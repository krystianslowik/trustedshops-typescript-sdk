import { EventService as EventsService } from "../src/services/EventsService";
import {
  EventRequest,
  EventPostResponse,
  EventGetResponse,
} from "../src/interfaces/Events.model";
import axios from "axios";

jest.mock("axios", () => {
  return {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      post: jest.fn(),
      get: jest.fn(),
    })),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
});

describe("EventsService", () => {
  let eventsService: EventsService;
  const mockGetAccessToken = jest.fn().mockResolvedValue("test-token");

  beforeEach(() => {
    jest.clearAllMocks();
    eventsService = new EventsService(mockGetAccessToken);
  });

  it("should create an event", async () => {
    const mockEventRequest: EventRequest = {
      type: "test-event",
      customer: { email: "test@example.com" },
      channel: { id: "chl-1" },
      transaction: { reference: "test-transaction" },
    };
    const mockEventResponse: EventPostResponse = {
      EventRef: "evt-1",
      Message: "Event created successfully",
    };
    (eventsService["axios"].post as jest.Mock).mockResolvedValue({
      data: mockEventResponse,
    });

    const response = await eventsService.createEvent(mockEventRequest);
    expect(response).toEqual(mockEventResponse);
    expect(eventsService["axios"].post).toHaveBeenCalledWith(
      "/events",
      mockEventRequest
    );
  });

  it("should get an event", async () => {
    const mockEventId = "evt-1";
    const mockEventDetails: EventGetResponse = {
      id: mockEventId,
      accountRef: "acc-1",
      type: "test-event",
      customer: { email: "test@example.com" },
      channel: { id: "chl-1", type: "etrusted" },
      transaction: { reference: "test-transaction" },
      tracking: { client: "test-client", medium: "API" },
      system: "test-system",
      systemVersion: "1.0.0",
      createdAt: "2023-01-01T00:00:00Z",
    };
    (eventsService["axios"].get as jest.Mock).mockResolvedValue({
      data: mockEventDetails,
    });

    const eventDetails = await eventsService.getEvent(mockEventId);
    expect(eventDetails).toEqual(mockEventDetails);
    expect(eventsService["axios"].get).toHaveBeenCalledWith(
      `/events/${mockEventId}`
    );
  });

  it("should handle errors when creating an event", async () => {
    const mockEventRequest: EventRequest = {
      type: "test-event",
      customer: { email: "test@example.com" },
      channel: { id: "chl-1" },
      transaction: { reference: "test-transaction" },
    };
    (eventsService["axios"].post as jest.Mock).mockRejectedValue(
      new Error("Failed to create event")
    );

    await expect(eventsService.createEvent(mockEventRequest)).rejects.toThrow(
      "Failed to create event"
    );
  });

  it("should handle errors when getting an event", async () => {
    const mockEventId = "evt-1";
    (eventsService["axios"].get as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch event")
    );

    await expect(eventsService.getEvent(mockEventId)).rejects.toThrow(
      "Failed to fetch event"
    );
  });
});
