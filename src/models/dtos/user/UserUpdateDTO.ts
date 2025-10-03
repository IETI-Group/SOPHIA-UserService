import type { ROLE } from '../../../utils/types.js';
import UserOutDTO from './UserOutDTO.js';

export default class UserUpdateDTO extends UserOutDTO {
  protected email: string;
  protected firstName: string;
  protected lastName: string;
  protected birthDate: Date;
  protected bio: string;

  constructor(
    id: string,
    role: ROLE,
    email: string,
    firstName: string,
    lastName: string,
    birthDate: Date,
    bio: string
  ) {
    super(id, role);
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthDate = birthDate;
    this.bio = bio;
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

  public getBio(): string {
    return this.bio;
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

  public setBio(bio: string): void {
    this.bio = bio;
  }
}
