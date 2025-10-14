import type { AnyColumn } from 'drizzle-orm';
import { and, asc, desc, eq, gte, ilike, inArray, lte, type SQL, sql } from 'drizzle-orm';
import type { DBDrizzleProvider } from '../../db/index.js';
import { ROLE, roles, users, users_roles, type ValidUserSortFields } from '../../db/schema.js';
import type {
  FiltersUser,
  PaginatedUsers,
  UserHeavyOutDTO,
  UserInDTO,
  UserOutDTO,
  UserUpdateDTO,
} from '../../models/index.js';
import type { UsersRepository } from '../UsersRepository.js';

export class UsersRepositoryPostgreSQL implements UsersRepository {
  private readonly client: DBDrizzleProvider;
  private readonly validSortFields: Record<keyof ValidUserSortFields, AnyColumn> = {
    first_name: users.first_name,
    last_name: users.last_name,
    email: users.email,
    birth_date: users.birth_date,
    created_at: users.created_at,
  };
  constructor(drizzleClient: DBDrizzleProvider) {
    this.client = drizzleClient;
  }

  private validateFilters(filters: FiltersUser): SQL<unknown>[] {
    const whereConditions: SQL<unknown>[] = [];
    if (filters.firstName) {
      whereConditions.push(ilike(users.first_name, `%${filters.firstName}%`));
    }
    if (filters.lastName) {
      whereConditions.push(ilike(users.last_name, `%${filters.lastName}%`));
    }
    if (filters.birthDateFrom) {
      whereConditions.push(gte(users.birth_date, filters.birthDateFrom));
    }
    if (filters.birthDateTo) {
      whereConditions.push(lte(users.birth_date, filters.birthDateTo));
    }
    return whereConditions;
  }

  private parseUsersToDTOs(usersResult: UsersQueryResult[], lightDTO: boolean): UserOutDTO[] {
    return usersResult.map((user) =>
      lightDTO
        ? { userId: user.id_user, role: user.role_name }
        : {
            userId: user.id_user,
            role: user.role_name,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            bio: user.bio,
            birthDate: user.birth_date,
          }
    );
  }

  private getUsersBaseQuery() {
    return this.client
      .select({
        id_user: users.id_user,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
        bio: users.bio,
        created_at: users.created_at,
        birth_date: users.birth_date,
        updated_at: users.updated_at,
        role_name: roles.name,
      })
      .from(users)
      .innerJoin(users_roles, eq(users.id_user, users_roles.user_id))
      .innerJoin(roles, eq(users_roles.role_id, roles.id_role));
  }

  private getUsersCountBaseQuery() {
    return this.client
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .innerJoin(users_roles, eq(users.id_user, users_roles.user_id))
      .innerJoin(roles, eq(users_roles.role_id, roles.id_role));
  }

  public async getUsers(
    page: number,
    size: number,
    filters: FiltersUser,
    sort: string,
    order: string,
    lightDTO: boolean
  ): Promise<PaginatedUsers> {
    const whereConditions: SQL<unknown>[] = this.validateFilters(filters);
    const isDescending = order?.toLowerCase() === 'desc';
    const sortField = sort || 'first_name';
    const sortColumn =
      this.validSortFields[sortField as keyof ValidUserSortFields] || users.first_name;
    const orderByClause = isDescending ? desc(sortColumn) : asc(sortColumn);

    const baseQuery = this.getUsersBaseQuery();
    const queryWithFilters =
      whereConditions.length > 0 ? baseQuery.where(and(...whereConditions)) : baseQuery;
    const usersResult = await queryWithFilters
      .orderBy(orderByClause)
      .limit(size)
      .offset((page - 1) * size);
    const countBaseQuery = this.getUsersCountBaseQuery();
    const countQuery =
      whereConditions.length > 0 ? countBaseQuery.where(and(...whereConditions)) : countBaseQuery;
    const totalResult = await countQuery;
    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / size);
    const mappedUsers: UserOutDTO[] = this.parseUsersToDTOs(usersResult, lightDTO);

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: mappedUsers,
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

