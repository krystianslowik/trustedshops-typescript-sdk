# TrustedShops TypeScript SDK

This SDK provides an easy-to-use interface for interacting with the TrustedShops API. It supports authentication, account management, and review operations. **Important:** Remember, use Authentication ONLY server-side.

## Installation

To install the SDK, run:

```sh
npm install trustedshops-typescript-sdk
```

## Authentication

Start by authenticating with your TrustedShops credentials:

```typescript
import { TrustedShops } from "trustedshops-typescript-sdk";

await TrustedShops.authenticate("your-client-id", "your-client-secret");
```

## Basic functionalities

After authentication, you can manage your channels & reviews:

```typescript
// Get all channels
const allChannels = TrustedShops.getChannels();
console.log("All channels:", allChannels);

// Refresh the list of channels
const refreshedChannels = await TrustedShops.refreshChannelsList();
console.log("Refreshed channels list:", refreshedChannels);

// Get a channel by ID
const channelById = TrustedShops.getChannelById("chl-12345");
console.log("Channel by ID:", channelById);

// Get a channel by name
const myShopChannel = TrustedShops.getChannelByName("My Shop");
console.log("My Shop channel:", myShopChannel);

// Get a channel by locale
const germanChannel = TrustedShops.getChannelByLocale("de_DE");
console.log("Channel for German locale:", germanChannel);

// Get all channels by locale
const germanChannels = TrustedShops.getChannelsByLocale("de_DE");
console.log("All channels for German locale:", germanChannels);

// Update a channel
if (myShopChannel) {
  await TrustedShops.updateChannel(myShopChannel.id, {
    name: "My Updated Shop",
  });
  console.log(
    "Channel updated:",
    await TrustedShops.getChannelById(myShopChannel.id)
  );
}

// Get reviews for a specific channel by ID, name, or locale
const reviewsForChannel = await TrustedShops.getReviewsForChannel("My Shop", {
  count: 10,
});
console.log("Reviews for 'My Shop':", reviewsForChannel);

// Get reviews for all channels
const reviewsForAllChannels = await TrustedShops.getReviewsForAllChannels({
  count: 20,
});
console.log("Reviews for all channels:", reviewsForAllChannels);

// Get a channel ID by name or locale with fallback option
const channelId = TrustedShops.getChannelId("de_DE", true);
console.log("Resolved Channel ID:", channelId);

// Trigger an event with the specified event data, channel name, or channel ID
const eventResponse = await TrustedShops.triggerEvent(eventData, "en-US");
console.log("Event created with reference:", eventResponse.EventRef);

// Check details of a specific event by its ID
const eventDetails = await TrustedShops.checkEventDetails("EVT123456");
console.log("Event details:", eventDetails);
```

# Deeper: ReviewsService Usage

The `ReviewsService` in the `TrustedShops` class allows you to interact with the TrustedShops API to fetch, create, and manage reviews. Below are the available methods and examples of how to use them.

## Fetch Reviews

You can fetch a list of reviews based on certain channels and filtering options.

### `getReviews(channels?: string[], options?: ReviewOptions): Promise<CustomerReviewListResponse>`

Fetches a list of reviews based on the provided channels and options.

```typescript
const channels = ["chl-123", "chl-456"];
const options = {
  rating: 4,
  status: ["APPROVED", "REJECTED"],
  type: ["PRODUCT_REVIEW"],
  orderBy: "submittedAt",
};

const reviews = await TrustedShops.Reviews.getReviews(channels, options);
console.log(reviews);
```

### `getMinimalReviews(channels?: string[], options?: ReviewOptions): Promise<CustomerReviewListResponse>`

Fetches a minimal list of reviews based on the provided channels and options.

```typescript
const channels = ["chl-123", "chl-456"];
const options = {
  rating: 5,
  status: ["APPROVED"],
  type: ["SERVICE_REVIEW"],
  orderBy: "submittedAt",
};

const minimalReviews = await TrustedShops.Reviews.getMinimalReviews(
  channels,
  options
);
console.log(minimalReviews);
```

### `getReview(reviewId: string): Promise<Review>`

Retrieves the details of a specific review.

```typescript
const reviewId = "review12345";
const review = await TrustedShops.Reviews.getReview(reviewId);
console.log(review);
```

### `createVeto(reviewId: string, reviewVetoRequest: ReviewVetoRequest): Promise<ReviewVetoResponse>`

Creates a veto for a specific review.

```typescript
const reviewVetoRequest = {
  comment: "This review contains abusive language.",
  reason: "ABUSIVE",
  vetoReporterEmail: "reporter@example.com",
  channelName: "Web",
};

const vetoResponse = await TrustedShops.Reviews.createVeto(
  "review12345",
  reviewVetoRequest
);
console.log(vetoResponse);
```

### `getReviewVeto(reviewId: string): Promise<ReviewVetoResponse>`

Retrieves the veto details for a specific review.

```typescript
const reviewId = "review12345";
const reviewVeto = await TrustedShops.Reviews.getReviewVeto(reviewId);
console.log(reviewVeto);
```

### `saveReviewReply(reviewId: string, reviewReply: ReviewReply): Promise<void>`

Saves a reply to a specific review.

```typescript
const reviewReply = {
  comment: "Thank you for your feedback!",
  sendNotification: true,
};

await TrustedShops.Reviews.saveReviewReply("review12345", reviewReply);
```

### `deleteReviewReply(reviewId: string): Promise<void>`

Deletes a reply from a specific review.

```typescript
await TrustedShops.Reviews.deleteReviewReply("review12345");
```

