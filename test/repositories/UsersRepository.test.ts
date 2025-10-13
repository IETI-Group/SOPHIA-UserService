import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { DBDrizzleProvider } from '../../src/db/DBDrizzleProvider.js';
import type {
  FiltersUser,
  UserHeavyOutDTO,
  UserInDTO,
  UserUpdateDTO,
} from '../../src/models/index.js';
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

  it('Should return user by ID with light DTO by default', async () => {
    const userId = '123';
    const userMockData = {
      id_user: userId,
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Bio',
      created_at: new Date('2024-01-01'),
      birth_date: new Date('1990-01-01'),
      updated_at: new Date('2024-01-02'),
      role_name: ROLE.STUDENT,
    };

    const whereMock = vi.fn().mockResolvedValue([userMockData]);
    const innerJoinMock = {
      innerJoin: vi.fn().mockReturnValue({
        where: whereMock,
      }),
    };
    const fromMock = {
      innerJoin: vi.fn().mockReturnValue(innerJoinMock),
    };

    drizzleClient.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue(fromMock),
    } as unknown as ReturnType<typeof drizzleClient.select>);

    const result = await repository.getUserById(userId);

    expect(result.userId).toBe(userId);
    expect(result.role).toBe(ROLE.STUDENT);
    // Light DTO no debe tener email, firstName, etc.
    expect('email' in result).toBe(false);
  });

  it('Should return user by ID with heavy DTO if specified', async () => {
    const userId = '123';
    const userMockData = {
      id_user: userId,
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Bio',
      created_at: new Date('2024-01-01'),
      birth_date: new Date('1990-01-01'),
      updated_at: new Date('2024-01-02'),
      role_name: ROLE.STUDENT,
    };

    const whereMock = vi.fn().mockResolvedValue([userMockData]);
    const innerJoinMock = {
      innerJoin: vi.fn().mockReturnValue({
        where: whereMock,
      }),
    };
    const fromMock = {
      innerJoin: vi.fn().mockReturnValue(innerJoinMock),
    };

    drizzleClient.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue(fromMock),
    } as unknown as ReturnType<typeof drizzleClient.select>);

    const result = await repository.getUserById(userId, false);
    const heavyResult = result as UserHeavyOutDTO;

    expect(heavyResult.userId).toBe(userId);
    expect(heavyResult.role).toBe(ROLE.STUDENT);
    expect(heavyResult.email).toBe('user@example.com');
    expect(heavyResult.firstName).toBe('John');
    expect(heavyResult.lastName).toBe('Doe');
    expect(heavyResult.bio).toBe('Bio');
    expect(heavyResult.createdAt).toEqual(new Date('2024-01-01'));
    expect(heavyResult.birthDate).toEqual(new Date('1990-01-01'));
  });

  it('Should throw User Repository Error if user not found', async () => {
    const userId = 'non-existent-id';

    const whereMock = vi.fn().mockResolvedValue([]);
    const innerJoinMock = {
      innerJoin: vi.fn().mockReturnValue({
        where: whereMock,
      }),
    };
    const fromMock = {
      innerJoin: vi.fn().mockReturnValue(innerJoinMock),
    };

    drizzleClient.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue(fromMock),
    } as unknown as ReturnType<typeof drizzleClient.select>);

    await expect(repository.getUserById(userId)).rejects.toThrow();
  });

  it('Should return user by Email with light DTO by default', async () => {
    const email = 'user@example.com';
    const userMockData = {
      id_user: '123',
      email: email,
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Bio',
      created_at: new Date('2024-01-01'),
      birth_date: new Date('1990-01-01'),
      updated_at: new Date('2024-01-02'),
      role_name: ROLE.STUDENT,
    };

    const whereMock = vi.fn().mockResolvedValue([userMockData]);
    const innerJoinMock = {
      innerJoin: vi.fn().mockReturnValue({
        where: whereMock,
      }),
    };
    const fromMock = {
      innerJoin: vi.fn().mockReturnValue(innerJoinMock),
    };

    drizzleClient.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue(fromMock),
    } as unknown as ReturnType<typeof drizzleClient.select>);

    const result = await repository.getUserByEmail(email);

    expect(result.userId).toBe('123');
    expect(result.role).toBe(ROLE.STUDENT);
    expect('email' in result).toBe(false);
  });

  it('Should return user by Email with heavy DTO if specified', async () => {
    const email = 'user@example.com';
    const userMockData = {
      id_user: '123',
      email: email,
      first_name: 'John',
      last_name: 'Doe',
      bio: 'Bio',
      created_at: new Date('2024-01-01'),
      birth_date: new Date('1990-01-01'),
      updated_at: new Date('2024-01-02'),
      role_name: ROLE.STUDENT,
    };

    const whereMock = vi.fn().mockResolvedValue([userMockData]);
    const innerJoinMock = {
      innerJoin: vi.fn().mockReturnValue({
        where: whereMock,
      }),
    };
    const fromMock = {
      innerJoin: vi.fn().mockReturnValue(innerJoinMock),
    };

    drizzleClient.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue(fromMock),
    } as unknown as ReturnType<typeof drizzleClient.select>);

    const result = await repository.getUserByEmail(email, false);
    const heavyResult = result as UserHeavyOutDTO;

    expect(heavyResult.userId).toBe('123');
    expect(heavyResult.email).toBe(email);
    expect(heavyResult.firstName).toBe('John');
    expect(heavyResult.lastName).toBe('Doe');
  });

  it('Should throw User Repository Error if user by Email not found', async () => {
    const email = 'nonexistent@example.com';

    const whereMock = vi.fn().mockResolvedValue([]);
    const innerJoinMock = {
      innerJoin: vi.fn().mockReturnValue({
        where: whereMock,
      }),
    };
    const fromMock = {
      innerJoin: vi.fn().mockReturnValue(innerJoinMock),
    };

    drizzleClient.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue(fromMock),
    } as unknown as ReturnType<typeof drizzleClient.select>);

    await expect(repository.getUserByEmail(email)).rejects.toThrow();
  });

  it('Should return users by list of ids with light DTO by default', async () => {
    const ids = ['1', '2', '3'];
    addMockData(3);

    const countMockData = [{ count: 3 }];
    const orderByMock = {
      limit: vi.fn().mockReturnValue({
        offset: vi.fn().mockResolvedValue(usersMockData),
      }),
    };
    const whereMock = {
      orderBy: vi.fn().mockReturnValue(orderByMock),
    };
    const fromMock = {
      innerJoin: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(whereMock),
        }),
      }),
    };
    const countInnerJoinMock = {
      innerJoin: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(countMockData),
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

    const result = await repository.getUsersByIds(ids);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
    expect(result.data?.every((user) => 'email' in user === false)).toBe(true);
  });

  it('Should return users by list of ids with heavy DTO if specified', async () => {
    const ids = ['1', '2'];
    addMockData(2);

    const countMockData = [{ count: 2 }];
    const orderByMock = {
      limit: vi.fn().mockReturnValue({
        offset: vi.fn().mockResolvedValue(usersMockData),
      }),
    };
    const whereMock = {
      orderBy: vi.fn().mockReturnValue(orderByMock),
    };
    const fromMock = {
      innerJoin: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(whereMock),
        }),
      }),
    };
    const countInnerJoinMock = {
      innerJoin: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(countMockData),
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

    const result = await repository.getUsersByIds(ids, false);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    if (result.data) {
      result.data.forEach((user) => {
        const heavyUser = user as UserHeavyOutDTO;
        expect(heavyUser.email).toBeDefined();
        expect(heavyUser.firstName).toBeDefined();
      });
    }
  });

  it('Should return empty list if no users found by list of ids', async () => {
    const ids = ['999', '888'];

    const countMockData = [{ count: 0 }];
    const orderByMock = {
      limit: vi.fn().mockReturnValue({
        offset: vi.fn().mockResolvedValue([]),
      }),
    };
    const whereMock = {
      orderBy: vi.fn().mockReturnValue(orderByMock),
    };
    const fromMock = {
      innerJoin: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(whereMock),
        }),
      }),
    };
    const countInnerJoinMock = {
      innerJoin: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(countMockData),
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

    const result = await repository.getUsersByIds(ids);

    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
  });

  it('Should throw an error if the list of ids exceeds the maximum allowed', async () => {
    const ids = Array.from({ length: 101 }, (_, i) => i.toString());

    await expect(repository.getUsersByIds(ids)).rejects.toThrow();
  });

  it('Should return a true if the user exists by the given id', async () => {
    const userId = '123';

    const whereMock = vi.fn().mockResolvedValue([{ id_user: userId }]);
    const fromMock = {
      where: whereMock,
    };

    drizzleClient.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue(fromMock),
    } as unknown as ReturnType<typeof drizzleClient.select>);

    const result = await repository.userExists(userId);

    expect(result).toBe(true);
  });

  it('Should return a false if the user does not exist by the given id', async () => {
    const userId = 'non-existent';

    const whereMock = vi.fn().mockResolvedValue([]);
    const fromMock = {
      where: whereMock,
    };

    drizzleClient.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue(fromMock),
    } as unknown as ReturnType<typeof drizzleClient.select>);

    const result = await repository.userExists(userId);

    expect(result).toBe(false);
  });

  it('Should create a new User', async () => {
    const newUser: UserInDTO = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      birthDate: new Date('1990-01-01'),
    };

    const createdUser = {
      id_user: '123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      birth_date: new Date('1990-01-01'),
      bio: null,
      profile_picture_url: null,
      created_at: new Date(),
      updated_at: new Date(),
      password_hash: 'hashedPassword',
      role: ROLE.STUDENT,
    };

    const insertMock = {
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([createdUser]),
      }),
    };

    drizzleClient.insert.mockReturnValue(
      insertMock as unknown as ReturnType<typeof drizzleClient.insert>
    );

    const result = await repository.postUser(newUser);

    expect(result.userId).toBe('123');
    expect((result as UserHeavyOutDTO).firstName).toBe('John');
  });

  it('Should throw User Repository Error if email already exists', async () => {
    const newUser: UserInDTO = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'existing@example.com',
      birthDate: new Date('1992-05-15'),
    };

    const insertMock = {
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockRejectedValue(new Error('duplicate key value violates unique constraint')),
      }),
    };

    drizzleClient.insert.mockReturnValue(
      insertMock as unknown as ReturnType<typeof drizzleClient.insert>
    );

    await expect(repository.postUser(newUser)).rejects.toThrow();
  });

  it('Should update an existing User', async () => {
    const userId = '123';
    const updates: Partial<UserUpdateDTO> = {
      firstName: 'Updated',
      bio: 'New bio',
    };

    const updatedUser = {
      id_user: userId,
      first_name: 'Updated',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      birth_date: new Date('1990-01-01'),
      bio: 'New bio',
      profile_picture_url: null,
      created_at: new Date(),
      updated_at: new Date(),
      password_hash: 'hashedPassword',
      role: ROLE.STUDENT,
    };

    const updateMock = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updatedUser]),
        }),
      }),
    };

    drizzleClient.update.mockReturnValue(
      updateMock as unknown as ReturnType<typeof drizzleClient.update>
    );

    const result = await repository.updateUser(userId, updates);

    expect(result.userId).toBe(userId);
    expect((result as UserHeavyOutDTO).firstName).toBe('Updated');
    expect((result as UserHeavyOutDTO).bio).toBe('New bio');
  });

  it('Should throw User Repository Error if trying to update a non-existing User', async () => {
    const userId = 'non-existent';
    const updates: Partial<UserUpdateDTO> = {
      firstName: 'Updated',
    };

    const updateMock = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    };

    drizzleClient.update.mockReturnValue(
      updateMock as unknown as ReturnType<typeof drizzleClient.update>
    );

    await expect(repository.updateUser(userId, updates)).rejects.toThrow();
  });

  it('Should throw User Repository Error if trying to update email to one that already exists', async () => {
    const userId = '123';
    const updates: Partial<UserUpdateDTO> = {
      email: 'existing@example.com',
    };

    const updateMock = {
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockRejectedValue(new Error('duplicate key value violates unique constraint')),
        }),
      }),
    };

    drizzleClient.update.mockReturnValue(
      updateMock as unknown as ReturnType<typeof drizzleClient.update>
    );

    await expect(repository.updateUser(userId, updates)).rejects.toThrow();
  });

  it('Should throw User Repository Error if no fields to update are provided', async () => {
    const userId = '123';
    const updates: Partial<UserUpdateDTO> = {};

    await expect(repository.updateUser(userId, updates)).rejects.toThrow();
  });

  it('Should throw User Repository Error if trying to update with invalid fields', async () => {
    const userId = '123';
    const updates = { invalidField: 'value' } as unknown as Partial<UserUpdateDTO>;

    await expect(repository.updateUser(userId, updates)).rejects.toThrow();
  });

  it('Should delete an existing User', async () => {
    const userId = '123';

    const deleteMock = {
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id_user: userId }]),
      }),
    };

    drizzleClient.delete.mockReturnValue(
      deleteMock as unknown as ReturnType<typeof drizzleClient.delete>
    );

    await expect(repository.deleteUser(userId)).resolves.not.toThrow();
  });

  it('Should throw User Repository Error if trying to delete a non-existing User', async () => {
    const userId = 'non-existent';

    const deleteMock = {
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    };

    drizzleClient.delete.mockReturnValue(
      deleteMock as unknown as ReturnType<typeof drizzleClient.delete>
    );

    await expect(repository.deleteUser(userId)).rejects.toThrow();
  });
});
