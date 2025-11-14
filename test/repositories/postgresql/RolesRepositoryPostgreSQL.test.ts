import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { DBDrizzleProvider } from '../../../src/db/DBDrizzleProvider.js';
import { ROLE } from '../../../src/db/schema.js';
import { RolesRepositoryPostgreSQL } from '../../../src/repositories/postgresql/RolesRepositoryPostgreSQL.js';
import type { RoleInput } from '../../../src/repositories/RolesRepository.js';

describe('RolesRepositoryPostgreSQL tests', () => {
  const drizzleClient = mockDeep<DBDrizzleProvider>();
  const repository = new RolesRepositoryPostgreSQL(drizzleClient);

  beforeEach(() => {
    mockReset(drizzleClient);
  });

  describe('getRoles', () => {
    it('should return paginated roles with default sort by name ascending', async () => {
      const rolesMockData = [
        {
          id_role: '1',
          name: ROLE.ADMIN,
          description: 'Administrator role',
          created_at: new Date('2024-01-01'),
          updated_at: null,
        },
        {
          id_role: '2',
          name: ROLE.INSTRUCTOR,
          description: 'Instructor role',
          created_at: new Date('2024-01-02'),
          updated_at: null,
        },
      ];
      const countMockData = [{ count: 2 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(rolesMockData),
        }),
      };
      const fromMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue(countMockData),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await repository.getRoles(1, 10);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Roles retrieved successfully');
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

    it('should return paginated roles sorted by description descending', async () => {
      const rolesMockData = [
        {
          id_role: '2',
          name: ROLE.INSTRUCTOR,
          description: 'Instructor role',
          created_at: new Date('2024-01-02'),
          updated_at: null,
        },
        {
          id_role: '1',
          name: ROLE.ADMIN,
          description: 'Administrator role',
          created_at: new Date('2024-01-01'),
          updated_at: null,
        },
      ];
      const countMockData = [{ count: 2 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(rolesMockData),
        }),
      };
      const fromMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue(countMockData),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await repository.getRoles(1, 10, 'description', 'desc');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should throw error for invalid sort field', async () => {
      await expect(repository.getRoles(1, 10, 'invalid_field', 'asc')).rejects.toThrow(
        'Invalid sort field: invalid_field'
      );
    });

    it('should handle second page pagination', async () => {
      const rolesMockData = [
        {
          id_role: '3',
          name: ROLE.STUDENT,
          description: 'Student role',
          created_at: new Date('2024-01-03'),
          updated_at: null,
        },
      ];
      const countMockData = [{ count: 11 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(rolesMockData),
        }),
      };
      const fromMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue(countMockData),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await repository.getRoles(2, 10);

      expect(result.success).toBe(true);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 11,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('should return empty list when no roles exist', async () => {
      const countMockData = [{ count: 0 }];

      const orderByMock = {
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue([]),
        }),
      };
      const fromMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };

      drizzleClient.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(fromMock),
        } as unknown as ReturnType<typeof drizzleClient.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockResolvedValue(countMockData),
        } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await repository.getRoles(1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getRole', () => {
    it('should return role by name', async () => {
      const roleMockData = {
        id_role: '1',
        name: ROLE.ADMIN,
        description: 'Administrator role',
        created_at: new Date('2024-01-01'),
        updated_at: null,
      };

      const whereMock = {
        limit: vi.fn().mockResolvedValue([roleMockData]),
      };
      const fromMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await repository.getRole(ROLE.ADMIN);

      expect(result.id_role).toBe('1');
      expect(result.name).toBe(ROLE.ADMIN);
      expect(result.description).toBe('Administrator role');
    });

    it('should throw error when role not found', async () => {
      const whereMock = {
        limit: vi.fn().mockResolvedValue([]),
      };
      const fromMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      await expect(repository.getRole('NONEXISTENT')).rejects.toThrow(
        'Role with name NONEXISTENT not found'
      );
    });
  });

  describe('postRole', () => {
    it('should create a new role', async () => {
      const newRole = {
        name: ROLE.STUDENT,
        description: 'Student role',
      };
      const createdRole = {
        id_role: '3',
        name: ROLE.STUDENT,
        description: 'Student role',
        created_at: new Date('2024-01-03'),
        updated_at: null,
      };

      const valuesMock = {
        returning: vi.fn().mockResolvedValue([createdRole]),
      };

      drizzleClient.insert.mockReturnValue({
        values: vi.fn().mockReturnValue(valuesMock),
      } as unknown as ReturnType<typeof drizzleClient.insert>);

      const result = await repository.postRole(newRole);

      expect(result.id_role).toBe('3');
      expect(result.name).toBe(ROLE.STUDENT);
      expect(result.description).toBe('Student role');
    });

    it('should throw error for invalid role name', async () => {
      const invalidRole = {
        name: 'INVALID_ROLE' as ROLE,
        description: 'Invalid role',
      };

      await expect(repository.postRole(invalidRole)).rejects.toThrow(
        'Invalid role name: INVALID_ROLE'
      );
    });

    it('should throw error when role already exists', async () => {
      const duplicateRole = {
        name: ROLE.ADMIN,
        description: 'Duplicate admin role',
      };

      const valuesMock = {
        returning: vi
          .fn()
          .mockRejectedValue(new Error('duplicate key value violates unique constraint')),
      };

      drizzleClient.insert.mockReturnValue({
        values: vi.fn().mockReturnValue(valuesMock),
      } as unknown as ReturnType<typeof drizzleClient.insert>);

      await expect(repository.postRole(duplicateRole)).rejects.toThrow(
        `Role with name ${ROLE.ADMIN} already exists`
      );
    });
  });

  describe('updateRole', () => {
    it('should update role description', async () => {
      const updatedRole = {
        id_role: '1',
        name: ROLE.ADMIN,
        description: 'Updated admin role',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      const whereMock = {
        returning: vi.fn().mockResolvedValue([updatedRole]),
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      drizzleClient.update.mockReturnValue({
        set: vi.fn().mockReturnValue(setMock),
      } as unknown as ReturnType<typeof drizzleClient.update>);

      const result = await repository.updateRole(ROLE.ADMIN, { description: 'Updated admin role' });

      expect(result.description).toBe('Updated admin role');
    });

    it('should update role name', async () => {
      const updatedRole = {
        id_role: '1',
        name: ROLE.INSTRUCTOR,
        description: 'Administrator role',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      const whereMock = {
        returning: vi.fn().mockResolvedValue([updatedRole]),
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      drizzleClient.update.mockReturnValue({
        set: vi.fn().mockReturnValue(setMock),
      } as unknown as ReturnType<typeof drizzleClient.update>);

      const result = await repository.updateRole(ROLE.ADMIN, { name: ROLE.INSTRUCTOR });

      expect(result.name).toBe(ROLE.INSTRUCTOR);
    });

    it('should throw error when no fields provided', async () => {
      await expect(repository.updateRole(ROLE.ADMIN, {})).rejects.toThrow(
        'No fields to update provided'
      );
    });

    it('should throw error for invalid fields', async () => {
      await expect(
        repository.updateRole(ROLE.ADMIN, { invalidField: 'value' } as Partial<RoleInput>)
      ).rejects.toThrow('Invalid fields provided: invalidField');
    });

    it('should throw error for invalid role name in update', async () => {
      await expect(
        repository.updateRole(ROLE.ADMIN, { name: 'INVALID_ROLE' as ROLE })
      ).rejects.toThrow('Invalid role name: INVALID_ROLE');
    });

    it('should throw error when role not found', async () => {
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
        repository.updateRole('NONEXISTENT', { description: 'Updated' })
      ).rejects.toThrow('Role with name NONEXISTENT not found');
    });

    it('should throw error when new name already exists', async () => {
      const whereMock = {
        returning: vi
          .fn()
          .mockRejectedValue(new Error('duplicate key value violates unique constraint')),
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };

      drizzleClient.update.mockReturnValue({
        set: vi.fn().mockReturnValue(setMock),
      } as unknown as ReturnType<typeof drizzleClient.update>);

      await expect(repository.updateRole(ROLE.ADMIN, { name: ROLE.STUDENT })).rejects.toThrow(
        `Role with name ${ROLE.STUDENT} already exists`
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete role by name', async () => {
      const deletedRole = {
        id_role: '1',
        name: ROLE.ADMIN,
        description: 'Administrator role',
        created_at: new Date('2024-01-01'),
        updated_at: null,
      };

      const whereMock = {
        returning: vi.fn().mockResolvedValue([deletedRole]),
      };

      drizzleClient.delete.mockReturnValue({
        where: vi.fn().mockReturnValue(whereMock),
      } as unknown as ReturnType<typeof drizzleClient.delete>);

      await expect(repository.deleteRole(ROLE.ADMIN)).resolves.not.toThrow();
    });

    it('should throw error when role not found', async () => {
      const whereMock = {
        returning: vi.fn().mockResolvedValue([]),
      };

      drizzleClient.delete.mockReturnValue({
        where: vi.fn().mockReturnValue(whereMock),
      } as unknown as ReturnType<typeof drizzleClient.delete>);

      await expect(repository.deleteRole('NONEXISTENT')).rejects.toThrow(
        'Role with name NONEXISTENT not found'
      );
    });
  });
});
