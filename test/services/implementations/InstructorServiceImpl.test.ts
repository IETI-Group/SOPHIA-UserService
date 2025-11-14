import { afterEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { VERIFICATION_STATUS } from '../../../src/db/schema.js';
import type {
  InstructorInput,
  InstructorRecord,
  InstructorsRepository,
} from '../../../src/repositories/index.js';
import InstructorServiceImpl from '../../../src/services/implementations/InstructorServiceImpl.js';

describe('InstructorServiceImpl tests', () => {
  const instructorsRepository = mockDeep<InstructorsRepository>();
  const instructorService = new InstructorServiceImpl(instructorsRepository);

  afterEach(() => {
    mockReset(instructorsRepository);
  });

  describe('getInstructor', () => {
    it('should call instructorsRepository.getInstructor and return the result', async () => {
      const instructorId = 'instructor123';
      const mockInstructor: InstructorRecord = {
        id_instructor: instructorId,
        total_students: 100,
        total_courses: 5,
        average_rating: '4.75',
        total_reviews: 50,
        verification_status: VERIFICATION_STATUS.VERIFIED,
        verified_at: new Date(),
      };

      instructorsRepository.getInstructor.mockResolvedValue(mockInstructor);

      const result = await instructorService.getInstructor(instructorId);

      expect(result).toEqual(mockInstructor);
      expect(instructorsRepository.getInstructor).toHaveBeenCalledTimes(1);
      expect(instructorsRepository.getInstructor).toHaveBeenCalledWith(instructorId);
    });
  });

  describe('postInstructor', () => {
    it('should call instructorsRepository.postInstructor and return the instructor ID', async () => {
      const instructorInput: InstructorInput = {
        instructorId: 'user123',
        verificationStatus: VERIFICATION_STATUS.PENDING,
      };
      const instructorId = 'user123';

      instructorsRepository.postInstructor.mockResolvedValue(instructorId);

      const result = await instructorService.postInstructor(instructorInput);

      expect(result).toBe(instructorId);
      expect(instructorsRepository.postInstructor).toHaveBeenCalledTimes(1);
      expect(instructorsRepository.postInstructor).toHaveBeenCalledWith(instructorInput);
    });
  });

  describe('updateInstructor', () => {
    it('should call instructorsRepository.updateInstructor and return the result', async () => {
      const instructorId = 'instructor123';
      const instructorUpdate: Partial<InstructorInput> = {
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        verifiedAt: new Date(),
      };
      const mockInstructor: InstructorRecord = {
        id_instructor: instructorId,
        total_students: 100,
        total_courses: 5,
        average_rating: '4.75',
        total_reviews: 50,
        verification_status: VERIFICATION_STATUS.VERIFIED,
        verified_at: new Date(),
      };

      instructorsRepository.updateInstructor.mockResolvedValue(mockInstructor);

      const result = await instructorService.updateInstructor(instructorId, instructorUpdate);

      expect(result).toEqual(mockInstructor);
      expect(instructorsRepository.updateInstructor).toHaveBeenCalledTimes(1);
      expect(instructorsRepository.updateInstructor).toHaveBeenCalledWith(
        instructorId,
        instructorUpdate
      );
    });
  });

  describe('deleteInstructor', () => {
    it('should call instructorsRepository.deleteInstructor', async () => {
      const instructorId = 'instructor123';

      instructorsRepository.deleteInstructor.mockResolvedValue();

      await instructorService.deleteInstructor(instructorId);

      expect(instructorsRepository.deleteInstructor).toHaveBeenCalledTimes(1);
      expect(instructorsRepository.deleteInstructor).toHaveBeenCalledWith(instructorId);
    });
  });
});
