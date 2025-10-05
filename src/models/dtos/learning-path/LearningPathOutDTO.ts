import type LearningPathInDTO from './LearningPathInDTO.js';

export default interface LearningPathOutDTO extends LearningPathInDTO {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
