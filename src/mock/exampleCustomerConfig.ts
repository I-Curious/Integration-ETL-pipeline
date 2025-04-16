import { CustomerConfig } from "../types/customerConfig";
const webhookUrl = "https://webhook.site/<your-webhook-urlID>";
export const exampleCustomerConfig: CustomerConfig = {
  customerID: "CUST789",

  enabledEndpoints: [
    {
      name: "CustomerProfileAPI",
      url: webhookUrl + "/customer/profile",
      fields: ["personalName", "customerID", "emailAddress", "phoneNumber", "dateOfBirth"],
      transformations: {
        personalName: "splitName",
        dateOfBirth: "dob-MMDDYYYY"
      },
      includeIf: {
        emailAddress: (form) => form.emailAddress.endsWith("@trusted.com")
      }
    },
    {
      name: "AddressVerificationService",
      url: webhookUrl + "/verify/address",
      fields: ["customerID", "currentAddress", "mailingAddress"],
      includeIf: {
        currentAddress: (form) => form.currentAddress !== form.mailingAddress
      }
    },
    {
      name: "CreditCheckSystem",
      url: webhookUrl + "/credit/check",
      fields: ["customerID", "incomeRange", "creditScore"],
      transformations: {
        incomeRange: "incomeNumber",
        creditScore: "creditCategory"
      },
      includeIf: {
        incomeRange: (form) => !!form.employmentStatus && form.employmentStatus !== "Unemployed"
      }
    },
    {
      name: "ProductCatalogService",
      url: webhookUrl + "/product/catalog",
      fields: ["productCategory", "customerID"],
      transformations: {
        productCategory: "productCode"
      }
    },
    {
      name: "RequestProcessingQueue",
      url: webhookUrl + "/request/queue",
      fields: ["customerID", "requestDate", "priorityLevel", "documentType"],
      transformations: {
        priorityLevel: "priorityNumber",
        documentType: "documentCode"
      }
    },
    {
      name: "CommunicationPreferencesAPI",
      url: webhookUrl + "/communication/preferences",
      fields: ["customerID", "preferredContactMethod", "emailAddress", "phoneNumber", "marketingOptIn"],
      transformations: {
        preferredContactMethod: "contactCode",
        marketingOptIn: "boolYN"
      },
      includeIf: {
        marketingOptIn: (form) => form.marketingOptIn === true
      }
    },
    {
      name: "AccountManagementSystem",
      url: webhookUrl + "/account/manage",
      fields: ["customerID", "accountType", "lastUpdated"],
      transformations: {
        accountType: "accountCode",
        lastUpdated: "timestamp"
      }
    },
    {
      name: "DocumentStorageService",
      url: webhookUrl + "/document/storage",
      fields: ["customerID", "documentType", "documentID"],
      transformations: {
        documentType: "documentCode"
      }
    },
    {
      name: "ApprovalWorkflowEngine",
      url: webhookUrl + "/approval/workflow",
      fields: ["customerID", "approvalStatus", "processingNotes", "agentID"],
      transformations: {
        approvalStatus: "approvalNumber"
      }
    },
    {
      name: "ConsentManagementService",
      url: webhookUrl + "/consent/manage",
      fields: ["customerID", "consentGiven", "lastUpdated"],
      transformations: {
        consentGiven: "boolStr",
        lastUpdated: "dob-ISO"
      }
    },
    {
      name: "AuditLogService",
      url: webhookUrl + "/audit/log",
      fields: ["customerID", "lastUpdated", "agentID", "ipAddress"]
    },
    {
      name: "DeviceTrackingSystem",
      url: webhookUrl + "/device/track",
      fields: ["customerID", "deviceType", "ipAddress"],
      transformations: {
        deviceType: "deviceCode"
      }
    },
    {
      name: "EmploymentVerificationAPI",
      url: webhookUrl + "/employment/verify",
      fields: ["customerID", "employmentStatus", "incomeRange"],
      transformations: {
        employmentStatus: "employmentCode",
        incomeRange: "incomeNumber"
      }
    },
    {
      name: "MarketingAutomationPlatform",
      url: webhookUrl + "/marketing/automate",
      fields: ["customerID", "personalName", "emailAddress", "marketingOptIn", "productCategory"],
      transformations: {
        marketingOptIn: "boolStr",
        productCategory: "productCode"
      }
    },
    {
      name: "FraudDetectionService",
      url: webhookUrl + "/fraud/detect",
      fields: ["customerID", "ipAddress", "deviceType", "requestDate", "creditScore"],
      transformations: {
        requestDate: "timestamp"
      }
    }
  ],

  defaults: {
    marketingOptIn: true,
    preferredContactMethod: "Email",
    documentType: "Application",
    agentID: "AGT456",
    accountType: "Business",
    consentGiven: false
  },

  validationRules: {
    creditScore: (value) => typeof value === "number" && value >= 600,
    emailAddress: (email) => typeof email === "string" && email.endsWith("@trusted.com"),
    personalName: (name) => typeof name === "string" && name.includes(" ")
  }
};