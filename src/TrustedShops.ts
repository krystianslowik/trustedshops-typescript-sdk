import { AuthenticationManager } from "./auth/authenticationManager";
import { ReviewsService } from "./services/ReviewsService";
import { AccountService } from "./services/AccountService";
import { EventService } from "./services/EventsService";
import { Channel, ChannelId, UpdateChannel } from "./interfaces/Account.model";
import { ReviewOptions, ReviewState } from "interfaces/Review.model";
import { get } from "http";
import {
  EventGetResponse,
  EventPostResponse,
  EventRequest,
} from "interfaces/Events.model";
import { channel } from "diagnostics_channel";

export class TrustedShops {
  private static authManager: AuthenticationManager;
  public static Reviews: ReviewsService;
  private static Account: AccountService;
  private static Events: EventService;
  public static channels: Channel[] = [];
  private static defaultOptions: ReviewOptions = {
    count: 999,
    orderBy: "submittedAt",
    // status: [ReviewState.APPROVED],
  };

  private static readonly TOKEN_ENDPOINT =
    process.env.TOKEN_ENDPOINT ?? "https://login.etrusted.com/oauth/token";

  public static async authenticate(
    clientId: string,
    clientSecret: string
  ): Promise<void> {
    TrustedShops.authManager = new AuthenticationManager({
      clientId,
      clientSecret,
      tokenEndpoint: TrustedShops.TOKEN_ENDPOINT,
    });
    await TrustedShops.authManager.authenticate();

    const getAccessToken = () => TrustedShops.authManager.getAccessToken();

    TrustedShops.Reviews = new ReviewsService(getAccessToken);
    TrustedShops.Account = new AccountService(getAccessToken);
    TrustedShops.Events = new EventService(getAccessToken);

    TrustedShops.channels = await TrustedShops.Account.getChannels();
    console.log("Kanaly: ", TrustedShops.channels);
  }

  public static async showToken(): Promise<string> {
    if (TrustedShops.authManager) {
      return TrustedShops.authManager.getAccessToken();
    } else {
      throw new Error(
        "Not authenticated. Call TrustedShops.authenticate first."
      );
    }
  }

  public static getChannels(): Channel[] {
    return this.channels;
  }

  public static async refreshChannelsList(): Promise<Channel[]> {
    return await TrustedShops.Account.getChannels();
  }

  public static getChannelById(id: ChannelId): Channel | undefined {
    return TrustedShops.channels.find((channel) => channel.id === id);
  }

  public static getChannelByName(name: string): Channel | undefined {
    return TrustedShops.Account.getChannelByName(TrustedShops.channels, name);
  }

  public static getChannelByLocale(locale: string): Channel | undefined {
    return TrustedShops.Account.getChannelByLocale(
      TrustedShops.channels,
      locale
    );
  }

  public static getChannelsByLocale(locale: string): Channel[] {
    return TrustedShops.Account.getChannelsByLocale(
      TrustedShops.channels,
      locale
    );
  }

  public static async updateChannel(id: ChannelId, updateData: UpdateChannel) {
    const response = await TrustedShops.Account.updateChannel(id, updateData);
    TrustedShops.channels = await TrustedShops.Account.getChannels();
    return response;
  }

  public static async getReviewsForChannel(
    channelIdOrNameOrLocale: ChannelId | string,
    options: ReviewOptions = { ...this.defaultOptions }
  ) {
    let channel: Channel | undefined;

    if (channelIdOrNameOrLocale.startsWith("chl-")) {
      channel = this.getChannelById(channelIdOrNameOrLocale);
    } else {
      channel =
        this.getChannelByName(channelIdOrNameOrLocale) ||
        this.getChannelByLocale(channelIdOrNameOrLocale);
    }

    if (!channel) {
      throw new Error(`Channel not found: ${channelIdOrNameOrLocale}`);
    }

    return TrustedShops.Reviews.getReviews([channel.id], options);
  }

  public static async getReviewsForAllChannels(options?: ReviewOptions) {
    const channelIds = TrustedShops.channels.map((channel) => channel.id);
    return TrustedShops.Reviews.getReviews(channelIds, options);
  }

  public static async triggerEvent(
    eventData: EventRequest,
    channelNameOrLocale?: string,
    channelId?: ChannelId
  ): Promise<EventPostResponse> {
    const resolvedChannelId =
      channelId ??
      (channelNameOrLocale && (await this.getChannelId(channelNameOrLocale)));

    if (resolvedChannelId) {
      eventData.channel = { id: resolvedChannelId, type: "etrusted" };
    }

    console.log(
      `Triggering event "${eventData.type}" for customer email "${eventData.customer.email}"...\n`
    );

    return await TrustedShops.Events.createEvent(eventData);
  }

  public static async checkEventDetails(
    eventId: string
  ): Promise<EventGetResponse> {
    console.log(`Checking event data for event "${eventId}"...\n`);
    return await TrustedShops.Events.getEvent(eventId);
  }

  public static getChannelId(
    channelNameOrLocale: string,
    fallback: boolean = false
  ): ChannelId {
    const channel =
      this.getChannelByName(channelNameOrLocale) ||
      this.getChannelByLocale(channelNameOrLocale);

    if (channel) {
      return channel.id;
    }

    if (fallback) {
      return TrustedShops.channels[0].id;
    }

    throw new Error(`Channel not found: ${channelNameOrLocale}`);
  }
}
