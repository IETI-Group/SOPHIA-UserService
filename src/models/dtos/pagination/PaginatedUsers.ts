import type { UserHeavyOutDTO } from '../index.js';
import type UserOutDTO from '../user/UserOutDTO.js';
import type PaginatedResponse from './PaginatedResponse.js';

interface PaginatedUsers extends PaginatedResponse<UserOutDTO | UserHeavyOutDTO> {}

export type { PaginatedUsers };
export default PaginatedUsers;
