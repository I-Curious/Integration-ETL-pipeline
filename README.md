# Multi‑Source / Multi‑Destination Form Data Integration System

## 🚀 Overview

This project implements a **highly configurable ETL pipeline in TypeScript** that:

1. 📥 **Receives** form submissions (25 fields + customer ID)  
2. ✅ **Validates** input with core & customer‑specific rules  
3. 🔧 **Transforms** each field with built‑in, LLM‑powered, or multi‑step pipelines  
4. 📡 **Routes** payloads to enabled endpoints with retry/backoff logic  
5. 🧾 **Logs** every step using simple Logger  
6. 📊 **Tracks metrics** including retries, durations, and totals  
7. 🔁 **Runs endpoints in parallel** when no dependencies exist  

---

## 🏗 Architecture

```
src/
├── pipeline/
│   └── processFormSubmission.ts   # Main orchestrator
├── utils/
│   ├── validator.ts               # Validation logic
│   ├── transformer.ts             # LLM + built‑in transformation logic
│   ├── retry.ts                   # Retry mechanism with logging
│   ├── logger.ts                  # Winston logger setup
│   └── metrics.ts                 # Submission metrics tracking
├── types/
│   ├── formFields.ts              # Schema for form input
│   └── customerConfig.ts          # Schema for configuration
├── mock/
│   ├── exampleForm.ts             # Sample form input
│   └── exampleCustomerConfig.ts   # Sample customer config
└── tests/                         # Jest test suites
```

- **Config-driven**: Powered by strongly typed `CustomerConfig`
- **LLM Support**: Inject `llm` into any transform pipeline
- **Retry Logic**: Exponential backoff with configurable retries/delay
- **Parallelization**: Uses `Promise.all` for concurrency
- **Metrics**: Track runtime and submission stats

---

## ⚙️ Getting Started

### Prerequisites

- Node.js >= 18
- Webhook.site URL for testing
- `.env` with `OPENAI_API_KEY` if using LLM
- `src\mock\exampleCustomerConfig.ts` with `your-webhook-urlID` to send data to webhook.site

### Setup

```bash
git clone <repo-url>
cd <repo-dir>
npm install
# Edit .env for OpenAI config and src\mock\exampleCustomerConfig.ts for testing and sending data to webhook.site if needed
```

### Running the Submission Pipeline

```bash
ts-node src/testRunner
```

Or call `processFormSubmission(Form, CustomerConfig)` programmatically.

### Running Tests

```bash
npx jest
```

---

## 🧩 Configuration Example

```ts
import { CustomerConfig } from "./types/customerConfig";

export const exampleCustomerConfig: CustomerConfig = {
  customerID: "CUST789",
  enabledEndpoints: [
    {
      name: "CustomerProfileAPI",
      url: "https://webhook.site/.../customer/profile",
      fields: ["personalName","emailAddress","dateOfBirth"],
      transformations: {
        personalName: ["llm","splitName"],
        dateOfBirth: "dob-MMDDYYYY"
      },
      includeIf: {
        emailAddress: form => form.emailAddress.endsWith("@trusted.com")
      },
      retryOptions: { retries: 5, delayMs: 200, backoffFactor: 1.5 }
    }
  ],
  defaults: {
    marketingOptIn: true,
  },
  validationRules: {
    creditScore: value => typeof value === "number" && value >= 600
  }
};
```

---

## ✅ Assumptions

- All 25 form fields are populated at submission time
- Endpoints ignore unexpected fields
- LLM transforms are idempotent & context-aware
- Metrics are stored in-memory for this demo

---

## ⚠️ Limitations

- No persistent metrics or logs
- No config loader (hardcoded TypeScript config)
- No Docker/Kubernetes production setup
- No advanced dependency graph between transforms

---

## 🌱 Future Improvements

- Prometheus/Grafana integration for real-time metrics
- Dynamic config loading with Zod validation
- CLI + web dashboard for config management
- Retry with jitter & circuit-breakers
- Graph-based transformation dependency resolution

---

> _Built with ❤️ using TypeScript_