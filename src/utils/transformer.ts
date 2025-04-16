import { FormSubmission } from "../types/formFields";
import { applyLLMTransformation } from "./llm";

type TransformedPayload = Record<string, any>;

export class Transformer {
  static splitFullName(fullName: string): { firstName: string; lastName: string } {
    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ");
    return { firstName, lastName };
  }

  static convertDOB(dateStr: string, format: "MM/DD/YYYY" | "YYYY-MM-DD"): string {
    // Split date manually to ensure consistency
    let year: number, month: number, day: number;
  
    if (dateStr.includes("-")) {
      // "YYYY-MM-DD"
      [year, month, day] = dateStr.split("-").map(Number);
    } else if (dateStr.includes("/")) {
      // "MM/DD/YYYY"
      [month, day, year] = dateStr.split("/").map(Number);
    } else {
      throw new Error("Invalid date format");
    }
  
    // Use UTC to avoid timezone issues
    const date = new Date(Date.UTC(year, month - 1, day));
    const pad = (n: number) => n.toString().padStart(2, "0");
  
    return format === "MM/DD/YYYY"
      ? `${pad(date.getUTCMonth() + 1)}/${pad(date.getUTCDate())}/${date.getUTCFullYear()}`
      : `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  }
  
  

  static convertToUnixTimestamp(dateStr: string): number {
    return Math.floor(new Date(dateStr).getTime() / 1000);
  }

  static convertToISO8601(dateStr: string): string {
    return new Date(dateStr).toISOString();
  }

  static employmentStatusToCode(status: string): string {
    const map: Record<string, string> = {
      "Employed": "FT",
      "Self-employed": "SE",
      "Unemployed": "UE",
      "Retired": "RT",
      "Student": "ST",
    };
    return map[status] || "UE";
  }

  static incomeRangeToNumber(range: string): number {
    const map: Record<string, number> = {
      "$0-$25k": 0,
      "$25k-$50k": 25000,
      "$50k-$75k": 50000,
      "$75k-$100k": 75000,
      "$100k+": 100000,
    };
    return map[range] ?? 0;
  }

  static priorityLevelToNumber(level: string): number {
    const map: Record<string, number> = {
      "Low": 1,
      "Medium": 2,
      "High": 3,
      "Urgent": 4,
    };
    return map[level] ?? 1;
  }

  static approvalStatusToNumber(status: string): number {
    const map: Record<string, number> = {
      "Pending": 0,
      "Approved": 1,
      "Rejected": 2,
      "Under Review": 3,
    };
    return map[status] ?? 0;
  }

  static contactMethodToCode(method: string): string {
    const map: Record<string, string> = {
      "Email": "E",
      "Phone": "P",
      "Mail": "M",
      "SMS": "S",
    };
    return map[method] ?? "E";
  }

  static accountTypeToCode(type: string): number {
    const map: Record<string, number> = {
      "Personal": 1,
      "Business": 2,
      "Joint": 3,
      "Trust": 4,
    };
    return map[type] ?? 1;
  }

  static documentTypeToCode(type: string): string {
    const map: Record<string, string> = {
      "Application": "A",
      "Verification": "V",
      "Statement": "S",
      "Contract": "C",
    };
    return map[type] ?? "A";
  }

  static deviceTypeToCode(type: string): string {
    const map: Record<string, string> = {
      "Desktop": "D",
      "Mobile": "M",
      "Tablet": "T",
      "Other": "O",
    };
    return map[type] ?? "O";
  }

  static productCategoryToCode(category: string): string {
    const map: Record<string, string> = {
      "Loans": "LN",
      "Insurance": "IN",
      "Investments": "IV",
      "Banking": "BK",
      "Credit Cards": "CC",
    };
    return map[category] ?? "LN";
  }

  static creditScoreToCategory(score: number): string {
    if (score < 580) return "Poor";
    if (score < 670) return "Fair";
    if (score < 740) return "Good";
    return "Excellent";
  }

  static booleanToYN(val: boolean): "Y" | "N" {
    return val ? "Y" : "N";
  }

  static booleanToString(val: boolean): "true" | "false" {
    return val ? "true" : "false";
  }

  // Dynamic transformer
  static applyCustomTransform(
    field: keyof FormSubmission,
    value: any,
    type: string
  ): any {
    switch (type) {
      case "splitName":
        return Transformer.splitFullName(value);
      case "dob-MMDDYYYY":
        return Transformer.convertDOB(value, "MM/DD/YYYY");
      case "dob-ISO":
        return Transformer.convertToISO8601(value);
      case "timestamp":
        return Transformer.convertToUnixTimestamp(value);
      case "employmentCode":
        return Transformer.employmentStatusToCode(value);
      case "incomeNumber":
        return Transformer.incomeRangeToNumber(value);
      case "priorityNumber":
        return Transformer.priorityLevelToNumber(value);
      case "approvalNumber":
        return Transformer.approvalStatusToNumber(value);
      case "contactCode":
        return Transformer.contactMethodToCode(value);
      case "accountCode":
        return Transformer.accountTypeToCode(value);
      case "documentCode":
        return Transformer.documentTypeToCode(value);
      case "deviceCode":
        return Transformer.deviceTypeToCode(value);
      case "productCode":
        return Transformer.productCategoryToCode(value);
      case "creditCategory":
        return Transformer.creditScoreToCategory(value);
      case "boolYN":
        return Transformer.booleanToYN(value);
      case "boolStr":
        return Transformer.booleanToString(value);
      default:
        return value;
    }
  }
  static async applyTransformLLM(field: keyof FormSubmission, value: any): Promise<any> {
    return await applyLLMTransformation(field, value);
  }

  static async applyTransformPipeline(field: keyof FormSubmission, value: any, types: string | string[]): Promise<any> {
    const steps = Array.isArray(types) ? types : [types];
    let result = value;

    for (const step of steps) {
      if (step === "llm") {
        result = await Transformer.applyTransformLLM(field, result);
      } else {
        result = Transformer.applyCustomTransform(field, result, step);
      }
    }

    return result;
  }
}