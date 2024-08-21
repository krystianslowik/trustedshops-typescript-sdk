import { AuthenticationManager } from "./auth/authenticationManager";
import { ReviewsService } from "./services/ReviewsService";
import { AccountService } from "./services/AccountService";
import { Channel, ChannelId, UpdateChannel } from "./interfaces/Account.model";
import { ReviewOptions, ReviewState } from "interfaces/Review.model";

export class TrustedShops {
  private static authManager: AuthenticationManager;
  public static Reviews: ReviewsService;
  private static Account: AccountService;
  private static channels: Channel[] = [];
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

    TrustedShops.channels = await TrustedShops.Account.getChannels();
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
    return TrustedShops.channels;
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
    channelIdOrNameOrLocale: string,
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
}
