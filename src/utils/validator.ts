import { FormSubmission } from "../types/formFields";
import { ValidationRuleFn } from "../types/customerConfig";

export class Validator {
  // Check if full name has at least two parts
  static isValidFullName(name: string): boolean {
    return typeof name === "string" && name.trim().split(" ").length >= 2;
  }

  // Ensure dateOfBirth is valid and person is at least 18
  static isValidDOB(dob: string): boolean {
    const date = new Date(dob);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    const m = now.getMonth() - date.getMonth();
    const day = now.getDate() - date.getDate();
    return !isNaN(date.getTime()) && (age > 18 || (age === 18 && (m > 0 || (m === 0 && day >= 0))));
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[0-9\-+\s()]{7,20}$/;
    return phoneRegex.test(phone);
  }

  static isValidCreditScore(score: number): boolean {
    return typeof score === "number" && score >= 300 && score <= 850;
  }

  static isNonEmpty(value: string | undefined | null): boolean {
    return typeof value === "string" && value.trim().length > 0;
  }

  static isValidBoolean(value: any): boolean {
    return typeof value === "boolean";
  }

  static isValidIPAddress(ip: string): boolean {
    const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    return ipRegex.test(ip);
  }

  // Generic field validator that combines all checks
  static validateSubmission(
    form: FormSubmission,
    customerValidationRules?: Partial<Record<keyof FormSubmission, ValidationRuleFn>>
  ): string[] {
    const errors: string[] = [];

    // Core validation
    if (!this.isValidFullName(form.personalName))
      errors.push("Invalid personalName. Must include at least first and last name.");

    if (!this.isValidDOB(form.dateOfBirth))
      errors.push("Invalid dateOfBirth or user is under 18.");

    if (!this.isValidEmail(form.emailAddress))
      errors.push("Invalid emailAddress.");

    if (!this.isValidPhoneNumber(form.phoneNumber))
      errors.push("Invalid phoneNumber.");

    if (!this.isValidCreditScore(form.creditScore))
      errors.push("creditScore must be between 300 and 850.");

    if (!this.isNonEmpty(form.customerID))
      errors.push("customerID is required.");

    if (!this.isValidBoolean(form.consentGiven))
      errors.push("consentGiven must be true or false.");

    if (!this.isValidIPAddress(form.ipAddress))
      errors.push("Invalid ipAddress format.");

    // ✅ Optional: Apply customer-specific validation rules
    if (customerValidationRules) {
      for (const [field, ruleFn] of Object.entries(customerValidationRules)) {
        const key = field as keyof FormSubmission;
        const value = form[key];
        if (!ruleFn(value, form)) {
          errors.push(`Custom validation failed for ${field}`);
        }
      }
    }

    return errors;
  }
}