import type LinkedAccountOutDTO from '../linked-account/LinkedAccountOutDTO.js';
import type PaginatedResponse from './PaginatedResponse.js';

interface PaginatedLinkedAccounts extends PaginatedResponse<LinkedAccountOutDTO> {}

export type { PaginatedLinkedAccounts };
export default PaginatedLinkedAccounts;
