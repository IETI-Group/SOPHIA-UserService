import type { REVIEW_DISCRIMINANT } from '../../../utils/types.js';

export default class ReviewInDTO {
  protected rate: number;
  protected recommended: boolean;
  protected comments: string;
  protected discriminant: REVIEW_DISCRIMINANT;

  constructor(
    rate: number,
    recommended: boolean,
    comments: string,
    discriminant: REVIEW_DISCRIMINANT
  ) {
    this.rate = rate;
    this.recommended = recommended;
    this.comments = comments;
    this.discriminant = discriminant;
  }

  public getRate(): number {
    return this.rate;
  }

  public setRate(value: number): void {
    this.rate = value;
  }

  public isRecommended(): boolean {
    return this.recommended;
  }

  public setRecommended(value: boolean): void {
    this.recommended = value;
  }

  public getComments(): string {
    return this.comments;
  }

  public setComments(value: string): void {
    this.comments = value;
  }

  public getDiscriminant(): REVIEW_DISCRIMINANT {
    return this.discriminant;
  }

  public setDiscriminant(value: REVIEW_DISCRIMINANT): void {
    this.discriminant = value;
  }
}
