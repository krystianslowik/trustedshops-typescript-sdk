import { AuthenticationManager } from "./auth/authenticationManager";
import { ReviewsService } from "./services/ReviewsService";
import { AccountService } from "./services/AccountService";
import { EventService } from "./services/EventsService";
import {
  Channel,
  ChannelId,
  ChannelResponse,
  UpdateChannel,
} from "./interfaces/Account.model";
import {
  ReviewOptions,
  ReviewState,
  CustomerReviewListResponse,
} from "./interfaces/Review.model";
import {
  EventGetResponse,
  EventPostResponse,
  EventRequest,
} from "./interfaces/Events.model";

export class TrustedShops {
  private static authManager: AuthenticationManager;
  public static Reviews: ReviewsService;
  private static Account: AccountService;
  private static Events: EventService;
  private static channels: Channel[] = [];
  private static isInitialized: boolean = false;

  private static readonly TOKEN_ENDPOINT =
    process.env.TOKEN_ENDPOINT ?? "https://login.etrusted.com/oauth/token";

  private static readonly defaultReviewOptions: ReviewOptions = {
    count: 999,
    orderBy: "submittedAt",
  };

  /**
   * Initializes the TrustedShops class with authentication and services setup.
   * @param clientId - The client ID for authentication.
   * @param clientSecret - The client secret for authentication.
   * @throws {Error} If initialization fails.
   */
  public static async initialize(
    clientId: string,
    clientSecret: string
  ): Promise<void> {
    try {
      this.authManager = new AuthenticationManager({
        clientId,
        clientSecret,
        tokenEndpoint: this.TOKEN_ENDPOINT,
      });
      await this.authManager.authenticate();

      const getAccessToken = () => this.authManager.getAccessToken();

      this.Reviews = new ReviewsService(getAccessToken);
      this.Account = new AccountService(getAccessToken);
      this.Events = new EventService(getAccessToken);

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize TrustedShops:", error);
      throw new Error("TrustedShops initialization failed");
    }
  }

  /**
   * Ensures the class is initialized before performing operations.
   * @throws {Error} If the class is not initialized.
   */
  private static ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error(
        "TrustedShops is not initialized. Call initialize() first."
      );
    }
  }

  /**
   * Refreshes the list of channels.
   * @returns {Promise<Channel[]>} The updated list of channels.
   */
  public static async refreshChannelsList(): Promise<Channel[]> {
    this.ensureInitialized();
    this.channels = await this.Account.getChannels();
    return this.channels;
  }

  /**
   * Gets the current access token.
   * @returns {Promise<string>} The current access token.
   * @throws {Error} If not authenticated.
   */
  public static async showToken(): Promise<string> {
    this.ensureInitialized();
    return this.authManager.getAccessToken();
  }

  /**
   * Gets all channels.
   * @returns {Channel[]} The list of all channels.
   */
  public static getChannels(): Channel[] {
    this.ensureInitialized();
    return this.channels;
  }

  /**
   * Gets a channel by its ID, name, or locale.
   * @param identifier - The channel ID, name, or locale.
   * @returns {Channel | undefined} The found channel or undefined.
   */
  public static getChannel(
    identifier: ChannelId | string
  ): Channel | undefined {
    this.ensureInitialized();
    if (typeof identifier === "string" && identifier.startsWith("chl-")) {
      return this.channels.find((channel) => channel.id === identifier);
    }
    return this.channels.find(
      (channel) =>
        channel.name.toLowerCase() === identifier.toLowerCase() ||
        channel.locale === identifier
    );
  }

  /**
   * Gets channels by locale.
   * @param locale - The locale to filter by.
   * @returns {Channel[]} The list of channels matching the locale.
   */
  public static getChannelsByLocale(locale: string): Channel[] {
    this.ensureInitialized();
    return this.channels.filter((channel) => channel.locale === locale);
  }

  /**
   * Updates a channel.
   * @param id - The ID of the channel to update.
   * @param updateData - The data to update the channel with.
   * @returns {Promise<Channel>} The updated channel.
   */
  public static async updateChannel(
    id: ChannelId,
    updateData: UpdateChannel
  ): Promise<ChannelResponse> {
    this.ensureInitialized();
    const response = await this.Account.updateChannel(id, updateData);
    await this.refreshChannelsList();
    return response;
  }

  /**
   * Gets reviews for a specific channel.
   * @param channelIdentifier - The channel ID, name, or locale.
   * @param options - The options for fetching reviews.
   * @returns {Promise<CustomerReviewListResponse>} The list of reviews.
   * @throws {Error} If the channel is not found.
   */
  public static async getReviewsForChannel(
    channelIdentifier: ChannelId | string,
    options: ReviewOptions = { ...this.defaultReviewOptions }
  ): Promise<CustomerReviewListResponse> {
    this.ensureInitialized();
    const channel = this.getChannel(channelIdentifier);

    if (!channel) {
      throw new Error(`Channel not found: ${channelIdentifier}`);
    }

    return this.Reviews.getReviews([channel.id], options);
  }

  /**
   * Gets reviews for all channels.
   * @param options - The options for fetching reviews.
   * @returns {Promise<CustomerReviewListResponse>} The list of reviews.
   */
  public static async getReviewsForAllChannels(
    options: ReviewOptions = { ...this.defaultReviewOptions }
  ): Promise<CustomerReviewListResponse> {
    this.ensureInitialized();
    const channelIds = this.channels.map((channel) => channel.id);
    return this.Reviews.getReviews(channelIds, options);
  }

  /**
   * Triggers an event for a specific channel.
   * @param eventData - The event data to be sent.
   * @param channelIdentifier - The channel ID, name, or locale.
   * @returns {Promise<EventPostResponse>} The response from creating the event.
   * @throws {Error} If the channel is not found.
   */
  public static async triggerEvent(
    eventData: Partial<EventRequest>,
    channelIdentifier?: ChannelId | string
  ): Promise<EventPostResponse> {
    this.ensureInitialized();
    const channel = channelIdentifier
      ? this.getChannel(channelIdentifier)
      : this.channels[0];

    if (!channel) {
      throw new Error(`Channel not found: ${channelIdentifier}`);
    }

    const fullEventData: EventRequest = {
      ...eventData,
      channel: { id: channel.id, type: "etrusted" },
      transaction: {
        reference:
          eventData.transaction?.reference || `transaction-${Date.now()}`,
        ...eventData.transaction,
      },
    } as EventRequest;

    console.log(
      `Triggering event "${fullEventData.type}" for customer email "${fullEventData.customer.email}" on channel "${channel.name}"...\n`
    );

    return await this.Events.createEvent(fullEventData);
  }

  /**
   * Checks the details of a specific event.
   * @param eventId - The ID of the event to check.
   * @returns {Promise<EventGetResponse>} The event details.
   */
  public static async checkEventDetails(
    eventId: string
  ): Promise<EventGetResponse> {
    this.ensureInitialized();
    console.log(`Checking event data for event "${eventId}"...\n`);
    return await this.Events.getEvent(eventId);
  }
}
