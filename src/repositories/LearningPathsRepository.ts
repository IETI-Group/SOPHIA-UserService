import type { LearningPathInDTO, LearningPathOutDTO } from '../models/index.js';

export interface LearningPathsRepository {
  getUserLearningPath(userId: string): Promise<LearningPathOutDTO>;
  postUserLearningPath(
    userId: string,
    learningPathInDTO: LearningPathInDTO
  ): Promise<LearningPathOutDTO>;
  updateLearningPath(
    userId: string,
    learningPathUpdateDTO: Partial<LearningPathInDTO>
  ): Promise<LearningPathOutDTO>;
}
