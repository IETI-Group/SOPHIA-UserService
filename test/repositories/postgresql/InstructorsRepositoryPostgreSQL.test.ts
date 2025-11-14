import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { DBDrizzleProvider } from '../../../src/db/DBDrizzleProvider.js';
import { VERIFICATION_STATUS } from '../../../src/db/schema.js';
import { FiltersInstructor } from '../../../src/models/index.js';
import { InstructorsRepositoryPostgreSQL } from '../../../src/repositories/postgresql/InstructorsRepositoryPostgreSQL.js';

describe('InstructorsRepositoryPostgreSQL tests', () => {
  const drizzleClient = mockDeep<DBDrizzleProvider>();
  const repository = new InstructorsRepositoryPostgreSQL(drizzleClient);

  beforeEach(() => {
    mockReset(drizzleClient);
  });

  describe('getInstructors', () => {
    it('should return paginated instructors without filters', async () => {
      const instructorsMockData = [
        {
          id_instructor: 'instructor1',
          total_students: 100,
          total_courses: 5,
          average_rating: '4.5',
          total_reviews: 50,
          verification_status: VERIFICATION_STATUS.VERIFIED,
          verified_at: new Date('2024-01-01'),
        },
        {
          id_instructor: 'instructor2',
          total_students: 200,
          total_courses: 10,
          average_rating: '4.8',
          total_reviews: 100,
          verification_status: VERIFICATION_STATUS.VERIFIED,
          verified_at: new Date('2024-01-02'),
        },
      ];
      const countMockData = [{ count: 2 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(instructorsMockData),
        }),
      };
      const fromMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };

      const countFromMock = vi.fn().mockResolvedValue(countMockData);

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: countFromMock,
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const filters = new FiltersInstructor(null, null, null, null, null);
      const result = await repository.getInstructors(1, 10, filters);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Instructors retrieved successfully');
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should return paginated instructors with filters', async () => {
      const instructorsMockData = [
        {
          id_instructor: 'instructor1',
          total_students: 150,
          total_courses: 8,
          average_rating: '4.7',
          total_reviews: 75,
          verification_status: VERIFICATION_STATUS.VERIFIED,
          verified_at: new Date('2024-01-01'),
        },
      ];
      const countMockData = [{ count: 1 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(instructorsMockData),
        }),
      };
      const whereMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };
      const fromMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      const countWhereMock = vi.fn().mockResolvedValue(countMockData);
      const countFromMock = {
        where: countWhereMock,
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(countFromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const filters = new FiltersInstructor(
        VERIFICATION_STATUS.VERIFIED,
        50,
        100,
        5,
        4.5
      );
      const result = await repository.getInstructors(1, 10, filters);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]?.verification_status).toBe(VERIFICATION_STATUS.VERIFIED);
    });

    it('should throw error for invalid sort field', async () => {
      const filters = new FiltersInstructor(null, null, null, null, null);

      await expect(
        repository.getInstructors(1, 10, filters, 'invalid_field', 'asc')
      ).rejects.toThrow('Invalid sort field: invalid_field');
    });

    it('should return instructors sorted by total_students descending', async () => {
      const instructorsMockData = [
        {
          id_instructor: 'instructor2',
          total_students: 200,
          total_courses: 10,
          average_rating: '4.8',
          total_reviews: 100,
          verification_status: VERIFICATION_STATUS.VERIFIED,
          verified_at: new Date('2024-01-02'),
        },
        {
          id_instructor: 'instructor1',
          total_students: 100,
          total_courses: 5,
          average_rating: '4.5',
          total_reviews: 50,
          verification_status: VERIFICATION_STATUS.VERIFIED,
          verified_at: new Date('2024-01-01'),
        },
      ];
      const countMockData = [{ count: 2 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(instructorsMockData),
        }),
      };
      const fromMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };

      const countFromMock = vi.fn().mockResolvedValue(countMockData);

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: countFromMock,
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const filters = new FiltersInstructor(null, null, null, null, null);
      const result = await repository.getInstructors(1, 10, filters, 'total_students', 'desc');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]?.total_students).toBe(200);
      expect(result.data?.[1]?.total_students).toBe(100);
    });

    it('should handle second page pagination', async () => {
      const instructorsMockData = [
        {
          id_instructor: 'instructor11',
          total_students: 50,
          total_courses: 3,
          average_rating: '4.2',
          total_reviews: 25,
          verification_status: VERIFICATION_STATUS.PENDING,
          verified_at: null,
        },
      ];
      const countMockData = [{ count: 15 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(instructorsMockData),
        }),
      };
      const fromMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };

      const countFromMock = vi.fn().mockResolvedValue(countMockData);

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: countFromMock,
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const filters = new FiltersInstructor(null, null, null, null, null);
      const result = await repository.getInstructors(2, 10, filters);

      expect(result.success).toBe(true);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 15,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('should return empty list when no instructors exist', async () => {
      const countMockData = [{ count: 0 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue([]),
        }),
      };
      const fromMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };

      const countFromMock = vi.fn().mockResolvedValue(countMockData);

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: countFromMock,
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const filters = new FiltersInstructor(null, null, null, null, null);
      const result = await repository.getInstructors(1, 10, filters);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getInstructor', () => {
    it('should return instructor by id', async () => {
      const instructorMockData = {
        id_instructor: 'instructor1',
        total_students: 100,
        total_courses: 5,
        average_rating: '4.5',
        total_reviews: 50,
        verification_status: VERIFICATION_STATUS.VERIFIED,
        verified_at: new Date('2024-01-01'),
      };

      const limitMock = vi.fn().mockResolvedValue([instructorMockData]);
      const whereMock = {
        limit: limitMock,
      };
      const fromMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await repository.getInstructor('instructor1');

      expect(result.id_instructor).toBe('instructor1');
      expect(result.total_students).toBe(100);
      expect(result.verification_status).toBe(VERIFICATION_STATUS.VERIFIED);
    });

    it('should throw error when instructor not found', async () => {
      const limitMock = vi.fn().mockResolvedValue([]);
      const whereMock = {
        limit: limitMock,
      };
      const fromMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      await expect(repository.getInstructor('nonexistent')).rejects.toThrow(
        'Instructor with id nonexistent not found'
      );
    });
  });

  describe('postInstructor', () => {
    it('should create a new instructor with default values', async () => {
      const newInstructor = {
        instructorId: 'instructor1',
      };
      const createdInstructor = {
        id_instructor: 'instructor1',
        total_students: 0,
        total_courses: 0,
        average_rating: '0',
        total_reviews: 0,
        verification_status: VERIFICATION_STATUS.PENDING,
        verified_at: null,
      };

      const valuesMock = {
        returning: vi.fn().mockResolvedValue([createdInstructor]),
      };

      drizzleClient.insert.mockReturnValue({
        values: vi.fn().mockReturnValue(valuesMock),
      } as unknown as ReturnType<typeof drizzleClient.insert>);

      const result = await repository.postInstructor(newInstructor);

      expect(result).toBe('instructor1');
    });

    it('should create a new instructor with verified status', async () => {
      const verifiedAt = new Date('2024-01-01');
      const newInstructor = {
        instructorId: 'instructor2',
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        verifiedAt: verifiedAt,
      };
      const createdInstructor = {
        id_instructor: 'instructor2',
        total_students: 0,
        total_courses: 0,
        average_rating: '0',
        total_reviews: 0,
        verification_status: VERIFICATION_STATUS.VERIFIED,
        verified_at: verifiedAt,
      };

      const valuesMock = {
        returning: vi.fn().mockResolvedValue([createdInstructor]),
      };

      drizzleClient.insert.mockReturnValue({
        values: vi.fn().mockReturnValue(valuesMock),
      } as unknown as ReturnType<typeof drizzleClient.insert>);

      const result = await repository.postInstructor(newInstructor);

      expect(result).toBe('instructor2');
    });

    it('should throw error when instructor already exists', async () => {
      const duplicateInstructor = {
        instructorId: 'instructor1',
      };

      const valuesMock = {
        returning: vi
          .fn()
          .mockRejectedValue(new Error('duplicate key value violates unique constraint')),
      };

      drizzleClient.insert.mockReturnValue({
        values: vi.fn().mockReturnValue(valuesMock),
      } as unknown as ReturnType<typeof drizzleClient.insert>);

      await expect(repository.postInstructor(duplicateInstructor)).rejects.toThrow(
        'Instructor with id instructor1 already exists'
      );
    });

    it('should throw error when user not found (foreign key violation)', async () => {
      const instructorWithNonexistentUser = {
        instructorId: 'nonexistent-user',
      };

      const valuesMock = {
        returning: vi
          .fn()
          .mockRejectedValue(new Error('foreign key constraint violation')),
      };

      drizzleClient.insert.mockReturnValue({
        values: vi.fn().mockReturnValue(valuesMock),
      } as unknown as ReturnType<typeof drizzleClient.insert>);

      await expect(repository.postInstructor(instructorWithNonexistentUser)).rejects.toThrow(
        'User with id nonexistent-user not found'
      );
    });
  });

  describe('updateInstructor', () => {
    it('should update instructor verification status', async () => {
      const updatedInstructor = {
        id_instructor: 'instructor1',
        total_students: 100,
        total_courses: 5,
        average_rating: '4.5',
        total_reviews: 50,
        verification_status: VERIFICATION_STATUS.VERIFIED,
        verified_at: new Date('2024-01-10'),
      };

      const whereMock = {
        returning: vi.fn().mockResolvedValue([updatedInstructor]),
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      drizzleClient.update.mockReturnValue({
        set: vi.fn().mockReturnValue(setMock),
      } as unknown as ReturnType<typeof drizzleClient.update>);

      const result = await repository.updateInstructor('instructor1', {
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        verifiedAt: new Date('2024-01-10'),
      });

      expect(result.verification_status).toBe(VERIFICATION_STATUS.VERIFIED);
      expect(result.verified_at).toEqual(new Date('2024-01-10'));
    });

    it('should update instructor to rejected status', async () => {
      const updatedInstructor = {
        id_instructor: 'instructor2',
        total_students: 0,
        total_courses: 0,
        average_rating: '0',
        total_reviews: 0,
        verification_status: VERIFICATION_STATUS.REJECTED,
        verified_at: null,
      };

      const whereMock = {
        returning: vi.fn().mockResolvedValue([updatedInstructor]),
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      drizzleClient.update.mockReturnValue({
        set: vi.fn().mockReturnValue(setMock),
      } as unknown as ReturnType<typeof drizzleClient.update>);

      const result = await repository.updateInstructor('instructor2', {
        verificationStatus: VERIFICATION_STATUS.REJECTED,
      });

      expect(result.verification_status).toBe(VERIFICATION_STATUS.REJECTED);
    });

    it('should throw error when no fields provided', async () => {
      await expect(repository.updateInstructor('instructor1', {})).rejects.toThrow(
        'No fields to update provided'
      );
    });

    it('should throw error for invalid fields', async () => {
      await expect(
        repository.updateInstructor('instructor1', { invalid: 'field' } as any)
      ).rejects.toThrow('Invalid fields provided: invalid');
    });

    it('should throw error when instructor not found', async () => {
      const whereMock = {
        returning: vi.fn().mockResolvedValue([]),
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      drizzleClient.update.mockReturnValue({
        set: vi.fn().mockReturnValue(setMock),
      } as unknown as ReturnType<typeof drizzleClient.update>);

      await expect(
        repository.updateInstructor('nonexistent', {
          verificationStatus: VERIFICATION_STATUS.VERIFIED,
        })
      ).rejects.toThrow('Instructor with id nonexistent not found');
    });
  });

  describe('deleteInstructor', () => {
    it('should delete instructor by id', async () => {
      const deletedInstructor = {
        id_instructor: 'instructor1',
        total_students: 100,
        total_courses: 5,
        average_rating: '4.5',
        total_reviews: 50,
        verification_status: VERIFICATION_STATUS.VERIFIED,
        verified_at: new Date('2024-01-01'),
      };

      const whereMock = {
        returning: vi.fn().mockResolvedValue([deletedInstructor]),
      };

      drizzleClient.delete.mockReturnValue({
        where: vi.fn().mockReturnValue(whereMock),
      } as unknown as ReturnType<typeof drizzleClient.delete>);

      await expect(repository.deleteInstructor('instructor1')).resolves.not.toThrow();
    });

    it('should throw error when instructor not found', async () => {
      const whereMock = {
        returning: vi.fn().mockResolvedValue([]),
      };

      drizzleClient.delete.mockReturnValue({
        where: vi.fn().mockReturnValue(whereMock),
      } as unknown as ReturnType<typeof drizzleClient.delete>);

      await expect(repository.deleteInstructor('nonexistent')).rejects.toThrow(
        'Instructor with id nonexistent not found'
      );
    });
  });
});
