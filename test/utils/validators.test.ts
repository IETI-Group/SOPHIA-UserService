import { describe, expect, it } from 'vitest';
import {
  batchUsers,
  booleanQuery,
  confirmEmailDTO,
  emailParam,
  enumQuery,
  instructorInDTO,
  learningPathInDTO,
  linkedAccountInDTO,
  loginInDTO,
  paginationParams,
  resendConfirmationDTO,
  reviewBodyInDTO,
  reviewsParams,
  roleAssignationInDTO,
  roleInDTO,
  signUpInDTO,
  sortingParams,
  stringParam,
  userInDTO,
  usersParams,
} from '../../src/utils/validators.js';

describe('validators', () => {
  describe('usersParams', () => {
    it('should have 4 validators', () => {
      expect(usersParams).toHaveLength(4);
    });

    it('should be an array of ValidationChain', () => {
      expect(Array.isArray(usersParams)).toBe(true);
      expect(usersParams[0]).toBeDefined();
    });
  });

  describe('sortingParams', () => {
    it('should have 2 validators', () => {
      expect(sortingParams).toHaveLength(2);
    });

    it('should be an array of ValidationChain', () => {
      expect(Array.isArray(sortingParams)).toBe(true);
    });
  });

  describe('paginationParams', () => {
    it('should include page and size validation', () => {
      expect(paginationParams.length).toBeGreaterThanOrEqual(2);
    });

    it('should include sorting params', () => {
      expect(paginationParams.length).toBeGreaterThan(2);
    });
  });

  describe('reviewsParams', () => {
    it('should have 3 validators', () => {
      expect(reviewsParams).toHaveLength(3);
    });

    it('should be an array of ValidationChain', () => {
      expect(Array.isArray(reviewsParams)).toBe(true);
    });
  });

  describe('batchUsers', () => {
    it('should have 2 validators', () => {
      expect(batchUsers).toHaveLength(2);
    });

    it('should be an array of ValidationChain', () => {
      expect(Array.isArray(batchUsers)).toBe(true);
    });
  });

  describe('reviewBodyInDTO', () => {
    it('should return 5 validators when optional is false', () => {
      const validators = reviewBodyInDTO(false);
      expect(validators).toHaveLength(5);
    });

    it('should return 5 validators when optional is true', () => {
      const validators = reviewBodyInDTO(true);
      expect(validators).toHaveLength(5);
    });

    it('should return array of ValidationChain', () => {
      const validators = reviewBodyInDTO(false);
      expect(Array.isArray(validators)).toBe(true);
      expect(validators[0]).toBeDefined();
    });
  });

  describe('stringParam', () => {
    it('should create a validator', () => {
      const validator = stringParam('id', 'Invalid ID');
      expect(validator).toBeDefined();
      expect(validator.builder).toBeDefined();
    });

    it('should create validator for custom param', () => {
      const validator = stringParam('userId', 'Invalid user ID');
      expect(validator).toBeDefined();
    });

    it('should support optional flag', () => {
      const validator = stringParam('id', 'Invalid ID', true);
      expect(validator).toBeDefined();
    });
  });

  describe('emailParam', () => {
    it('should create email validator with default params', () => {
      const validator = emailParam();
      expect(validator).toBeDefined();
      expect(validator.builder).toBeDefined();
    });

    it('should create email validator for custom param', () => {
      const validator = emailParam('userEmail', 'Invalid email');
      expect(validator).toBeDefined();
    });

    it('should support optional flag', () => {
      const validator = emailParam('email', 'Invalid email', true);
      expect(validator).toBeDefined();
    });
  });

  describe('booleanQuery', () => {
    it('should create boolean query validator', () => {
      const validator = booleanQuery('active', 'Must be boolean');
      expect(validator).toBeDefined();
      expect(validator.builder).toBeDefined();
    });

    it('should support optional flag', () => {
      const validator = booleanQuery('active', 'Must be boolean', true);
      expect(validator).toBeDefined();
    });
  });

  describe('learningPathInDTO', () => {
    it('should return 5 validators when optional is false', () => {
      const validators = learningPathInDTO(false);
      expect(validators).toHaveLength(5);
    });

    it('should return 5 validators when optional is true', () => {
      const validators = learningPathInDTO(true);
      expect(validators).toHaveLength(5);
    });

    it('should return array of ValidationChain', () => {
      const validators = learningPathInDTO(false);
      expect(Array.isArray(validators)).toBe(true);
    });
  });

  describe('userInDTO', () => {
    it('should return 4 validators when partial is false', () => {
      const validators = userInDTO(false);
      expect(validators).toHaveLength(4);
    });

    it('should return 4 validators when partial is true', () => {
      const validators = userInDTO(true);
      expect(validators).toHaveLength(4);
    });

    it('should return array of ValidationChain', () => {
      const validators = userInDTO(false);
      expect(Array.isArray(validators)).toBe(true);
    });
  });

  describe('linkedAccountInDTO', () => {
    it('should return 5 validators when optional is false', () => {
      const validators = linkedAccountInDTO(false);
      expect(validators).toHaveLength(5);
    });

    it('should return 5 validators when optional is true', () => {
      const validators = linkedAccountInDTO(true);
      expect(validators).toHaveLength(5);
    });

    it('should return array of ValidationChain', () => {
      const validators = linkedAccountInDTO(false);
      expect(Array.isArray(validators)).toBe(true);
    });
  });

  describe('signUpInDTO', () => {
    it('should have 5 validators', () => {
      expect(signUpInDTO).toHaveLength(5);
    });

    it('should be an array of ValidationChain', () => {
      expect(Array.isArray(signUpInDTO)).toBe(true);
      expect(signUpInDTO[0]).toBeDefined();
    });

    it('should validate email as first field', () => {
      expect(signUpInDTO[0]).toBeDefined();
    });

    it('should validate password as second field', () => {
      expect(signUpInDTO[1]).toBeDefined();
    });

    it('should validate firstName as third field', () => {
      expect(signUpInDTO[2]).toBeDefined();
    });
  });

  describe('loginInDTO', () => {
    it('should have 2 validators', () => {
      expect(loginInDTO).toHaveLength(2);
    });

    it('should be an array of ValidationChain', () => {
      expect(Array.isArray(loginInDTO)).toBe(true);
    });
  });

  describe('confirmEmailDTO', () => {
    it('should have 2 validators', () => {
      expect(confirmEmailDTO).toHaveLength(2);
    });

    it('should be an array of ValidationChain', () => {
      expect(Array.isArray(confirmEmailDTO)).toBe(true);
    });
  });

  describe('resendConfirmationDTO', () => {
    it('should have 1 validator', () => {
      expect(resendConfirmationDTO).toHaveLength(1);
    });

    it('should be an array of ValidationChain', () => {
      expect(Array.isArray(resendConfirmationDTO)).toBe(true);
    });
  });

  describe('roleInDTO', () => {
    it('should return 2 validators when optional is false', () => {
      const validators = roleInDTO(false);
      expect(validators).toHaveLength(2);
    });

    it('should return 2 validators when optional is true', () => {
      const validators = roleInDTO(true);
      expect(validators).toHaveLength(2);
    });

    it('should return array of ValidationChain', () => {
      const validators = roleInDTO(false);
      expect(Array.isArray(validators)).toBe(true);
    });
  });

  describe('roleAssignationInDTO', () => {
    it('should return 4 validators when optional is false', () => {
      const validators = roleAssignationInDTO(false);
      expect(validators).toHaveLength(4);
    });

    it('should return 4 validators when optional is true', () => {
      const validators = roleAssignationInDTO(true);
      expect(validators).toHaveLength(4);
    });

    it('should return array of ValidationChain', () => {
      const validators = roleAssignationInDTO(false);
      expect(Array.isArray(validators)).toBe(true);
    });
  });

  describe('instructorInDTO', () => {
    it('should return 3 validators when optional is false', () => {
      const validators = instructorInDTO(false);
      expect(validators).toHaveLength(3);
    });

    it('should return 3 validators when optional is true', () => {
      const validators = instructorInDTO(true);
      expect(validators).toHaveLength(3);
    });

    it('should return array of ValidationChain', () => {
      const validators = instructorInDTO(false);
      expect(Array.isArray(validators)).toBe(true);
    });
  });

  describe('enumQuery', () => {
    it('should create enum query validator', () => {
      const validator = enumQuery('status', 'Invalid status', ['active', 'inactive']);
      expect(validator).toBeDefined();
      expect(validator.builder).toBeDefined();
    });

    it('should support optional flag', () => {
      const validator = enumQuery('status', 'Invalid status', ['active', 'inactive'], true);
      expect(validator).toBeDefined();
    });

    it('should accept valid enum values', () => {
      const validator = enumQuery('role', 'Invalid role', ['admin', 'user', 'guest']);
      expect(validator).toBeDefined();
    });
  });
});
