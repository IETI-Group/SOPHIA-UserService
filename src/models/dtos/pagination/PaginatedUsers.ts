import type UserOutDTO from '../user/UserOutDTO.js';
import type PaginatedResponse from './PaginatedResponse.js';

export default interface PaginatedUsers extends PaginatedResponse<UserOutDTO> {}