### `filterFetchedReviews(reviews: Review[], rating?: number, type?: ReviewType): Promise<Review[]>`

Filters an array of reviews based on the provided rating and type.

```typescript
const reviews = TrustedShops.Reviews.;

const filteredReviews = await TrustedShops.Reviews.filterFetchedReviews(
  reviews,
  5,
  "SERVICE_REVIEW"
);
console.log(filteredReviews);
```

### `getReviewsCount(options?: { channels?: string[], submittedAfter?: string, submittedBefore?: string, rating?: number[], status?: ReviewState[], type?: ReviewType[], hasReply?: boolean, ignoreStatements?: boolean, query?: string, sku?: string[] }): Promise<ChannelReviewCountResponse>`

Fetches the count of reviews based on the provided filter options.

```typescript
const options = {
  channels: ["chl-123", "chl-456"],
  submittedAfter: "2024-01-01",
  rating: [4, 5],
};

const reviewsCount = await TrustedShops.Reviews.getReviewsCount(options);
console.log(reviewsCount);
```

## Event Management

The Trusted Shops SDK provides methods to create and manage events associated with customer transactions. Below are the key methods related to event management.

### `triggerEvent`

The `triggerEvent` method is used to create a new event, such as a purchase or order, associated with a specific customer and channel. This method allows you to specify event details, including customer information, transaction details, and product information.

#### Method Signature

```typescript
public static async triggerEvent(
  eventData: EventRequest,
  channelNameOrLocale?: string,
  channelId?: ChannelId
): Promise<EventPostResponse>
```

#### Parameters

- `eventData` (**EventRequest**): The event data that includes details like event type, customer information, transaction reference, and product details.
- `channelNameOrLocale` (**string**, optional): The name or locale of the channel associated with the event. If provided, the SDK will attempt to resolve the channel ID based on this value.
- `channelId` (**ChannelId**, optional): The ID of the channel. If both `channelId` and `channelNameOrLocale` are provided, `channelId` takes precedence.

#### Returns

A `Promise` that resolves to an `EventPostResponse`, which contains information about the created event, including the event reference.

#### Example Usage

```typescript
import { TrustedShops } from "trustedshops-sdk";

async function createPurchaseEvent() {
  const eventData = {
    type: "purchase",
    customer: {
      email: "customer@example.com",
      firstName: "John",
      lastName: "Doe",
    },
    transaction: {
      reference: "ORDER12345",
      date: "2024-08-21",
    },
    products: [
      {
        name: "Sample Product",
        sku: "SKU12345",
        url: "https://example.com/product",
      },
    ],
  };

  const response = await TrustedShops.triggerEvent(eventData, "en-US");
  console.log("Event created with reference:", response.EventRef);
}

createPurchaseEvent();
```

### `checkEventDetails`

The `checkEventDetails` method retrieves the details of an event using its reference ID. This is useful for checking the status or details of an event after it has been created.

#### Method Signature

```typescript
public static async checkEventDetails(
  eventId: string
): Promise<EventGetResponse>
```

#### Parameters

- `eventId` (**string**): The reference ID of the event to retrieve.

#### Returns

A `Promise` that resolves to an `EventGetResponse`, containing detailed information about the event, including customer and transaction details.

#### Example Usage

```typescript
import { TrustedShops } from "trustedshops-sdk";

async function getEventDetails() {
  const eventId = "EVT123456";
  const eventDetails = await TrustedShops.checkEventDetails(eventId);
  console.log("Event details:", eventDetails);
}

getEventDetails();
```

### EventRequest Interface

The `EventRequest` interface defines the structure of the event data required by the `triggerEvent` method.

#### Properties

- `type` (**string**): The type of event (e.g., "purchase").
- `defaultLocale` (**string**, optional): The default locale for the event.
- `customer` (**object**): The customer details, including `firstName`, `lastName`, and `email`.
- `channel` (**object**): The channel information, including `id` and `type`.
- `transaction` (**object**): The transaction details, including `reference` and `date`.
- `estimatedDeliveryDate` (**string**, optional): The estimated delivery date for the products.
- `products` (**Array<object>**, optional): A list of products associated with the event, each containing properties like `name`, `sku`, and `url`.
- `system` (**string**, optional): The system creating the event (default is "Trusted Shops TypeScript SDK").
- `systemVersion` (**string**, optional): The version of the system creating the event.
- `metadata` (**object**, optional): Additional metadata for the event.

### EventPostResponse Interface

The `EventPostResponse` interface defines the structure of the response returned after creating an event.

#### Properties

- `Message` (**string**): A message indicating the status of the event creation.
- `EventRef` (**string**): The reference ID of the created event.

### EventGetResponse Interface

The `EventGetResponse` interface defines the structure of the response returned when retrieving an event's details.

#### Properties

- `id` (**string**): The unique ID of the event.
- `accountRef` (**string**): The reference to the account associated with the event.
- `type` (**string**): The type of the event.
- `customer` (**object**): The customer details.
- `channel` (**object**): The channel details.
- `transaction` (**object**): The transaction details.
- `products` (**Array<object>**): A list of products associated with the event.
- `system` (**string**): The system that created the event.
- `systemVersion` (**string**): The version of the system that created the event.
- `metadata` (**object**): Additional metadata for the event.
- `createdAt` (**string**): The timestamp when the event was created.

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions for all methods and returned data structures.

## Contributing

Contributions are welcome! Please submit pull requests with any enhancements, bug fixes, or documentation improvements.

## License

This SDK is released under the MIT License.
