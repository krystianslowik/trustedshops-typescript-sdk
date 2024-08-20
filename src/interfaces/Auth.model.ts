export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthenticationConfig {
  clientId: string;
  clientSecret: string;
  tokenEndpoint: string;
}
