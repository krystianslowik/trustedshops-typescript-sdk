import axios from "axios";
import {
  OAuthTokenResponse,
  AuthenticationConfig,
} from "../interfaces/Auth.model";

export class AuthenticationManager {
  private clientId: string;
  private clientSecret: string;
  private tokenEndpoint: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(config: AuthenticationConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.tokenEndpoint = config.tokenEndpoint;
  }

  public async authenticate(): Promise<void> {
    try {
      const response = await axios.post<OAuthTokenResponse>(
        this.tokenEndpoint,
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const data = response.data;
      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000;

      if (!this.accessToken) {
        throw new Error("Failed to obtain access token");
      }
    } catch (error) {
      console.error("Failed to fetch access token", error);
      throw new Error("Authentication failed");
    }
  }

  public async getAccessToken(): Promise<string> {
    if (
      !this.accessToken ||
      !this.tokenExpiresAt ||
      Date.now() >= this.tokenExpiresAt
    ) {
      await this.authenticate();
    }
    return this.accessToken!;
  }
}
