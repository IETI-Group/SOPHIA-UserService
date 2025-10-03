import type { REVIEW_DISCRIMINANT } from '../../../utils/types.js';
import ReviewInDTO from './ReviewInDTO.js';

export default class ReviewOutDTO extends ReviewInDTO {
  private id: string;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    rate: number,
    recommended: boolean,
    comments: string,
    discriminant: REVIEW_DISCRIMINANT
  ) {
    super(rate, recommended, comments, discriminant);
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

  public setUpdatedAt(value: Date): void {
    this.updatedAt = value;
  }

  public setId(value: string): void {
    this.id = value;
  }
  public setCreatedAt(value: Date): void {
    this.createdAt = value;
  }
}
