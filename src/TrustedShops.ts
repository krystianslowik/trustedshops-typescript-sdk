import { AuthenticationManager } from "./auth/authenticationManager";
import { ReviewsAPI } from "./implementations/ReviewsAPI";

export class TrustedShops {
  private authManager: AuthenticationManager | null = null;
  private accessToken: string | null = null;
  private static readonly TOKEN_ENDPOINT =
    process.env.TOKEN_ENDPOINT ?? "https://login.etrusted.com/oauth/token";

  public Reviews: ReviewsAPI | null = null; // Expose ReviewsAPI as a public property

  public async authenticate(
    clientId: string,
    clientSecret: string
  ): Promise<void> {
    this.authManager = new AuthenticationManager(
      clientId,
      clientSecret,
      TrustedShops.TOKEN_ENDPOINT
    );
    await this.authManager.authenticate();
    this.accessToken = await this.authManager.getAccessToken();

    this.Reviews = new ReviewsAPI(this.accessToken);
  }

  public showToken(): Promise<string> {
    if (this.authManager) {
      return this.authManager.getAccessToken();
    } else {
      throw Error(
        "Instance is not authenticated. \nCall .authenticate(client_id, client_secret) to authenticate this instance.\n"
      );
    }
  }
}
