# TrustedShops TypeScript SDK

This SDK provides an easy way to interact with the TrustedShops API, starting with OAuth2 authentication. More features will be added as the SDK evolves.

## Installation

Before you can use the SDK, make sure to install the necessary dependencies:

```bash
npm install
npm run generate:all # to generate all needed API handlers from OpenAPI specs
```

## Authentication

The SDK supports OAuth2 authentication using your TrustedShops `clientId` and `clientSecret`. Below is an example of how to authenticate and obtain an access token:

### Example: Getting the Access Token

```typescript
import { TrustedShops } from "../src/TrustedShops";

async function main() {
  const clientId = "someclientID";
  const clientSecret = "somesecret";

  const myTrustedShop = new TrustedShops();
  await myTrustedShop.authenticate(clientId, clientSecret);

  console.log(myTrustedShop.showToken()); // Outputs the access token
}

main();
```

## Reviews

After authenticating, you can interact with the Reviews API to fetch and manipulate reviews.

### Example: Utilizing the Reviews Implementation

```typescript
import { TrustedShops } from "../src/TrustedShops";

async function main() {
  const clientId = "someclientID";
  const clientSecret = "someclientsecret";

  const myTrustedShop = new TrustedShops();
  await myTrustedShop.authenticate(clientId, clientSecret);

  // Get all reviews for a specific channel
  const reviews = await myTrustedShop.Reviews?.getReviews("chl-123123");

  // Filter reviews to show only those with a 5-star rating
  const filtered = await myTrustedShop.Reviews?.filterReviews(reviews!, 5);
  console.log("Count of 5-star reviews:", filtered?.length);

  // Display the title and customer name of each 5-star review
  for (const review of filtered!) {
    console.log("Title:", review.title);
    console.log(
      "Customer Name:",
      review.customer.firstName ?? "No-name provided"
    );
  }

  // Sort reviews by date in ascending order
  const sortedReviews = await myTrustedShop.Reviews?.sortReviewsByDate(
    reviews!,
    "asc"
  );
  console.log("Sorted Reviews:", sortedReviews);
}

main();
```
