import type { ROLE } from '../../../utils/types.js';

export default class UserInDTO {
  private email: string;
  private firstName: string;
  private lastName: string;
  private birthDate: Date;
  private role: ROLE;
  constructor(email: string, firstName: string, lastName: string, birthDate: Date, role: ROLE) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthDate = birthDate;
    this.role = role;
  }

  public getEmail(): string {
    return this.email;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public getBirthDate(): Date {
    return this.birthDate;
  }

  public getRole(): ROLE {
    return this.role;
  }

  public setEmail(email: string): void {
    this.email = email;
  }

  public setFirstName(firstName: string): void {
    this.firstName = firstName;
  }

  public setLastName(lastName: string): void {
    this.lastName = lastName;
  }

  public setBirthDate(birthDate: Date): void {
    this.birthDate = birthDate;
  }

  public setRole(role: ROLE): void {
    this.role = role;
  }
}
