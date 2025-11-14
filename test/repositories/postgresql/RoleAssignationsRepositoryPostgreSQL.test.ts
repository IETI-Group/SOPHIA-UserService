import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { DBDrizzleProvider } from '../../../src/db/DBDrizzleProvider.js';
import { ROLE, ROLE_STATUS } from '../../../src/db/schema.js';
import { FiltersRoleAssignation } from '../../../src/models/index.js';
import { RoleAssignationsRepositoryPostgreSQL } from '../../../src/repositories/postgresql/RoleAssignationsRepositoryPostgreSQL.js';

describe('RoleAssignationsRepositoryPostgreSQL tests', () => {
  const drizzleClient = mockDeep<DBDrizzleProvider>();
  const repository = new RoleAssignationsRepositoryPostgreSQL(drizzleClient);

  beforeEach(() => {
    mockReset(drizzleClient);
  });

  describe('getAssignedRoles', () => {
    it('should return paginated role assignations without filters', async () => {
      const assignationsMockData = [
        {
          id_user_role: '1',
          user_id: 'user1',
          role_id: 'role1',
          assigned_at: new Date('2024-01-01'),
          expires_at: null,
          status: ROLE_STATUS.ACTIVE,
          role_name: ROLE.ADMIN,
          user_email: 'user1@example.com',
          user_first_name: 'John',
          user_last_name: 'Doe',
        },
        {
          id_user_role: '2',
          user_id: 'user2',
          role_id: 'role2',
          assigned_at: new Date('2024-01-02'),
          expires_at: null,
          status: ROLE_STATUS.ACTIVE,
          role_name: ROLE.INSTRUCTOR,
          user_email: 'user2@example.com',
          user_first_name: 'Jane',
          user_last_name: 'Smith',
        },
      ];
      const countMockData = [{ count: 2 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(assignationsMockData),
        }),
      };
      const innerJoinMock = {
        innerJoin: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue(orderByMock),
        }),
      };
      const fromMock = {
        innerJoin: vi.fn().mockReturnValue(innerJoinMock),
      };

      const countInnerJoinMock = {
        innerJoin: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockResolvedValue(countMockData),
        }),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(countInnerJoinMock),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const filters = new FiltersRoleAssignation(null, null, null, null, null, null);
      const result = await repository.getAssignedRoles(1, 10, filters);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Role assignations retrieved successfully');
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

    it('should return paginated role assignations with filters', async () => {
      const assignationsMockData = [
        {
          id_user_role: '1',
          user_id: 'user1',
          role_id: 'role1',
          assigned_at: new Date('2024-01-15'),
          expires_at: null,
          status: ROLE_STATUS.ACTIVE,
          role_name: ROLE.ADMIN,
          user_email: 'user1@example.com',
          user_first_name: 'John',
          user_last_name: 'Doe',
        },
      ];
      const countMockData = [{ count: 1 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(assignationsMockData),
        }),
      };
      const whereMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };
      const innerJoinMock = {
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(whereMock),
        }),
      };
      const fromMock = {
        innerJoin: vi.fn().mockReturnValue(innerJoinMock),
      };

      const countWhereMock = vi.fn().mockResolvedValue(countMockData);
      const countInnerJoinMock = {
        innerJoin: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: countWhereMock,
          }),
        }),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(countInnerJoinMock),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const filters = new FiltersRoleAssignation(
        new Date('2024-01-10'),
        new Date('2024-01-20'),
        null,
        null,
        ROLE_STATUS.ACTIVE,
        ROLE.ADMIN
      );
      const result = await repository.getAssignedRoles(1, 10, filters);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]?.role_name).toBe(ROLE.ADMIN);
    });

    it('should throw error for invalid sort field', async () => {
      const filters = new FiltersRoleAssignation(null, null, null, null, null, null);

      await expect(
        repository.getAssignedRoles(1, 10, filters, 'invalid_field', 'asc')
      ).rejects.toThrow('Invalid sort field: invalid_field');
    });

    it('should handle second page pagination', async () => {
      const assignationsMockData = [
        {
          id_user_role: '11',
          user_id: 'user11',
          role_id: 'role1',
          assigned_at: new Date('2024-01-11'),
          expires_at: null,
          status: ROLE_STATUS.ACTIVE,
          role_name: ROLE.STUDENT,
          user_email: 'user11@example.com',
          user_first_name: 'User',
          user_last_name: 'Eleven',
        },
      ];
      const countMockData = [{ count: 15 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(assignationsMockData),
        }),
      };
      const innerJoinMock = {
        innerJoin: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue(orderByMock),
        }),
      };
      const fromMock = {
        innerJoin: vi.fn().mockReturnValue(innerJoinMock),
      };

      const countInnerJoinMock = {
        innerJoin: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockResolvedValue(countMockData),
        }),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(countInnerJoinMock),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const filters = new FiltersRoleAssignation(null, null, null, null, null, null);
      const result = await repository.getAssignedRoles(2, 10, filters);

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
  });

  describe('createAssignation', () => {
    it('should create a new role assignation', async () => {
      const userId = 'user1';
      const role = ROLE.INSTRUCTOR;
      const roleRecord = {
        id_role: 'role-instructor',
        name: ROLE.INSTRUCTOR,
        description: 'Instructor role',
        created_at: new Date(),
        updated_at: null,
      };
      const createdAssignation = {
        id_user_role: 'assignation1',
        user_id: userId,
        role_id: 'role-instructor',
        assigned_at: new Date(),
        expires_at: null,
        status: ROLE_STATUS.ACTIVE,
      };

      // Mock role lookup
      const roleLimitMock = vi.fn().mockResolvedValue([roleRecord]);
      const roleWhereMock = {
        limit: roleLimitMock,
      };
      const roleFromMock = {
        where: vi.fn().mockReturnValue(roleWhereMock),
      };

      // Mock user existence check
      const userLimitMock = vi.fn().mockResolvedValue([{ id_user: userId }]);
      const userWhereMock = {
        limit: userLimitMock,
      };
      const userFromMock = {
        where: vi.fn().mockReturnValue(userWhereMock),
      };

      // Mock insert
      const valuesMock = {
        returning: vi.fn().mockResolvedValue([createdAssignation]),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(roleFromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(userFromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      drizzleClient.insert.mockReturnValue({
        values: vi.fn().mockReturnValue(valuesMock),
      } as unknown as ReturnType<typeof drizzleClient.insert>);

      const result = await repository.createAssignation(userId, role);

      expect(result).toBe('assignation1');
    });

    it('should throw error for invalid role', async () => {
      const userId = 'user1';
      const invalidRole = 'INVALID_ROLE' as ROLE;

      await expect(repository.createAssignation(userId, invalidRole)).rejects.toThrow(
        'Invalid role: INVALID_ROLE'
      );
    });

    it('should throw error when role not found in database', async () => {
      const userId = 'user1';
      const role = ROLE.ADMIN;

      const roleLimitMock = vi.fn().mockResolvedValue([]);
      const roleWhereMock = {
        limit: roleLimitMock,
      };
      const roleFromMock = {
        where: vi.fn().mockReturnValue(roleWhereMock),
      };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(roleFromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      await expect(repository.createAssignation(userId, role)).rejects.toThrow(
        `Role ${role} not found in database`
      );
    });

    it('should throw error when user not found', async () => {
      const userId = 'nonexistent-user';
      const role = ROLE.STUDENT;
      const roleRecord = {
        id_role: 'role-student',
        name: ROLE.STUDENT,
        description: 'Student role',
        created_at: new Date(),
        updated_at: null,
      };

      const roleLimitMock = vi.fn().mockResolvedValue([roleRecord]);
      const roleWhereMock = {
        limit: roleLimitMock,
      };
      const roleFromMock = {
        where: vi.fn().mockReturnValue(roleWhereMock),
      };

      const userLimitMock = vi.fn().mockResolvedValue([]);
      const userWhereMock = {
        limit: userLimitMock,
      };
      const userFromMock = {
        where: vi.fn().mockReturnValue(userWhereMock),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(roleFromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(userFromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      await expect(repository.createAssignation(userId, role)).rejects.toThrow(
        `User with id ${userId} not found`
      );
    });

    it('should throw error when user already has the role', async () => {
      const userId = 'user1';
      const role = ROLE.ADMIN;
      const roleRecord = {
        id_role: 'role-admin',
        name: ROLE.ADMIN,
        description: 'Admin role',
        created_at: new Date(),
        updated_at: null,
      };

      const roleLimitMock = vi.fn().mockResolvedValue([roleRecord]);
      const roleWhereMock = {
        limit: roleLimitMock,
      };
      const roleFromMock = {
        where: vi.fn().mockReturnValue(roleWhereMock),
      };

      const userLimitMock = vi.fn().mockResolvedValue([{ id_user: userId }]);
      const userWhereMock = {
        limit: userLimitMock,
      };
      const userFromMock = {
        where: vi.fn().mockReturnValue(userWhereMock),
      };

      const valuesMock = {
        returning: vi
          .fn()
          .mockRejectedValue(new Error('duplicate key value violates unique constraint')),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(roleFromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(userFromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      drizzleClient.insert.mockReturnValue({
        values: vi.fn().mockReturnValue(valuesMock),
      } as unknown as ReturnType<typeof drizzleClient.insert>);

      await expect(repository.createAssignation(userId, role)).rejects.toThrow(
        `User ${userId} already has role ${role}`
      );
    });
  });

  describe('updateAssignationByUserAndRole', () => {
    it('should update assignation status', async () => {
      const userId = 'user1';
      const role = ROLE.INSTRUCTOR;
      const roleRecord = {
        id_role: 'role-instructor',
        name: ROLE.INSTRUCTOR,
        description: 'Instructor role',
        created_at: new Date(),
        updated_at: null,
      };
      const updatedAssignation = {
        id_user_role: 'assignation1',
        user_id: userId,
        role_id: 'role-instructor',
        assigned_at: new Date(),
        expires_at: null,
        status: ROLE_STATUS.INACTIVE,
      };
      const completeAssignation = {
        ...updatedAssignation,
        role_name: ROLE.INSTRUCTOR,
      };

      // Mock role lookup
      const roleLimitMock = vi.fn().mockResolvedValue([roleRecord]);
      const roleWhereMock = {
        limit: roleLimitMock,
      };
      const roleFromMock = {
        where: vi.fn().mockReturnValue(roleWhereMock),
      };

      // Mock update
      const updateWhereMock = {
        returning: vi.fn().mockResolvedValue([updatedAssignation]),
      };
      const setMock = {
        where: vi.fn().mockReturnValue(updateWhereMock),
      };

      // Mock complete assignation fetch
      const completeLimitMock = vi.fn().mockResolvedValue([completeAssignation]);
      const completeWhereMock = {
        limit: completeLimitMock,
      };
      const completeInnerJoinMock = {
        where: vi.fn().mockReturnValue(completeWhereMock),
      };
      const completeFromMock = {
        innerJoin: vi.fn().mockReturnValue(completeInnerJoinMock),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(roleFromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(completeFromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      drizzleClient.update.mockReturnValue({
        set: vi.fn().mockReturnValue(setMock),
      } as unknown as ReturnType<typeof drizzleClient.update>);

      const result = await repository.updateAssignationByUserAndRole(userId, role, {
        status: ROLE_STATUS.INACTIVE,
      });

      expect(result.status).toBe(ROLE_STATUS.INACTIVE);
      expect(result.role_name).toBe(ROLE.INSTRUCTOR);
    });

    it('should throw error when no fields provided', async () => {
      await expect(
        repository.updateAssignationByUserAndRole('user1', ROLE.ADMIN, {})
      ).rejects.toThrow('No fields to update provided');
    });

    it('should throw error for invalid role', async () => {
      await expect(
        repository.updateAssignationByUserAndRole('user1', 'INVALID' as ROLE, {
          status: ROLE_STATUS.INACTIVE,
        })
      ).rejects.toThrow('Invalid role: INVALID');
    });

    it('should throw error when assignation not found', async () => {
      const userId = 'user1';
      const role = ROLE.STUDENT;
      const roleRecord = {
        id_role: 'role-student',
        name: ROLE.STUDENT,
        description: 'Student role',
        created_at: new Date(),
        updated_at: null,
      };

      const roleLimitMock = vi.fn().mockResolvedValue([roleRecord]);
      const roleWhereMock = {
        limit: roleLimitMock,
      };
      const roleFromMock = {
        where: vi.fn().mockReturnValue(roleWhereMock),
      };

      const updateWhereMock = {
        returning: vi.fn().mockResolvedValue([]),
      };
      const setMock = {
        where: vi.fn().mockReturnValue(updateWhereMock),
      };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(roleFromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      drizzleClient.update.mockReturnValue({
        set: vi.fn().mockReturnValue(setMock),
      } as unknown as ReturnType<typeof drizzleClient.update>);

      await expect(
        repository.updateAssignationByUserAndRole(userId, role, { status: ROLE_STATUS.INACTIVE })
      ).rejects.toThrow(`Role assignation for user ${userId} and role ${role} not found`);
    });
  });

  describe('updateAssignationById', () => {
    it('should update assignation by id', async () => {
      const assignationId = 'assignation1';
      const updatedAssignation = {
        id_user_role: assignationId,
        user_id: 'user1',
        role_id: 'role-admin',
        assigned_at: new Date(),
        expires_at: new Date('2025-12-31'),
        status: ROLE_STATUS.ACTIVE,
      };
      const completeAssignation = {
        ...updatedAssignation,
        role_name: ROLE.ADMIN,
      };

      const updateWhereMock = {
        returning: vi.fn().mockResolvedValue([updatedAssignation]),
      };
      const setMock = {
        where: vi.fn().mockReturnValue(updateWhereMock),
      };

      const completeLimitMock = vi.fn().mockResolvedValue([completeAssignation]);
      const completeWhereMock = {
        limit: completeLimitMock,
      };
      const completeInnerJoinMock = {
        where: vi.fn().mockReturnValue(completeWhereMock),
      };
      const completeFromMock = {
        innerJoin: vi.fn().mockReturnValue(completeInnerJoinMock),
      };

      drizzleClient.update.mockReturnValue({
        set: vi.fn().mockReturnValue(setMock),
      } as unknown as ReturnType<typeof drizzleClient.update>);

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(completeFromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await repository.updateAssignationById(assignationId, {
        expiresAt: new Date('2025-12-31'),
      });

      expect(result.expires_at).toEqual(new Date('2025-12-31'));
      expect(result.role_name).toBe(ROLE.ADMIN);
    });

    it('should throw error when no fields provided', async () => {
      await expect(repository.updateAssignationById('assignation1', {})).rejects.toThrow(
        'No fields to update provided'
      );
    });

    it('should throw error for invalid fields', async () => {
      await expect(
        repository.updateAssignationById('assignation1', { invalid: 'field' } as any)
      ).rejects.toThrow('Invalid fields provided: invalid');
    });
  });

  describe('deleteAssignationByUserAndRole', () => {
    it('should delete assignation by user and role', async () => {
      const userId = 'user1';
      const role = ROLE.INSTRUCTOR;
      const roleRecord = {
        id_role: 'role-instructor',
        name: ROLE.INSTRUCTOR,
        description: 'Instructor role',
        created_at: new Date(),
        updated_at: null,
      };
      const deletedAssignation = {
        id_user_role: 'assignation1',
        user_id: userId,
        role_id: 'role-instructor',
        assigned_at: new Date(),
        expires_at: null,
        status: ROLE_STATUS.ACTIVE,
      };

      const roleLimitMock = vi.fn().mockResolvedValue([roleRecord]);
      const roleWhereMock = {
        limit: roleLimitMock,
      };
      const roleFromMock = {
        where: vi.fn().mockReturnValue(roleWhereMock),
      };

      const deleteWhereMock = {
        returning: vi.fn().mockResolvedValue([deletedAssignation]),
      };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(roleFromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      drizzleClient.delete.mockReturnValue({
        where: vi.fn().mockReturnValue(deleteWhereMock),
      } as unknown as ReturnType<typeof drizzleClient.delete>);

      await expect(
        repository.deleteAssignationByUserAndRole(userId, role)
      ).resolves.not.toThrow();
    });

    it('should throw error when assignation not found', async () => {
      const userId = 'user1';
      const role = ROLE.ADMIN;
      const roleRecord = {
        id_role: 'role-admin',
        name: ROLE.ADMIN,
        description: 'Admin role',
        created_at: new Date(),
        updated_at: null,
      };

      const roleLimitMock = vi.fn().mockResolvedValue([roleRecord]);
      const roleWhereMock = {
        limit: roleLimitMock,
      };
      const roleFromMock = {
        where: vi.fn().mockReturnValue(roleWhereMock),
      };

      const deleteWhereMock = {
        returning: vi.fn().mockResolvedValue([]),
      };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(roleFromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      drizzleClient.delete.mockReturnValue({
        where: vi.fn().mockReturnValue(deleteWhereMock),
      } as unknown as ReturnType<typeof drizzleClient.delete>);

      await expect(repository.deleteAssignationByUserAndRole(userId, role)).rejects.toThrow(
        `Role assignation for user ${userId} and role ${role} not found`
      );
    });
  });

  describe('deleteAssignationById', () => {
    it('should delete assignation by id', async () => {
      const assignationId = 'assignation1';
      const deletedAssignation = {
        id_user_role: assignationId,
        user_id: 'user1',
        role_id: 'role-admin',
        assigned_at: new Date(),
        expires_at: null,
        status: ROLE_STATUS.ACTIVE,
      };

      const deleteWhereMock = {
        returning: vi.fn().mockResolvedValue([deletedAssignation]),
      };

      drizzleClient.delete.mockReturnValue({
        where: vi.fn().mockReturnValue(deleteWhereMock),
      } as unknown as ReturnType<typeof drizzleClient.delete>);

      await expect(repository.deleteAssignationById(assignationId)).resolves.not.toThrow();
    });

    it('should throw error when assignation not found', async () => {
      const assignationId = 'nonexistent';

      const deleteWhereMock = {
        returning: vi.fn().mockResolvedValue([]),
      };

      drizzleClient.delete.mockReturnValue({
        where: vi.fn().mockReturnValue(deleteWhereMock),
      } as unknown as ReturnType<typeof drizzleClient.delete>);

      await expect(repository.deleteAssignationById(assignationId)).rejects.toThrow(
        `Role assignation with id ${assignationId} not found`
      );
    });
  });
});
