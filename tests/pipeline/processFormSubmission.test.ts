import { processFormSubmission } from "../../src/pipeline/processFormSubmission";
import { exampleForm } from "../../src/mock/exampleForm";
import { exampleCustomerConfig } from "../../src/mock/exampleCustomerConfig";
import { FormSubmission } from "../../src/types/formFields";
import { CustomerConfig } from "../../src/types/customerConfig";

import { Validator } from "../../src/utils/validator";
import { Transformer } from "../../src/utils/transformer";
import axios from "axios";

// Silence logger during test runs
jest.mock("../../src/utils/logger", () => ({
  Logger: {
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock("axios");
jest.mock("../../src/utils/validator");
jest.mock("../../src/utils/transformer");

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedValidator = Validator as jest.Mocked<typeof Validator>;
const mockedTransformer = Transformer as jest.Mocked<typeof Transformer>;

describe("processFormSubmission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should validate, transform, and post data successfully", async () => {
    mockedValidator.validateSubmission.mockReturnValue([]);

    mockedTransformer.applyCustomTransform.mockImplementation((field, value, type) => {
      return `transformed_${value}`;
    });

    mockedAxios.post.mockResolvedValue({ status: 200 });

    await processFormSubmission(exampleForm, exampleCustomerConfig);

    expect(mockedValidator.validateSubmission).toHaveBeenCalledWith(
      exampleForm,
      exampleCustomerConfig.validationRules
    );

    expect(mockedAxios.post).toHaveBeenCalledTimes(exampleCustomerConfig.enabledEndpoints.length);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining("/customer/profile"),
      expect.objectContaining({
        personalName: expect.any(String),
        customerID: expect.any(String)
      }),
      expect.any(Object)
    );
  });

  it("should not proceed if validation fails", async () => {
    mockedValidator.validateSubmission.mockReturnValue(["Invalid email"]);

    await processFormSubmission(exampleForm, exampleCustomerConfig);

    expect(mockedValidator.validateSubmission).toHaveBeenCalledWith(
      exampleForm,
      exampleCustomerConfig.validationRules
    );

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("should handle axios post failure gracefully", async () => {
    mockedValidator.validateSubmission.mockReturnValue([]);

    mockedTransformer.applyCustomTransform.mockImplementation((field, value, type) => {
      return `mocked_${value}`;
    });

    mockedAxios.post.mockRejectedValue(new Error("Post failed")); 
    
    const retryConfig = {
      ...exampleCustomerConfig,
      enabledEndpoints: [
        {
          ...exampleCustomerConfig.enabledEndpoints[0],
          retryOptions: { retries: 2, delayMs: 0 } // No delay for testing
        }
      ]
    };

    await processFormSubmission(exampleForm, retryConfig);

    expect(mockedAxios.post).toHaveBeenCalled();
  }); // Increase timeout if needed

  it("should apply a complex transformation pipeline with LLM and custom steps", async () => {
    const complexConfig: CustomerConfig = {
      ...exampleCustomerConfig,
      enabledEndpoints: [
        {
          name: "SequentialTransformerAPI",
          url: "https://mock-endpoint.com/sequential",
          fields: ["processingNotes"],
          transformations: {
            processingNotes: ["llm", "splitName"]
          }
        }
      ]
    };

    mockedValidator.validateSubmission.mockReturnValue([]);
    mockedTransformer.applyTransformLLM.mockResolvedValue("LLM Cleaned Notes");
    mockedTransformer.applyCustomTransform.mockImplementation((field, value, type) => {
      if (field === "processingNotes" && type === "splitName") {
        return { firstName: "LLM", lastName: "Cleaned Notes" };
      }
      return value;
    });

    mockedAxios.post.mockResolvedValue({ status: 200 });

    const customForm: FormSubmission = { ...exampleForm, processingNotes: "Some raw notes" };
    await processFormSubmission(customForm, complexConfig);

    expect(mockedTransformer.applyTransformLLM).toHaveBeenCalledWith("processingNotes", "Some raw notes");
    expect(mockedTransformer.applyCustomTransform).toHaveBeenCalledWith("processingNotes", "LLM Cleaned Notes", "splitName");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://mock-endpoint.com/sequential",
      expect.objectContaining({ firstName: "LLM", lastName: "Cleaned Notes" }),
      expect.any(Object)
    );
  });

  it("should retry failed requests and eventually succeed", async () => {
    mockedValidator.validateSubmission.mockReturnValue([]);
    mockedTransformer.applyCustomTransform.mockImplementation((field, value, type) => value);

    const mockPost = mockedAxios.post as jest.Mock;
    mockPost
      .mockRejectedValueOnce(new Error("Temporary network error"))
      .mockRejectedValueOnce(new Error("Still failing"))
      .mockResolvedValueOnce({ status: 200 });

    const retryConfig: CustomerConfig = {
      ...exampleCustomerConfig,
      enabledEndpoints: [
        {
          ...exampleCustomerConfig.enabledEndpoints[0],
          retryOptions: { retries: 2, delayMs: 0 } // No delay for testing
        }
      ]
    };

    await processFormSubmission(exampleForm, retryConfig);

    expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    expect(mockedAxios.post).toHaveBeenLastCalledWith(
      expect.stringContaining("/customer/profile"),
      expect.objectContaining({ personalName: expect.anything() }),
      expect.any(Object)
    );
  });
});
