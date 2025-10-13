import type { AnyColumn } from 'drizzle-orm';
import { and, asc, desc, eq, gte, ilike, inArray, lte, type SQL, sql } from 'drizzle-orm';
import type { DBDrizzleProvider } from '../../db/index.js';
import { roles, users, users_roles } from '../../db/schema.js';
import type {
  FiltersUser,
  PaginatedUsers,
  UserInDTO,
  UserOutDTO,
  UserUpdateDTO,
} from '../../models/index.js';
import type { ROLE, ValidUserSortFields } from '../../utils/types.js';
import type { UsersRepository } from '../UsersRepository.js';

export class UsersRepositoryPostgreSQL implements UsersRepository {
  private readonly client: DBDrizzleProvider;
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
    const validSortFields: Record<keyof ValidUserSortFields, AnyColumn> = {
      first_name: users.first_name,
      last_name: users.last_name,
      email: users.email,
      birth_date: users.birth_date,
      created_at: users.created_at,
    };
    const sortColumn = validSortFields[sortField as keyof ValidUserSortFields] || users.first_name;
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

  public async getUsersByIds(ids: string[], lightDTO = true): Promise<PaginatedUsers> {
    const MAX_IDS = 100;

    if (ids.length > MAX_IDS) {
      throw new Error(`Cannot query more than ${MAX_IDS} users at once. Received: ${ids.length}`);
    }

    const baseQuery = this.getUsersBaseQuery();
    const usersResult = await baseQuery
      .where(inArray(users.id_user, ids))
      .orderBy(asc(users.first_name))
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

  public async getUserById(_userId: string, _lightDTO?: boolean): Promise<UserOutDTO> {
    throw new Error('Method not implemented.');
  }
  public async getUserByEmail(_email: string, _lightDTO?: boolean): Promise<UserOutDTO> {
    throw new Error('Method not implemented.');
  }
  userExists(_userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  public async postUser(_userDTO: UserInDTO): Promise<UserOutDTO> {
    throw new Error('Method not implemented.');
  }
  public async updateUser(
    _userId: string,
    _userInDTO: Partial<UserUpdateDTO>
  ): Promise<UserOutDTO> {
    throw new Error('Method not implemented.');
  }
  public async deleteUser(_userId: string): Promise<void> {
    throw new Error('Method not implemented.');
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
