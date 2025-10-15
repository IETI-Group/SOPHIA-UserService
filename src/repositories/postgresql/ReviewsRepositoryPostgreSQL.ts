import { and, asc, count, desc, eq, isNotNull, or } from 'drizzle-orm';
import type { DBDrizzleProvider } from '../../db/index.js';
import { courses_reviews, instructors, instructors_reviews, reviews } from '../../db/schema.js';
import type { PaginatedReviews, ReviewInDTO, ReviewOutDTO } from '../../models/index.js';
import { REVIEW_DISCRIMINANT } from '../../utils/types.js';
import type { ReviewsRepository } from '../ReviewsRepository.js';

type ReviewQueryResult = {
  id_review: string;
  reviewer_id: string;
  rate: number;
  recommended: boolean;
  comments: string | null;
  created_at: Date;
  updated_at: Date | null;
  instructors_reviews: {
    id_instructor_review: string;
    instructor_id: string;
  } | null;
  courses_reviews: {
    id_course_review: string;
    course_id: string;
  } | null;
};

export class ReviewsRepositoryPostgreSQL implements ReviewsRepository {
  private readonly client: DBDrizzleProvider;
  constructor(drizzleClient: DBDrizzleProvider) {
    this.client = drizzleClient;
  }

  private buildReviewQueryWithJoins() {
    return this.client
      .select({
        id_review: reviews.id_review,
        reviewer_id: reviews.reviewer_id,
        rate: reviews.rate,
        recommended: reviews.recommended,
        comments: reviews.comments,
        created_at: reviews.created_at,
        updated_at: reviews.updated_at,
        instructors_reviews: {
          id_instructor_review: instructors_reviews.id_instructor_review,
          instructor_id: instructors_reviews.instructor_id,
        },
        courses_reviews: {
          id_course_review: courses_reviews.id_course_review,
          course_id: courses_reviews.course_id,
        },
      })
      .from(reviews)
      .leftJoin(
        instructors_reviews,
        eq(reviews.id_review, instructors_reviews.id_instructor_review)
      )
      .leftJoin(courses_reviews, eq(reviews.id_review, courses_reviews.id_course_review));
  }

  private async fetchReviewWithDiscriminant(reviewId: string): Promise<ReviewQueryResult> {
    const reviewData = await this.buildReviewQueryWithJoins().where(
      eq(reviews.id_review, reviewId)
    );

    return reviewData[0];
  }

  private async countReviewsWithConditions(
    conditions: ReturnType<typeof eq | typeof isNotNull | typeof or>[]
  ): Promise<number> {
    const countResult = await this.client
      .select({ count: count() })
      .from(reviews)
      .leftJoin(
        instructors_reviews,
        eq(reviews.id_review, instructors_reviews.id_instructor_review)
      )
      .leftJoin(courses_reviews, eq(reviews.id_review, courses_reviews.id_course_review))
      .where(and(...conditions));

    return Number(countResult[0]?.count ?? 0);
  }

  private buildFilterConditions(
    reviewerId: string,
    showInstructors?: boolean,
    showCourses?: boolean,
    reviewedId?: string
  ): ReturnType<typeof eq | typeof isNotNull | typeof or>[] {
    const conditions: ReturnType<typeof eq | typeof isNotNull | typeof or>[] = [
      eq(reviews.reviewer_id, reviewerId),
    ];

    if (showInstructors === true && showCourses === false) {
      conditions.push(isNotNull(instructors_reviews.instructor_id));
    } else if (showCourses === true && showInstructors === false) {
      conditions.push(isNotNull(courses_reviews.course_id));
    }

    if (reviewedId) {
      const orCondition = or(
        eq(instructors_reviews.instructor_id, reviewedId),
        eq(courses_reviews.course_id, reviewedId)
      );
      if (orCondition) {
        conditions.push(orCondition);
      }
    }

    return conditions;
  }

  private buildUpdateFields(
    reviewUpdate: Partial<ReviewInDTO>
  ): Partial<{ rate: number; recommended: boolean; comments: string | undefined }> {
    const updateFields: Partial<{
      rate: number;
      recommended: boolean;
      comments: string | undefined;
    }> = {};

    if (reviewUpdate.rate !== undefined) {
      updateFields.rate = reviewUpdate.rate;
    }
    if (reviewUpdate.recommended !== undefined) {
      updateFields.recommended = reviewUpdate.recommended;
    }
    if (reviewUpdate.comments !== undefined) {
      updateFields.comments = reviewUpdate.comments;
    }

    return updateFields;
  }

  private parseReviewToDTO(review: ReviewQueryResult): ReviewOutDTO {
    const discriminant = review.instructors_reviews
      ? REVIEW_DISCRIMINANT.INSTRUCTOR
      : REVIEW_DISCRIMINANT.COURSE;

    const reviewedId = review.instructors_reviews
      ? review.instructors_reviews.instructor_id
      : (review.courses_reviews?.course_id ?? '');

    return {
      id: review.id_review,
      reviewerId: review.reviewer_id,
      reviewedId,
      discriminant,
      rate: review.rate,
      recommended: review.recommended,
      ...(review.comments && { comments: review.comments }),
      createdAt: review.created_at,
      updatedAt: review.updated_at ?? review.created_at,
    };
  }

