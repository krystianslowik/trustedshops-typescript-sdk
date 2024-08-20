import axios, { AxiosInstance } from "axios";
import {
  ReviewResponse as Review,
  ReviewVetoRequest,
  ReviewReply,
  CustomerReviewListResponse,
  ReviewVetoResponse,
  ChannelReviewCountResponse,
  ReviewState,
  ReviewType,
  ReviewOptions,
} from "../interfaces/Review.model";

export class ReviewsService {
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

  public async getReviews(
    channels?: string[],
    options?: ReviewOptions
  ): Promise<CustomerReviewListResponse> {
    try {
      const response = await this.axios.get<CustomerReviewListResponse>(
        "/reviews",
        {
          params: {
            channels: channels?.join(","),
            ...options,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      throw error;
    }
  }

  public async getMinimalReviews(
    channels?: string[],
    options?: ReviewOptions
  ): Promise<CustomerReviewListResponse> {
    try {
      const response = await this.axios.get<CustomerReviewListResponse>(
        "/reviews-minimal",
        {
          params: {
            channels: channels?.join(","),
            ...options,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch minimal reviews:", error);
      throw error;
    }
  }

  public async getReview(reviewId: string): Promise<Review> {
    try {
      const response = await this.axios.get<Review>(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch review:", error);
      throw error;
    }
  }

  public async createVeto(
    reviewId: string,
    reviewVetoRequest: ReviewVetoRequest
  ): Promise<ReviewVetoResponse> {
    try {
      const response = await this.axios.post<ReviewVetoResponse>(
        `/reviews/${reviewId}/vetos`,
        reviewVetoRequest
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create veto:", error);
      throw error;
    }
  }

  public async getReviewVeto(reviewId: string): Promise<ReviewVetoResponse> {
    try {
      const response = await this.axios.get<ReviewVetoResponse>(
        `/reviews/${reviewId}/vetos`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch review veto:", error);
      throw error;
    }
  }

  public async saveReviewReply(
    reviewId: string,
    reviewReply: ReviewReply
  ): Promise<void> {
    try {
      await this.axios.post(`/reviews/${reviewId}/reply`, reviewReply);
    } catch (error) {
      console.error("Failed to save review reply:", error);
      throw error;
    }
  }

  public async deleteReviewReply(reviewId: string): Promise<void> {
    try {
      await this.axios.delete(`/reviews/${reviewId}/reply`);
    } catch (error) {
      console.error("Failed to delete review reply:", error);
      throw error;
    }
  }

  public async filterReviews(
    reviews: Review[],
    rating?: number,
    type?: ReviewType
  ): Promise<Review[]> {
    return reviews.filter((review) => {
      return (
        (rating ? review.rating === rating : true) &&
        (type ? review.type === type : true)
      );
    });
  }

  public async getReviewsCount(options?: {
    channels?: string[];
    submittedAfter?: string;
    submittedBefore?: string;
    rating?: number[];
    status?: ReviewState[];
    type?: ReviewType[];
    hasReply?: boolean;
    ignoreStatements?: boolean;
    query?: string;
    sku?: string[];
  }): Promise<ChannelReviewCountResponse> {
    try {
      const response = await this.axios.get<ChannelReviewCountResponse>(
        "/reviews/count",
        {
          params: {
            ...options,
            channels: options?.channels?.join(","),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch review count:", error);
      throw error;
    }
  }
}
