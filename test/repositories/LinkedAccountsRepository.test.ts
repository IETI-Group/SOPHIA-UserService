import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { DBDrizzleProvider } from '../../src/db/DBDrizzleProvider.js';
import type { LinkedAccountInDTO } from '../../src/models/index.js';
import { LinkedAccountsRepositoryPostgreSQL } from '../../src/repositories/postgresql/LinkedAccountsRepositoryPostgreSQL.js';

describe('Linked Accounts Repository', () => {
  const drizzleClient = mockDeep<DBDrizzleProvider>();
  const linkedAccountsRepository = new LinkedAccountsRepositoryPostgreSQL(drizzleClient);

  beforeEach(() => {
    mockReset(drizzleClient);
  });

  describe('getLinkedAccounts', () => {
    it('should return paginated linked accounts for a user', async () => {
      const userId = 'user-123';
      const mockLinkedAccountsData = [
        {
          id_linked_account: 'account-1',
          user_id: userId,
          provider: 'Google',
          issuer: 'google.com',
          external_id: 'google-123',
          email: 'user@gmail.com',
          email_verified: true,
          is_primary: true,
          linked_at: new Date('2024-01-01'),
        },
        {
          id_linked_account: 'account-2',
          user_id: userId,
          provider: 'GitHub',
          issuer: 'github.com',
          external_id: 'github-456',
          email: 'user@github.com',
          email_verified: false,
          is_primary: false,
          linked_at: new Date('2024-01-02'),
        },
      ];

      const offsetMock = vi.fn().mockResolvedValue(mockLinkedAccountsData);
      const limitMock = { offset: offsetMock };
      const orderByMock = { limit: vi.fn().mockReturnValue(limitMock) };
      const whereMock = { orderBy: vi.fn().mockReturnValue(orderByMock) };
      const fromMock = { where: vi.fn().mockReturnValue(whereMock) };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const whereCountMock = vi.fn().mockResolvedValue([{ count: '2' }]);
      const fromCountMock = { where: whereCountMock };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromCountMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await linkedAccountsRepository.getLinkedAccounts(userId, 1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].provider).toBe('Google');
      expect(result.data?.[1].provider).toBe('GitHub');
      expect(result.message).toBe('Linked accounts retrieved successfully');
      expect(result.pagination.total).toBe(2);
    });

    it('should return empty list when user has no linked accounts', async () => {
      const userId = 'user-456';

      const offsetMock = vi.fn().mockResolvedValue([]);
      const limitMock = { offset: offsetMock };
      const orderByMock = { limit: vi.fn().mockReturnValue(limitMock) };
      const whereMock = { orderBy: vi.fn().mockReturnValue(orderByMock) };
      const fromMock = { where: vi.fn().mockReturnValue(whereMock) };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const whereCountMock = vi.fn().mockResolvedValue([{ count: '0' }]);
      const fromCountMock = { where: whereCountMock };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromCountMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await linkedAccountsRepository.getLinkedAccounts(userId, 1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should apply sorting by provider in ascending order', async () => {
      const userId = 'user-123';
      const mockLinkedAccountsData = [
        {
          id_linked_account: 'account-2',
          user_id: userId,
          provider: 'GitHub',
          issuer: 'github.com',
          external_id: 'github-456',
          email: 'user@github.com',
          email_verified: false,
          is_primary: false,
          linked_at: new Date('2024-01-02'),
        },
        {
          id_linked_account: 'account-1',
          user_id: userId,
          provider: 'Google',
          issuer: 'google.com',
          external_id: 'google-123',
          email: 'user@gmail.com',
          email_verified: true,
          is_primary: true,
          linked_at: new Date('2024-01-01'),
        },
      ];

      const offsetMock = vi.fn().mockResolvedValue(mockLinkedAccountsData);
      const limitMock = { offset: offsetMock };
      const orderByMock = { limit: vi.fn().mockReturnValue(limitMock) };
      const whereMock = { orderBy: vi.fn().mockReturnValue(orderByMock) };
      const fromMock = { where: vi.fn().mockReturnValue(whereMock) };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const whereCountMock = vi.fn().mockResolvedValue([{ count: '2' }]);
      const fromCountMock = { where: whereCountMock };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromCountMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await linkedAccountsRepository.getLinkedAccounts(
        userId,
        1,
        10,
        'provider',
        'asc'
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].provider).toBe('GitHub');
      expect(result.data?.[1].provider).toBe('Google');
    });

    it('should handle pagination correctly', async () => {
      const userId = 'user-123';
      const mockLinkedAccountsData = [
        {
          id_linked_account: 'account-3',
          user_id: userId,
          provider: 'Twitter',
          issuer: 'twitter.com',
          external_id: 'twitter-789',
          email: 'user@twitter.com',
          email_verified: true,
          is_primary: false,
          linked_at: new Date('2024-01-03'),
        },
      ];

      const offsetMock = vi.fn().mockResolvedValue(mockLinkedAccountsData);
      const limitMock = { offset: offsetMock };
      const orderByMock = { limit: vi.fn().mockReturnValue(limitMock) };
      const whereMock = { orderBy: vi.fn().mockReturnValue(orderByMock) };
      const fromMock = { where: vi.fn().mockReturnValue(whereMock) };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const whereCountMock = vi.fn().mockResolvedValue([{ count: '15' }]);
      const fromCountMock = { where: whereCountMock };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromCountMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await linkedAccountsRepository.getLinkedAccounts(userId, 2, 5);

      expect(result.success).toBe(true);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.totalPages).toBe(3);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(true);
    });
  });

  describe('getLinkedAccount', () => {
    it('should return a linked account by ID', async () => {
      const accountId = 'account-123';
      const mockLinkedAccount = {
        id_linked_account: accountId,
        user_id: 'user-123',
        provider: 'Google',
        issuer: 'google.com',
        external_id: 'google-123',
        email: 'user@gmail.com',
        email_verified: true,
        is_primary: true,
        linked_at: new Date('2024-01-01'),
      };

      const whereMock = vi.fn().mockResolvedValue([mockLinkedAccount]);
      const fromMock = { where: whereMock };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await linkedAccountsRepository.getLinkedAccount(accountId);

      expect(result.idLinkedAccount).toBe(accountId);
      expect(result.provider).toBe('Google');
      expect(result.email).toBe('user@gmail.com');
      expect(result.isPrimary).toBe(true);
      expect(result.emailVerified).toBe(true);
    });

    it('should throw error when linked account not found', async () => {
      const accountId = 'nonexistent-account';

      const whereMock = vi.fn().mockResolvedValue([]);
      const fromMock = { where: whereMock };

      drizzleClient.select.mockReturnValue({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      await expect(linkedAccountsRepository.getLinkedAccount(accountId)).rejects.toThrow(
        'Linked account not found'
      );
    });
  });

  describe('postLinkedAccount', () => {
    it('should create a new linked account', async () => {
      const linkedAccountIn: LinkedAccountInDTO = {
        userId: 'user-123',
        provider: 'Google',
        issuer: 'google.com',
        idExternal: 'google-123',
        email: 'user@gmail.com',
        isPrimary: true,
      };

      const mockCreatedAccount = {
        id_linked_account: 'new-account-123',
        user_id: linkedAccountIn.userId,
        provider: linkedAccountIn.provider,
        issuer: linkedAccountIn.issuer,
        external_id: linkedAccountIn.idExternal,
        email: linkedAccountIn.email,
        email_verified: false,
        is_primary: linkedAccountIn.isPrimary,
        linked_at: new Date('2024-01-01'),
      };

      // Mock user validation query
      const whereMock = vi.fn().mockResolvedValue([{ id_user: linkedAccountIn.userId }]);
      const fromMock = { where: whereMock };
      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const returningMock = vi.fn().mockResolvedValue([mockCreatedAccount]);
      const valuesMock = { returning: returningMock };
      const insertMock = { values: vi.fn().mockReturnValue(valuesMock) };

      drizzleClient.insert.mockReturnValue(
        insertMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      const result = await linkedAccountsRepository.postLinkedAccount(linkedAccountIn);

      expect(result.idLinkedAccount).toBe('new-account-123');
      expect(result.provider).toBe('Google');
      expect(result.email).toBe('user@gmail.com');
      expect(result.isPrimary).toBe(true);
      expect(result.emailVerified).toBe(false);
    });

    it('should create linked account with email_verified as false by default', async () => {
      const linkedAccountIn: LinkedAccountInDTO = {
        userId: 'user-456',
        provider: 'GitHub',
        issuer: 'github.com',
        idExternal: 'github-456',
        email: 'user@github.com',
        isPrimary: false,
      };

      const mockCreatedAccount = {
        id_linked_account: 'new-account-456',
        user_id: linkedAccountIn.userId,
        provider: linkedAccountIn.provider,
        issuer: linkedAccountIn.issuer,
        external_id: linkedAccountIn.idExternal,
        email: linkedAccountIn.email,
        email_verified: false,
        is_primary: linkedAccountIn.isPrimary,
        linked_at: new Date('2024-01-01'),
      };

      // Mock user validation query
      const whereMock = vi.fn().mockResolvedValue([{ id_user: linkedAccountIn.userId }]);
      const fromMock = { where: whereMock };
      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const returningMock = vi.fn().mockResolvedValue([mockCreatedAccount]);
      const valuesMock = { returning: returningMock };
      const insertMock = { values: vi.fn().mockReturnValue(valuesMock) };

      drizzleClient.insert.mockReturnValue(
        insertMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      const result = await linkedAccountsRepository.postLinkedAccount(linkedAccountIn);

      expect(result.emailVerified).toBe(false);
    });

    it('should throw error when user does not exist', async () => {
      const linkedAccountIn: LinkedAccountInDTO = {
        userId: 'nonexistent-user',
        provider: 'Google',
        issuer: 'google.com',
        idExternal: 'google-123',
        email: 'user@gmail.com',
        isPrimary: true,
      };

      // Mock user validation query returning empty array
      const whereMock = vi.fn().mockResolvedValue([]);
      const fromMock = { where: whereMock };
      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      await expect(linkedAccountsRepository.postLinkedAccount(linkedAccountIn)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('updateLinkedAccount', () => {
    it('should update a linked account with all fields', async () => {
      const accountId = 'account-123';
      const updateData: Partial<LinkedAccountInDTO> = {
        provider: 'Google Updated',
        issuer: 'accounts.google.com',
        email: 'newemail@gmail.com',
        isPrimary: false,
      };

      const mockUpdatedAccount = {
        id_linked_account: accountId,
        user_id: 'user-123',
        provider: 'Google Updated',
        issuer: 'accounts.google.com',
        external_id: 'google-123',
        email: 'newemail@gmail.com',
        email_verified: true,
        is_primary: false,
        linked_at: new Date('2024-01-01'),
      };

      const returningMock = vi.fn().mockResolvedValue([mockUpdatedAccount]);
      const whereMock = { returning: returningMock };
      const setMock = { where: vi.fn().mockReturnValue(whereMock) };
      const updateMock = { set: vi.fn().mockReturnValue(setMock) };

      drizzleClient.update.mockReturnValue(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      const result = await linkedAccountsRepository.updateLinkedAccount(accountId, updateData);

      expect(result.idLinkedAccount).toBe(accountId);
      expect(result.provider).toBe('Google Updated');
      expect(result.email).toBe('newemail@gmail.com');
      expect(result.isPrimary).toBe(false);
    });

    it('should update only specified fields', async () => {
      const accountId = 'account-123';
      const updateData: Partial<LinkedAccountInDTO> = {
        isPrimary: true,
      };

      const mockUpdatedAccount = {
        id_linked_account: accountId,
        user_id: 'user-123',
        provider: 'Google',
        issuer: 'google.com',
        external_id: 'google-123',
        email: 'user@gmail.com',
        email_verified: true,
        is_primary: true,
        linked_at: new Date('2024-01-01'),
      };

      const returningMock = vi.fn().mockResolvedValue([mockUpdatedAccount]);
      const whereMock = { returning: returningMock };
      const setMock = { where: vi.fn().mockReturnValue(whereMock) };
      const updateMock = { set: vi.fn().mockReturnValue(setMock) };

      drizzleClient.update.mockReturnValue(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      const result = await linkedAccountsRepository.updateLinkedAccount(accountId, updateData);

      expect(result.isPrimary).toBe(true);
      expect(result.provider).toBe('Google');
    });

    it('should throw error when linked account not found for update', async () => {
      const accountId = 'nonexistent-account';
      const updateData: Partial<LinkedAccountInDTO> = {
        isPrimary: true,
      };

      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = { returning: returningMock };
      const setMock = { where: vi.fn().mockReturnValue(whereMock) };
      const updateMock = { set: vi.fn().mockReturnValue(setMock) };

      drizzleClient.update.mockReturnValue(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      await expect(
        linkedAccountsRepository.updateLinkedAccount(accountId, updateData)
      ).rejects.toThrow('Linked account not found');
    });

    it('should throw error when no fields provided for update', async () => {
      const accountId = 'account-123';
      const updateData: Partial<LinkedAccountInDTO> = {};

      await expect(
        linkedAccountsRepository.updateLinkedAccount(accountId, updateData)
      ).rejects.toThrow('At least one field must be provided to update');
    });
  });

  describe('deleteLinkedAccount', () => {
    it('should delete an existing linked account', async () => {
      const accountId = 'account-123';

      const mockDeletedAccount = {
        id_linked_account: accountId,
        user_id: 'user-123',
        provider: 'Google',
        issuer: 'google.com',
        external_id: 'google-123',
        email: 'user@gmail.com',
        email_verified: true,
        is_primary: true,
        linked_at: new Date('2024-01-01'),
      };

      const returningMock = vi.fn().mockResolvedValue([mockDeletedAccount]);
      const whereMock = { returning: returningMock };
      const deleteMock = { where: vi.fn().mockReturnValue(whereMock) };

      drizzleClient.delete.mockReturnValue(
        deleteMock as unknown as ReturnType<typeof drizzleClient.delete>
      );

      const result = await linkedAccountsRepository.deleteLinkedAccount(accountId);

      expect(result).toBeUndefined();
    });

    it('should throw error when linked account not found for deletion', async () => {
      const accountId = 'nonexistent-account';

      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = { returning: returningMock };
      const deleteMock = { where: vi.fn().mockReturnValue(whereMock) };

      drizzleClient.delete.mockReturnValue(
        deleteMock as unknown as ReturnType<typeof drizzleClient.delete>
      );

      await expect(linkedAccountsRepository.deleteLinkedAccount(accountId)).rejects.toThrow(
        'Linked account not found'
      );
    });
  });
});
