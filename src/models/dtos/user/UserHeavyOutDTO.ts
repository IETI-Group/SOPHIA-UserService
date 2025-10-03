import type { ROLE } from '../../../utils/types.js';
import UserUpdateDTO from './UserUpdateDTO.js';
export default class UserHeavyOutDTO extends UserUpdateDTO {
  private createdAt: Date;
  private updatedAt: Date;

  constructor(
    id: string,
    role: ROLE,
    email: string,
    firstName: string,
    lastName: string,
    birthDate: Date,
    bio: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, role, email, firstName, lastName, birthDate, bio);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public setCreatedAt(createdAt: Date): void {
    this.createdAt = createdAt;
  }

  public setUpdatedAt(updatedAt: Date): void {
    this.updatedAt = updatedAt;
  }
}
