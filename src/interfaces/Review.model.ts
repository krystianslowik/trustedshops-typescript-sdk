export type ReviewState =
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "MODERATION"
  | "DISCARDED";

export enum FeedbackType {
  REVIEW = "REVIEW",
  STATEMENT = "STATEMENT",
}

export enum VerificationType {
  VERIFIED = "VERIFIED",
  UNDEFINED = "UNDEFINED",
}

export type ReviewType = "SERVICE_REVIEW" | "PRODUCT_REVIEW";

export interface ReviewOptions {
  after?: string;
  before?: string;
  submittedAfter?: string;
  submittedBefore?: string;
  count?: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  status?: ReviewState[];
  type?: ReviewType[];
  hasReply?: boolean;
  additionalInformation?: string[];
  ignoreStatements?: boolean;
  query?: string;
  sku?: string[];
  orderBy?: "submittedAt" | "updatedAt" | "lastEditedAt" | "editedAt";
}

export interface ReviewResponse {
  _object?: string;
  id: string;
  accountRef: string;
  channelRef: string;
  inviteRef?: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  feedbackType?: FeedbackType;
  state: ReviewState;
  type: ReviewType;
  verificationType?: VerificationType;
  reply?: CustomerReviewReply;
  customer?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    mobile?: string;
  };
  transaction: {
    reference: string;
    date?: string;
  };
  event?: {
    id: string;
    type: string;
  };
  metadata?: Record<string, any>;
  surveyData?: Record<string, any>;
  questionnaire: {
    id: string;
    locale: string;
    templateRef: string;
  };
  hasAttachments?: boolean;
  additionalInformation?: {
    veto?: ReviewVeto;
    attachments?: {
      images?: AttachmentImage[];
    };
    originalReview?: OriginalReview;
  };
  product?: ProductReviewResponse;
  editedAt?: string;
  originalReview?: OriginalReview;
}

export interface CustomerReviewReply {
  createdAt: string;
  updatedAt: string;
  comment: string;
  sendNotification?: boolean;
}

export interface ReviewVeto {
  createdAt: string;
  comment: string;
  reason: "UNTRUTHFUL" | "ABUSIVE" | "VIOLATES_THE_TERMS_OF_USE";
  ticketId: string;
}

export interface AttachmentImage {
  id: string;
  extensions: string;
  urlOriginal: string;
  pathOriginal: string;
  pathThumbnail: string;
  pathLarge: string;
}

export interface OriginalReview {
  rating: number;
  comment: string;
  title: string;
  reply?: {
    replyComment: string;
    replyCreatedAt: string;
    replyUpdatedAt: string;
  };
}

export interface ProductReviewResponse {
  id: string;
  sku: string;
  mpn?: string;
  gtin?: string;
  name: string;
  url: string;
  imageUrl?: string;
  brand?: string;
}

export interface CustomerReviewListResponse {
  totalElements: number;
  paging: {
    count: number;
    cursor: {
      before: string;
      after?: string;
    };
    links: {
      previous: string;
      next?: string;
    };
  };
  items: ReviewResponse[];
}

export interface ReviewVetoRequest {
  comment: string;
  reason:
    | "UNTRUTHFUL"
    | "ABUSIVE"
    | "VIOLATES_THE_TERMS_OF_USE"
    | "INAPPROPRIATE_IMAGE";
  vetoReporterEmail?: string;
  channelName?: string;
}

export interface ReviewVetoResponse {
  id: string;
  ticketId: string;
  comment: string;
  reason:
    | "UNTRUTHFUL"
    | "ABUSIVE"
    | "VIOLATES_THE_TERMS_OF_USE"
    | "INAPPROPRIATE_IMAGE";
  createdAt: string;
  updatedAt: string;
}

export interface ChannelReviewCountResponse {
  accountId: string;
  channelList?: string[];
  totalElements: number;
}

export interface ReviewReply {
  comment: string;
  sendNotification?: boolean;
}
