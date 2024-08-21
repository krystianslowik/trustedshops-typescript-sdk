import axios, { AxiosInstance } from "axios";
import {
  EventRequest,
  EventPostResponse,
  EventGetResponse,
} from "../interfaces/";

export class EventService {
  private axios: AxiosInstance;
  private getAccessToken: () => Promise<string>;

  constructor(getAccessToken: () => Promise<string>) {
    this.getAccessToken = getAccessToken;
    this.axios = axios.create({
      baseURL: "https://api.etrusted.com",
    });

    this.axios.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  /**
   * Creates a new event.
   *
   * @param {EventRequest} eventRequest - The event data to be created.
   * @returns {Promise<EventPostResponse>} A promise that resolves to the created event response.
   */
  public async createEvent(
    eventRequest: EventRequest
  ): Promise<EventPostResponse> {
    try {
      if (!eventRequest.system) {
        eventRequest.system = "Trusted Shops TypeScript SDK";
      }

      if (!eventRequest.systemVersion) {
        eventRequest.systemVersion = "1.0.0";
      }

      const response = await this.axios.post<EventPostResponse>(
        "/events",
        eventRequest
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create event:", error);
      throw error;
    }
  }

  /**
   * Retrieves an event by its ID.
   *
   * @param {string} eventRef - The reference ID of the event to retrieve.
   * @returns {Promise<EventGetResponse>} A promise that resolves to the event details.
   */
  public async getEvent(eventRef: string): Promise<EventGetResponse> {
    try {
      const response = await this.axios.get<EventGetResponse>(
        `/events/${eventRef}`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch event:", error);
      throw error;
    }
  }
}
