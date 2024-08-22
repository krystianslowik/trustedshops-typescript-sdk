import { TrustedShops } from "../src/TrustedShops";
import { AuthenticationManager } from "../src/auth/authenticationManager";
import { ReviewsService } from "../src/services/ReviewsService";
import { AccountService } from "../src/services/AccountService";
import { EventService } from "../src/services/EventsService";

// Mock the imported services
jest.mock("../src/auth/authenticationManager");
jest.mock("../src/services/ReviewsService");
jest.mock("../src/services/AccountService");
jest.mock("../src/services/EventsService");

describe("TrustedShops", () => {
  const mockClientId = "test-client-id";
  const mockClientSecret = "test-client-secret";
  const mockToken = "test-token";
  const mockChannels = [
    { id: "chl-1", name: "Channel 1", locale: "en_US" },
    { id: "chl-2", name: "Channel 2", locale: "de_DE" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (
      AuthenticationManager.prototype.authenticate as jest.Mock
    ).mockResolvedValue(undefined);
    (
      AuthenticationManager.prototype.getAccessToken as jest.Mock
    ).mockResolvedValue(mockToken);
    (AccountService.prototype.getChannels as jest.Mock).mockResolvedValue(
      mockChannels
    );
  });

  describe("initialize", () => {
    it("should initialize TrustedShops successfully", async () => {
      await TrustedShops.initialize(mockClientId, mockClientSecret);
      expect(TrustedShops["isInitialized"]).toBe(true);
    });

    it("should throw an error if initialization fails", async () => {
      (
        AuthenticationManager.prototype.authenticate as jest.Mock
      ).mockRejectedValue(new Error("Auth failed"));
      await expect(
        TrustedShops.initialize(mockClientId, mockClientSecret)
      ).rejects.toThrow("TrustedShops initialization failed");
    });
  });

  describe("after initialization", () => {
    beforeEach(async () => {
      await TrustedShops.initialize(mockClientId, mockClientSecret);
    });

    describe("refreshChannelsList", () => {
      it("should refresh the channels list", async () => {
        const channels = await TrustedShops.refreshChannelsList();
        expect(channels).toEqual(mockChannels);
        expect(TrustedShops["channels"]).toEqual(mockChannels);
      });
    });

    describe("showToken", () => {
      it("should return the current access token", async () => {
        const token = await TrustedShops.showToken();
        expect(token).toBe(mockToken);
      });
    });

    describe("getChannels", () => {
      it("should return all channels", async () => {
        await TrustedShops.refreshChannelsList();
        const channels = TrustedShops.getChannels();
        expect(channels).toEqual(mockChannels);
      });
    });

    describe("getChannel", () => {
      beforeEach(async () => {
        await TrustedShops.refreshChannelsList();
      });

      it("should return a channel by ID", () => {
        const channel = TrustedShops.getChannel("chl-1");
        expect(channel).toEqual(mockChannels[0]);
      });

      it("should return a channel by name", () => {
        const channel = TrustedShops.getChannel("Channel 2");
        expect(channel).toEqual(mockChannels[1]);
      });

      it("should return a channel by locale", () => {
        const channel = TrustedShops.getChannel("de_DE");
        expect(channel).toEqual(mockChannels[1]);
      });

      it("should return undefined for non-existent channel", () => {
        const channel = TrustedShops.getChannel("non-existent");
        expect(channel).toBeUndefined();
      });
    });

    describe("getChannelsByLocale", () => {
      it("should return channels by locale", async () => {
        await TrustedShops.refreshChannelsList();
        const channels = TrustedShops.getChannelsByLocale("de_DE");
        expect(channels).toEqual([mockChannels[1]]);
      });
    });

    describe("updateChannel", () => {
      it("should update a channel and refresh the list", async () => {
        const mockUpdateData = { name: "Updated Channel" };
        const mockUpdateResponse = { id: "chl-1", ...mockUpdateData };
        (AccountService.prototype.updateChannel as jest.Mock).mockResolvedValue(
          mockUpdateResponse
        );

        const response = await TrustedShops.updateChannel(
          "chl-1",
          mockUpdateData
        );
        expect(response).toEqual(mockUpdateResponse);
        expect(AccountService.prototype.getChannels).toHaveBeenCalled();
      });
    });

    describe("getReviewsForChannel", () => {
      it("should get reviews for a specific channel", async () => {
        const mockReviews = { items: [{ id: "review-1" }] };
        (ReviewsService.prototype.getReviews as jest.Mock).mockResolvedValue(
          mockReviews
        );

        const reviews = await TrustedShops.getReviewsForChannel("chl-1");
        expect(reviews).toEqual(mockReviews);
        expect(ReviewsService.prototype.getReviews).toHaveBeenCalledWith(
          ["chl-1"],
          expect.any(Object)
        );
      });

      it("should throw an error for non-existent channel", async () => {
        await expect(
          TrustedShops.getReviewsForChannel("non-existent")
        ).rejects.toThrow("Channel not found");
      });
    });

    describe("getReviewsForAllChannels", () => {
      it("should get reviews for all channels", async () => {
        const mockReviews = { items: [{ id: "review-1" }, { id: "review-2" }] };
        (ReviewsService.prototype.getReviews as jest.Mock).mockResolvedValue(
          mockReviews
        );

        const reviews = await TrustedShops.getReviewsForAllChannels();
        expect(reviews).toEqual(mockReviews);
        expect(ReviewsService.prototype.getReviews).toHaveBeenCalledWith(
          ["chl-1", "chl-2"],
          expect.any(Object)
        );
      });
    });

    describe("triggerEvent", () => {
      it("should trigger an event for a specific channel", async () => {
        const mockEventData = {
          type: "test-event",
          customer: { email: "test@example.com" },
          transaction: { reference: "test-transaction" },
        };
        const mockEventResponse = { EventRef: "evt-1" };
        (EventService.prototype.createEvent as jest.Mock).mockResolvedValue(
          mockEventResponse
        );

        const response = await TrustedShops.triggerEvent(
          mockEventData,
          "chl-1"
        );

        expect(response).toEqual(mockEventResponse);
        expect(EventService.prototype.createEvent).toHaveBeenCalledWith({
          ...mockEventData,
          channel: { id: "chl-1", type: "etrusted" },
        });
      });
    });

    describe("checkEventDetails", () => {
      it("should check event details", async () => {
        const mockEventDetails = { id: "evt-1", type: "test-event" };
        (EventService.prototype.getEvent as jest.Mock).mockResolvedValue(
          mockEventDetails
        );

        const eventDetails = await TrustedShops.checkEventDetails("evt-1");
        expect(eventDetails).toEqual(mockEventDetails);
        expect(EventService.prototype.getEvent).toHaveBeenCalledWith("evt-1");
      });
    });
  });
});
