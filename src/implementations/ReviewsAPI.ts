import { AxiosInstance } from "axios";
import { Configuration } from "../generated/reviews/configuration";
import { BaseAPI } from "../generated/reviews/base";
import type { Review } from "interfaces/Review";

export class ReviewsAPI extends BaseAPI {
  protected axios: AxiosInstance;

  constructor(accessToken: string) {
    const config = new Configuration({
      basePath: "https://api.etrusted.com",
      accessToken: accessToken,
    });
    super(config);

    this.axios =
      config.baseOptions?.axiosInstance ||
      super["axios"] ||
      require("axios").default.create({
        baseURL: config.basePath,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  }

  public async getReviews(channelId: string, options?: any): Promise<Review[]> {
    const path = `/reviews`;
    const requestParams = {
      params: {
        channels: channelId,
        ...options,
      },
    };

    try {
      const response = await this.axios.get(path, requestParams);
      const reviews: Review[] = response.data.items;
      return reviews;
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      throw error;
    }
  }

  public async filterReviews(
    reviews: Review[],
    rating?: number,
    type?: string
  ): Promise<Review[]> {
    return reviews.filter((review) => {
      return (
        (rating ? review.rating === rating : true) &&
        (type ? review.type === type : true)
      );
    });
  }

  public async sortReviewsByDate(
    reviews: Review[],
    order: "asc" | "desc" = "desc"
  ): Promise<Review[]> {
    return reviews.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });
  }

  //   public async paginateReviews(
  //     reviews: Review[],
  //     page: number,
  //     pageSize: number
  //   ): Promise<Review[]> {
  //     const start = (page - 1) * pageSize;
  //     return reviews.slice(start, start + pageSize);
  //   }
}
