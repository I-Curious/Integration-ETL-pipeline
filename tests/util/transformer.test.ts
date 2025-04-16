import { Transformer } from "../../src/utils/transformer";
import { applyLLMTransformation } from "../../src/utils/llm";

jest.mock("../../src/utils/llm");
const mockedLLM = applyLLMTransformation as jest.Mock;

describe("Transformer", () => {
  test("splitFullName should split name into first and last", () => {
    const result = Transformer.splitFullName("Jane Doe");
    expect(result).toEqual({ firstName: "Jane", lastName: "Doe" });
  });

  test("convertDOB MM/DD/YYYY", () => {
    const result = Transformer.convertDOB("2000-01-15", "MM/DD/YYYY");
    expect(result).toBe("01/15/2000");
  });

  test("convertDOB YYYY-MM-DD", () => {
    const result = Transformer.convertDOB("01/15/2000", "YYYY-MM-DD");
    expect(result).toBe("2000-01-15");
  });

  test("convertToUnixTimestamp", () => {
    const result = Transformer.convertToUnixTimestamp("2020-01-01T00:00:00Z");
    expect(typeof result).toBe("number");
  });

  test("convertToISO8601", () => {
    const result = Transformer.convertToISO8601("2020-01-01T00:00:00Z");
    expect(result).toBe("2020-01-01T00:00:00.000Z");
  });

  test("employmentStatusToCode", () => {
    expect(Transformer.employmentStatusToCode("Student")).toBe("ST");
  });

  test("incomeRangeToNumber", () => {
    expect(Transformer.incomeRangeToNumber("$50k-$75k")).toBe(50000);
  });

  test("priorityLevelToNumber", () => {
    expect(Transformer.priorityLevelToNumber("Urgent")).toBe(4);
  });

  test("approvalStatusToNumber", () => {
    expect(Transformer.approvalStatusToNumber("Under Review")).toBe(3);
  });

  test("contactMethodToCode", () => {
    expect(Transformer.contactMethodToCode("SMS")).toBe("S");
  });

  test("accountTypeToCode", () => {
    expect(Transformer.accountTypeToCode("Joint")).toBe(3);
  });

  test("documentTypeToCode", () => {
    expect(Transformer.documentTypeToCode("Statement")).toBe("S");
  });

  test("deviceTypeToCode", () => {
    expect(Transformer.deviceTypeToCode("Tablet")).toBe("T");
  });

  test("productCategoryToCode", () => {
    expect(Transformer.productCategoryToCode("Investments")).toBe("IV");
  });

  test("creditScoreToCategory", () => {
    expect(Transformer.creditScoreToCategory(720)).toBe("Good");
  });

  test("booleanToYN", () => {
    expect(Transformer.booleanToYN(true)).toBe("Y");
    expect(Transformer.booleanToYN(false)).toBe("N");
  });

  test("booleanToString", () => {
    expect(Transformer.booleanToString(true)).toBe("true");
    expect(Transformer.booleanToString(false)).toBe("false");
  });

  test("applyCustomTransform fallback", () => {
    const result = Transformer.applyCustomTransform("emailAddress", "test@trusted.com", "nonexistent");
    expect(result).toBe("test@trusted.com");
  });

  test("complex transformation pipeline: LLM followed by boolStr", async () => {
    mockedLLM.mockResolvedValue(true); // Simulate LLM returning a boolean

    let value = "Yes, please subscribe me";
    value = await Transformer.applyTransformLLM("marketingOptIn", value);
    value = Transformer.applyCustomTransform("marketingOptIn", value, "boolStr");

    expect(value).toBe("true");
    expect(mockedLLM).toHaveBeenCalledWith("marketingOptIn", "Yes, please subscribe me");
  });
});