  public async getUserReviews(
    reviewerId: string,
    page: number,
    size: number,
    sort?: string,
    order?: string,
    showInstructors?: boolean,
    showCourses?: boolean,
    reviewedId?: string
  ): Promise<PaginatedReviews> {
    const conditions = this.buildFilterConditions(
      reviewerId,
      showInstructors,
      showCourses,
      reviewedId
    );

    const total = await this.countReviewsWithConditions(conditions);

    const sortField = sort === 'created_at' ? reviews.created_at : reviews.created_at;
    const orderFn = order === 'asc' ? asc : desc;
    const offset = (page - 1) * size;

    const reviewsData = await this.buildReviewQueryWithJoins()
      .where(and(...conditions))
      .orderBy(orderFn(sortField))
      .limit(size)
      .offset(offset);

    const reviewsDTOs = reviewsData.map((review) => this.parseReviewToDTO(review));

    const totalPages = Math.ceil(total / size);

    return {
      success: true,
      data: reviewsDTOs,
      message: 'Reviews retrieved successfully',
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit: size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  public async getInstructorReviews(
    instructorId: string,
    page: number,
    size: number,
    sort?: string,
    order?: string
  ): Promise<PaginatedReviews> {
    const conditions = [eq(instructors_reviews.instructor_id, instructorId)];

    const total = await this.countReviewsWithConditions(conditions);

    const sortField = sort === 'created_at' ? reviews.created_at : reviews.created_at;
    const orderFn = order === 'asc' ? asc : desc;
    const offset = (page - 1) * size;

    const reviewsData = await this.buildReviewQueryWithJoins()
      .where(and(...conditions))
      .orderBy(orderFn(sortField))
      .limit(size)
      .offset(offset);

    const reviewsDTOs = reviewsData.map((review) => this.parseReviewToDTO(review));

    const totalPages = Math.ceil(total / size);

    return {
      success: true,
      data: reviewsDTOs,
      message: 'Instructor reviews retrieved successfully',
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit: size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  public async getCourseReviews(
    courseId: string,
    page: number,
    size: number,
    sort?: string,
    order?: string
  ): Promise<PaginatedReviews> {
    const conditions = [eq(courses_reviews.course_id, courseId)];

    const total = await this.countReviewsWithConditions(conditions);

    const sortField = sort === 'created_at' ? reviews.created_at : reviews.created_at;
    const orderFn = order === 'asc' ? asc : desc;
    const offset = (page - 1) * size;

    const reviewsData = await this.buildReviewQueryWithJoins()
      .where(and(...conditions))
      .orderBy(orderFn(sortField))
      .limit(size)
      .offset(offset);

    const reviewsDTOs = reviewsData.map((review) => this.parseReviewToDTO(review));

    const totalPages = Math.ceil(total / size);

    return {
      success: true,
      data: reviewsDTOs,
      message: 'Course reviews retrieved successfully',
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit: size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  public async postReview(reviewIn: ReviewInDTO): Promise<ReviewOutDTO> {
    // Validate that instructor exists if discriminant is INSTRUCTOR
    if (reviewIn.discriminant === REVIEW_DISCRIMINANT.INSTRUCTOR) {
      const instructor = await this.client
        .select({ id_instructor: instructors.id_instructor })
        .from(instructors)
        .where(eq(instructors.id_instructor, reviewIn.reviewedId));

      if (!instructor || instructor.length === 0) {
        throw new Error('Instructor not found');
      }
    }

    const [createdReview] = await this.client
      .insert(reviews)
      .values({
        reviewer_id: reviewIn.reviewerId,
        rate: reviewIn.rate,
        recommended: reviewIn.recommended,
        comments: reviewIn.comments,
      })
      .returning();

    if (reviewIn.discriminant === REVIEW_DISCRIMINANT.INSTRUCTOR) {
      await this.client.insert(instructors_reviews).values({
        id_instructor_review: createdReview.id_review,
        instructor_id: reviewIn.reviewedId,
      });
    } else {
      await this.client.insert(courses_reviews).values({
        id_course_review: createdReview.id_review,
        course_id: reviewIn.reviewedId,
      });
    }

    return {
      id: createdReview.id_review,
      reviewerId: createdReview.reviewer_id,
      reviewedId: reviewIn.reviewedId,
      discriminant: reviewIn.discriminant,
      rate: createdReview.rate,
      recommended: createdReview.recommended,
      ...(createdReview.comments && { comments: createdReview.comments }),
      createdAt: createdReview.created_at,
      updatedAt: createdReview.updated_at ?? createdReview.created_at,
    };
  }
  public async updateReview(
    reviewId: string,
    reviewUpdate: Partial<ReviewInDTO>
  ): Promise<ReviewOutDTO> {
    const updateFields = this.buildUpdateFields(reviewUpdate);

    if (Object.keys(updateFields).length === 0) {
      throw new Error('At least one field must be provided to update');
    }

    const [updatedReview] = await this.client
      .update(reviews)
      .set(updateFields)
      .where(eq(reviews.id_review, reviewId))
      .returning();

    if (!updatedReview) {
      throw new Error('Review not found');
    }

    const reviewData = await this.fetchReviewWithDiscriminant(reviewId);

    return this.parseReviewToDTO(reviewData);
  }

  public async deleteReview(reviewId: string): Promise<void> {
    const [deletedReview] = await this.client
      .delete(reviews)
      .where(eq(reviews.id_review, reviewId))
      .returning();

    if (!deletedReview) {
      throw new Error('Review not found');
    }
  }
}
