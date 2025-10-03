import type { ROLE } from '../../../utils/types.js';

export default class UserOutDTO {
  protected userId: string;
  protected role: ROLE;

  constructor(userId: string, role: ROLE) {
    this.userId = userId;
    this.role = role;
  }

  public getUserId(): string {
    return this.userId;
  }
  public getRole(): ROLE {
    return this.role;
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  public setRole(role: ROLE): void {
    this.role = role;
  }
}
