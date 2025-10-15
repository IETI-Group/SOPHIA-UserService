import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { DBDrizzleProvider } from '../../src/db/index.js';
import type { LearningPathInDTO } from '../../src/models/index.js';
import { LearningPathsRepositoryPostgreSQL } from '../../src/repositories/postgresql/LearningPathsRepositoryPostgreSQL.js';
import { LEARNING_STYLES, PACE_PREFERENCE } from '../../src/utils/types.js';

describe('Learning Paths Repository', () => {
  const drizzleClient = mockDeep<DBDrizzleProvider>();
  const repository = new LearningPathsRepositoryPostgreSQL(drizzleClient);

  beforeEach(() => {
    mockReset(drizzleClient);
  });

  describe('getUserLearningPath', () => {
    it('Should return a learning path by user ID', async () => {
      const userId = '123';
      const learningPathMockData = {
        id_learning_profile: 'lp-123',
        user_id: userId,
        primary_style: LEARNING_STYLES.VISUAL,
        secondary_style: LEARNING_STYLES.AUDITORY,
        pace_preference: PACE_PREFERENCE.NORMAL,
        interactivity_preference: 5,
        gamification_enabled: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      const whereMock = vi.fn().mockResolvedValue([learningPathMockData]);
      const fromMock = {
        where: whereMock,
      };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      const result = await repository.getUserLearningPath(userId);

      expect(result.userId).toBe(userId);
      expect(result.id).toBe('lp-123');
      expect(result.primaryStyle).toBe(LEARNING_STYLES.VISUAL);
      expect(result.secondaryStyle).toBe(LEARNING_STYLES.AUDITORY);
      expect(result.pacePreference).toBe(PACE_PREFERENCE.NORMAL);
      expect(result.interactivityPreference).toBe(5);
      expect(result.gamificationEnabled).toBe(true);
      expect(result.createdAt).toEqual(new Date('2024-01-01'));
      expect(result.updatedAt).toEqual(new Date('2024-01-02'));
    });

    it('Should throw error if learning path not found', async () => {
      const userId = 'non-existent-id';

      const whereMock = vi.fn().mockResolvedValue([]);
      const fromMock = {
        where: whereMock,
      };

      drizzleClient.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue(fromMock),
      } as unknown as ReturnType<typeof drizzleClient.select>);

      await expect(repository.getUserLearningPath(userId)).rejects.toThrow();
    });
  });

  describe('postUserLearningPath', () => {
    it('Should create a new learning path for a user', async () => {
      const userId = '123';
      const learningPathInDTO: LearningPathInDTO = {
        primaryStyle: LEARNING_STYLES.VISUAL,
        secondaryStyle: LEARNING_STYLES.AUDITORY,
        pacePreference: PACE_PREFERENCE.FAST,
        interactivityPreference: 7,
        gamificationEnabled: true,
      };

      const createdLearningPath = {
        id_learning_profile: 'lp-new-123',
        user_id: userId,
        primary_style: LEARNING_STYLES.VISUAL,
        secondary_style: LEARNING_STYLES.AUDITORY,
        pace_preference: PACE_PREFERENCE.FAST,
        interactivity_preference: 7,
        gamification_enabled: true,
        created_at: new Date('2024-01-01'),
        updated_at: null,
      };

      const returningMock = vi.fn().mockResolvedValue([createdLearningPath]);
      const valuesMock = {
        returning: returningMock,
      };
      const insertMock = {
        values: vi.fn().mockReturnValue(valuesMock),
      };

      drizzleClient.insert.mockReturnValueOnce(
        insertMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      const result = await repository.postUserLearningPath(userId, learningPathInDTO);

      expect(result.userId).toBe(userId);
      expect(result.id).toBe('lp-new-123');
      expect(result.primaryStyle).toBe(LEARNING_STYLES.VISUAL);
      expect(result.secondaryStyle).toBe(LEARNING_STYLES.AUDITORY);
      expect(result.pacePreference).toBe(PACE_PREFERENCE.FAST);
      expect(result.interactivityPreference).toBe(7);
      expect(result.gamificationEnabled).toBe(true);
      expect(result.createdAt).toEqual(new Date('2024-01-01'));
    });

    it('Should throw error if user already has a learning path', async () => {
      const userId = '123';
      const learningPathInDTO: LearningPathInDTO = {
        primaryStyle: LEARNING_STYLES.KINESTHETIC,
        secondaryStyle: LEARNING_STYLES.READING_WRITING,
        pacePreference: PACE_PREFERENCE.SLOW,
        interactivityPreference: 3,
        gamificationEnabled: false,
      };

      const returningMock = vi.fn().mockRejectedValue(new Error('duplicate key value'));
      const valuesMock = {
        returning: returningMock,
      };
      const insertMock = {
        values: vi.fn().mockReturnValue(valuesMock),
      };

      drizzleClient.insert.mockReturnValueOnce(
        insertMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      await expect(repository.postUserLearningPath(userId, learningPathInDTO)).rejects.toThrow();
    });

    it('Should create learning path without secondary style', async () => {
      const userId = '123';
      const learningPathInDTO: LearningPathInDTO = {
        primaryStyle: LEARNING_STYLES.VISUAL,
        secondaryStyle: LEARNING_STYLES.AUDITORY,
        pacePreference: PACE_PREFERENCE.NORMAL,
        interactivityPreference: 5,
        gamificationEnabled: false,
      };

      const createdLearningPath = {
        id_learning_profile: 'lp-new-456',
        user_id: userId,
        primary_style: LEARNING_STYLES.VISUAL,
        secondary_style: LEARNING_STYLES.AUDITORY,
        pace_preference: PACE_PREFERENCE.NORMAL,
        interactivity_preference: 5,
        gamification_enabled: false,
        created_at: new Date('2024-01-01'),
        updated_at: null,
      };

      const returningMock = vi.fn().mockResolvedValue([createdLearningPath]);
      const valuesMock = {
        returning: returningMock,
      };
      const insertMock = {
        values: vi.fn().mockReturnValue(valuesMock),
      };

      drizzleClient.insert.mockReturnValueOnce(
        insertMock as unknown as ReturnType<typeof drizzleClient.insert>
      );

      const result = await repository.postUserLearningPath(userId, learningPathInDTO);

      expect(result.userId).toBe(userId);
      expect(result.primaryStyle).toBe(LEARNING_STYLES.VISUAL);
      expect(result.secondaryStyle).toBe(LEARNING_STYLES.AUDITORY);
      expect(result.gamificationEnabled).toBe(false);
    });
  });

  describe('updateLearningPath', () => {
    it('Should update an existing learning path', async () => {
      const userId = '123';
      const learningPathUpdateDTO: Partial<LearningPathInDTO> = {
        primaryStyle: LEARNING_STYLES.KINESTHETIC,
        pacePreference: PACE_PREFERENCE.FAST,
      };

      const updatedLearningPath = {
        id_learning_profile: 'lp-123',
        user_id: userId,
        primary_style: LEARNING_STYLES.KINESTHETIC,
        secondary_style: LEARNING_STYLES.AUDITORY,
        pace_preference: PACE_PREFERENCE.FAST,
        interactivity_preference: 5,
        gamification_enabled: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-10'),
      };

      const returningMock = vi.fn().mockResolvedValue([updatedLearningPath]);
      const whereMock = {
        returning: returningMock,
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };
      const updateMock = {
        set: vi.fn().mockReturnValue(setMock),
      };

      drizzleClient.update.mockReturnValueOnce(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      const result = await repository.updateLearningPath(userId, learningPathUpdateDTO);

      expect(result.userId).toBe(userId);
      expect(result.primaryStyle).toBe(LEARNING_STYLES.KINESTHETIC);
      expect(result.pacePreference).toBe(PACE_PREFERENCE.FAST);
      expect(result.updatedAt).toEqual(new Date('2024-01-10'));
    });

    it('Should update only specific fields', async () => {
      const userId = '123';
      const learningPathUpdateDTO: Partial<LearningPathInDTO> = {
        gamificationEnabled: false,
      };

      const updatedLearningPath = {
        id_learning_profile: 'lp-123',
        user_id: userId,
        primary_style: LEARNING_STYLES.VISUAL,
        secondary_style: LEARNING_STYLES.AUDITORY,
        pace_preference: PACE_PREFERENCE.NORMAL,
        interactivity_preference: 5,
        gamification_enabled: false,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-10'),
      };

      const returningMock = vi.fn().mockResolvedValue([updatedLearningPath]);
      const whereMock = {
        returning: returningMock,
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };
      const updateMock = {
        set: vi.fn().mockReturnValue(setMock),
      };

      drizzleClient.update.mockReturnValueOnce(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      const result = await repository.updateLearningPath(userId, learningPathUpdateDTO);

      expect(result.gamificationEnabled).toBe(false);
      expect(result.primaryStyle).toBe(LEARNING_STYLES.VISUAL);
    });

    it('Should throw error if learning path not found', async () => {
      const userId = 'non-existent-id';
      const learningPathUpdateDTO: Partial<LearningPathInDTO> = {
        primaryStyle: LEARNING_STYLES.VISUAL,
      };

      const returningMock = vi.fn().mockResolvedValue([]);
      const whereMock = {
        returning: returningMock,
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };
      const updateMock = {
        set: vi.fn().mockReturnValue(setMock),
      };

      drizzleClient.update.mockReturnValueOnce(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      await expect(repository.updateLearningPath(userId, learningPathUpdateDTO)).rejects.toThrow();
    });

    it('Should throw error if no fields to update are provided', async () => {
      const userId = '123';
      const learningPathUpdateDTO: Partial<LearningPathInDTO> = {};

      await expect(repository.updateLearningPath(userId, learningPathUpdateDTO)).rejects.toThrow();
    });

    it('Should update interactivity preference', async () => {
      const userId = '123';
      const learningPathUpdateDTO: Partial<LearningPathInDTO> = {
        interactivityPreference: 9,
      };

      const updatedLearningPath = {
        id_learning_profile: 'lp-123',
        user_id: userId,
        primary_style: LEARNING_STYLES.VISUAL,
        secondary_style: LEARNING_STYLES.AUDITORY,
        pace_preference: PACE_PREFERENCE.NORMAL,
        interactivity_preference: 9,
        gamification_enabled: true,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-10'),
      };

      const returningMock = vi.fn().mockResolvedValue([updatedLearningPath]);
      const whereMock = {
        returning: returningMock,
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };
      const updateMock = {
        set: vi.fn().mockReturnValue(setMock),
      };

      drizzleClient.update.mockReturnValueOnce(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      const result = await repository.updateLearningPath(userId, learningPathUpdateDTO);

      expect(result.interactivityPreference).toBe(9);
    });

    it('Should update all fields at once', async () => {
      const userId = '123';
      const learningPathUpdateDTO: Partial<LearningPathInDTO> = {
        primaryStyle: LEARNING_STYLES.COLLABORATIVE,
        secondaryStyle: LEARNING_STYLES.PROBLEM_SOLVING,
        pacePreference: PACE_PREFERENCE.SLOW,
        interactivityPreference: 8,
        gamificationEnabled: false,
      };

      const updatedLearningPath = {
        id_learning_profile: 'lp-123',
        user_id: userId,
        primary_style: LEARNING_STYLES.COLLABORATIVE,
        secondary_style: LEARNING_STYLES.PROBLEM_SOLVING,
        pace_preference: PACE_PREFERENCE.SLOW,
        interactivity_preference: 8,
        gamification_enabled: false,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-10'),
      };

      const returningMock = vi.fn().mockResolvedValue([updatedLearningPath]);
      const whereMock = {
        returning: returningMock,
      };
      const setMock = {
        where: vi.fn().mockReturnValue(whereMock),
      };
      const updateMock = {
        set: vi.fn().mockReturnValue(setMock),
      };

      drizzleClient.update.mockReturnValueOnce(
        updateMock as unknown as ReturnType<typeof drizzleClient.update>
      );

      const result = await repository.updateLearningPath(userId, learningPathUpdateDTO);

      expect(result.primaryStyle).toBe(LEARNING_STYLES.COLLABORATIVE);
      expect(result.secondaryStyle).toBe(LEARNING_STYLES.PROBLEM_SOLVING);
      expect(result.pacePreference).toBe(PACE_PREFERENCE.SLOW);
      expect(result.interactivityPreference).toBe(8);
      expect(result.gamificationEnabled).toBe(false);
    });
  });
});
