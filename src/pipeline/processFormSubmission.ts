import axios from "axios";
import { FormSubmission } from "../types/formFields";
import { CustomerConfig } from "../types/customerConfig";
import { Validator } from "../utils/validator";
import { Transformer } from "../utils/transformer";
import { Logger } from "../utils/logger";
import { retry } from "../utils/retry";
import { Metrics } from "../utils/metrics";

/**
 * Process a single form submission using customer configuration.
 */
export async function processFormSubmission(
  form: FormSubmission,
  config: CustomerConfig
): Promise<void> {
  const start = Metrics.startTimer();
  Logger.info("📬 Processing form submission", { customerID: form.customerID });

  const errors = Validator.validateSubmission(form, config.validationRules);
  if (errors.length > 0) {
    Logger.warn("❌ Validation failed", { customerID: form.customerID, errors });
    errors.forEach(err => console.error(` - ${err}`));
    Metrics.recordFailure();
    return;
  }

  Logger.info("✅ Validation passed", { customerID: form.customerID });

  const tasks = config.enabledEndpoints.map(endpoint => async () => {
    try {
      const payload: Record<string, any> = {};
      Logger.debug(`🔄 Preparing payload for ${endpoint.name}`, { endpoint: endpoint.url });

      for (const field of endpoint.fields) {
        const formKey = field as keyof FormSubmission;
        const rawValue = form[formKey] ?? config.defaults?.[formKey];

        if (endpoint.includeIf?.[formKey] && !endpoint.includeIf[formKey]!(form)) {
          Logger.debug(`⏩ Skipping field ${field} due to conditional includeIf`);
          continue;
        }

        const transformationType = endpoint.transformations?.[field];
        let transformed: any;

        if (Array.isArray(transformationType)) {
          transformed = rawValue;
          for (const step of transformationType) {
            if (step === "llm") {
              Logger.debug(`🤖 Using LLM in pipeline for field: ${field}`, { original: transformed });
              transformed = await Transformer.applyTransformLLM(formKey, transformed);
            } else {
              transformed = Transformer.applyCustomTransform(formKey, transformed, step);
            }
          }
        } else if (transformationType === "llm") {
          Logger.debug(`🤖 Using LLM for field: ${field}`, { original: rawValue });
          transformed = await Transformer.applyTransformLLM(formKey, rawValue);
        } else if (transformationType) {
          transformed = Transformer.applyCustomTransform(formKey, rawValue, transformationType);
        } else {
          transformed = rawValue;
        }

        if (typeof transformed === "object" && !Array.isArray(transformed)) {
          Object.assign(payload, transformed);
        } else {
          payload[field] = transformed;
        }

        Logger.debug(`✅ Field processed: ${field}`, {
          original: rawValue,
          transformed
        });
      }

      Logger.info(`📤 Sending payload to ${endpoint.name}`, { url: endpoint.url });
      Logger.debug(`📦 Payload preview for ${endpoint.name}`, payload);

      const response = await retry(
        () =>
          axios.post(endpoint.url, payload, {
            headers: { "Content-Type": "application/json" }
          }),
        endpoint.retryOptions?.retries ?? 3,
        endpoint.retryOptions?.delayMs ?? 500,
        endpoint.retryOptions?.backoffFactor ?? 2,
        {
          label: `POST ${endpoint.name}`,
          customerID: form.customerID,
          onRetry: () => Metrics.incrementRetry(endpoint.name)
        }
      );

      Logger.info(`✅ Submission to ${endpoint.name} succeeded`, {
        status: response.status,
        statusText: response.statusText
      });
      Metrics.recordSuccess();
    } catch (error: any) {
      Logger.error(`💥 Failed to submit to ${endpoint.name}`, {
        customerID: form.customerID,
        error: error?.message || error
      });
      Metrics.recordFailure();
    }
  });

  await Promise.all(tasks.map(task => task()));

  Metrics.endTimer(start);
  Logger.info("🏁 Form submission completed", { customerID: form.customerID });
  Metrics.logSummary();
}
