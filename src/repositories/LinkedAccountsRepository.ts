import type {
  LinkedAccountInDTO,
  LinkedAccountOutDTO,
  PaginatedLinkedAccounts,
} from '../models/index.js';

export interface LinkedAccountsRepository {
  getLinkedAccounts(
    userId: string,
    page: number,
    size: number,
    sort?: string,
    order?: string
  ): Promise<PaginatedLinkedAccounts>;
  getLinkedAccount(accountId: string): Promise<LinkedAccountOutDTO>;
  postLinkedAccount(linkedAccountIn: LinkedAccountInDTO): Promise<LinkedAccountOutDTO>;
  updateLinkedAccount(
    accountId: string,
    linkedAccountUpdate: Partial<LinkedAccountInDTO>
  ): Promise<LinkedAccountOutDTO>;
  deleteLinkedAccount(accountId: string): Promise<void>;
}
