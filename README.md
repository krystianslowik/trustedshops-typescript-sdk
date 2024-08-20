TrustedShops TypeScript SDK

# TrustedShops TypeScript SDK

This SDK provides an easy-to-use interface for interacting with the TrustedShops API. It supports authentication, account management, and review operations. **Important:** Remember, use it ONLY server-side.

## Installation

To install the SDK, run:

```
npm install trustedshops-typescript-sdk
```

## Authentication

Start by authenticating with your TrustedShops credentials:

```

import { TrustedShops } from "trustedshops-typescript-sdk";

await TrustedShops.authenticate("your-client-id", "your-client-secret");

```

## Account and Channel Management

After authentication, you can manage your account and channels:

```

// Get all channels
const allChannels = TrustedShops.getChannels();
console.log("All channels:", allChannels);

// Get a channel by name
const myShopChannel = TrustedShops.getChannelByName("My Shop");
console.log("My Shop channel:", myShopChannel);

// Get channels by locale
const germanChannels = TrustedShops.getChannelsByLocale("de_DE");
console.log("German channels:", germanChannels);

// Update a channel
await TrustedShops.updateChannel(myShopChannel.id, { name: "My Updated Shop" });

```

## Working with Reviews

You can fetch and manage reviews for specific channels or across all channels:

```

// Get reviews for a specific channel (by name)
const myShopReviews = await TrustedShops.getReviewsForChannel("My Shop", { count: 10 });
console.log("My Shop reviews:", myShopReviews);

// Get reviews for a channel (by ID)
const channelReviews = await TrustedShops.getReviewsForChannel("chl-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", { count: 10 });
console.log("Channel reviews:", channelReviews);

// Get reviews for all channels
const allReviews = await TrustedShops.getReviewsForAllChannels({ count: 20 });
console.log("All reviews:", allReviews);

// Filter reviews (example: 5-star reviews)
const fiveStarReviews = allReviews.items.filter(review => review.rating === 5);
console.log("5-star reviews:", fiveStarReviews);

```

## Error Handling

The SDK uses native JavaScript promises. Handle potential errors using try/catch blocks:

```

try {
  await TrustedShops.authenticate("invalid-client-id", "invalid-client-secret");
} catch (error) {
  console.error("Authentication failed:", error.message);
}

```

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions for all methods and returned data structures.

## Contributing

Contributions are welcome! Please submit pull requests with any enhancements, bug fixes, or documentation improvements.

## License

This SDK is released under the MIT License.
