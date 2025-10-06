import type UserOutDTO from '../user/UserOutDTO.js';
import type PaginatedResponse from './PaginatedResponse.js';

interface PaginatedUsers extends PaginatedResponse<UserOutDTO> {}

export type { PaginatedUsers };
export default PaginatedUsers;
