import { afterEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { Logger } from 'winston';
import UserController from '../../src/controllers/UserController.js';
import type { UserUpdateDTO } from '../../src/models/index.js';
import {
  FiltersUser,
  LearningPathInDTO,
  LearningPathOutDTO,
  LinkedAccountInDTO,
  LinkedAccountOutDTO,
  ReviewInDTO,
  ReviewOutDTO,
  UserInDTO,
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
      const userDTO = new UserInDTO('Jane', 'Doe', 'jane.doe@example.com', new Date('1995-05-15'));

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
      const mockLearningPath = new LearningPathOutDTO(
        userId,
        LEARNING_STYLES.VISUAL,
        LEARNING_STYLES.AUDITORY,
        PACE_PREFERENCE.FAST,
        5,
        true,
        new Date(),
        new Date()
      );
      userService.getUserLearningPath.mockResolvedValue(mockLearningPath);

      const result = await userController.getUserLearningPath(userId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBeInstanceOf(LearningPathOutDTO);
      expect(result.timestamp).toBeDefined();

      expect(userService.getUserLearningPath).toHaveBeenCalledTimes(1);
      expect(userService.getUserLearningPath).toHaveBeenCalledWith(userId);
    });
  });

  describe('post user learning path', () => {
    it('should call the service to create a learning path and return it', async () => {
      const userId = '12345';
      const learningPathInDTO = new LearningPathInDTO(
        LEARNING_STYLES.VISUAL,
        LEARNING_STYLES.AUDITORY,
        PACE_PREFERENCE.NORMAL,
        5,
        true
      );
      const mockLearningPath = new LearningPathOutDTO(
        userId,
        LEARNING_STYLES.VISUAL,
        LEARNING_STYLES.AUDITORY,
        PACE_PREFERENCE.NORMAL,
        5,
        true,
        new Date(),
        new Date()
      );
      userService.postUserLearningPath.mockResolvedValue(mockLearningPath);

      const result = await userController.postUserLearningPath(userId, learningPathInDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBeInstanceOf(LearningPathOutDTO);
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
      const mockLearningPath = new LearningPathOutDTO(
        userId,
        LEARNING_STYLES.KINESTHETIC,
        LEARNING_STYLES.READING_WRITING,
        PACE_PREFERENCE.SLOW,
        3,
        false,
        new Date(),
        new Date()
      );
      userService.updateLearningPath.mockResolvedValue(mockLearningPath);

      const result = await userController.updateLearningPath(userId, learningPathUpdateDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBeInstanceOf(LearningPathOutDTO);
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
      const mockReviews = Array.from(
        { length: 3 },
        (_, i) =>
          new ReviewOutDTO(
            (i + 1).toString(),
            new Date(),
            new Date(),
            5,
            true,
            'Great instructor',
            REVIEW_DISCRIMINANT.INSTRUCTOR
          )
      );

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
        params.showCourses
      );
    });
  });

  describe('post review', () => {
    it('should call the service to create a review and return it', async () => {
      const reviewInDTO = new ReviewInDTO(
        5,
        true,
        'Excellent teaching',
        REVIEW_DISCRIMINANT.INSTRUCTOR
      );
      const mockReview = new ReviewOutDTO(
        'review1',
        new Date(),
        new Date(),
        5,
        true,
        'Excellent teaching',
        REVIEW_DISCRIMINANT.INSTRUCTOR
      );
      userService.postReview.mockResolvedValue(mockReview);

      const result = await userController.postReview(reviewInDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBeInstanceOf(ReviewOutDTO);
      expect(result.timestamp).toBeDefined();

      expect(userService.postReview).toHaveBeenCalledTimes(1);
      expect(userService.postReview).toHaveBeenCalledWith(reviewInDTO);
    });
  });

  describe('update review', () => {
    it('should call the service to update a review and return it', async () => {
      const reviewId = 'review123';
      const reviewUpdateDTO = {
        rate: 4,
        comments: 'Updated comment',
      } as Partial<ReviewInDTO>;
      const mockReview = new ReviewOutDTO(
        reviewId,
        new Date(),
        new Date(),
        4,
        true,
        'Updated comment',
        REVIEW_DISCRIMINANT.INSTRUCTOR
      );
      userService.updateReview.mockResolvedValue(mockReview);

      const result = await userController.updateReview(reviewId, reviewUpdateDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBeInstanceOf(ReviewOutDTO);
      expect(result.timestamp).toBeDefined();

      expect(userService.updateReview).toHaveBeenCalledTimes(1);
      expect(userService.updateReview).toHaveBeenCalledWith(reviewId, reviewUpdateDTO);
    });
  });

  describe('delete review', () => {
    it('should call the service to delete a review and return a success message', async () => {
      const reviewId = 'review123';
      userService.deleteReview.mockResolvedValue();

      const result = await userController.deleteReview(reviewId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBe(`Review with id ${reviewId} deleted successfully`);
      expect(result.timestamp).toBeDefined();

      expect(userService.deleteReview).toHaveBeenCalledTimes(1);
      expect(userService.deleteReview).toHaveBeenCalledWith(reviewId);
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
      const mockAccounts = Array.from(
        { length: 2 },
        (_, i) =>
          new LinkedAccountOutDTO(
            userId,
            'github',
            'issuer',
            `external${i}`,
            `email${i}@example.com`,
            false,
            (i + 1).toString(),
            new Date(),
            true
          )
      );

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
      const mockAccount = new LinkedAccountOutDTO(
        'user123',
        'github',
        'issuer',
        'external123',
        'user@example.com',
        true,
        accountId,
        new Date(),
        true
      );
      userService.getLinkedAccount.mockResolvedValue(mockAccount);

      const result = await userController.getLinkedAccount(accountId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBeInstanceOf(LinkedAccountOutDTO);
      expect(result.timestamp).toBeDefined();

      expect(userService.getLinkedAccount).toHaveBeenCalledTimes(1);
      expect(userService.getLinkedAccount).toHaveBeenCalledWith(accountId);
    });
  });

  describe('post linked account', () => {
    it('should call the service to create a linked account and return it', async () => {
      const linkedAccountInDTO = new LinkedAccountInDTO(
        'user123',
        'github',
        'issuer',
        'external123',
        'user@example.com',
        true
      );
      const mockAccount = new LinkedAccountOutDTO(
        'user123',
        'github',
        'issuer',
        'external123',
        'user@example.com',
        true,
        'account123',
        new Date(),
        true
      );
      userService.postLinkedAccount.mockResolvedValue(mockAccount);

      const result = await userController.postLinkedAccount(linkedAccountInDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBeInstanceOf(LinkedAccountOutDTO);
      expect(result.timestamp).toBeDefined();

      expect(userService.postLinkedAccount).toHaveBeenCalledTimes(1);
      expect(userService.postLinkedAccount).toHaveBeenCalledWith(linkedAccountInDTO);
    });
  });

  describe('update linked account', () => {
    it('should call the service to update a linked account and return it', async () => {
      const accountId = 'account123';
      const linkedAccountUpdateDTO = {
        idExternal: 'newExternal',
      } as Partial<LinkedAccountInDTO>;
      const mockAccount = new LinkedAccountOutDTO(
        'user123',
        'github',
        'issuer',
        'newExternal',
        'user@example.com',
        true,
        accountId,
        new Date(),
        true
      );
      userService.updateLinkedAccount.mockResolvedValue(mockAccount);

      const result = await userController.updateLinkedAccount(accountId, linkedAccountUpdateDTO);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBeInstanceOf(LinkedAccountOutDTO);
      expect(result.timestamp).toBeDefined();

      expect(userService.updateLinkedAccount).toHaveBeenCalledTimes(1);
      expect(userService.updateLinkedAccount).toHaveBeenCalledWith(
        accountId,
        linkedAccountUpdateDTO
      );
    });
  });

  describe('delete linked account', () => {
    it('should call the service to delete a linked account and return a success message', async () => {
      const accountId = 'account123';
      userService.deleteLinkedAccount.mockResolvedValue();

      const result = await userController.deleteLinkedAccount(accountId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Request successful');
      expect(result.data).toBe(`Linked account with id ${accountId} deleted successfully`);
      expect(result.timestamp).toBeDefined();

      expect(userService.deleteLinkedAccount).toHaveBeenCalledTimes(1);
      expect(userService.deleteLinkedAccount).toHaveBeenCalledWith(accountId);
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