  public async getUsersByIds(
    ids: string[],
    lightDTO = true,
    sort: string = 'first_name',
    order: 'asc' | 'desc' = 'asc'
  ): Promise<PaginatedUsers> {
    const MAX_IDS = 100;

    if (ids.length > MAX_IDS) {
      throw new Error(`Cannot query more than ${MAX_IDS} users at once. Received: ${ids.length}`);
    }

    const isDescending = order?.toLowerCase() === 'desc';
    const sortColumn = this.validSortFields[sort as keyof ValidUserSortFields] || users.first_name;
    const orderByClause = isDescending ? desc(sortColumn) : asc(sortColumn);
    const baseQuery = this.getUsersBaseQuery();
    const usersResult = await baseQuery
      .where(inArray(users.id_user, ids))
      .orderBy(orderByClause)
      .limit(ids.length)
      .offset(0);

    const countBaseQuery = this.getUsersCountBaseQuery();
    const totalResult = await countBaseQuery.where(inArray(users.id_user, ids));
    const total = totalResult[0]?.count ?? 0;

    const mappedUsers: UserOutDTO[] = this.parseUsersToDTOs(usersResult, lightDTO);

    return {
      success: true,
      message: 'Users retrieved successfully',
      data: mappedUsers,
      timestamp: new Date().toISOString(),
      pagination: {
        page: 1,
        limit: ids.length,
        total,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  public async getUserById(userId: string, lightDTO = true): Promise<UserOutDTO> {
    const baseQuery = this.getUsersBaseQuery();
    const usersResult = await baseQuery.where(eq(users.id_user, userId));

    if (usersResult.length === 0) {
      throw new Error(`User with id ${userId} not found`);
    }

    const user = usersResult[0];
    const mappedUser = this.parseUsersToDTOs([user], lightDTO)[0];

    return mappedUser;
  }
  public async getUserByEmail(email: string, lightDTO = true): Promise<UserOutDTO> {
    const baseQuery = this.getUsersBaseQuery();
    const usersResult = await baseQuery.where(eq(users.email, email));

    if (usersResult.length === 0) {
      throw new Error(`User with email ${email} not found`);
    }

    const user = usersResult[0];
    const mappedUser = this.parseUsersToDTOs([user], lightDTO)[0];

    return mappedUser;
  }
  public async userExists(userId: string): Promise<boolean> {
    const result = await this.client
      .select({ id_user: users.id_user })
      .from(users)
      .where(eq(users.id_user, userId));

    return result.length > 0;
  }
  public async postUser(userDTO: UserInDTO): Promise<UserOutDTO> {
    try {
      const [createdUser] = await this.client
        .insert(users)
        .values({
          email: userDTO.email,
          first_name: userDTO.firstName,
          last_name: userDTO.lastName,
          birth_date: userDTO.birthDate,
        })
        .returning();

      const studentRole = await this.verifyAndGetStudentRole();

      await this.client.insert(users_roles).values({
        user_id: createdUser.id_user,
        role_id: studentRole.id_role,
      });

      const heavyDTO: UserHeavyOutDTO = {
        userId: createdUser.id_user,
        role: ROLE.STUDENT,
        email: createdUser.email,
        firstName: createdUser.first_name,
        lastName: createdUser.last_name,
        bio: createdUser.bio || '',
        birthDate: createdUser.birth_date,
        createdAt: createdUser.created_at,
        updatedAt: createdUser.updated_at,
      };

      return heavyDTO;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error(`User with email ${userDTO.email} already exists`);
      }
      throw error;
    }
  }
  public async updateUser(userId: string, userInDTO: Partial<UserUpdateDTO>): Promise<UserOutDTO> {
    if (!userInDTO || Object.keys(userInDTO).length === 0) {
      throw new Error('No fields to update provided');
    }

    const allowedFields = ['email', 'firstName', 'lastName', 'birthDate', 'bio'];
    const providedFields = Object.keys(userInDTO);
    const invalidFields = providedFields.filter((field) => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields provided: ${invalidFields.join(', ')}`);
    }

    try {
      const updateValues: {
        email?: string;
        first_name?: string;
        last_name?: string;
        birth_date?: Date;
        bio?: string;
      } = {};

      if (userInDTO.email !== undefined) updateValues.email = userInDTO.email;
      if (userInDTO.firstName !== undefined) updateValues.first_name = userInDTO.firstName;
      if (userInDTO.lastName !== undefined) updateValues.last_name = userInDTO.lastName;
      if (userInDTO.birthDate !== undefined) updateValues.birth_date = userInDTO.birthDate;
      if (userInDTO.bio !== undefined) updateValues.bio = userInDTO.bio;

      const [updatedUser] = await this.client
        .update(users)
        .set(updateValues)
        .where(eq(users.id_user, userId))
        .returning();

      if (!updatedUser) {
        throw new Error(`User with id ${userId} not found`);
      }

      const heavyDTO: UserHeavyOutDTO = {
        userId: updatedUser.id_user,
        role: (updatedUser as unknown as { role: ROLE }).role || ROLE.STUDENT,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        bio: updatedUser.bio || '',
        birthDate: updatedUser.birth_date,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at,
      };

      return heavyDTO;
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error(`User with email ${userInDTO.email} already exists`);
      }
      throw error;
    }
  }
  public async deleteUser(userId: string): Promise<void> {
    const [deletedUser] = await this.client
      .delete(users)
      .where(eq(users.id_user, userId))
      .returning();

    if (!deletedUser) {
      throw new Error(`User with id ${userId} not found`);
    }
  }

  private async verifyAndGetStudentRole(): Promise<{
    id_role: string;
    name: ROLE;
  }> {
    const [existingRole] = await this.client
      .select()
      .from(roles)
      .where(eq(roles.name, ROLE.STUDENT))
      .limit(1);

    if (existingRole) {
      return existingRole;
    }

    const [newRole] = await this.client
      .insert(roles)
      .values({ name: ROLE.STUDENT, description: 'Student role created by default.' })
      .returning();

    return newRole;
  }
}

interface UsersQueryResult {
  id_user: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  created_at: Date;
  birth_date: Date | null;
  updated_at: Date | null;
  role_name: ROLE;
}
