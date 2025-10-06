import type LearningPathInDTO from './LearningPathInDTO.js';

interface LearningPathOutDTO extends LearningPathInDTO {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type { LearningPathOutDTO };
export default LearningPathOutDTO;
