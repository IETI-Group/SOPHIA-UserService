import type ReviewOutDTO from '../review/ReviewOutDTO.js';
import type PaginatedResponse from './PaginatedResponse.js';

interface PaginatedReviews extends PaginatedResponse<ReviewOutDTO> {}

export type { PaginatedReviews };
export default PaginatedReviews;
