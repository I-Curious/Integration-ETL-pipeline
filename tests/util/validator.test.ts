import { Validator } from "../../src/utils/validator";
import { validSubmission, invalidSubmission } from "../mock/mock";

describe("Validator", () => {
  it("should pass validation for valid submission", () => {
    const result = Validator.validateSubmission(validSubmission);
    expect(result).toEqual([]);
  });

  it("should return errors for invalid submission", () => {
    const result = Validator.validateSubmission(invalidSubmission);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Invalid personalName"),
        expect.stringContaining("Invalid dateOfBirth"),
        expect.stringContaining("Invalid emailAddress"),
        expect.stringContaining("Invalid phoneNumber"),
        expect.stringContaining("creditScore"),
        expect.stringContaining("customerID"),
        expect.stringContaining("consentGiven"),
        expect.stringContaining("ipAddress")
      ])
    );
  });

  it("should apply custom validation rules", () => {
    const customRules = {
      emailAddress: (email: string) => email.endsWith("@trusted.com")
    };

    const formWithInvalidCustomEmail = { ...validSubmission, emailAddress: "alice@fake.com" };
    const result = Validator.validateSubmission(formWithInvalidCustomEmail, customRules);
    expect(result).toContain("Custom validation failed for emailAddress");
  });
});