import { afterEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { Logger } from 'winston';
import InstructorController from '../../src/controllers/InstructorController.js';
import { VERIFICATION_STATUS } from '../../src/db/schema.js';
import type { InstructorInput, InstructorRecord } from '../../src/repositories/index.js';
import type { InstructorService } from '../../src/services/index.js';

describe('Instructor Controller tests', () => {
  const instructorService = mockDeep<InstructorService>();
  const logger = mockDeep<Logger>();
  const instructorController = new InstructorController(instructorService, logger);

  afterEach(() => {
    mockReset(instructorService);
    mockReset(logger);
  });

  describe('getInstructor', () => {
    it('should return an instructor by ID', async () => {
      const instructorId = 'instructor123';
      const mockInstructor: InstructorRecord = {
        first_name: 'John',
        last_name: 'Doe',
        id_instructor: instructorId,
        total_students: 100,
        total_courses: 5,
        average_rating: '4.75',
        total_reviews: 50,
        verification_status: VERIFICATION_STATUS.VERIFIED,
        verified_at: new Date(),
      };

      instructorService.getInstructor.mockResolvedValue(mockInstructor);

      const result = await instructorController.getInstructor(instructorId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Instructor retrieved successfully');
      expect(result.data).toEqual(mockInstructor);
      expect(result.timestamp).toBeDefined();

      expect(instructorService.getInstructor).toHaveBeenCalledTimes(1);
      expect(instructorService.getInstructor).toHaveBeenCalledWith(instructorId);
    });
  });

  describe('postInstructor', () => {
    it('should create a new instructor and return it', async () => {
      const instructorInput: InstructorInput = {
        instructorId: 'user123',
        verificationStatus: VERIFICATION_STATUS.PENDING,
      };
      const instructorId = 'user123';
      const mockInstructor: InstructorRecord = {
        first_name: 'Name Test',
        last_name: 'Last Test',
        id_instructor: instructorId,
        total_students: 0,
        total_courses: 0,
        average_rating: '0',
        total_reviews: 0,
        verification_status: VERIFICATION_STATUS.PENDING,
        verified_at: null,
      };

      instructorService.postInstructor.mockResolvedValue(instructorId);
      instructorService.getInstructor.mockResolvedValue(mockInstructor);

      const result = await instructorController.postInstructor(instructorInput);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Instructor created successfully');
      expect(result.data).toEqual(mockInstructor);
      expect(result.timestamp).toBeDefined();

      expect(instructorService.postInstructor).toHaveBeenCalledTimes(1);
      expect(instructorService.postInstructor).toHaveBeenCalledWith(instructorInput);
      expect(instructorService.getInstructor).toHaveBeenCalledTimes(1);
      expect(instructorService.getInstructor).toHaveBeenCalledWith(instructorId);
    });
  });

  describe('updateInstructor', () => {
    it('should update an instructor and return it', async () => {
      const instructorId = 'instructor123';
      const instructorUpdate: Partial<InstructorInput> = {
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        verifiedAt: new Date(),
      };
      const mockInstructor: InstructorRecord = {
        first_name: 'John',
        last_name: 'Doe',
        id_instructor: instructorId,
        total_students: 100,
        total_courses: 5,
        average_rating: '4.75',
        total_reviews: 50,
        verification_status: VERIFICATION_STATUS.VERIFIED,
        verified_at: new Date(),
      };

      instructorService.updateInstructor.mockResolvedValue(mockInstructor);

      const result = await instructorController.updateInstructor(instructorId, instructorUpdate);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Instructor updated successfully');
      expect(result.data).toEqual(mockInstructor);
      expect(result.timestamp).toBeDefined();

      expect(instructorService.updateInstructor).toHaveBeenCalledTimes(1);
      expect(instructorService.updateInstructor).toHaveBeenCalledWith(
        instructorId,
        instructorUpdate
      );
    });
  });

  describe('deleteInstructor', () => {
    it('should delete an instructor and return success message', async () => {
      const instructorId = 'instructor123';

      instructorService.deleteInstructor.mockResolvedValue();

      const result = await instructorController.deleteInstructor(instructorId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Instructor deleted successfully');
      expect(result.data).toBe(`Instructor ${instructorId} deleted successfully`);
      expect(result.timestamp).toBeDefined();

      expect(instructorService.deleteInstructor).toHaveBeenCalledTimes(1);
      expect(instructorService.deleteInstructor).toHaveBeenCalledWith(instructorId);
    });
  });
});
