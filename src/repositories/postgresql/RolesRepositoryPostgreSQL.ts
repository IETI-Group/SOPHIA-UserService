import { asc, desc, eq, sql } from 'drizzle-orm';
import type { DBDrizzleProvider } from '../../db/index.js';
import { ROLE, roles } from '../../db/schema.js';
import type { PaginatedResponse } from '../../models/index.js';
import type { RoleInput, RoleRecord, RolesRepository } from '../RolesRepository.js';

export class RolesRepositoryPostgreSQL implements RolesRepository {
  private readonly client: DBDrizzleProvider;

  constructor(drizzleClient: DBDrizzleProvider) {
    this.client = drizzleClient;
  }

  public async getRoles(
    page: number,
    size: number,
    sort?: string,
    order?: string
  ): Promise<PaginatedResponse<RoleRecord>> {
    const isDescending = order?.toLowerCase() === 'desc';
    const sortField = sort || 'name';

    // Validate sort field
    const validSortFields = ['name', 'description'];
    if (!validSortFields.includes(sortField)) {
      throw new Error(`Invalid sort field: ${sortField}`);
    }

    const sortColumn = sortField === 'name' ? roles.name : roles.description;
    const orderByClause = isDescending ? desc(sortColumn) : asc(sortColumn);

    const rolesResult = await this.client
      .select()
      .from(roles)
      .orderBy(orderByClause)
      .limit(size)
      .offset((page - 1) * size);

    const totalResult = await this.client.select({ count: sql<number>`count(*)::int` }).from(roles);

    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / size);

    return {
      success: true,
      message: 'Roles retrieved successfully',
      data: rolesResult,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit: size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  public async getRole(name: string): Promise<RoleRecord> {
    const [role] = await this.client
      .select()
      .from(roles)
      .where(eq(roles.name, name as ROLE.ADMIN | ROLE.INSTRUCTOR | ROLE.STUDENT))
      .limit(1);

    if (!role) {
      throw new Error(`Role with name ${name} not found`);
    }

    return role;
  }

  public async postRole(role: RoleInput): Promise<RoleRecord> {
    // Validate role name is one of the allowed values in DB
    const validRoles: ROLE[] = [ROLE.ADMIN, ROLE.INSTRUCTOR, ROLE.STUDENT];
    if (!validRoles.includes(role.name)) {
      throw new Error(
        `Invalid role name: ${role.name}. Only ${validRoles.join(', ')} are allowed.`
      );
    }

    try {
      const [createdRole] = await this.client
        .insert(roles)
        .values({
          name: role.name as ROLE.ADMIN | ROLE.INSTRUCTOR | ROLE.STUDENT,
          description: role.description,
        })
        .returning();

      return createdRole;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error(`Role with name ${role.name} already exists`);
      }
      throw error;
    }
  }

  public async updateRole(roleName: string, roleInput: Partial<RoleInput>): Promise<RoleRecord> {
    if (!roleInput || Object.keys(roleInput).length === 0) {
      throw new Error('No fields to update provided');
    }

    const allowedFields = ['name', 'description'];
    const providedFields = Object.keys(roleInput);
    const invalidFields = providedFields.filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields provided: ${invalidFields.join(', ')}`);
    }

    try {
      const updateValues: {
        name?: ROLE.ADMIN | ROLE.INSTRUCTOR | ROLE.STUDENT;
        description?: string | null;
      } = {};

      if (roleInput.name !== undefined) {
        const validRoles: ROLE[] = [ROLE.ADMIN, ROLE.INSTRUCTOR, ROLE.STUDENT];
        if (!validRoles.includes(roleInput.name)) {
          throw new Error(
            `Invalid role name: ${roleInput.name}. Only ${validRoles.join(', ')} are allowed.`
          );
        }
        updateValues.name = roleInput.name as ROLE.ADMIN | ROLE.INSTRUCTOR | ROLE.STUDENT;
      }
      if (roleInput.description !== undefined) {
        updateValues.description = roleInput.description;
      }

      const [updatedRole] = await this.client
        .update(roles)
        .set(updateValues)
        .where(eq(roles.name, roleName as ROLE.ADMIN | ROLE.INSTRUCTOR | ROLE.STUDENT))
        .returning();

      if (!updatedRole) {
        throw new Error(`Role with name ${roleName} not found`);
      }

      return updatedRole;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error(`Role with name ${roleInput.name} already exists`);
      }
      throw error;
    }
  }

  public async deleteRole(roleName: string): Promise<void> {
    const [deletedRole] = await this.client
      .delete(roles)
      .where(eq(roles.name, roleName as ROLE.ADMIN | ROLE.INSTRUCTOR | ROLE.STUDENT))
      .returning();

    if (!deletedRole) {
      throw new Error(`Role with name ${roleName} not found`);
    }
  }
}
