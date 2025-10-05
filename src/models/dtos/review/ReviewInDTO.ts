import type { REVIEW_DISCRIMINANT } from '../../../utils/types.js';

export default interface ReviewInDTO {
  reviewerId: string;
  reviewedId: string;
  discriminant: REVIEW_DISCRIMINANT;
  rate: number;
  recommended: boolean;
  comments?: string;
}
