import { processFormSubmission } from "./pipeline/processFormSubmission";
import { exampleForm } from "./mock/exampleForm";
import { exampleCustomerConfig } from "./mock/exampleCustomerConfig";

(async () => {
  await processFormSubmission(exampleForm, exampleCustomerConfig);
})();