import type ReviewInDTO from './ReviewInDTO.js';

export default interface ReviewOutDTO extends ReviewInDTO {
  reviewerId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
