import { eq } from 'drizzle-orm';
import type { DBDrizzleProvider } from '../../db/index.js';
import { user_learning_profile } from '../../db/schema.js';
import type { LearningPathInDTO, LearningPathOutDTO } from '../../models/index.js';
import type { LearningPathsRepository } from '../LearningPathsRepository.js';

export class LearningPathsRepositoryPostgreSQL implements LearningPathsRepository {
  private readonly client: DBDrizzleProvider;

  constructor(drizzleClient: DBDrizzleProvider) {
    this.client = drizzleClient;
  }

  private parseLearningPathToDTO(learningPath: LearningPathQueryResult): LearningPathOutDTO {
    return {
      id: learningPath.id_learning_profile,
      userId: learningPath.user_id,
      primaryStyle: learningPath.primary_style,
      secondaryStyle: learningPath.secondary_style ?? learningPath.primary_style,
      pacePreference: learningPath.pace_preference,
      interactivityPreference: learningPath.interactivity_preference,
      gamificationEnabled: learningPath.gamification_enabled,
      createdAt: learningPath.created_at,
      updatedAt: learningPath.updated_at ?? learningPath.created_at,
    };
  }

  public async getUserLearningPath(userId: string): Promise<LearningPathOutDTO> {
    const learningPath = await this.client
      .select()
      .from(user_learning_profile)
      .where(eq(user_learning_profile.user_id, userId));

    if (learningPath.length === 0) {
      throw new Error(`Learning path for user with id ${userId} not found`);
    }

    return this.parseLearningPathToDTO(learningPath[0]);
  }

  public async postUserLearningPath(
    userId: string,
    learningPathInDTO: LearningPathInDTO
  ): Promise<LearningPathOutDTO> {
    const newLearningPath = await this.client
      .insert(user_learning_profile)
      .values({
        user_id: userId,
        primary_style: learningPathInDTO.primaryStyle,
        secondary_style: learningPathInDTO.secondaryStyle,
        pace_preference: learningPathInDTO.pacePreference,
        interactivity_preference: learningPathInDTO.interactivityPreference,
        gamification_enabled: learningPathInDTO.gamificationEnabled,
      })
      .returning();

    return this.parseLearningPathToDTO(newLearningPath[0]);
  }

  public async updateLearningPath(
    userId: string,
    learningPathUpdateDTO: Partial<LearningPathInDTO>
  ): Promise<LearningPathOutDTO> {
    if (Object.keys(learningPathUpdateDTO).length === 0) {
      throw new Error('No fields to update provided');
    }

    const updateData: Record<string, unknown> = {};

    if (learningPathUpdateDTO.primaryStyle !== undefined) {
      updateData.primary_style = learningPathUpdateDTO.primaryStyle;
    }
    if (learningPathUpdateDTO.secondaryStyle !== undefined) {
      updateData.secondary_style = learningPathUpdateDTO.secondaryStyle;
    }
    if (learningPathUpdateDTO.pacePreference !== undefined) {
      updateData.pace_preference = learningPathUpdateDTO.pacePreference;
    }
    if (learningPathUpdateDTO.interactivityPreference !== undefined) {
      updateData.interactivity_preference = learningPathUpdateDTO.interactivityPreference;
    }
    if (learningPathUpdateDTO.gamificationEnabled !== undefined) {
      updateData.gamification_enabled = learningPathUpdateDTO.gamificationEnabled;
    }

    const updatedLearningPath = await this.client
      .update(user_learning_profile)
      .set(updateData)
      .where(eq(user_learning_profile.user_id, userId))
      .returning();

    if (updatedLearningPath.length === 0) {
      throw new Error(`Learning path for user with id ${userId} not found`);
    }

    return this.parseLearningPathToDTO(updatedLearningPath[0]);
  }
}

type LearningPathQueryResult = typeof user_learning_profile.$inferSelect;
