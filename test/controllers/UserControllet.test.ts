import { afterEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { Logger } from 'winston';
import UserController from '../../src/controllers/UserController.js';
import type { UserUpdateDTO } from '../../src/models/index.js';
import {
  FiltersUser,
  type LearningPathInDTO,
  type LearningPathOutDTO,
  type LinkedAccountInDTO,
  type LinkedAccountOutDTO,
  type ReviewInDTO,
  type ReviewOutDTO,
  type UserInDTO,
} from '../../src/models/index.js';
import type { UserService } from '../../src/services/index.js';
import {
  LEARNING_STYLES,
  PACE_PREFERENCE,
  REVIEW_DISCRIMINANT,
  ROLE,
} from '../../src/utils/types.js';

describe('User Controller tests', () => {
  const userService = mockDeep<UserService>();
  const logger = mockDeep<Logger>();
  const userController = new UserController(userService, logger);
  afterEach(() => {
    mockReset(userService);
    mockReset(logger);
  });
  describe('get users', () => {
    it('should return a list of users with pagination specified with no filters', async () => {
      const params = { page: 1, size: 10, sort: 'firstName', order: 'asc' as 'asc' | 'desc' };
      const filters: FiltersUser = new FiltersUser(null, null, null, null);
      const timestamp = new Date().toISOString();
      userService.getUsers.mockResolvedValue({
        success: true,
        message: 'Users retrieved successfully',
        data: [
          { userId: '1', role: ROLE.ADMIN },
          { userId: '2', role: ROLE.INSTRUCTOR },
          { userId: '3', role: ROLE.STUDENT },
          { userId: '4', role: ROLE.STUDENT },
          { userId: '5', role: ROLE.INSTRUCTOR },
          { userId: '6', role: ROLE.STUDENT },
          { userId: '7', role: ROLE.INSTRUCTOR },
          { userId: '8', role: ROLE.STUDENT },
          { userId: '9', role: ROLE.STUDENT },
          { userId: '10', role: ROLE.INSTRUCTOR },
          { userId: '11', role: ROLE.STUDENT },
          { userId: '12', role: ROLE.STUDENT },
        ],
        timestamp,
        pagination: {
          page: params.page,
          limit: params.size,
          total: 12,
          totalPages: 2,
          hasNext: true,
          hasPrev: false,
        },
      });

      const result = await userController.getUsers(
        params.page,
        params.size,
        params.sort,
        params.order
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Users retrieved successfully');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(12);
      expect(result.timestamp).toBe(timestamp);
      expect(result.pagination).toBeDefined();
      expect(result.pagination?.page).toBe(params.page);
      expect(result.pagination?.limit).toBe(params.size);
      expect(result.pagination?.total).toBe(12);
      expect(result.pagination?.totalPages).toBe(2);
      expect(result.pagination?.hasNext).toBe(true);
      expect(result.pagination?.hasPrev).toBe(false);

      expect(userService.getUsers).toHaveBeenCalledTimes(1);
      expect(userService.getUsers).toHaveBeenCalledWith(
        params.page,
        params.size,
        params.sort,
        params.order,
        undefined,
        filters
      );
    });

    it('should return a list of users with pagination specified with all filters', async () => {
      const params = {
        page: 1,
        size: 10,
        sort: 'firstName',
        order: 'asc' as 'asc' | 'desc',
        lightDTO: true,
        firstName: 'John',
        lastName: 'Doe',
        birthDayFrom: new Date('1990-01-01'),
        birthDayTo: new Date('2000-12-31'),
      };
      const filters: FiltersUser = new FiltersUser(
        params.firstName,
        params.lastName,
        params.birthDayFrom,
        params.birthDayTo
      );
      const timestamp = new Date().toISOString();
      const mockUsers = Array.from({ length: 5 }, (_, i) => ({
        userId: (i + 1).toString(),
        role: ROLE.STUDENT,
      }));

      userService.getUsers.mockResolvedValue({
        success: true,
        message: 'Users retrieved successfully',
        data: mockUsers,
        timestamp,
        pagination: {
          page: params.page,
          limit: params.size,
          total: 5,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      const result = await userController.getUsers(
        params.page,
        params.size,
        params.sort,
        params.order,
        params.lightDTO,
        params.firstName,
        params.lastName,
        params.birthDayFrom,
        params.birthDayTo
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Users retrieved successfully');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(5);
      expect(result.timestamp).toBe(timestamp);
      expect(result.pagination).toBeDefined();
      expect(result.pagination?.page).toBe(params.page);
      expect(result.pagination?.limit).toBe(params.size);
      expect(result.pagination?.total).toBe(5);
      expect(result.pagination?.totalPages).toBe(1);
      expect(result.pagination?.hasNext).toBe(false);
      expect(result.pagination?.hasPrev).toBe(false);

      expect(userService.getUsers).toHaveBeenCalledTimes(1);
      expect(userService.getUsers).toHaveBeenCalledWith(
        params.page,
        params.size,
        params.sort,
        params.order,
        params.lightDTO,
        filters
      );
    });
  });

  describe('get user by id', () => {
    it('should return a user by ID', async () => {
      const userId = '12345';
      const lightDTO = true;
      const mockUser = { userId, role: ROLE.INSTRUCTOR };
      userService.getUserById.mockResolvedValue(mockUser);

      const result = await userController.getUserById(userId, lightDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toEqual(mockUser);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('create user', () => {
    it('should call the service to create a user and return the created user', async () => {
      const userDTO: UserInDTO = {
        email: 'jane.doe@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        birthDate: new Date('1995-05-15'),
      };

      const createdUser = { userId: '1', role: ROLE.STUDENT };
      userService.postUser.mockResolvedValue(createdUser);

      const result = await userController.postUser(userDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toEqual(createdUser);
      expect(result.timestamp).toBeDefined();

      expect(userService.postUser).toHaveBeenCalledTimes(1);
      expect(userService.postUser).toHaveBeenCalledWith(userDTO);
    });
  });

  describe('update user', () => {
    it('should call the service to update a user and return the updated user', async () => {
      const userId = '12345';
      const userUpdateDTO = {
        firstName: 'UpdatedName',
        bio: 'Updated bio',
        lastName: 'UpdatedLastName',
      } as Partial<UserUpdateDTO>;

      const updatedUser = { userId, role: ROLE.INSTRUCTOR };
      userService.updateUser.mockResolvedValue(updatedUser);

      const result = await userController.updateUser(userId, userUpdateDTO);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toEqual(updatedUser);
      expect(result.timestamp).toBeDefined();

      expect(userService.updateUser).toHaveBeenCalledTimes(1);
      expect(userService.updateUser).toHaveBeenCalledWith(userId, userUpdateDTO);
    });
  });

  describe('delete user', () => {
    it('should call the service to delete a user and return a success message', async () => {
      const userId = '12345';
      userService.deleteUser.mockResolvedValue();

      const result = await userController.deleteUser(userId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBe(`User with id ${userId} deleted successfully`);
      expect(result.timestamp).toBeDefined();

      expect(userService.deleteUser).toHaveBeenCalledTimes(1);
      expect(userService.deleteUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('get user by email', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const lightDTO = true;
      const mockUser = { userId: '12345', role: ROLE.INSTRUCTOR };
      userService.getUserByEmail.mockResolvedValue(mockUser);

      const result = await userController.getUserByEmail(email, lightDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toEqual(mockUser);
      expect(result.timestamp).toBeDefined();

      expect(userService.getUserByEmail).toHaveBeenCalledTimes(1);
      expect(userService.getUserByEmail).toHaveBeenCalledWith(email, lightDTO);
    });
  });

  describe('get user learning path', () => {
    it('should call the service to get user learning path and return it', async () => {
      const userId = '12345';
      const mockLearningPath: LearningPathOutDTO = {
        userId,
        id: '67890',
        primaryStyle: LEARNING_STYLES.VISUAL,
        secondaryStyle: LEARNING_STYLES.AUDITORY,
        pacePreference: PACE_PREFERENCE.FAST,
        gamificationEnabled: true,
        interactivityPreference: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userService.getUserLearningPath.mockResolvedValue(mockLearningPath);

      const result = await userController.getUserLearningPath(userId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.timestamp).toBeDefined();

      expect(userService.getUserLearningPath).toHaveBeenCalledTimes(1);
      expect(userService.getUserLearningPath).toHaveBeenCalledWith(userId);
    });
  });

  describe('post user learning path', () => {
    it('should call the service to create a learning path and return it', async () => {
      const userId = '12345';
      const learningPathInDTO = {
        primaryStyle: LEARNING_STYLES.VISUAL,
        secondaryStyle: LEARNING_STYLES.AUDITORY,
        pacePreference: PACE_PREFERENCE.NORMAL,
        duration: 5,
        gamificationEnabled: true,
        interactivityPreference: 4,
      };
      const mockLearningPath: LearningPathOutDTO = {
        userId,
        primaryStyle: LEARNING_STYLES.VISUAL,
        secondaryStyle: LEARNING_STYLES.AUDITORY,
        pacePreference: PACE_PREFERENCE.NORMAL,
        id: '67890',
        gamificationEnabled: true,
        interactivityPreference: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userService.postUserLearningPath.mockResolvedValue(mockLearningPath);

      const result = await userController.postUserLearningPath(userId, learningPathInDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.timestamp).toBeDefined();

      expect(userService.postUserLearningPath).toHaveBeenCalledTimes(1);
      expect(userService.postUserLearningPath).toHaveBeenCalledWith(userId, learningPathInDTO);
    });
  });

  describe('update learning path', () => {
    it('should call the service to update a learning path and return it', async () => {
      const userId = '12345';
      const learningPathUpdateDTO = {
        primaryStyle: LEARNING_STYLES.KINESTHETIC,
        pacePreference: PACE_PREFERENCE.SLOW,
      } as Partial<LearningPathInDTO>;
      const mockLearningPath = {
        userId,
        id: '67890',
        primaryStyle: LEARNING_STYLES.KINESTHETIC,
        secondaryStyle: LEARNING_STYLES.READING_WRITING,
        pacePreference: PACE_PREFERENCE.SLOW,
        interactivityPreference: 3,
        gamificationEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      userService.updateLearningPath.mockResolvedValue(mockLearningPath);

      const result = await userController.updateLearningPath(userId, learningPathUpdateDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.timestamp).toBeDefined();

      expect(userService.updateLearningPath).toHaveBeenCalledTimes(1);
      expect(userService.updateLearningPath).toHaveBeenCalledWith(userId, learningPathUpdateDTO);
    });
  });

  describe('get user reviews', () => {
    it('should return a list of reviews with pagination', async () => {
      const reviewerId = '12345';
      const params = {
        page: 1,
        size: 10,
        sort: 'createdAt',
        order: 'desc' as 'asc' | 'desc',
        showInstructors: true,
        showCourses: false,
      };
      const timestamp = new Date().toISOString();
      const mockReviews: ReviewOutDTO[] = Array.from({ length: 3 }, (_, i) => {
        return {
          reviewedId: `review${i + 1}`,
          id: `id${i + 1}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          rate: 5,
          recommended: true,
          comments: 'Great instructor',
          discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
          reviewerId: reviewerId,
        };
      });

      userService.getUserReviews.mockResolvedValue({
        success: true,
        message: 'Reviews retrieved successfully',
        data: mockReviews,
        timestamp,
        pagination: {
          page: params.page,
          limit: params.size,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      const result = await userController.getUserReviews(
        reviewerId,
        params.page,
        params.size,
        params.sort,
        params.order,
        params.showInstructors,
        params.showCourses
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Reviews retrieved successfully');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(3);
      expect(result.timestamp).toBe(timestamp);

      expect(userService.getUserReviews).toHaveBeenCalledTimes(1);
      expect(userService.getUserReviews).toHaveBeenCalledWith(
        reviewerId,
        params.page,
        params.size,
        params.sort,
        params.order,
        params.showInstructors,
        params.showCourses,
        undefined
      );
    });
  });

  describe('post review', () => {
    it('should call the service to create a review and return it', async () => {
      const reviewInDTO: ReviewInDTO = {
        reviewerId: '12345',
        reviewedId: 'review1',
        rate: 5,
        recommended: true,
        comments: 'Excellent teaching',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
      };

      const mockReview: ReviewOutDTO = {
        reviewedId: 'review1',
        reviewerId: '12345',
        id: 'id1',
        createdAt: new Date(),
        updatedAt: new Date(),
        rate: 5,
        recommended: true,
        comments: 'Excellent teaching',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
      };
      userService.postReview.mockResolvedValue(mockReview);

      const result = await userController.postReview(reviewInDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.timestamp).toBeDefined();

      expect(userService.postReview).toHaveBeenCalledTimes(1);
      expect(userService.postReview).toHaveBeenCalledWith(reviewInDTO);
    });
  });

  describe('update review', () => {
    it('should call the service to update a review and return it', async () => {
      const reviewId = 'review123';
      const reviewUpdateDTO: Partial<ReviewInDTO> = {
        rate: 4,
        comments: 'Updated comment',
      };
      const userId = 'user123';
      const mockReview: ReviewOutDTO = {
        id: reviewId,
        reviewedId: reviewId,
        createdAt: new Date(),
        updatedAt: new Date(),
        rate: 4,
        recommended: true,
        comments: 'Updated comment',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
        reviewerId: reviewId,
      };
      userService.updateReview.mockResolvedValue(mockReview);

      const result = await userController.updateReview(userId, reviewId, reviewUpdateDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.timestamp).toBeDefined();

      expect(userService.updateReview).toHaveBeenCalledTimes(1);
      expect(userService.updateReview).toHaveBeenCalledWith(userId, reviewId, reviewUpdateDTO);
    });
  });

  describe('delete review', () => {
    it('should call the service to delete a review and return a success message', async () => {
      const reviewId = 'review123';
      const userId = 'user123';
      userService.deleteReview.mockResolvedValue();

      const result = await userController.deleteReview(userId, reviewId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBe(`Review with id ${reviewId} deleted successfully`);
      expect(result.timestamp).toBeDefined();

      expect(userService.deleteReview).toHaveBeenCalledTimes(1);
      expect(userService.deleteReview).toHaveBeenCalledWith(userId, reviewId);
    });
  });

  describe('get linked accounts', () => {
    it('should return a list of linked accounts with pagination', async () => {
      const userId = '12345';
      const params = {
        page: 1,
        size: 10,
        sort: 'platform',
        order: 'asc' as 'asc' | 'desc',
      };
      const timestamp = new Date().toISOString();
      const mockAccounts: LinkedAccountOutDTO[] = Array.from({ length: 2 }, (_, i) => {
        return {
          userId: 'user123',
          provider: 'github',
          issuer: 'issuer',
          idExternal: `external${i}`,
          email: `email${i}@example.com`,
          isPrimary: false,
          idLinkedAccount: `account${i}`,
          linkedAt: new Date(),
          emailVerified: true,
        };
      });

      userService.getLinkedAccounts.mockResolvedValue({
        success: true,
        message: 'Linked accounts retrieved successfully',
        data: mockAccounts,
        timestamp,
        pagination: {
          page: params.page,
          limit: params.size,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      const result = await userController.getLinkedAccounts(
        userId,
        params.page,
        params.size,
        params.sort,
        params.order
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Linked accounts retrieved successfully');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(2);
      expect(result.timestamp).toBe(timestamp);

      expect(userService.getLinkedAccounts).toHaveBeenCalledTimes(1);
      expect(userService.getLinkedAccounts).toHaveBeenCalledWith(
        userId,
        params.page,
        params.size,
        params.sort,
        params.order
      );
    });
  });

  describe('get linked account', () => {
    it('should call the service to get a linked account and return it', async () => {
      const accountId = 'account123';
      const userId = 'user123';
      const mockAccount = {
        userId,
        provider: 'github',
        issuer: 'issuer',
        idExternal: 'external123',
        email: 'user@example.com',
        isPrimary: true,
        idLinkedAccount: accountId,
        linkedAt: new Date(),
        emailVerified: true,
      };
      userService.getLinkedAccount.mockResolvedValue(mockAccount);

      const result = await userController.getLinkedAccount(userId, accountId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.timestamp).toBeDefined();

      expect(userService.getLinkedAccount).toHaveBeenCalledTimes(1);
      expect(userService.getLinkedAccount).toHaveBeenCalledWith(userId, accountId);
    });
  });

  describe('post linked account', () => {
    it('should call the service to create a linked account and return it', async () => {
      const userId = 'user123';
      const linkedAccountInDTO: LinkedAccountInDTO = {
        userId,
        provider: 'github',
        issuer: 'issuer',
        idExternal: 'external123',
        email: 'user@example.com',
        isPrimary: true,
      };
      const mockAccount: LinkedAccountOutDTO = {
        idLinkedAccount: 'account123',
        linkedAt: new Date(),
        emailVerified: true,
        userId: 'user123',
        provider: 'github',
        issuer: 'issuer',
        idExternal: 'external123',
        email: 'user@example.com',
        isPrimary: true,
      };
      userService.postLinkedAccount.mockResolvedValue(mockAccount);

      const result = await userController.postLinkedAccount(userId, linkedAccountInDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.timestamp).toBeDefined();

      expect(userService.postLinkedAccount).toHaveBeenCalledTimes(1);
      expect(userService.postLinkedAccount).toHaveBeenCalledWith(userId, linkedAccountInDTO);
    });
  });

  describe('update linked account', () => {
    it('should call the service to update a linked account and return it', async () => {
      const accountId = 'account123';
      const userId = 'user123';
      const linkedAccountUpdateDTO = {
        idExternal: 'newExternal',
      } as Partial<LinkedAccountInDTO>;
      const mockAccount: LinkedAccountOutDTO = {
        userId,
        provider: 'github',
        issuer: 'issuer',
        idExternal: 'newExternal',
        email: 'user@example.com',
        isPrimary: true,
        idLinkedAccount: accountId,
        linkedAt: new Date(),
        emailVerified: true,
      };
      userService.updateLinkedAccount.mockResolvedValue(mockAccount);

      const result = await userController.updateLinkedAccount(
        userId,
        accountId,
        linkedAccountUpdateDTO
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.timestamp).toBeDefined();

      expect(userService.updateLinkedAccount).toHaveBeenCalledTimes(1);
      expect(userService.updateLinkedAccount).toHaveBeenCalledWith(
        userId,
        accountId,
        linkedAccountUpdateDTO
      );
    });
  });

  describe('delete linked account', () => {
    it('should call the service to delete a linked account and return a success message', async () => {
      const accountId = 'account123';
      const userId = 'user123';
      userService.deleteLinkedAccount.mockResolvedValue();

      const result = await userController.deleteLinkedAccount(userId, accountId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBe(`Linked account with id ${accountId} deleted successfully`);
      expect(result.timestamp).toBeDefined();

      expect(userService.deleteLinkedAccount).toHaveBeenCalledTimes(1);
      expect(userService.deleteLinkedAccount).toHaveBeenCalledWith(userId, accountId);
    });
  });

  describe('get users by ids', () => {
    it('should return a list of users by ids with pagination', async () => {
      const userIds = ['1', '2', '3'];
      const params = {
        page: 1,
        size: 10,
        sort: 'firstName',
        order: 'asc' as 'asc' | 'desc',
        lightDTO: true,
      };
      const timestamp = new Date().toISOString();
      const mockUsers = userIds.map((id) => ({ userId: id, role: ROLE.STUDENT }));

      userService.getUsersByIds.mockResolvedValue({
        success: true,
        message: 'Users retrieved successfully',
        data: mockUsers,
        timestamp,
        pagination: {
          page: params.page,
          limit: params.size,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      const result = await userController.getUsersByIds(
        userIds,
        params.page,
        params.size,
        params.sort,
        params.order,
        params.lightDTO
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Users retrieved successfully');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data).toHaveLength(3);
      expect(result.timestamp).toBe(timestamp);

      expect(userService.getUsersByIds).toHaveBeenCalledTimes(1);
      expect(userService.getUsersByIds).toHaveBeenCalledWith(
        userIds,
        params.page,
        params.size,
        params.sort,
        params.order,
        params.lightDTO
      );
    });
  });
});
