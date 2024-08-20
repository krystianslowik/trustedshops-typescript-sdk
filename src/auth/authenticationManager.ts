import axios from "axios";
import { AuthenticationApiAxiosParamCreator as OAuth } from "../generated/auth";
import type { OauthTokenPost200Response } from "../generated/auth";

export class AuthenticationManager {
  private clientId: string;
  private clientSecret: string;
  private tokenEndpoint: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(clientId: string, clientSecret: string, tokenEndpoint: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tokenEndpoint = tokenEndpoint;
  }

  public async authenticate(): Promise<void> {
    try {
      const oauthParams = await OAuth().oauthTokenPost(
        this.clientId,
        this.clientSecret,
        "client_credentials",
        this.tokenEndpoint
      );

      const response = await axios.request<OauthTokenPost200Response>({
        ...oauthParams.options,
        url: this.tokenEndpoint,
      });

      const data = response.data;
      this.accessToken = data.access_token || null;
      this.tokenExpiresAt = data.expires_in
        ? Date.now() + data.expires_in * 1000
        : null;

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
