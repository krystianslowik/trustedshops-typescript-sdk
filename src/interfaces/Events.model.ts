import { ChannelId } from "./";

export interface EventRequest {
  type: string;
  defaultLocale?: string;
  customer: {
    firstName?: string;
    lastName?: string;
    email: string;
    address?: string;
    mobile?: string;
    reference?: string;
  };
  channel: {
    id?: ChannelId;
    type?: "user_defined" | "etrusted";
  };
  transaction: {
    reference: string;
    date?: string;
  };
  estimatedDeliveryDate?: string;
  products?: Array<{
    gtin?: string;
    imageUrl?: string;
    name: string;
    mpn?: string;
    sku: string;
    brand?: string;
    url: string;
  }>;
  system?: string;
  systemVersion?: string;
  metadata?: Record<string, any>;
}

export interface EventPostResponse {
  Message: string;
  EventRef: string;
}

export interface EventGetResponse {
  id: string;
  accountRef: string;
  type: string;
  defaultLocale?: string;
  customer: {
    firstName?: string;
    lastName?: string;
    email: string;
    address?: string;
    mobile?: string;
    reference?: string;
  };
  channel: {
    id: string;
    type?: "user_defined" | "etrusted";
  };
  tracking: {
    client?: string;
    medium?: "API" | "WIDGET" | "WEB_APP" | "MOBILE_APP";
  };
  transaction: {
    reference: string;
    date?: string;
  };
  estimatedDeliveryDate?: string;
  products?: Array<{
    gtin?: string;
    imageUrl?: string;
    name: string;
    mpn?: string;
    sku: string;
    brand?: string;
    url: string;
  }>;
  system: string;
  systemVersion: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ValidationError {
  Message: string;
}

export interface ServiceUnavailable {
  Message: string;
}

export interface UnauthorizedError {
  Message: string;
}

export interface InternalServerError {
  Message: string;
}
