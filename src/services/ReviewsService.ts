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
} from "../interfaces/";

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

  /**
   * Fetches a list of reviews based on the provided channels and options.
   *
   * @param {string[]} [channels] - An optional array of channels to filter the reviews by. The channels will be joined as a comma-separated string.
   * @param {ReviewOptions} [options] - Optional parameters to further filter the reviews.
   *
   * @param {string} [options.after] - A cursor string to fetch reviews submitted after a certain point in the dataset, useful for paginating results.
   * @param {string} [options.before] - A cursor string to fetch reviews submitted before a certain point in the dataset, useful for paginating results.
   * @param {string} [options.submittedAfter] - The date (ISO 8601 format) to filter reviews submitted after this date.
   * @param {string} [options.submittedBefore] - The date (ISO 8601 format) to filter reviews submitted before this date.
   * @param {number} [options.count] - The maximum number of reviews to return in the response.
   * @param {1 | 2 | 3 | 4 | 5} [options.rating] - A specific rating to filter reviews by (1 to 5).
   * @param {ReviewState[]} [options.status] - An array of review statuses to filter reviews by, such as "APPROVED" or "REJECTED".
   * @param {ReviewType[]} [options.type] - An array of review types to filter by, such as "SERVICE_REVIEW" or "PRODUCT_REVIEW".
   * @param {boolean} [options.hasReply] - A boolean to filter reviews that have a reply.
   * @param {string[]} [options.additionalInformation] - An array of additional information fields to include in the response.
   * @param {boolean} [options.ignoreStatements] - A boolean to indicate whether to ignore statements when filtering reviews.
   * @param {string} [options.query] - A search query string to filter reviews by matching text.
   * @param {string[]} [options.sku] - An array of SKUs to filter reviews by specific products.
   * @param {"submittedAt" | "updatedAt" | "lastEditedAt" | "editedAt"} [options.orderBy] - A field to order the reviews by, such as submission date or last edit date.
   *
   * @returns {Promise<CustomerReviewListResponse>} A promise that resolves to a list of reviews.
   *
   * @example
   * // Example usage:
   * const channels = ["web", "mobile"];
   * const options = {
   *   rating: 4,
   *   status: ["APPROVED", "REJECTED"],
   *   type: ["PRODUCT_REVIEW"],
   *   orderBy: "submittedAt"
   * };
   *
   * const reviews = await getReviews(channels, options);
   *
   * @example
   * // Example response:
   * const customerReviewListResponse = {
   *   totalElements: 250,
   *   paging: {
   *     count: 20,
   *     cursor: {
   *       before: "cursor_before_string",
   *       after: "cursor_after_string"
   *     },
   *     links: {
   *       previous: "https://example.com/reviews?before=cursor_before_string",
   *       next: "https://example.com/reviews?after=cursor_after_string"
   *     }
   *   },
   *   items: [
   *     {
   *       id: "review67890",
   *       accountRef: "account12345",
   *       channelRef: "channel001",
   *       rating: 4,
   *       title: "Good product",
   *       comment: "I liked this product. It meets my expectations.",
   *       submittedAt: "2024-08-20T10:00:00Z",
   *       state: "APPROVED",
   *       type: "PRODUCT_REVIEW"
   *     },
   *     // More reviews...
   *   ]
   * };
   *
   * @throws Will throw an error if the request to fetch reviews fails.
   */
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

  /**
   * Fetches a minimal list of reviews based on the provided channels and options.
   *
   * @param {string[]} [channels] - An optional array of channels to filter the reviews by. The channels will be joined as a comma-separated string.
   * @param {ReviewOptions} [options] - Optional parameters to further filter the reviews.
   *
   * @returns {Promise<CustomerReviewListResponse>} A promise that resolves to a list of reviews with minimal details.
   *
   * @example
   * // Example usage:
   * const channels = ["chl-123", "chl-456"];
   * const options = {
   *   rating: 5,
   *   status: ["APPROVED"],
   *   type: ["SERVICE_REVIEW"],
   *   orderBy: "submittedAt"
   * };
   *
   * const minimalReviews = await getMinimalReviews(channels, options);
   *
   * @example
   * // Example response:
   * const customerReviewListResponse = {
   *   totalElements: 150,
   *   paging: {
   *     count: 10,
   *     cursor: {
   *       before: "cursor_before_string",
   *       after: "cursor_after_string"
   *     },
   *     links: {
   *       previous: "https://example.com/reviews-minimal?before=cursor_before_string",
   *       next: "https://example.com/reviews-minimal?after=cursor_after_string"
   *     }
   *   },
   *   items: [
   *     {
   *       id: "review12345",
   *       accountRef: "account67890",
   *       channelRef: "channel001",
   *       rating: 5,
   *       title: "Excellent service!",
   *       comment: "The service was outstanding.",
   *       submittedAt: "2024-08-21T14:30:00Z",
   *       state: "APPROVED",
   *       type: "SERVICE_REVIEW"
   *     },
   *     // More reviews...
   *   ]
   * };
   *
   * @throws Will throw an error if the request to fetch minimal reviews fails.
   */
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

  /**
   * Retrieves the details of a specific review.
   *
   * @param {string} reviewId - The ID of the review to be fetched.
   *
   * @returns {Promise<Review>} A promise that resolves to the details of the review.
   *
   * @example
   * // Example response:
   * const review = {
   *   id: "review12345",
   *   accountRef: "account67890",
   *   channelRef: "channel001",
   *   rating: 5,
   *   title: "Great product!",
   *   comment: "I really enjoyed using this product. Highly recommend!",
   *   createdAt: "2024-08-21T14:30:00Z",
   *   updatedAt: "2024-08-21T15:00:00Z",
   *   submittedAt: "2024-08-20T14:30:00Z",
   *   feedbackType: "REVIEW",
   *   state: "APPROVED",
   *   type: "SERVICE_REVIEW",
   *   verificationType: "VERIFIED",
   *   reply: {
   *     createdAt: "2024-08-22T14:30:00Z",
   *     updatedAt: "2024-08-22T15:00:00Z",
   *     comment: "Thank you for your positive feedback!",
   *     sendNotification: true
   *   },
   *   customer: {
   *     firstName: "John",
   *     lastName: "Doe",
   *     fullName: "John Doe",
   *     email: "john.doe@example.com",
   *     mobile: "+123456789"
   *   },
   *   transaction: {
   *     reference: "transaction7890",
   *     date: "2024-08-19T14:30:00Z"
   *   },
   *   product: {
   *     id: "product12345",
   *     sku: "sku12345",
   *     name: "Sample Product",
   *     url: "https://example.com/product/sample-product",
   *     imageUrl: "https://example.com/product/sample-product/image.jpg",
   *     brand: "Sample Brand"
   *   },
   *   metadata: {
   *     key1: "value1",
   *     key2: "value2"
   *   }
   * };
   *
   * @throws Will throw an error if the request to fetch the review fails.
   */
  public async getReview(reviewId: string): Promise<Review> {
    try {
      const response = await this.axios.get<Review>(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch review:", error);
      throw error;
    }
  }

  /**
   * Creates a veto for a specific review.
   *
   * @param {string} reviewId - The ID of the review for which the veto is to be created.
   * @param {ReviewVetoRequest} reviewVetoRequest - The request object containing veto details.
   *
   * @example
   * const reviewVetoRequest = {
   *   comment: "This review contains abusive language.",
   *   reason: "ABUSIVE",
   *   vetoReporterEmail: "reporter@example.com",
   *   channelName: "Web"
   * };
   *
   * @returns {Promise<ReviewVetoResponse>} A promise that resolves to the response of the veto creation.
   *
   * @throws Will throw an error if the request to create the veto fails.
   */
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

  /**
   * Retrieves the veto details for a specific review.
   *
   * @param {string} reviewId - The ID of the review for which the veto details are to be fetched.
   *
   * @returns {Promise<ReviewVetoResponse>} A promise that resolves to the veto details of the review.
   *
   * @example
   * const reviewVetoResponse = {
   *   id: "veto12345",
   *   ticketId: "ticket67890",
   *   comment: "This review contains untruthful information.",
   *   reason: "UNTRUTHFUL",
   *   createdAt: "2024-08-21T14:30:00Z",
   *   updatedAt: "2024-08-21T15:00:00Z"
   * };
   *
   * @throws Will throw an error if the request to fetch the veto details fails.
   */
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

  /**
   * Saves a reply to a specific review.
   *
   * @param {string} reviewId - The ID of the review to which the reply is to be saved.
   * @param {ReviewReply} reviewReply - The reply object containing the reply details.
   *
   * @example
   * const reviewReply = {
   *   comment: "Thank you for your feedback!",
   *   sendNotification: true
   * };
   *
   * @returns {Promise<void>} A promise that resolves when the reply is successfully saved.
   *
   * @throws Will throw an error if the request to save the reply fails.
   */
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

  /**
   * Deletes a reply from a specific review.
   *
   * @param {string} reviewId - The ID of the review from which the reply is to be deleted.
   *
   * @returns {Promise<void>} A promise that resolves when the reply is successfully deleted.
   *
   * @throws Will throw an error if the request to delete the reply fails.
   */
  public async deleteReviewReply(reviewId: string): Promise<void> {
    try {
      await this.axios.delete(`/reviews/${reviewId}/reply`);
    } catch (error) {
      console.error("Failed to delete review reply:", error);
      throw error;
    }
  }

  /**
   * Filters an array of reviews based on the provided rating and type.
   *
   * @param {Review[]} reviews - The array of reviews to be filtered.
   * @param {number} [rating] - The rating to filter reviews by. If not provided, all ratings are included.
   * @param {ReviewType} [type] - The type of review to filter by. If not provided, all types are included.
   *
   * @returns {Promise<Review[]>} A promise that resolves to an array of reviews that match the provided rating and type filters.
   */
  public async filterFetchedReviews(
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

  /**
   * Fetches the count of reviews based on the provided filter options.
   *
   * @param {Object} [options] - Optional parameters to filter the reviews count.
   * @param {string[]} [options.channels] - An array of channels to filter the reviews by. The channels will be joined as a comma-separated string.
   * @param {string} [options.submittedAfter] - The date (ISO 8601 format) to filter reviews submitted after this date.
   * @param {string} [options.submittedBefore] - The date (ISO 8601 format) to filter reviews submitted before this date.
   * @param {number[]} [options.rating] - An array of ratings to filter reviews by.
   * @param {ReviewState[]} [options.status] - An array of review statuses to filter reviews by.
   * @param {ReviewType[]} [options.type] - An array of review types to filter reviews by.
   * @param {boolean} [options.hasReply] - Whether to filter reviews that have a reply.
   * @param {boolean} [options.ignoreStatements] - Whether to ignore statements in the filter.
   * @param {string} [options.query] - A query string to search reviews by.
   * @param {string[]} [options.sku] - An array of SKUs to filter reviews by.
   *
   * @returns {Promise<ChannelReviewCountResponse>} A promise that resolves to the count of reviews matching the provided filters.
   *
   * @throws Will throw an error if the request to fetch the review count fails.
   */
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
