import type { DBDrizzleProvider } from '../../db/index.js';
import type { LearningPathInDTO, LearningPathOutDTO } from '../../models/index.js';
import type { LearningPathsRepository } from '../LearningPathsRepository.js';

export class LearningPathsRepositoryPostgreSQL implements LearningPathsRepository {
  private readonly client: DBDrizzleProvider;

  constructor(drizzleClient: DBDrizzleProvider) {
    this.client = drizzleClient;
  }

  public async getUserLearningPath(_userId: string): Promise<LearningPathOutDTO> {
    this.client;
    throw new Error('Method not implemented.');
  }
  public async postUserLearningPath(
    _userId: string,
    _learningPathInDTO: LearningPathInDTO
  ): Promise<LearningPathOutDTO> {
    throw new Error('Method not implemented.');
  }
  public async updateLearningPath(
    _userId: string,
    _learningPathUpdateDTO: Partial<LearningPathInDTO>
  ): Promise<LearningPathOutDTO> {
    throw new Error('Method not implemented.');
  }
}
