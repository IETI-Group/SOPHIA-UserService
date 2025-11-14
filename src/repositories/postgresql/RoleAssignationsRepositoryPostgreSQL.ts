import { and, asc, desc, eq, gte, lte, type SQL, sql } from 'drizzle-orm';
import type { DBDrizzleProvider } from '../../db/index.js';
import { ROLE, ROLE_STATUS, roles, users, users_roles } from '../../db/schema.js';
import type { FiltersRoleAssignation, PaginatedResponse } from '../../models/index.js';
import type {
  RoleAssignationInput,
  RoleAssignationRecord,
  RoleAssignationsRepository,
} from '../RoleAssignationsRepository.js';

export class RoleAssignationsRepositoryPostgreSQL implements RoleAssignationsRepository {
  private readonly client: DBDrizzleProvider;

  constructor(drizzleClient: DBDrizzleProvider) {
    this.client = drizzleClient;
  }

  private validateFilters(filters: FiltersRoleAssignation): SQL<unknown>[] {
    const whereConditions: SQL<unknown>[] = [];

    const assignmentStartDate = filters.getAssignmentStartDate();
    const assignmentEndDate = filters.getAssignmentEndDate();
    const expirationStartDate = filters.getExpirationStartDate();
    const expirationEndDate = filters.getExpirationEndDate();
    const roleStatus = filters.getRoleStatus();
    const role = filters.getRole();

    if (assignmentStartDate) {
      whereConditions.push(gte(users_roles.assigned_at, assignmentStartDate));
    }
    if (assignmentEndDate) {
      whereConditions.push(lte(users_roles.assigned_at, assignmentEndDate));
    }
    if (expirationStartDate) {
      whereConditions.push(gte(users_roles.expires_at, expirationStartDate));
    }
    if (expirationEndDate) {
      whereConditions.push(lte(users_roles.expires_at, expirationEndDate));
    }
    if (roleStatus) {
      whereConditions.push(eq(users_roles.status, roleStatus));
    }
    if (role) {
      whereConditions.push(eq(roles.name, role as ROLE.ADMIN | ROLE.INSTRUCTOR | ROLE.STUDENT));
    }

    return whereConditions;
  }

  public async getAssignedRoles(
    page: number,
    size: number,
    roleFilter: FiltersRoleAssignation,
    sort?: string,
    order?: string
  ): Promise<PaginatedResponse<RoleAssignationRecord>> {
    const whereConditions: SQL<unknown>[] = this.validateFilters(roleFilter);
    const isDescending = order?.toLowerCase() === 'desc';
    const sortField = sort || 'assigned_at';

    // Validate sort field
    const validSortFields = ['assigned_at', 'expires_at', 'status'];
    if (!validSortFields.includes(sortField)) {
      throw new Error(`Invalid sort field: ${sortField}`);
    }

    const orderByClause =
      sortField === 'expires_at'
        ? isDescending
          ? desc(users_roles.expires_at)
          : asc(users_roles.expires_at)
        : sortField === 'status'
          ? isDescending
            ? desc(users_roles.status)
            : asc(users_roles.status)
          : isDescending
            ? desc(users_roles.assigned_at)
            : asc(users_roles.assigned_at);

    const baseQuery = this.client
      .select({
        id_user_role: users_roles.id_user_role,
        user_id: users_roles.user_id,
        role_id: users_roles.role_id,
        assigned_at: users_roles.assigned_at,
        expires_at: users_roles.expires_at,
        status: users_roles.status,
        role_name: roles.name,
        user_email: users.email,
        user_first_name: users.first_name,
        user_last_name: users.last_name,
      })
      .from(users_roles)
      .innerJoin(roles, eq(users_roles.role_id, roles.id_role))
      .innerJoin(users, eq(users_roles.user_id, users.id_user));

    const queryWithFilters =
      whereConditions.length > 0 ? baseQuery.where(and(...whereConditions)) : baseQuery;

    const assignationsResult = await queryWithFilters
      .orderBy(orderByClause)
      .limit(size)
      .offset((page - 1) * size);

    const countBaseQuery = this.client
      .select({ count: sql<number>`count(*)::int` })
      .from(users_roles)
      .innerJoin(roles, eq(users_roles.role_id, roles.id_role))
      .innerJoin(users, eq(users_roles.user_id, users.id_user));

    const countQuery =
      whereConditions.length > 0 ? countBaseQuery.where(and(...whereConditions)) : countBaseQuery;

    const totalResult = await countQuery;
    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / size);

    return {
      success: true,
      message: 'Role assignations retrieved successfully',
      data: assignationsResult,
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

  public async createAssignation(userId: string, role: ROLE): Promise<string> {
    // Validate that the role is allowed in DB
    const validRoles: ROLE[] = [ROLE.ADMIN, ROLE.INSTRUCTOR, ROLE.STUDENT];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Only ${validRoles.join(', ')} are allowed.`);
    }

    // Get role ID
    const [roleRecord] = await this.client
      .select()
      .from(roles)
      .where(eq(roles.name, role as ROLE.ADMIN | ROLE.INSTRUCTOR | ROLE.STUDENT))
      .limit(1);

    if (!roleRecord) {
      throw new Error(`Role ${role} not found in database`);
    }

    // Verify user exists
    const [userExists] = await this.client
      .select({ id_user: users.id_user })
      .from(users)
      .where(eq(users.id_user, userId))
      .limit(1);

    if (!userExists) {
      throw new Error(`User with id ${userId} not found`);
    }

    try {
      const [assignation] = await this.client
        .insert(users_roles)
        .values({
          user_id: userId,
          role_id: roleRecord.id_role,
          status: ROLE_STATUS.ACTIVE,
        })
        .returning();

      return assignation.id_user_role;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error(`User ${userId} already has role ${role}`);
      }
      throw error;
    }
  }

  public async updateAssignationByUserAndRole(
    userId: string,
    role: ROLE,
    assignation: Partial<RoleAssignationInput>
  ): Promise<RoleAssignationRecord> {
    if (!assignation || Object.keys(assignation).length === 0) {
      throw new Error('No fields to update provided');
    }

    const validRoles: ROLE[] = [ROLE.ADMIN, ROLE.INSTRUCTOR, ROLE.STUDENT];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Only ${validRoles.join(', ')} are allowed.`);
    }

