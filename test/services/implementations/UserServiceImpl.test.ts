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
import type { UsersRepository } from '../../../src/repositories/index.js';
import UserServiceImpl from '../../../src/services/implementations/UserServiceImpl.js';
import {
  LEARNING_STYLES,
  PACE_PREFERENCE,
  REVIEW_DISCRIMINANT,
  ROLE,
} from '../../../src/utils/types.js';

describe('User Service Implementation', () => {
  const userRepository = mockDeep<UsersRepository>();
  const userService = new UserServiceImpl(userRepository);

  beforeEach(() => {
    mockReset(userRepository);
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
    it('should throw error for not implemented method', async () => {
      const userId = '12345';

      await expect(userService.getUserLearningPath(userId)).rejects.toThrow(
        'Method not implemented.'
      );
    });
  });

  describe('postUserLearningPath', () => {
    it('should throw error for not implemented method', async () => {
      const userId = '12345';
      const learningPathInDTO: LearningPathInDTO = {
        primaryStyle: LEARNING_STYLES.VISUAL,
        secondaryStyle: LEARNING_STYLES.AUDITORY,
        pacePreference: PACE_PREFERENCE.NORMAL,
        gamificationEnabled: true,
        interactivityPreference: 4,
      };

      await expect(userService.postUserLearningPath(userId, learningPathInDTO)).rejects.toThrow(
        'Method not implemented.'
      );
    });
  });

  describe('updateLearningPath', () => {
    it('should throw error for not implemented method', async () => {
      const userId = '12345';
      const learningPathUpdateDTO: Partial<LearningPathInDTO> = {
        primaryStyle: LEARNING_STYLES.KINESTHETIC,
      };

      await expect(userService.updateLearningPath(userId, learningPathUpdateDTO)).rejects.toThrow(
        'Method not implemented.'
      );
    });
  });

  describe('getUserReviews', () => {
    it('should throw error for not implemented method', async () => {
      const reviewerId = '12345';

      await expect(
        userService.getUserReviews(reviewerId, 1, 10, 'createdAt', 'desc', true, false, undefined)
      ).rejects.toThrow('Method not implemented.');
    });
  });

  describe('postReview', () => {
    it('should throw error for not implemented method', async () => {
      const reviewInDTO: ReviewInDTO = {
        reviewerId: '12345',
        reviewedId: 'review1',
        rate: 5,
        recommended: true,
        comments: 'Great!',
        discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
      };

      await expect(userService.postReview(reviewInDTO)).rejects.toThrow('Method not implemented.');
    });
  });

  describe('updateReview', () => {
    it('should throw error for not implemented method', async () => {
      const userId = '12345';
      const reviewId = 'review123';
      const reviewUpdateDTO: Partial<ReviewInDTO> = {
        rate: 4,
      };

      await expect(userService.updateReview(userId, reviewId, reviewUpdateDTO)).rejects.toThrow(
        'Method not implemented.'
      );
    });
  });

  describe('deleteReview', () => {
    it('should throw error for not implemented method', async () => {
      const userId = '12345';
      const reviewId = 'review123';

      await expect(userService.deleteReview(userId, reviewId)).rejects.toThrow(
        'Method not implemented.'
      );
    });
  });

  describe('getLinkedAccounts', () => {
    it('should throw error for not implemented method', async () => {
      const userId = '12345';

      await expect(userService.getLinkedAccounts(userId, 1, 10, 'platform', 'asc')).rejects.toThrow(
        'Method not implemented.'
      );
    });
  });

  describe('getLinkedAccount', () => {
    it('should throw error for not implemented method', async () => {
      const userId = '12345';
      const accountId = 'account123';

      await expect(userService.getLinkedAccount(userId, accountId)).rejects.toThrow(
        'Method not implemented.'
      );
    });
  });

  describe('postLinkedAccount', () => {
    it('should throw error for not implemented method', async () => {
      const userId = '12345';
      const linkedAccountInDTO: LinkedAccountInDTO = {
        userId: userId,
        provider: 'GitHub',
        issuer: 'github.com',
        idExternal: 'user123',
        email: 'user@github.com',
        isPrimary: false,
      };

      await expect(userService.postLinkedAccount(userId, linkedAccountInDTO)).rejects.toThrow(
        'Method not implemented.'
      );
    });
  });

  describe('updateLinkedAccount', () => {
    it('should throw error for not implemented method', async () => {
      const userId = '12345';
      const accountId = 'account123';
      const linkedAccountUpdateDTO: Partial<LinkedAccountInDTO> = {
        provider: 'GitLab',
        isPrimary: true,
      };

      await expect(
        userService.updateLinkedAccount(userId, accountId, linkedAccountUpdateDTO)
      ).rejects.toThrow('Method not implemented.');
    });
  });

  describe('deleteLinkedAccount', () => {
    it('should throw error for not implemented method', async () => {
      const userId = '12345';
      const accountId = 'account123';

      await expect(userService.deleteLinkedAccount(userId, accountId)).rejects.toThrow(
        'Method not implemented.'
      );
    });
  });
});
