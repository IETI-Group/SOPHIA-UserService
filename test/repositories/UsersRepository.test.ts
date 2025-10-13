import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { DBDrizzleProvider } from '../../src/db/DBDrizzleProvider.js';
import type { FiltersUser, UserHeavyOutDTO } from '../../src/models/index.js';
import { UsersRepositoryPostgreSQL } from '../../src/repositories/postgresql/UsersRepositoryPostgreSQL.js';
import { ROLE } from '../../src/utils/types.js';

describe('Users Repository', async () => {
  const drizzleClient = mockDeep<DBDrizzleProvider>();
  const repository = new UsersRepositoryPostgreSQL(drizzleClient);
  let usersMockData: {
    id_user: string;
    email: string;
    first_name: string;
    last_name: string;
    bio: string;
    created_at: Date;
    birth_date: Date;
    updated_at: Date | null;
    role_name: ROLE;
  }[] = [];
  const addMockData = (count: number, firstName?: string) => {
    for (let i = 1; i <= count; i++) {
      usersMockData.push({
        id_user: i.toString(),
        email: `user${i}@example.com`,
        first_name: firstName || `First${i}`,
        last_name: `Last${i}`,
        bio: `Bio user ${i}`,
        created_at: new Date(`2024-01-0${i}`),
        birth_date: new Date(`1990-01-0${i}`),
        updated_at: i % 2 === 0 ? null : new Date(`2024-01-0${i + 1}`),
        role_name: i % 2 === 0 ? ROLE.INSTRUCTOR : ROLE.STUDENT,
      });
    }
  };

  const setupMocks = (withFilters = false) => {
    const countMockData = [{ count: usersMockData.length }];
    const orderByMock = {
      limit: vi.fn().mockReturnValue({
        offset: vi.fn().mockResolvedValue(usersMockData),
      }),
    };

    if (withFilters) {
      const whereResultMock = {
        orderBy: vi.fn().mockReturnValue(orderByMock),
      };
      const fromMock = {
        innerJoin: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue(whereResultMock),
            orderBy: vi.fn().mockReturnValue(orderByMock),
          }),
        }),
      };
      const countWhereResultMock = vi.fn().mockResolvedValue(countMockData);
      const countInnerJoinMock = {
        innerJoin: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: countWhereResultMock,
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
    } else {
      const fromMock = {
        innerJoin: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue(orderByMock),
          }),
        }),
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
    }
  };

  beforeEach(() => {
    usersMockData = [];
    mockReset(drizzleClient);
  });

  it('Should return users with no specified filters', async () => {
    const filters: FiltersUser = {
      firstName: null,
      lastName: null,
      birthDateTo: null,
      birthDateFrom: null,
    };
    addMockData(2);
    setupMocks(false);

    const result = await repository.getUsers(1, 10, filters, 'first_name', 'asc', true);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Users retrieved successfully');
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

  it('Should return users with specified filters', async () => {
    const filters: FiltersUser = {
      firstName: 'Common name',
      lastName: null,
      birthDateTo: new Date('1990-01-02'),
      birthDateFrom: null,
    };
    addMockData(5, 'Common name');
    addMockData(10);

    // Filtrar los datos mockeados para simular el comportamiento del filtro
    usersMockData = usersMockData.filter((user) => user.first_name === 'Common name');
    setupMocks(true);

    const result = await repository.getUsers(1, 10, filters, 'first_name', 'asc', false);
    expect(result.success).toBe(true);
    expect(result.message).toBe('Users retrieved successfully');
    expect(result.data).toHaveLength(5);
    expect(
      result.data?.every((user) => (user as UserHeavyOutDTO).firstName === 'Common name')
    ).toBe(true);

    if (result.data) {
      result.data.forEach((user, index) => {
        expect((user as UserHeavyOutDTO).lastName).toBe(`Last${index + 1}`);
      });
    }
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 5,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });

  it('Should return users in asc order of name', async () => {
    const filters: FiltersUser = {
      firstName: null,
      lastName: null,
      birthDateTo: null,
      birthDateFrom: null,
    };
    addMockData(5);
    setupMocks(false);

    const result = await repository.getUsers(1, 10, filters, 'first_name', 'asc', false);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(5);
    if (result.data) {
      result.data.forEach((user, index) => {
        expect((user as UserHeavyOutDTO).firstName).toBe(`First${index + 1}`);
      });
    }
  });

  it('Should return users in desc order of name', async () => {
    const filters: FiltersUser = {
      firstName: null,
      lastName: null,
      birthDateTo: null,
      birthDateFrom: null,
    };
    addMockData(5);
    // Invertir el orden para simular DESC
    usersMockData.reverse();
    setupMocks(false);

    const result = await repository.getUsers(1, 10, filters, 'first_name', 'desc', false);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(5);
    if (result.data) {
      result.data.forEach((user, index) => {
        expect((user as UserHeavyOutDTO).firstName).toBe(`First${5 - index}`);
      });
    }
  });

  it('Should return users in asc order of age', async () => {
    const filters: FiltersUser = {
      firstName: null,
      lastName: null,
      birthDateTo: null,
      birthDateFrom: null,
    };
    addMockData(3);
    setupMocks(false);

    const result = await repository.getUsers(1, 10, filters, 'birth_date', 'asc', false);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
    if (result.data && result.data.length >= 2) {
      const firstBirthDate = (result.data[0] as UserHeavyOutDTO).birthDate;
      const secondBirthDate = (result.data[1] as UserHeavyOutDTO).birthDate;
      expect(firstBirthDate <= secondBirthDate).toBe(true);
    }
  });

  it('Should return users in desc order of age', async () => {
    const filters: FiltersUser = {
      firstName: null,
      lastName: null,
      birthDateTo: null,
      birthDateFrom: null,
    };
    addMockData(3);
    usersMockData.reverse();
    setupMocks(false);

    const result = await repository.getUsers(1, 10, filters, 'birth_date', 'desc', false);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
    if (result.data && result.data.length >= 2) {
      const firstBirthDate = (result.data[0] as UserHeavyOutDTO).birthDate;
      const secondBirthDate = (result.data[1] as UserHeavyOutDTO).birthDate;
      expect(firstBirthDate >= secondBirthDate).toBe(true);
    }
  });

  it('Should return users with specified pagination', async () => {
    const filters: FiltersUser = {
      firstName: null,
      lastName: null,
      birthDateTo: null,
      birthDateFrom: null,
    };
    // Simular 25 usuarios totales, pero solo devolver 5 de la página 2
    addMockData(5);
    const totalCount = 25;
    const page = 2;
    const size = 5;

    // Modificar setupMocks para manejar el count diferente
    const countMockData = [{ count: totalCount }];
    const orderByMock = {
      limit: vi.fn().mockReturnValue({
        offset: vi.fn().mockResolvedValue(usersMockData),
      }),
    };
    const fromMock = {
      innerJoin: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue(orderByMock),
        }),
      }),
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

    const result = await repository.getUsers(page, size, filters, 'first_name', 'asc', true);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(5);
    expect(result.pagination).toEqual({
      page: 2,
      limit: 5,
      total: 25,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
    });
  });

  it('Should return heavy DTOs users if specified', async () => {
    const filters: FiltersUser = {
      firstName: null,
      lastName: null,
      birthDateTo: null,
      birthDateFrom: null,
    };
    addMockData(2);
    setupMocks(false);

    const result = await repository.getUsers(1, 10, filters, 'first_name', 'asc', false);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    if (result.data) {
      result.data.forEach((user) => {
        const heavyUser = user as UserHeavyOutDTO;
        expect(heavyUser.userId).toBeDefined();
        expect(heavyUser.role).toBeDefined();
        expect(heavyUser.email).toBeDefined();
        expect(heavyUser.firstName).toBeDefined();
        expect(heavyUser.lastName).toBeDefined();
        expect(heavyUser.createdAt).toBeDefined();
        expect(heavyUser.birthDate).toBeDefined();
      });
    }
  });

  it('Should return no users if there are no users', async () => {
    const filters: FiltersUser = {
      firstName: null,
      lastName: null,
      birthDateTo: null,
      birthDateFrom: null,
    };
    // No agregar datos
    setupMocks(false);

    const result = await repository.getUsers(1, 10, filters, 'first_name', 'asc', true);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
  });

  it('Should return user by ID with light DTO by default', async () => {});

  it('Should return user by ID with heavy DTO if specified', async () => {});

  it('Should throw User Repository Error if user not found', async () => {});

  it('Should return user by Email with light DTO by default', async () => {});

  it('Should return user by Email with heavy DTO if specified', async () => {});

  it('Should throw User Repository Error if user by Email not found', async () => {});

  it('Should return users by list of ids with light DTO by default', async () => {});

  it('Should return users by list of ids with heavy DTO if specified', async () => {});

  it('Should return empty list if no users found by list of ids', async () => {});

  it('Should throw an error if the list of ids exceeds the maximum allowed', async () => {});

  it('Should return a true if the user exists by the given id', async () => {});

  it('Should return a false if the user does not exist by the given id', async () => {});

  it('Should create a new User', async () => {});

  it('Should throw User Repository Error if email already exists', async () => {});

  it('Should update an existing User', async () => {});

  it('Should throw User Repository Error if trying to update a non-existing User', async () => {});

  it('Should throw User Repository Error if trying to update email to one that already exists', async () => {});

  it('Should throw User Repository Error if no fields to update are provided', async () => {});

  it('Should throw User Repository Error if trying to update with invalid fields', async () => {});

  it('Should delete an existing User', async () => {});

  it('Should throw User Repository Error if trying to delete a non-existing User', async () => {});
});
