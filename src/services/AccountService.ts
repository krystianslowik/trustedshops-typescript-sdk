import axios, { AxiosInstance } from "axios";
import { Channel, UpdateChannel, ChannelResponse } from "../interfaces/";

export class AccountService {
  private axios: AxiosInstance;

  constructor(private getAccessToken: () => Promise<string>) {
    this.axios = axios.create({
      baseURL: "https://api.etrusted.com",
    });

    this.axios.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async getChannels(): Promise<Channel[]> {
    const response = await this.axios.get<Channel[]>("/channels");
    return response.data;
  }

  async updateChannel(
    id: string,
    updateData: UpdateChannel
  ): Promise<ChannelResponse> {
    const response = await this.axios.put<ChannelResponse>(
      `/channels/${id}`,
      updateData
    );
    return response.data;
  }

  getChannelByName(channels: Channel[], name: string): Channel | undefined {
    return channels.find(
      (channel) => channel.name.toLowerCase() === name.toLowerCase()
    );
  }

  getChannelByLocale(channels: Channel[], locale: string): Channel | undefined {
    return channels.find((channel) => channel.locale === locale);
  }

  getChannelsByLocale(channels: Channel[], locale: string): Channel[] {
    return channels.filter((channel) => channel.locale === locale);
  }
}
