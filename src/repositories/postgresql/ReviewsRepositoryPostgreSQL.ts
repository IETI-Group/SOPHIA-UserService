import type { DBDrizzleProvider } from '../../db/index.js';
import type { PaginatedReviews, ReviewInDTO, ReviewOutDTO } from '../../models/index.js';
import type { ReviewsRepository } from '../ReviewsRepository.js';

export class ReviewsRepositoryPostgreSQL implements ReviewsRepository {
  private readonly client: DBDrizzleProvider;
  constructor(drizzleClient: DBDrizzleProvider) {
    this.client = drizzleClient;
  }

  public async getUserReviews(
    _reviewerId: string,
    _page: number,
    _size: number,
    _sort?: string,
    _order?: string,
    _showInstructors?: boolean,
    _showCourses?: boolean,
    _reviewedId?: string
  ): Promise<PaginatedReviews> {
    this.client;
    throw new Error('Method not implemented.');
  }

  public async postReview(_reviewIn: ReviewInDTO): Promise<ReviewOutDTO> {
    throw new Error('Method not implemented.');
  }
  public async updateReview(
    _reviewId: string,
    _reviewInstructor: Partial<ReviewInDTO>
  ): Promise<ReviewOutDTO> {
    throw new Error('Method not implemented.');
  }
  public async deleteReview(_reviewId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
