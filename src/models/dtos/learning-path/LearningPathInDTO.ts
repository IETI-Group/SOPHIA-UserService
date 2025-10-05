import type { LEARNING_STYLES, PACE_PREFERENCE } from '../../../utils/types.js';
export default interface LearningPathInDTO {
  primaryStyle: LEARNING_STYLES;
  secondaryStyle: LEARNING_STYLES;
  pacePreference: PACE_PREFERENCE;
  interactivityPreference: number;
  gamificationEnabled: boolean;
}