    // Get role ID
    const [roleRecord] = await this.client
      .select()
      .from(roles)
      .where(eq(roles.name, role as ROLE.ADMIN | ROLE.INSTRUCTOR | ROLE.STUDENT))
      .limit(1);

    if (!roleRecord) {
      throw new Error(`Role ${role} not found in database`);
    }

    const allowedFields = ['status', 'expires_at'];
    const providedFields = Object.keys(assignation);
    const invalidFields = providedFields.filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields provided: ${invalidFields.join(', ')}`);
    }

    const updateValues: {
      status?: ROLE_STATUS;
      expires_at?: Date | null;
    } = {};

    if (assignation.status !== undefined) {
      updateValues.status = assignation.status;
    }
    if (assignation.expiresAt !== undefined) {
      updateValues.expires_at = assignation.expiresAt;
    }

    const [updatedAssignation] = await this.client
      .update(users_roles)
      .set(updateValues)
      .where(and(eq(users_roles.user_id, userId), eq(users_roles.role_id, roleRecord.id_role)))
      .returning();

    if (!updatedAssignation) {
      throw new Error(`Role assignation for user ${userId} and role ${role} not found`);
    }

    // Fetch complete assignation with role name
    const [completeAssignation] = await this.client
      .select({
        id_user_role: users_roles.id_user_role,
        user_id: users_roles.user_id,
        role_id: users_roles.role_id,
        assigned_at: users_roles.assigned_at,
        expires_at: users_roles.expires_at,
        status: users_roles.status,
        role_name: roles.name,
      })
      .from(users_roles)
      .innerJoin(roles, eq(users_roles.role_id, roles.id_role))
      .where(eq(users_roles.id_user_role, updatedAssignation.id_user_role))
      .limit(1);

    if (!completeAssignation) {
      throw new Error(`Failed to retrieve updated assignation`);
    }

    return completeAssignation;
  }

  public async updateAssignationById(
    assignationId: string,
    assignation: Partial<RoleAssignationInput>
  ): Promise<RoleAssignationRecord> {
    if (!assignation || Object.keys(assignation).length === 0) {
      throw new Error('No fields to update provided');
    }

    const allowedFields = ['status', 'expiresAt'];
    const providedFields = Object.keys(assignation);
    const invalidFields = providedFields.filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields provided: ${invalidFields.join(', ')}`);
    }

    const updateValues: {
      status?: ROLE_STATUS;
      expires_at?: Date | null;
    } = {};

    if (assignation.status !== undefined) {
      updateValues.status = assignation.status;
    }
    if (assignation.expiresAt !== undefined) {
      updateValues.expires_at = assignation.expiresAt;
    }

    const [updatedAssignation] = await this.client
      .update(users_roles)
      .set(updateValues)
      .where(eq(users_roles.id_user_role, assignationId))
      .returning();

    if (!updatedAssignation) {
      throw new Error(`Role assignation with id ${assignationId} not found`);
    }

    // Fetch complete assignation with role name
    const [completeAssignation] = await this.client
      .select({
        id_user_role: users_roles.id_user_role,
        user_id: users_roles.user_id,
        role_id: users_roles.role_id,
        assigned_at: users_roles.assigned_at,
        expires_at: users_roles.expires_at,
        status: users_roles.status,
        role_name: roles.name,
      })
      .from(users_roles)
      .innerJoin(roles, eq(users_roles.role_id, roles.id_role))
      .where(eq(users_roles.id_user_role, updatedAssignation.id_user_role))
      .limit(1);

    if (!completeAssignation) {
      throw new Error(`Failed to retrieve updated assignation`);
    }

    return completeAssignation;
  }

  public async deleteAssignationByUserAndRole(userId: string, role: ROLE): Promise<void> {
    const validRoles: ROLE[] = [ROLE.ADMIN, ROLE.INSTRUCTOR, ROLE.STUDENT];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Only ${validRoles.join(', ')} are allowed.`);
    }

    // Get role ID
    const [roleRecord] = await this.client
      .select()
      .from(roles)
      .where(eq(roles.name, role as ROLE.ADMIN | ROLE.INSTRUCTOR | ROLE.STUDENT))
      .limit(1);

    if (!roleRecord) {
      throw new Error(`Role ${role} not found in database`);
    }

    const [deletedAssignation] = await this.client
      .delete(users_roles)
      .where(and(eq(users_roles.user_id, userId), eq(users_roles.role_id, roleRecord.id_role)))
      .returning();

    if (!deletedAssignation) {
      throw new Error(`Role assignation for user ${userId} and role ${role} not found`);
    }
  }

  public async deleteAssignationById(assignationId: string): Promise<void> {
    const [deletedAssignation] = await this.client
      .delete(users_roles)
      .where(eq(users_roles.id_user_role, assignationId))
      .returning();

    if (!deletedAssignation) {
      throw new Error(`Role assignation with id ${assignationId} not found`);
    }
  }
}
