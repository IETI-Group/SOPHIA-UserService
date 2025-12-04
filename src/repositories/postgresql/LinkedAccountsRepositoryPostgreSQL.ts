import { type AnyColumn, and, asc, count, desc, eq, type SQL } from 'drizzle-orm';
import type { DBDrizzleProvider } from '../../db/index.js';
import { linked_accounts, users } from '../../db/schema.js';
import type {
  LinkedAccountInDTO,
  LinkedAccountOutDTO,
  PaginatedLinkedAccounts,
} from '../../models/index.js';
import type { LinkedAccountsRepository } from '../LinkedAccountsRepository.js';

export class LinkedAccountsRepositoryPostgreSQL implements LinkedAccountsRepository {
  private readonly client: DBDrizzleProvider;
  constructor(drizzleClient: DBDrizzleProvider) {
    this.client = drizzleClient;
  }

  private parseLinkedAccountToDTO(
    account: typeof linked_accounts.$inferSelect
  ): LinkedAccountOutDTO {
    return {
      idLinkedAccount: account.id_linked_account,
      userId: account.user_id,
      provider: account.provider,
      issuer: account.issuer,
      idExternal: account.external_id,
      email: account.email ?? '',
      emailVerified: account.email_verified,
      isPrimary: account.is_primary,
      linkedAt: account.linked_at,
    };
  }

  public async getLinkedAccounts(
    userId: string,
    page: number,
    size: number,
    sort?: string,
    order?: string
  ): Promise<PaginatedLinkedAccounts> {
    const whereConditions: SQL<unknown>[] = [eq(linked_accounts.user_id, userId)];

    let sortField: AnyColumn = linked_accounts.linked_at;
    if (sort === 'provider') {
      sortField = linked_accounts.provider;
    } else if (sort === 'issuer') {
      sortField = linked_accounts.issuer;
    } else if (sort === 'email') {
      sortField = linked_accounts.email;
    } else if (sort === 'linked_at') {
      sortField = linked_accounts.linked_at;
    }

    const orderFn = order === 'asc' ? asc : desc;
    const offset = (page - 1) * size;

    const accountsData = await this.client
      .select()
      .from(linked_accounts)
      .where(and(...whereConditions))
      .orderBy(orderFn(sortField))
      .limit(size)
      .offset(offset);

    const countResult = await this.client
      .select({ count: count() })
      .from(linked_accounts)
      .where(and(...whereConditions));

    const total = Number(countResult[0]?.count ?? 0);
    const totalPages = Math.ceil(total / size);

    const accountsDTOs = accountsData.map((account) => this.parseLinkedAccountToDTO(account));

    return {
      success: true,
      data: accountsDTOs,
      message: 'Linked accounts retrieved successfully',
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

  public async getLinkedAccount(accountId: string): Promise<LinkedAccountOutDTO> {
    const [account] = await this.client
      .select()
      .from(linked_accounts)
      .where(eq(linked_accounts.id_linked_account, accountId));

    if (!account) {
      throw new Error('Linked account not found');
    }

    return this.parseLinkedAccountToDTO(account);
  }

  public async getLinkedAccountByProviderAndExternalId(
    provider: string,
    externalId: string
  ): Promise<LinkedAccountOutDTO | null> {
    const [account] = await this.client
      .select()
      .from(linked_accounts)
      .where(
        and(eq(linked_accounts.provider, provider), eq(linked_accounts.external_id, externalId))
      );

    if (!account) {
      return null;
    }

    return this.parseLinkedAccountToDTO(account);
  }

  public async postLinkedAccount(
    linkedAccountIn: LinkedAccountInDTO
  ): Promise<LinkedAccountOutDTO> {
    // Validate that user exists
    const [user] = await this.client
      .select({ id_user: users.id_user })
      .from(users)
      .where(eq(users.id_user, linkedAccountIn.userId));

    if (!user) {
      throw new Error('User not found');
    }

    const [createdAccount] = await this.client
      .insert(linked_accounts)
      .values({
        user_id: linkedAccountIn.userId,
        provider: linkedAccountIn.provider,
        issuer: linkedAccountIn.issuer,
        external_id: linkedAccountIn.idExternal,
        email: linkedAccountIn.email,
        is_primary: linkedAccountIn.isPrimary,
        email_verified: false,
      })
      .returning();

    return this.parseLinkedAccountToDTO(createdAccount);
  }

  public async updateLinkedAccount(
    accountId: string,
    linkedAccountUpdate: Partial<LinkedAccountInDTO>
  ): Promise<LinkedAccountOutDTO> {
    const updateFields: Partial<{
      provider: string;
      issuer: string;
      external_id: string;
      email: string;
      is_primary: boolean;
    }> = {};

    if (linkedAccountUpdate.provider !== undefined) {
      updateFields.provider = linkedAccountUpdate.provider;
    }
    if (linkedAccountUpdate.issuer !== undefined) {
      updateFields.issuer = linkedAccountUpdate.issuer;
    }
    if (linkedAccountUpdate.idExternal !== undefined) {
      updateFields.external_id = linkedAccountUpdate.idExternal;
    }
    if (linkedAccountUpdate.email !== undefined) {
      updateFields.email = linkedAccountUpdate.email;
    }
    if (linkedAccountUpdate.isPrimary !== undefined) {
      updateFields.is_primary = linkedAccountUpdate.isPrimary;
    }

    if (Object.keys(updateFields).length === 0) {
      throw new Error('At least one field must be provided to update');
    }

    const [updatedAccount] = await this.client
      .update(linked_accounts)
      .set(updateFields)
      .where(eq(linked_accounts.id_linked_account, accountId))
      .returning();

    if (!updatedAccount) {
      throw new Error('Linked account not found');
    }

    return this.parseLinkedAccountToDTO(updatedAccount);
  }

  public async deleteLinkedAccount(accountId: string): Promise<void> {
    const [deletedAccount] = await this.client
      .delete(linked_accounts)
      .where(eq(linked_accounts.id_linked_account, accountId))
      .returning();

    if (!deletedAccount) {
      throw new Error('Linked account not found');
    }
  }
}
