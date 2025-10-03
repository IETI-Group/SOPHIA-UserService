import type { LEARNING_STYLES, PACE_PREFERENCE } from '../../../utils/types.js';
import LearningPathInDTO from './LearningPathInDTO.js';

export default class LearningPathOutDTO extends LearningPathInDTO {
  private id: string;
  private createdAt: Date;
  private updatedAt: Date;
  constructor(
    id: string,
    primaryStyle: LEARNING_STYLES,
    secondaryStyle: LEARNING_STYLES,
    pacePreference: PACE_PREFERENCE,
    interactivityPreference: number,
    gamificationEnabled: boolean,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(
      primaryStyle,
      secondaryStyle,
      pacePreference,
      interactivityPreference,
      gamificationEnabled
    );
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getId(): string {
    return this.id;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public setId(value: string): void {
    this.id = value;
  }
  public setCreatedAt(value: Date): void {
    this.createdAt = value;
  }
  public setUpdatedAt(value: Date): void {
    this.updatedAt = value;
  }
}
