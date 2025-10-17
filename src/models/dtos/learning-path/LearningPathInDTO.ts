import type { LEARNING_STYLES, PACE_PREFERENCE } from '../../../db/schema.js';

interface LearningPathInDTO {
  primaryStyle: LEARNING_STYLES;
  secondaryStyle: LEARNING_STYLES;
  pacePreference: PACE_PREFERENCE;
  interactivityPreference: number;
  gamificationEnabled: boolean;
}

export type { LearningPathInDTO };
export default LearningPathInDTO;
