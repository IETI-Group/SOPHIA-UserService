import type { DBDrizzleProvider } from '../../db/index.js';
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

  getLinkedAccounts(
    _userId: string,
    _page: number,
    _size: number,
    _sort?: string,
    _order?: string
  ): Promise<PaginatedLinkedAccounts> {
    this.client;
    throw new Error('Method not implemented.');
  }
  getLinkedAccount(_accountId: string): Promise<LinkedAccountOutDTO> {
    throw new Error('Method not implemented.');
  }
  postLinkedAccount(_linkedAccountIn: LinkedAccountInDTO): Promise<LinkedAccountOutDTO> {
    throw new Error('Method not implemented.');
  }
  updateLinkedAccount(
    _accountId: string,
    _linkedAccountUpdate: Partial<LinkedAccountInDTO>
  ): Promise<LinkedAccountOutDTO> {
    throw new Error('Method not implemented.');
  }
  deleteLinkedAccount(_accountId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
