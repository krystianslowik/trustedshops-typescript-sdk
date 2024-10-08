export type ChannelId = string;
export interface Channel {
  id: ChannelId;
  createdAt: string;
  updatedAt: string;
  name: string;
  address: string;
  url: string;
  logoUrl: string;
  accountRef: string;
  locale: string;
}

export interface ChannelResponse {
  id: string;
}

export interface UpdateChannel {
  name: string;
  address?: string;
  url?: string;
  logoUrl?: string;
  locale?: string;
}
