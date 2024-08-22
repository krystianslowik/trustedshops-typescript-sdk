import { AuthenticationManager } from "../src/auth/authenticationManager";
import axios from "axios";

jest.mock("axios");

describe("AuthenticationManager", () => {
  const mockClientId = "test-client-id";
  const mockClientSecret = "test-client-secret";
  const mockTokenEndpoint = "https://test.com/token";

  let authManager: AuthenticationManager;

  beforeEach(() => {
    jest.clearAllMocks();
    authManager = new AuthenticationManager({
      clientId: mockClientId,
      clientSecret: mockClientSecret,
      tokenEndpoint: mockTokenEndpoint,
    });
  });

  it("should authenticate successfully", async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { access_token: "test-token", expires_in: 3600 },
    });
    await authManager.authenticate();
    expect(await authManager.getAccessToken()).toBe("test-token");
    expect(axios.post).toHaveBeenCalledWith(
      mockTokenEndpoint,
      expect.any(URLSearchParams),
      expect.any(Object)
    );
  });

  it("should throw an error if authentication fails", async () => {
    (axios.post as jest.Mock).mockRejectedValue(
      new Error("Authentication failed")
    );
    await expect(authManager.authenticate()).rejects.toThrow(
      "Authentication failed"
    );
  });

  it("should return a valid access token", async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { access_token: "test-token", expires_in: 3600 },
    });
    await authManager.authenticate();
    const token = await authManager.getAccessToken();
    expect(token).toBe("test-token");
  });

  it("should re-authenticate if token is expired", async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { access_token: "new-token", expires_in: 3600 },
    });
    await authManager.authenticate();

    (axios.post as jest.Mock).mockClear();

    (authManager as any).tokenExpiresAt = Date.now() - 1000;

    const token = await authManager.getAccessToken();
    expect(token).toBe("new-token");
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it("should not re-authenticate if token is still valid", async () => {
    (axios.post as jest.Mock).mockResolvedValue({
      data: { access_token: "test-token", expires_in: 3600 },
    });
    await authManager.authenticate();

    (axios.post as jest.Mock).mockClear();

    const token = await authManager.getAccessToken();
    expect(token).toBe("test-token");
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("should handle network errors during authentication", async () => {
    (axios.post as jest.Mock).mockRejectedValue(new Error("Network Error"));
    await expect(authManager.authenticate()).rejects.toThrow(
      "Authentication failed"
    );
  });
});
