import type ReviewOutDTO from '../review/ReviewOutDTO.js';
import type PaginatedResponse from './PaginatedResponse.js';

export default interface PaginatedReviews extends PaginatedResponse<ReviewOutDTO> {}
