# TrustedShops TypeScript SDK

This SDK provides an easy way to interact with the TrustedShops API, starting with OAuth2 authentication. More features will be added as the SDK evolves.

## Installation

Before you can use the SDK, make sure to install the necessary dependencies:

```bash
npm install
npm run generate:all #to generate all needed API handlers from OpenAPI specs
```

## Usage

Currently, the SDK supports OAuth2 authentication using your TrustedShops `clientId` and `clientSecret`. Below is an example of how to use the SDK to authenticate:

### Example

```typescript
import { TrustedShops } from "../src/TrustedShops";

async function main() {
  const clientId = "someclientID";
  const clientSecret = "somesecret";

  await TrustedShops.authenticate(clientId, clientSecret);
  // output: Access Token or 400
}

main();
```
