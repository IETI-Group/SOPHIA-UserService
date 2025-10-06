import type ReviewInDTO from './ReviewInDTO.js';

interface ReviewOutDTO extends ReviewInDTO {
  reviewerId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type { ReviewOutDTO };
export default ReviewOutDTO;
