import { AuthenticationManager } from "./auth/authenticationManager";

export class TrustedShops {
  private static authManager: AuthenticationManager | null = null;
  private static readonly TOKEN_ENDPOINT =
    process.env.TOKEN_ENDPOINT ?? "https://login.etrusted.com/oauth/token";

  public static async authenticate(
    clientId: string,
    clientSecret: string
  ): Promise<void> {
    this.authManager = new AuthenticationManager(
      clientId,
      clientSecret,
      this.TOKEN_ENDPOINT
    );
    await this.authManager.authenticate();

    const accessToken = await this.authManager.getAccessToken();
    console.log("Access Token:", accessToken);
  }
}
