import type { LearningPathInDTO, LearningPathOutDTO } from '../models/index.js';

export interface LearningPathsRepository {
  getUserLearningPath(userId: string): LearningPathOutDTO;
  postUserLearningPath(userId: string, learningPathInDTO: LearningPathInDTO): LearningPathOutDTO;
  updateLearningPath(
    userId: string,
    learningPathUpdateDTO: Partial<LearningPathInDTO>
  ): LearningPathOutDTO;
}
