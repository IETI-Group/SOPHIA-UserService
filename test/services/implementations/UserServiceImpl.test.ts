import { beforeEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type {
  FiltersUser,
  LearningPathInDTO,
  LinkedAccountInDTO,
  ReviewInDTO,
  UserInDTO,
  UserUpdateDTO,
} from '../../../src/models/index.js';
import type {
  LearningPathsRepository,
  LinkedAccountsRepository,
  ReviewsRepository,
  UsersRepository,
} from '../../../src/repositories/index.js';
import UserServiceImpl from '../../../src/services/implementations/UserServiceImpl.js';
import {
  LEARNING_STYLES,
  PACE_PREFERENCE,
  REVIEW_DISCRIMINANT,
  ROLE,
} from '../../../src/utils/types.js';

describe('User Service Implementation', () => {
  const userRepository = mockDeep<UsersRepository>();
  const learningPathsRepository = mockDeep<LearningPathsRepository>();
  const reviewsRepository = mockDeep<ReviewsRepository>();
  const linkedAccountsRepository = mockDeep<LinkedAccountsRepository>();
  const userService = new UserServiceImpl(
    userRepository,
    learningPathsRepository,
    reviewsRepository,
    linkedAccountsRepository
  );

  beforeEach(() => {
    mockReset(userRepository);
    mockReset(learningPathsRepository);
    mockReset(reviewsRepository);
    mockReset(linkedAccountsRepository);
  });

  describe('getUsers', () => {
    it('should call repository getUsers with correct parameters', async () => {
      const page = 1;
      const size = 10;
      const sort = 'first_name';
      const order = 'asc' as 'asc' | 'desc';
      const lightDTO = true;
      const filters: FiltersUser = {
        firstName: null,
        lastName: null,
        birthDateFrom: null,
        birthDateTo: null,
      };

      const mockResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: [{ userId: '1', role: ROLE.STUDENT }],
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      userRepository.getUsers.mockResolvedValue(mockResponse);

      const result = await userService.getUsers(page, size, sort, order, lightDTO, filters);

      expect(result).toEqual(mockResponse);
      expect(userRepository.getUsers).toHaveBeenCalledTimes(1);
      expect(userRepository.getUsers).toHaveBeenCalledWith(
        page,
        size,
        filters,
        sort,
        order,
        lightDTO
      );
    });

    it('should default to lightDTO true when undefined', async () => {
      const page = 1;
      const size = 10;
      const sort = 'first_name';
      const order = 'desc' as 'asc' | 'desc';
      const filters: FiltersUser = {
        firstName: null,
        lastName: null,
        birthDateFrom: null,
        birthDateTo: null,
      };

      const mockResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: [],
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      userRepository.getUsers.mockResolvedValue(mockResponse);

      await userService.getUsers(page, size, sort, order, undefined, filters);

      expect(userRepository.getUsers).toHaveBeenCalledWith(page, size, filters, sort, order, true);
    });
  });

  describe('getUserById', () => {
    it('should call repository getUserById with correct parameters', async () => {
      const userId = '12345';
      const lightDTO = true;
      const mockUser = { userId, role: ROLE.STUDENT };

      userRepository.getUserById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId, lightDTO);

      expect(result).toEqual(mockUser);
      expect(userRepository.getUserById).toHaveBeenCalledTimes(1);
      expect(userRepository.getUserById).toHaveBeenCalledWith(userId, lightDTO);
    });

    it('should call repository getUserById with lightDTO false', async () => {
      const userId = '12345';
      const lightDTO = false;
      const mockUser = {
        userId,
        role: ROLE.INSTRUCTOR,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      userRepository.getUserById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(userId, lightDTO);

      expect(result).toEqual(mockUser);
      expect(userRepository.getUserById).toHaveBeenCalledWith(userId, false);
    });
  });

  describe('getUserByEmail', () => {
    it('should call repository getUserByEmail with correct parameters', async () => {
      const email = 'test@example.com';
      const lightDTO = true;
      const mockUser = { userId: '12345', role: ROLE.STUDENT };

      userRepository.getUserByEmail.mockResolvedValue(mockUser);

      const result = await userService.getUserByEmail(email, lightDTO);

      expect(result).toEqual(mockUser);
      expect(userRepository.getUserByEmail).toHaveBeenCalledTimes(1);
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(email, lightDTO);
    });
  });

  describe('getUsersByIds', () => {
    it('should call repository getUsersByIds with correct parameters', async () => {
      const userIds = ['1', '2', '3'];
      const sort = 'first_name';
      const order = 'asc' as 'asc' | 'desc';
      const lightDTO = true;

      const mockResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: [
          { userId: '1', role: ROLE.STUDENT },
          { userId: '2', role: ROLE.INSTRUCTOR },
          { userId: '3', role: ROLE.ADMIN },
        ],
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 3,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      userRepository.getUsersByIds.mockResolvedValue(mockResponse);

      const result = await userService.getUsersByIds(userIds, sort, order, lightDTO);

      expect(result).toEqual(mockResponse);
      expect(userRepository.getUsersByIds).toHaveBeenCalledTimes(1);
      expect(userRepository.getUsersByIds).toHaveBeenCalledWith(userIds, lightDTO, sort, order);
    });

    it('should call repository getUsersByIds with undefined optional parameters', async () => {
      const userIds = ['1', '2'];

      const mockResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: [{ userId: '1', role: ROLE.STUDENT }],
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 1,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      userRepository.getUsersByIds.mockResolvedValue(mockResponse);

      await userService.getUsersByIds(userIds, undefined, 'asc', undefined);

      expect(userRepository.getUsersByIds).toHaveBeenCalledWith(
        userIds,
        undefined,
        undefined,
        'asc'
      );
    });
  });

  describe('postUser', () => {
    it('should call repository postUser with correct parameters', async () => {
      const userDTO: UserInDTO = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        birthDate: new Date('1995-05-15'),
      };

      const mockCreatedUser = { userId: '12345', role: ROLE.STUDENT };

      userRepository.postUser.mockResolvedValue(mockCreatedUser);

      const result = await userService.postUser(userDTO);

      expect(result).toEqual(mockCreatedUser);
      expect(userRepository.postUser).toHaveBeenCalledTimes(1);
      expect(userRepository.postUser).toHaveBeenCalledWith(userDTO);
    });
  });

  describe('updateUser', () => {
    it('should call repository updateUser with correct parameters', async () => {
      const userId = '12345';
      const userUpdateDTO: Partial<UserUpdateDTO> = {
        firstName: 'UpdatedName',
        bio: 'Updated bio',
      };

      const mockUpdatedUser = { userId, role: ROLE.INSTRUCTOR };

      userRepository.updateUser.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser(userId, userUpdateDTO);

      expect(result).toEqual(mockUpdatedUser);
      expect(userRepository.updateUser).toHaveBeenCalledTimes(1);
      expect(userRepository.updateUser).toHaveBeenCalledWith(userId, userUpdateDTO);
    });
  });

  describe('deleteUser', () => {
    it('should call repository deleteUser with correct parameters', async () => {
      const userId = '12345';

      userRepository.deleteUser.mockResolvedValue();

      await userService.deleteUser(userId);

      expect(userRepository.deleteUser).toHaveBeenCalledTimes(1);
      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('getUserLearningPath', () => {
    it('should call repository getUserLearningPath with correct parameters', async () => {
      const userId = '12345';
      const mockLearningPath = {
        id: 'lp-123',
        userId: userId,
        primaryStyle: LEARNING_STYLES.VISUAL,
        secondaryStyle: LEARNING_STYLES.AUDITORY,
        pacePreference: PACE_PREFERENCE.NORMAL,
        interactivityPreference: 5,
        gamificationEnabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      learningPathsRepository.getUserLearningPath.mockResolvedValue(mockLearningPath);

      const result = await userService.getUserLearningPath(userId);

      expect(result).toEqual(mockLearningPath);
      expect(learningPathsRepository.getUserLearningPath).toHaveBeenCalledTimes(1);
      expect(learningPathsRepository.getUserLearningPath).toHaveBeenCalledWith(userId);
    });
  });

  describe('postUserLearningPath', () => {
    it('should call repository postUserLearningPath with correct parameters', async () => {
      const userId = '12345';
      const learningPathInDTO: LearningPathInDTO = {
        primaryStyle: LEARNING_STYLES.VISUAL,
        secondaryStyle: LEARNING_STYLES.AUDITORY,
        pacePreference: PACE_PREFERENCE.NORMAL,
        gamificationEnabled: true,
        interactivityPreference: 4,
      };

      const mockCreatedLearningPath = {
        id: 'lp-new-123',
        userId: userId,
        primaryStyle: LEARNING_STYLES.VISUAL,
        secondaryStyle: LEARNING_STYLES.AUDITORY,
        pacePreference: PACE_PREFERENCE.NORMAL,
        interactivityPreference: 4,
        gamificationEnabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      learningPathsRepository.postUserLearningPath.mockResolvedValue(mockCreatedLearningPath);

      const result = await userService.postUserLearningPath(userId, learningPathInDTO);

      expect(result).toEqual(mockCreatedLearningPath);
      expect(learningPathsRepository.postUserLearningPath).toHaveBeenCalledTimes(1);
      expect(learningPathsRepository.postUserLearningPath).toHaveBeenCalledWith(
        userId,
        learningPathInDTO
      );
    });
  });

  describe('updateLearningPath', () => {
    it('should call repository updateLearningPath with correct parameters', async () => {
      const userId = '12345';
      const learningPathUpdateDTO: Partial<LearningPathInDTO> = {
        primaryStyle: LEARNING_STYLES.KINESTHETIC,
        pacePreference: PACE_PREFERENCE.FAST,
      };

      const mockUpdatedLearningPath = {
        id: 'lp-123',
        userId: userId,
        primaryStyle: LEARNING_STYLES.KINESTHETIC,
        secondaryStyle: LEARNING_STYLES.AUDITORY,
        pacePreference: PACE_PREFERENCE.FAST,
        interactivityPreference: 5,
        gamificationEnabled: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-10'),
      };

      learningPathsRepository.updateLearningPath.mockResolvedValue(mockUpdatedLearningPath);

      const result = await userService.updateLearningPath(userId, learningPathUpdateDTO);

      expect(result).toEqual(mockUpdatedLearningPath);
      expect(learningPathsRepository.updateLearningPath).toHaveBeenCalledTimes(1);
      expect(learningPathsRepository.updateLearningPath).toHaveBeenCalledWith(
        userId,
        learningPathUpdateDTO
      );
    });
  });

  describe('getUserReviews', () => {
    it('should call reviewsRepository.getUserReviews with correct parameters', async () => {
      const reviewerId = '12345';
      const page = 1;
      const size = 10;
      const sort = 'created_at';
      const order = 'desc' as 'asc' | 'desc';
      const showInstructors = true;
      const showCourses = false;
      const reviewedId = 'instructor-123';

      const mockResponse = {
        success: true,
        data: [
          {
            id: 'review-1',
            reviewerId: reviewerId,
            reviewedId: reviewedId,
            discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
            rate: 5,
            recommended: true,
            comments: 'Great instructor!',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
        message: 'Reviews retrieved successfully',
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      reviewsRepository.getUserReviews.mockResolvedValue(mockResponse);

      const result = await userService.getUserReviews(
        reviewerId,
        page,
        size,
        sort,
        order,
        showInstructors,
        showCourses,
        reviewedId
      );

      expect(result).toEqual(mockResponse);
      expect(reviewsRepository.getUserReviews).toHaveBeenCalledTimes(1);
      expect(reviewsRepository.getUserReviews).toHaveBeenCalledWith(
        reviewerId,
        page,
        size,
        sort,
        order,
        showInstructors,
        showCourses,
        reviewedId
      );
    });

    it('should call reviewsRepository.getUserReviews with optional parameters undefined', async () => {
      const reviewerId = '12345';
      const page = 1;
      const size = 10;

      const mockResponse = {
        success: true,
        data: [],
        message: 'Reviews retrieved successfully',
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      reviewsRepository.getUserReviews.mockResolvedValue(mockResponse);

      await userService.getUserReviews(
        reviewerId,
        page,
        size,
        undefined,
        'desc',
        undefined,
        undefined,
        undefined
      );

      expect(reviewsRepository.getUserReviews).toHaveBeenCalledWith(
        reviewerId,
        page,
        size,
        undefined,
        'desc',
        undefined,
        undefined,
        undefined
      );
    });
  });

  describe('postReview', () => {
    it('should call reviewsRepository.postReview with correct parameters', async () => {
      const reviewInDTO: ReviewInDTO = {
        reviewerId: '12345',
        reviewedId: 'instructor-456',
        rate: 5,
        recommended: true,
        comments: 'Great instructor!',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
      };

      const mockCreatedReview = {
        id: 'review-new-123',
        reviewerId: reviewInDTO.reviewerId,
        reviewedId: reviewInDTO.reviewedId,
        discriminant: reviewInDTO.discriminant,
        rate: reviewInDTO.rate,
        recommended: reviewInDTO.recommended,
        comments: reviewInDTO.comments,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      reviewsRepository.postReview.mockResolvedValue(mockCreatedReview);

      const result = await userService.postReview(reviewInDTO);

      expect(result).toEqual(mockCreatedReview);
      expect(reviewsRepository.postReview).toHaveBeenCalledTimes(1);
      expect(reviewsRepository.postReview).toHaveBeenCalledWith(reviewInDTO);
    });

    it('should call reviewsRepository.postReview for course review', async () => {
      const reviewInDTO: ReviewInDTO = {
        reviewerId: '12345',
        reviewedId: 'course-789',
        rate: 4,
        recommended: true,
        discriminant: REVIEW_DISCRIMINANT.COURSE,
      };

      const mockCreatedReview = {
        id: 'review-new-456',
        reviewerId: reviewInDTO.reviewerId,
        reviewedId: reviewInDTO.reviewedId,
        discriminant: reviewInDTO.discriminant,
        rate: reviewInDTO.rate,
        recommended: reviewInDTO.recommended,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      reviewsRepository.postReview.mockResolvedValue(mockCreatedReview);

      const result = await userService.postReview(reviewInDTO);

      expect(result).toEqual(mockCreatedReview);
      expect(reviewsRepository.postReview).toHaveBeenCalledWith(reviewInDTO);
    });
  });

  describe('updateReview', () => {
    it('should call reviewsRepository.updateReview with correct parameters', async () => {
      const userId = '12345';
      const reviewId = 'review-123';
      const reviewUpdateDTO: Partial<ReviewInDTO> = {
        rate: 4,
        recommended: false,
        comments: 'Updated comment',
      };

      const mockUpdatedReview = {
        id: reviewId,
        reviewerId: userId,
        reviewedId: 'instructor-456',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
        rate: 4,
        recommended: false,
        comments: 'Updated comment',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      reviewsRepository.updateReview.mockResolvedValue(mockUpdatedReview);

      const result = await userService.updateReview(userId, reviewId, reviewUpdateDTO);

      expect(result).toEqual(mockUpdatedReview);
      expect(reviewsRepository.updateReview).toHaveBeenCalledTimes(1);
      expect(reviewsRepository.updateReview).toHaveBeenCalledWith(reviewId, reviewUpdateDTO);
    });

    it('should call reviewsRepository.updateReview with partial update', async () => {
      const userId = '12345';
      const reviewId = 'review-123';
      const reviewUpdateDTO: Partial<ReviewInDTO> = {
        rate: 3,
      };

      const mockUpdatedReview = {
        id: reviewId,
        reviewerId: userId,
        reviewedId: 'course-789',
        discriminant: REVIEW_DISCRIMINANT.COURSE,
        rate: 3,
        recommended: true,
        comments: 'Original comment',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      reviewsRepository.updateReview.mockResolvedValue(mockUpdatedReview);

      await userService.updateReview(userId, reviewId, reviewUpdateDTO);

      expect(reviewsRepository.updateReview).toHaveBeenCalledWith(reviewId, reviewUpdateDTO);
    });
  });

  describe('deleteReview', () => {
    it('should call reviewsRepository.deleteReview with correct parameters', async () => {
      const userId = '12345';
      const reviewId = 'review-123';

      reviewsRepository.deleteReview.mockResolvedValue();

      await userService.deleteReview(userId, reviewId);

      expect(reviewsRepository.deleteReview).toHaveBeenCalledTimes(1);
      expect(reviewsRepository.deleteReview).toHaveBeenCalledWith(reviewId);
    });

    it('should call reviewsRepository.deleteReview and return void', async () => {
      const userId = '12345';
      const reviewId = 'review-456';

      reviewsRepository.deleteReview.mockResolvedValue();

      const result = await userService.deleteReview(userId, reviewId);

      expect(result).toBeUndefined();
      expect(reviewsRepository.deleteReview).toHaveBeenCalledWith(reviewId);
    });
  });

  describe('getLinkedAccounts', () => {
    it('should call linkedAccountsRepository.getLinkedAccounts with correct parameters', async () => {
      const userId = '12345';
      const page = 1;
      const size = 10;
      const sort = 'linked_at';
      const order = 'desc' as 'asc' | 'desc';

      const mockResponse = {
        success: true,
        data: [
          {
            idLinkedAccount: 'account-1',
            userId: userId,
            provider: 'Google',
            issuer: 'google.com',
            idExternal: 'google-123',
            email: 'user@gmail.com',
            emailVerified: true,
            isPrimary: true,
            linkedAt: new Date('2024-01-01'),
          },
        ],
        message: 'Linked accounts retrieved successfully',
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      linkedAccountsRepository.getLinkedAccounts.mockResolvedValue(mockResponse);

      const result = await userService.getLinkedAccounts(userId, page, size, sort, order);

      expect(result).toEqual(mockResponse);
      expect(linkedAccountsRepository.getLinkedAccounts).toHaveBeenCalledTimes(1);
      expect(linkedAccountsRepository.getLinkedAccounts).toHaveBeenCalledWith(
        userId,
        page,
        size,
        sort,
        order
      );
    });

    it('should call linkedAccountsRepository.getLinkedAccounts with undefined optional parameters', async () => {
      const userId = '12345';
      const page = 1;
      const size = 10;

      const mockResponse = {
        success: true,
        data: [],
        message: 'Linked accounts retrieved successfully',
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      linkedAccountsRepository.getLinkedAccounts.mockResolvedValue(mockResponse);

      await userService.getLinkedAccounts(userId, page, size, undefined, 'asc');

      expect(linkedAccountsRepository.getLinkedAccounts).toHaveBeenCalledWith(
        userId,
        page,
        size,
        undefined,
        'asc'
      );
    });
  });

  describe('getLinkedAccount', () => {
    it('should call linkedAccountsRepository.getLinkedAccount with correct parameters', async () => {
      const userId = '12345';
      const accountId = 'account-123';

      const mockLinkedAccount = {
        idLinkedAccount: accountId,
        userId: userId,
        provider: 'GitHub',
        issuer: 'github.com',
        idExternal: 'github-456',
        email: 'user@github.com',
        emailVerified: false,
        isPrimary: false,
        linkedAt: new Date('2024-01-01'),
      };

      linkedAccountsRepository.getLinkedAccount.mockResolvedValue(mockLinkedAccount);

      const result = await userService.getLinkedAccount(userId, accountId);

      expect(result).toEqual(mockLinkedAccount);
      expect(linkedAccountsRepository.getLinkedAccount).toHaveBeenCalledTimes(1);
      expect(linkedAccountsRepository.getLinkedAccount).toHaveBeenCalledWith(accountId);
    });
  });

  describe('postLinkedAccount', () => {
    it('should call linkedAccountsRepository.postLinkedAccount with correct parameters', async () => {
      const userId = '12345';
      const linkedAccountInDTO: LinkedAccountInDTO = {
        userId: userId,
        provider: 'GitHub',
        issuer: 'github.com',
        idExternal: 'github-user123',
        email: 'user@github.com',
        isPrimary: false,
      };

      const mockCreatedAccount = {
        idLinkedAccount: 'new-account-123',
        userId: userId,
        provider: linkedAccountInDTO.provider,
        issuer: linkedAccountInDTO.issuer,
        idExternal: linkedAccountInDTO.idExternal,
        email: linkedAccountInDTO.email,
        emailVerified: false,
        isPrimary: linkedAccountInDTO.isPrimary,
        linkedAt: new Date('2024-01-01'),
      };

      linkedAccountsRepository.postLinkedAccount.mockResolvedValue(mockCreatedAccount);

      const result = await userService.postLinkedAccount(userId, linkedAccountInDTO);

      expect(result).toEqual(mockCreatedAccount);
      expect(linkedAccountsRepository.postLinkedAccount).toHaveBeenCalledTimes(1);
      expect(linkedAccountsRepository.postLinkedAccount).toHaveBeenCalledWith(linkedAccountInDTO);
    });

    it('should call linkedAccountsRepository.postLinkedAccount for primary account', async () => {
      const userId = '12345';
      const linkedAccountInDTO: LinkedAccountInDTO = {
        userId: userId,
        provider: 'Google',
        issuer: 'accounts.google.com',
        idExternal: 'google-user456',
        email: 'user@gmail.com',
        isPrimary: true,
      };

      const mockCreatedAccount = {
        idLinkedAccount: 'new-account-456',
        userId: userId,
        provider: linkedAccountInDTO.provider,
        issuer: linkedAccountInDTO.issuer,
        idExternal: linkedAccountInDTO.idExternal,
        email: linkedAccountInDTO.email,
        emailVerified: false,
        isPrimary: true,
        linkedAt: new Date('2024-01-01'),
      };

      linkedAccountsRepository.postLinkedAccount.mockResolvedValue(mockCreatedAccount);

      const result = await userService.postLinkedAccount(userId, linkedAccountInDTO);

      expect(result).toEqual(mockCreatedAccount);
      expect(linkedAccountsRepository.postLinkedAccount).toHaveBeenCalledWith(linkedAccountInDTO);
    });
  });

  describe('updateLinkedAccount', () => {
    it('should call linkedAccountsRepository.updateLinkedAccount with correct parameters', async () => {
      const userId = '12345';
      const accountId = 'account-123';
      const linkedAccountUpdateDTO: Partial<LinkedAccountInDTO> = {
        provider: 'GitLab',
        isPrimary: true,
      };

      const mockUpdatedAccount = {
        idLinkedAccount: accountId,
        userId: userId,
        provider: 'GitLab',
        issuer: 'gitlab.com',
        idExternal: 'gitlab-123',
        email: 'user@gitlab.com',
        emailVerified: true,
        isPrimary: true,
        linkedAt: new Date('2024-01-01'),
      };

      linkedAccountsRepository.updateLinkedAccount.mockResolvedValue(mockUpdatedAccount);

      const result = await userService.updateLinkedAccount(
        userId,
        accountId,
        linkedAccountUpdateDTO
      );

      expect(result).toEqual(mockUpdatedAccount);
      expect(linkedAccountsRepository.updateLinkedAccount).toHaveBeenCalledTimes(1);
      expect(linkedAccountsRepository.updateLinkedAccount).toHaveBeenCalledWith(
        accountId,
        linkedAccountUpdateDTO
      );
    });

    it('should call linkedAccountsRepository.updateLinkedAccount with partial update', async () => {
      const userId = '12345';
      const accountId = 'account-456';
      const linkedAccountUpdateDTO: Partial<LinkedAccountInDTO> = {
        email: 'newemail@example.com',
      };

      const mockUpdatedAccount = {
        idLinkedAccount: accountId,
        userId: userId,
        provider: 'Google',
        issuer: 'google.com',
        idExternal: 'google-123',
        email: 'newemail@example.com',
        emailVerified: true,
        isPrimary: false,
        linkedAt: new Date('2024-01-01'),
      };

      linkedAccountsRepository.updateLinkedAccount.mockResolvedValue(mockUpdatedAccount);

      await userService.updateLinkedAccount(userId, accountId, linkedAccountUpdateDTO);

      expect(linkedAccountsRepository.updateLinkedAccount).toHaveBeenCalledWith(
        accountId,
        linkedAccountUpdateDTO
      );
    });
  });

  describe('deleteLinkedAccount', () => {
    it('should call linkedAccountsRepository.deleteLinkedAccount with correct parameters', async () => {
      const userId = '12345';
      const accountId = 'account-123';

      linkedAccountsRepository.deleteLinkedAccount.mockResolvedValue();

      await userService.deleteLinkedAccount(userId, accountId);

      expect(linkedAccountsRepository.deleteLinkedAccount).toHaveBeenCalledTimes(1);
      expect(linkedAccountsRepository.deleteLinkedAccount).toHaveBeenCalledWith(accountId);
    });

    it('should call linkedAccountsRepository.deleteLinkedAccount and return void', async () => {
      const userId = '12345';
      const accountId = 'account-456';

      linkedAccountsRepository.deleteLinkedAccount.mockResolvedValue();

      const result = await userService.deleteLinkedAccount(userId, accountId);

      expect(result).toBeUndefined();
      expect(linkedAccountsRepository.deleteLinkedAccount).toHaveBeenCalledWith(accountId);
    });
  });

  describe('getInstructorReviews', () => {
    it('should call reviewsRepository.getInstructorReviews with correct parameters', async () => {
      const instructorId = 'instructor-123';
      const page = 1;
      const size = 10;
      const sort = 'created_at';
      const order = 'desc' as 'asc' | 'desc';

      const mockResponse = {
        success: true,
        data: [
          {
            id: 'review-1',
            reviewerId: 'user-1',
            reviewedId: instructorId,
            discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
            rate: 5,
            recommended: true,
            comments: 'Great instructor!',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
        message: 'Instructor reviews retrieved successfully',
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      reviewsRepository.getInstructorReviews.mockResolvedValue(mockResponse);

      const result = await userService.getInstructorReviews(instructorId, page, size, sort, order);

      expect(result).toEqual(mockResponse);
      expect(reviewsRepository.getInstructorReviews).toHaveBeenCalledTimes(1);
      expect(reviewsRepository.getInstructorReviews).toHaveBeenCalledWith(
        instructorId,
        page,
        size,
        sort,
        order
      );
    });
  });

  describe('getCourseReviews', () => {
    it('should call reviewsRepository.getCourseReviews with correct parameters', async () => {
      const courseId = 'course-456';
      const page = 1;
      const size = 10;
      const sort = 'rate';
      const order = 'asc' as 'asc' | 'desc';

      const mockResponse = {
        success: true,
        data: [
          {
            id: 'review-2',
            reviewerId: 'user-2',
            reviewedId: courseId,
            discriminant: REVIEW_DISCRIMINANT.COURSE,
            rate: 4,
            recommended: true,
            comments: 'Good course!',
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
          },
        ],
        message: 'Course reviews retrieved successfully',
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      reviewsRepository.getCourseReviews.mockResolvedValue(mockResponse);

      const result = await userService.getCourseReviews(courseId, page, size, sort, order);

      expect(result).toEqual(mockResponse);
      expect(reviewsRepository.getCourseReviews).toHaveBeenCalledTimes(1);
      expect(reviewsRepository.getCourseReviews).toHaveBeenCalledWith(
        courseId,
        page,
        size,
        sort,
        order
      );
    });
  });
});
