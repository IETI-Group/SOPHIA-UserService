import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { DBDrizzleProvider } from '../../src/db/index.js';
import type { ReviewInDTO } from '../../src/models/index.js';
import { ReviewsRepositoryPostgreSQL } from '../../src/repositories/postgresql/ReviewsRepositoryPostgreSQL.js';
import { REVIEW_DISCRIMINANT } from '../../src/utils/types.js';

describe('ReviewsRepository', () => {
  const drizzleClient = mockDeep<DBDrizzleProvider>();
  const reviewsRepository = new ReviewsRepositoryPostgreSQL(drizzleClient);

  beforeEach(() => {
    mockReset(drizzleClient);
  });

  describe('getUserReviews', () => {
    it('should return paginated reviews for a reviewer', async () => {
      const reviewerId = 'reviewer-123';
      const mockReviewsData = [
        {
          id_review: 'review-1',
          reviewer_id: reviewerId,
          rate: 5,
          recommended: true,
          comments: 'Great instructor!',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-02'),
          instructors_reviews: {
            id_instructor_review: 'review-1',
            instructor_id: 'instructor-1',
          },
          courses_reviews: null,
        },
        {
          id_review: 'review-2',
          reviewer_id: reviewerId,
          rate: 4,
          recommended: true,
          comments: 'Good course!',
          created_at: new Date('2024-01-03'),
          updated_at: null,
          instructors_reviews: null,
          courses_reviews: {
            id_course_review: 'review-2',
            course_id: 'course-1',
          },
        },
      ];

      const offsetMock = vi.fn().mockResolvedValue(mockReviewsData);
      const limitMock = { offset: offsetMock };
      const orderByMock = { limit: vi.fn().mockReturnValue(limitMock) };
      const whereMock = { orderBy: vi.fn().mockReturnValue(orderByMock) };
      const leftJoinMock2 = { where: vi.fn().mockReturnValue(whereMock) };
      const leftJoinMock1 = { leftJoin: vi.fn().mockReturnValue(leftJoinMock2) };
      const fromMock = { leftJoin: vi.fn().mockReturnValue(leftJoinMock1) };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const whereCountMock = vi.fn().mockResolvedValue([{ count: '2' }]);
      const leftJoinCount2 = { where: whereCountMock };
      const leftJoinCount1 = { leftJoin: vi.fn().mockReturnValue(leftJoinCount2) };
      const fromCountMock = { leftJoin: vi.fn().mockReturnValue(leftJoinCount1) };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromCountMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await reviewsRepository.getUserReviews(reviewerId, 1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toEqual({
        id: 'review-1',
        reviewerId: reviewerId,
        reviewedId: 'instructor-1',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
        rate: 5,
        recommended: true,
        comments: 'Great instructor!',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });
      expect(result.data?.[1]).toEqual({
        id: 'review-2',
        reviewerId: reviewerId,
        reviewedId: 'course-1',
        discriminant: REVIEW_DISCRIMINANT.COURSE,
        rate: 4,
        recommended: true,
        comments: 'Good course!',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      });
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should filter reviews by showInstructors=true', async () => {
      const reviewerId = 'reviewer-123';
      const mockInstructorReview = [
        {
          id_review: 'review-1',
          reviewer_id: reviewerId,
          rate: 5,
          recommended: true,
          comments: 'Great instructor!',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-02'),
          instructors_reviews: {
            id_instructor_review: 'review-1',
            instructor_id: 'instructor-1',
          },
          courses_reviews: null,
        },
      ];

      const offsetMock = vi.fn().mockResolvedValue(mockInstructorReview);
      const limitMock = { offset: offsetMock };
      const orderByMock = { limit: vi.fn().mockReturnValue(limitMock) };
      const whereMock = { orderBy: vi.fn().mockReturnValue(orderByMock) };
      const leftJoinMock2 = { where: vi.fn().mockReturnValue(whereMock) };
      const leftJoinMock1 = { leftJoin: vi.fn().mockReturnValue(leftJoinMock2) };
      const fromMock = { leftJoin: vi.fn().mockReturnValue(leftJoinMock1) };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const whereCountMock = vi.fn().mockResolvedValue([{ count: '1' }]);
      const leftJoinCount2 = { where: whereCountMock };
      const leftJoinCount1 = { leftJoin: vi.fn().mockReturnValue(leftJoinCount2) };
      const fromCountMock = { leftJoin: vi.fn().mockReturnValue(leftJoinCount1) };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromCountMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await reviewsRepository.getUserReviews(
        reviewerId,
        1,
        10,
        'created_at',
        'desc',
        true,
        false
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].discriminant).toBe(REVIEW_DISCRIMINANT.INSTRUCTOR);
    });

    it('should filter reviews by showCourses=true', async () => {
      const reviewerId = 'reviewer-123';
      const mockCourseReview = [
        {
          id_review: 'review-2',
          reviewer_id: reviewerId,
          rate: 4,
          recommended: true,
          comments: 'Good course!',
          created_at: new Date('2024-01-03'),
          updated_at: null,
          instructors_reviews: null,
          courses_reviews: {
            id_course_review: 'review-2',
            course_id: 'course-1',
          },
        },
      ];

      const offsetMock = vi.fn().mockResolvedValue(mockCourseReview);
      const limitMock = { offset: offsetMock };
      const orderByMock = { limit: vi.fn().mockReturnValue(limitMock) };
      const whereMock = { orderBy: vi.fn().mockReturnValue(orderByMock) };
      const leftJoinMock2 = { where: vi.fn().mockReturnValue(whereMock) };
      const leftJoinMock1 = { leftJoin: vi.fn().mockReturnValue(leftJoinMock2) };
      const fromMock = { leftJoin: vi.fn().mockReturnValue(leftJoinMock1) };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const whereCountMock = vi.fn().mockResolvedValue([{ count: '1' }]);
      const leftJoinCount2 = { where: whereCountMock };
      const leftJoinCount1 = { leftJoin: vi.fn().mockReturnValue(leftJoinCount2) };
      const fromCountMock = { leftJoin: vi.fn().mockReturnValue(leftJoinCount1) };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromCountMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await reviewsRepository.getUserReviews(
        reviewerId,
        1,
        10,
        'created_at',
        'desc',
        false,
        true
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].discriminant).toBe(REVIEW_DISCRIMINANT.COURSE);
    });

    it('should filter reviews by reviewedId (specific instructor)', async () => {
      const reviewerId = 'reviewer-123';
      const instructorId = 'instructor-1';
      const mockFilteredReviews = [
        {
          id_review: 'review-1',
          reviewer_id: reviewerId,
          rate: 5,
          recommended: true,
          comments: 'Great instructor!',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-02'),
          instructors_reviews: {
            id_instructor_review: 'review-1',
            instructor_id: instructorId,
          },
          courses_reviews: null,
        },
      ];

      const offsetMock = vi.fn().mockResolvedValue(mockFilteredReviews);
      const limitMock = { offset: offsetMock };
      const orderByMock = { limit: vi.fn().mockReturnValue(limitMock) };
      const whereMock = { orderBy: vi.fn().mockReturnValue(orderByMock) };
      const leftJoinMock2 = { where: vi.fn().mockReturnValue(whereMock) };
      const leftJoinMock1 = { leftJoin: vi.fn().mockReturnValue(leftJoinMock2) };
      const fromMock = { leftJoin: vi.fn().mockReturnValue(leftJoinMock1) };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const whereCountMock = vi.fn().mockResolvedValue([{ count: '1' }]);
      const leftJoinCount2 = { where: whereCountMock };
      const leftJoinCount1 = { leftJoin: vi.fn().mockReturnValue(leftJoinCount2) };
      const fromCountMock = { leftJoin: vi.fn().mockReturnValue(leftJoinCount1) };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromCountMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await reviewsRepository.getUserReviews(
        reviewerId,
        1,
        10,
        'created_at',
        'desc',
        undefined,
        undefined,
        instructorId
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].reviewedId).toBe(instructorId);
    });

    it('should return empty array when no reviews found', async () => {
      const offsetMock = vi.fn().mockResolvedValue([]);
      const limitMock = { offset: offsetMock };
      const orderByMock = { limit: vi.fn().mockReturnValue(limitMock) };
      const whereMock = { orderBy: vi.fn().mockReturnValue(orderByMock) };
      const leftJoinMock2 = { where: vi.fn().mockReturnValue(whereMock) };
      const leftJoinMock1 = { leftJoin: vi.fn().mockReturnValue(leftJoinMock2) };
      const fromMock = { leftJoin: vi.fn().mockReturnValue(leftJoinMock1) };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const whereCountMock = vi.fn().mockResolvedValue([{ count: '0' }]);
      const leftJoinCount2 = { where: whereCountMock };
      const leftJoinCount1 = { leftJoin: vi.fn().mockReturnValue(leftJoinCount2) };
      const fromCountMock = { leftJoin: vi.fn().mockReturnValue(leftJoinCount1) };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromCountMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await reviewsRepository.getUserReviews('nonexistent-reviewer', 1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('postReview', () => {
    it('should create a new instructor review', async () => {
      const reviewIn: ReviewInDTO = {
        reviewerId: 'reviewer-123',
        reviewedId: 'instructor-1',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
        rate: 5,
        recommended: true,
        comments: 'Excellent instructor!',
      };

      const mockCreatedReview = {
        id_review: 'new-review-id',
        reviewer_id: reviewIn.reviewerId,
        rate: reviewIn.rate,
        recommended: reviewIn.recommended,
        comments: reviewIn.comments,
        created_at: new Date('2024-01-15'),
        updated_at: null,
      };

      const mockInstructorReviewLink = {
        id_instructor_review: 'new-review-id',
        instructor_id: reviewIn.reviewedId,
      };

      // Mock instructor validation
      const whereInstructorMock = vi.fn().mockResolvedValue([{ id_instructor: 'instructor-1' }]);
      const fromInstructorMock = { where: whereInstructorMock };
      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromInstructorMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const returningMock = vi.fn().mockResolvedValue([mockCreatedReview]);
      const valuesMock = { returning: returningMock };
      const insertMock = { values: vi.fn().mockReturnValue(valuesMock) };

      drizzleClient.insert.mockReturnValueOnce(
        insertMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      const valuesLinkMock = vi.fn().mockResolvedValue([mockInstructorReviewLink]);
      const insertLinkMock = { values: valuesLinkMock };

      drizzleClient.insert.mockReturnValueOnce(
        insertLinkMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      const result = await reviewsRepository.postReview(reviewIn);

      expect(result).toEqual({
        id: 'new-review-id',
        reviewerId: reviewIn.reviewerId,
        reviewedId: reviewIn.reviewedId,
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
        rate: reviewIn.rate,
        recommended: reviewIn.recommended,
        comments: reviewIn.comments,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      });
    });

    it('should create a new course review', async () => {
      const reviewIn: ReviewInDTO = {
        reviewerId: 'reviewer-123',
        reviewedId: 'course-1',
        discriminant: REVIEW_DISCRIMINANT.COURSE,
        rate: 4,
        recommended: true,
        comments: 'Great course!',
      };

      const mockCreatedReview = {
        id_review: 'new-review-id',
        reviewer_id: reviewIn.reviewerId,
        rate: reviewIn.rate,
        recommended: reviewIn.recommended,
        comments: reviewIn.comments,
        created_at: new Date('2024-01-15'),
        updated_at: null,
      };

      const mockCourseReviewLink = {
        id_course_review: 'new-review-id',
        course_id: reviewIn.reviewedId,
      };

      const returningMock = vi.fn().mockResolvedValue([mockCreatedReview]);
      const valuesMock = { returning: returningMock };
      const insertMock = { values: vi.fn().mockReturnValue(valuesMock) };

      drizzleClient.insert.mockReturnValueOnce(
        insertMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      const valuesLinkMock = vi.fn().mockResolvedValue([mockCourseReviewLink]);
      const insertLinkMock = { values: valuesLinkMock };

      drizzleClient.insert.mockReturnValueOnce(
        insertLinkMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      const result = await reviewsRepository.postReview(reviewIn);

      expect(result).toEqual({
        id: 'new-review-id',
        reviewerId: reviewIn.reviewerId,
        reviewedId: reviewIn.reviewedId,
        discriminant: REVIEW_DISCRIMINANT.COURSE,
        rate: reviewIn.rate,
        recommended: reviewIn.recommended,
        comments: reviewIn.comments,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      });
    });

    it('should create a review without comments', async () => {
      const reviewIn: ReviewInDTO = {
        reviewerId: 'reviewer-123',
        reviewedId: 'instructor-1',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
        rate: 5,
        recommended: true,
      };

      const mockCreatedReview = {
        id_review: 'new-review-id',
        reviewer_id: reviewIn.reviewerId,
        rate: reviewIn.rate,
        recommended: reviewIn.recommended,
        comments: null,
        created_at: new Date('2024-01-15'),
        updated_at: null,
      };

      const mockInstructorReviewLink = {
        id_instructor_review: 'new-review-id',
        instructor_id: reviewIn.reviewedId,
      };

      // Mock instructor validation
      const whereInstructorMock = vi.fn().mockResolvedValue([{ id_instructor: 'instructor-1' }]);
      const fromInstructorMock = { where: whereInstructorMock };
      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromInstructorMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const returningMock = vi.fn().mockResolvedValue([mockCreatedReview]);
      const valuesMock = { returning: returningMock };
      const insertMock = { values: vi.fn().mockReturnValue(valuesMock) };

      drizzleClient.insert.mockReturnValueOnce(
        insertMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      const valuesLinkMock = vi.fn().mockResolvedValue([mockInstructorReviewLink]);
      const insertLinkMock = { values: valuesLinkMock };

      drizzleClient.insert.mockReturnValueOnce(
        insertLinkMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      const result = await reviewsRepository.postReview(reviewIn);

      expect(result.comments).toBeUndefined();
    });

    it('should throw error when instructor not found', async () => {
      const reviewIn: ReviewInDTO = {
        reviewerId: 'reviewer-123',
        reviewedId: 'nonexistent-instructor',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
        rate: 5,
        recommended: true,
        comments: 'Great instructor!',
      };

      // Mock instructor validation - instructor not found
      const whereInstructorMock = vi.fn().mockResolvedValue([]);
      const fromInstructorMock = { where: whereInstructorMock };
      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromInstructorMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      await expect(reviewsRepository.postReview(reviewIn)).rejects.toThrow('Instructor not found');
    });
  });

  describe('updateReview', () => {
    it('should update an existing review', async () => {
      const reviewId = 'review-123';
      const updateData: Partial<ReviewInDTO> = {
        rate: 4,
        recommended: false,
        comments: 'Updated comment',
      };

      const mockUpdatedReview = {
        id_review: reviewId,
        reviewer_id: 'reviewer-123',
        rate: 4,
        recommended: false,
        comments: 'Updated comment',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-20'),
      };

      const returningMock = vi.fn().mockResolvedValue([mockUpdatedReview]);
      const whereMock = { returning: returningMock };
      const setMock = { where: vi.fn().mockReturnValue(whereMock) };
      const updateMock = { set: vi.fn().mockReturnValue(setMock) };

      drizzleClient.update.mockReturnValue(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      const whereSelectMock = vi.fn().mockResolvedValue([
        {
          id_review: reviewId,
          reviewer_id: 'reviewer-123',
          rate: 4,
          recommended: false,
          comments: 'Updated comment',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-20'),
          instructors_reviews: {
            id_instructor_review: reviewId,
            instructor_id: 'instructor-1',
          },
          courses_reviews: null,
        },
      ]);
      const leftJoinSelect2 = { where: whereSelectMock };
      const leftJoinSelect1 = { leftJoin: vi.fn().mockReturnValue(leftJoinSelect2) };
      const fromSelectMock = { leftJoin: vi.fn().mockReturnValue(leftJoinSelect1) };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromSelectMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await reviewsRepository.updateReview(reviewId, updateData);

      expect(result).toEqual({
        id: reviewId,
        reviewerId: 'reviewer-123',
        reviewedId: 'instructor-1',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
        rate: 4,
        recommended: false,
        comments: 'Updated comment',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-20'),
      });
    });

    it('should update only specific fields', async () => {
      const reviewId = 'review-123';
      const updateData: Partial<ReviewInDTO> = {
        rate: 3,
      };

      const mockUpdatedReview = {
        id_review: reviewId,
        reviewer_id: 'reviewer-123',
        rate: 3,
        recommended: true,
        comments: 'Original comment',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-20'),
      };

      const returningMock = vi.fn().mockResolvedValue([mockUpdatedReview]);
      const whereMock = { returning: returningMock };
      const setMock = { where: vi.fn().mockReturnValue(whereMock) };
      const updateMock = { set: vi.fn().mockReturnValue(setMock) };

      drizzleClient.update.mockReturnValue(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      const whereSelectMock = vi.fn().mockResolvedValue([
        {
          id_review: reviewId,
          reviewer_id: 'reviewer-123',
          rate: 3,
          recommended: true,
          comments: 'Original comment',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-20'),
          instructors_reviews: {
            id_instructor_review: reviewId,
            instructor_id: 'instructor-1',
          },
          courses_reviews: null,
        },
      ]);
      const leftJoinSelect2 = { where: whereSelectMock };
      const leftJoinSelect1 = { leftJoin: vi.fn().mockReturnValue(leftJoinSelect2) };
      const fromSelectMock = { leftJoin: vi.fn().mockReturnValue(leftJoinSelect1) };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromSelectMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await reviewsRepository.updateReview(reviewId, updateData);

      expect(result.rate).toBe(3);
      expect(result.recommended).toBe(true);
      expect(result.comments).toBe('Original comment');
    });

    it('should throw error when review not found', async () => {
      const reviewId = 'nonexistent-review';
      const updateData: Partial<ReviewInDTO> = {
        rate: 4,
      };

      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = { returning: returningMock };
      const setMock = { where: vi.fn().mockReturnValue(whereMock) };
      const updateMock = { set: vi.fn().mockReturnValue(setMock) };

      drizzleClient.update.mockReturnValue(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      await expect(reviewsRepository.updateReview(reviewId, updateData)).rejects.toThrow(
        'Review not found'
      );
    });

    it('should throw error when no fields provided to update', async () => {
      const reviewId = 'review-123';
      const updateData: Partial<ReviewInDTO> = {};

      await expect(reviewsRepository.updateReview(reviewId, updateData)).rejects.toThrow(
        'At least one field must be provided to update'
      );
    });
  });

  describe('deleteReview', () => {
    it('should delete an existing review', async () => {
      const reviewId = 'review-123';

      const mockDeletedReview = {
        id_review: reviewId,
        reviewer_id: 'reviewer-123',
        rate: 5,
        recommended: true,
        comments: 'Great!',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      const returningMock = vi.fn().mockResolvedValue([mockDeletedReview]);
      const whereMock = { returning: returningMock };
      const deleteMock = { where: vi.fn().mockReturnValue(whereMock) };

      drizzleClient.delete.mockReturnValue(
        deleteMock as unknown as ReturnType<typeof drizzleClient.delete>
      );

      const result = await reviewsRepository.deleteReview(reviewId);

      expect(result).toBeUndefined();
    });

    it('should throw error when review not found for deletion', async () => {
      const reviewId = 'nonexistent-review';

      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = { returning: returningMock };
      const deleteMock = { where: vi.fn().mockReturnValue(whereMock) };

      drizzleClient.delete.mockReturnValue(
        deleteMock as unknown as ReturnType<typeof drizzleClient.delete>
      );

      await expect(reviewsRepository.deleteReview(reviewId)).rejects.toThrow('Review not found');
    });
  });
});
