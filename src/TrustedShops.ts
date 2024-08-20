import { AuthenticationManager } from "./auth/authenticationManager";
import { ReviewsService } from "./services/ReviewsService";
import { AccountService } from "./services/AccountService";
import { Channel, UpdateChannel } from "./interfaces/Account.model";

export class TrustedShops {
  private static authManager: AuthenticationManager;
  public static Reviews: ReviewsService;
  public static Account: AccountService;
  private static channels: Channel[] = [];

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

  public static getChannelById(id: string): Channel | undefined {
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

  public static async updateChannel(id: string, updateData: UpdateChannel) {
    const response = await TrustedShops.Account.updateChannel(id, updateData);
    TrustedShops.channels = await TrustedShops.Account.getChannels();
    return response;
  }

  public static async getReviewsForChannel(
    channelIdentifier: string,
    options?: any
  ) {
    let channel: Channel | undefined;

    if (channelIdentifier.startsWith("chl-")) {
      channel = this.getChannelById(channelIdentifier);
    } else {
      channel =
        this.getChannelByName(channelIdentifier) ||
        this.getChannelByLocale(channelIdentifier);
    }

    if (!channel) {
      throw new Error(`Channel not found: ${channelIdentifier}`);
    }

    return TrustedShops.Reviews.getReviews([channel.id], options);
  }

  public static async getReviewsForAllChannels(options?: any) {
    const channelIds = TrustedShops.channels.map((channel) => channel.id);
    return TrustedShops.Reviews.getReviews(channelIds, options);
  }
}
