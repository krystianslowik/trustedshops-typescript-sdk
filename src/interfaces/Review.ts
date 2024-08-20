export interface Review {
  id: string;
  accountRef: string;
  channelRef: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  feedbackType: string;
  state: string;
  type: string;
  verificationType: string;
  customer: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
  };
  transaction: { reference: string; date: string };
  event: { id: string; type: string };
  metadata: string;
  surveyData: any[];
  questionnaire: {
    id: string;
    locale: string;
    templateRef: string;
  };
  hasAttachments: boolean;
  product?: {
    id: string;
    sku: string;
    name: string;
    url: string;
    imageUrl: string;
    brand: string;
  };
  reply?: {
    createdAt: string;
    updatedAt: string;
    comment: string;
  };
  originalReview?: {
    rating: number;
    comment: string;
    title: string;
    reply: any;
  };
}
