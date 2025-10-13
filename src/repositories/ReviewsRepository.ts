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
  ): PaginatedReviews;
  postReview(reviewIn: ReviewInDTO): ReviewOutDTO;
  updateReview(reviewId: string, reviewInstructor: Partial<ReviewInDTO>): ReviewOutDTO;
  deleteReview(reviewId: string): void;
}
