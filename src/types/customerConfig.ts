import { FormSubmission } from './formFields';

export type ValidationRuleFn = (value: any, form?: FormSubmission) => boolean;

export type TransformationStep = string; // e.g., "llm", "splitName", "timestamp"

// Now allowing either a single step or a chain of steps
export type TransformationPipeline = TransformationStep | TransformationStep[];

export interface CustomerConfig {
  customerID: string;
  enabledEndpoints: EndpointConfig[];
  defaults?: Partial<FormSubmission>;
  validationRules?: Partial<Record<keyof FormSubmission, ValidationRuleFn>>;
}

export interface EndpointConfig {
  name: string;
  url: string;
  fields: (keyof FormSubmission)[];
  transformations?: Partial<Record<keyof FormSubmission, TransformationPipeline>>;
  includeIf?: Partial<Record<keyof FormSubmission, (form: FormSubmission) => boolean>>;
  retryOptions?: {
    retries?: number;
    delayMs?: number;
    backoffFactor?: number;
  };
}