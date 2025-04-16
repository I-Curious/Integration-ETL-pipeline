import { FormSubmission } from './types/formFields';
import { CustomerConfig } from './types/customerConfig';
import { Logger } from './utils/logger';

async function processFormSubmission(form: FormSubmission, config: CustomerConfig) {
  Logger.info(`📬 Processing mock submission`, { customerID: form.customerID });
//   console.log(`🚀 Processing submission for customer: ${form.customerID}`);

  for (const endpoint of config.enabledEndpoints) {
    const payload: Record<string, any> = {};

    for (const field of endpoint.fields) {
      payload[field] = form[field as keyof FormSubmission];
    }

    Logger.info(`📤 Prepared mock payload for ${endpoint.name}`, {
      url: endpoint.url,
      payload,
    });

    // Simulate submission
    // console.log(`🛰️ Would send to ${endpoint.name} at ${endpoint.url}:`);
    // console.log(JSON.stringify(payload, null, 2));
  }

  Logger.info(`✅ Mock submission complete`, { customerID: form.customerID });
//   console.log("✅ Form processing complete (mock).");
}
