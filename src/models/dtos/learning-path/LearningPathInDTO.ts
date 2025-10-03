import type { LEARNING_STYLES, PACE_PREFERENCE } from '../../../utils/types.js';
export default class LearningPathInDTO {
  protected primaryStyle: LEARNING_STYLES;
  protected secondaryStyle: LEARNING_STYLES;
  protected pacePreference: PACE_PREFERENCE;
  protected interactivityPreference: number;
  protected gamificationEnabled: boolean;

  constructor(
    primaryStyle: LEARNING_STYLES,
    secondaryStyle: LEARNING_STYLES,
    pacePreference: PACE_PREFERENCE,
    interactivityPreference: number,
    gamificationEnabled: boolean
  ) {
    this.primaryStyle = primaryStyle;
    this.secondaryStyle = secondaryStyle;
    this.pacePreference = pacePreference;
    this.interactivityPreference = interactivityPreference;
    this.gamificationEnabled = gamificationEnabled;
  }

  public getPrimaryStyle(): LEARNING_STYLES {
    return this.primaryStyle;
  }

  public setPrimaryStyle(value: LEARNING_STYLES): void {
    this.primaryStyle = value;
  }

  public getSecondaryStyle(): LEARNING_STYLES {
    return this.secondaryStyle;
  }

  public setSecondaryStyle(value: LEARNING_STYLES): void {
    this.secondaryStyle = value;
  }

  public getPacePreference(): PACE_PREFERENCE {
    return this.pacePreference;
  }

  public setPacePreference(value: PACE_PREFERENCE): void {
    this.pacePreference = value;
  }

  public getInteractivityPreference(): number {
    return this.interactivityPreference;
  }

  public setInteractivityPreference(value: number): void {
    this.interactivityPreference = value;
  }

  public isGamificationEnabled(): boolean {
    return this.gamificationEnabled;
  }

  public setGamificationEnabled(value: boolean): void {
    this.gamificationEnabled = value;
  }
}
