import type { PaginatedReviews, ReviewInDTO, ReviewOutDTO } from '../models/index.js';

export interface ReviewsRepository {
  getUserReviews(
    reviewerId: string,
    page: number,
    size: number,
    sort?: string,
    order?: string,
    showInstructors?: boolean,
    showCourses?: boolean,
    reviewedId?: string
  ): Promise<PaginatedReviews>;
  postReview(reviewIn: ReviewInDTO): Promise<ReviewOutDTO>;
  updateReview(reviewId: string, reviewInstructor: Partial<ReviewInDTO>): Promise<ReviewOutDTO>;
  deleteReview(reviewId: string): Promise<void>;
}
