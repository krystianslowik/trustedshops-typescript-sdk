import { AccountService } from "../src/services/AccountService";
import { Channel, UpdateChannel } from "../src/interfaces/Account.model";
import axios from "axios";

jest.mock("axios", () => {
  return {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      get: jest.fn(),
      put: jest.fn(),
    })),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
});

describe("AccountService", () => {
  let accountService: AccountService;
  const mockGetAccessToken = jest.fn().mockResolvedValue("test-token");

  beforeEach(() => {
    jest.clearAllMocks();
    accountService = new AccountService(mockGetAccessToken);
  });

  it("should get channels", async () => {
    const mockChannels = [{ id: "chl-1", name: "Channel 1" }];
    (accountService["axios"].get as jest.Mock).mockResolvedValue({
      data: mockChannels,
    });
    const channels = await accountService.getChannels();
    expect(channels).toEqual(mockChannels);
    expect(accountService["axios"].get).toHaveBeenCalledWith("/channels");
  });

  it("should update a channel", async () => {
    const mockUpdateData: UpdateChannel = { name: "Updated Channel" };
    const mockResponse = { id: "chl-1", ...mockUpdateData };
    (accountService["axios"].put as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });
    const response = await accountService.updateChannel(
      "chl-1",
      mockUpdateData
    );
    expect(response).toEqual(mockResponse);
    expect(accountService["axios"].put).toHaveBeenCalledWith(
      "/channels/chl-1",
      mockUpdateData
    );
  });

  it("should get channel by name", () => {
    const mockChannels: Channel[] = [
      {
        id: "chl-1",
        name: "Channel 1",
        accountRef: "",
        address: "",
        createdAt: "",
        locale: "",
        logoUrl: "",
        updatedAt: "",
        url: "",
      },
      {
        id: "chl-2",
        name: "Channel 2",
        accountRef: "",
        address: "",
        createdAt: "",
        locale: "",
        logoUrl: "",
        updatedAt: "",
        url: "",
      },
    ];
    const channel = accountService.getChannelByName(mockChannels, "Channel 2");
    expect(channel).toEqual(mockChannels[1]);
  });

  it("should return undefined when channel name is not found", () => {
    const mockChannels: Channel[] = [
      {
        id: "chl-1",
        name: "Channel 1",
        accountRef: "",
        address: "",
        createdAt: "",
        locale: "",
        logoUrl: "",
        updatedAt: "",
        url: "",
      },
    ];
    const channel = accountService.getChannelByName(
      mockChannels,
      "Non-existent Channel"
    );
    expect(channel).toBeUndefined();
  });

  it("should get channel by locale", () => {
    const mockChannels: Channel[] = [
      {
        id: "chl-1",
        name: "Channel 1",
        accountRef: "",
        address: "",
        createdAt: "",
        locale: "en_US",
        logoUrl: "",
        updatedAt: "",
        url: "",
      },
      {
        id: "chl-2",
        name: "Channel 2",
        accountRef: "",
        address: "",
        createdAt: "",
        locale: "de_DE",
        logoUrl: "",
        updatedAt: "",
        url: "",
      },
    ];
    const channel = accountService.getChannelByLocale(mockChannels, "de_DE");
    expect(channel).toEqual(mockChannels[1]);
  });

  it("should return undefined when channel locale is not found", () => {
    const mockChannels: Channel[] = [
      {
        id: "chl-1",
        name: "Channel 1",
        accountRef: "",
        address: "",
        createdAt: "",
        locale: "en_US",
        logoUrl: "",
        updatedAt: "",
        url: "",
      },
    ];
    const channel = accountService.getChannelByLocale(mockChannels, "fr_FR");
    expect(channel).toBeUndefined();
  });

  it("should get channels by locale", () => {
    const mockChannels: Channel[] = [
      {
        id: "chl-1",
        name: "Channel 1",
        accountRef: "",
        address: "",
        createdAt: "",
        locale: "en_US",
        logoUrl: "",
        updatedAt: "",
        url: "",
      },
      {
        id: "chl-2",
        name: "Channel 2",
        accountRef: "",
        address: "",
        createdAt: "",
        locale: "de_DE",
        logoUrl: "",
        updatedAt: "",
        url: "",
      },
      {
        id: "chl-3",
        name: "Channel 3",
        accountRef: "",
        address: "",
        createdAt: "",
        locale: "en_US",
        logoUrl: "",
        updatedAt: "",
        url: "",
      },
    ];
    const channels = accountService.getChannelsByLocale(mockChannels, "en_US");
    expect(channels).toEqual([mockChannels[0], mockChannels[2]]);
  });

  it("should return an empty array when no channels match the locale", () => {
    const mockChannels: Channel[] = [
      {
        id: "chl-1",
        name: "Channel 1",
        accountRef: "",
        address: "",
        createdAt: "",
        locale: "en_US",
        logoUrl: "",
        updatedAt: "",
        url: "",
      },
    ];
    const channels = accountService.getChannelsByLocale(mockChannels, "fr_FR");
    expect(channels).toEqual([]);
  });
});
