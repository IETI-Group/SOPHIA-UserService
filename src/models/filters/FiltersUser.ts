export default class FiltersUser {
  private firstName: string | null;
  private lastName: string | null;
  private birthDateFrom: Date | null;
  private birthDateTo: Date | null;

  constructor(
    firstName?: string | null,
    lastName?: string | null,
    birthDateFrom?: Date | null,
    birthDateTo?: Date | null
  ) {
    this.firstName = firstName || null;
    this.lastName = lastName || null;
    this.birthDateFrom = birthDateFrom || null;
    this.birthDateTo = birthDateTo || null;
  }

  // Getters
  public getFirstName(): string | null {
    return this.firstName;
  }

  public getLastName(): string | null {
    return this.lastName;
  }

  public getBirthDateFrom(): Date | null {
    return this.birthDateFrom;
  }

  public getBirthDateTo(): Date | null {
    return this.birthDateTo;
  }

  // Setters
  public setFirstName(firstName: string | null): void {
    this.firstName = firstName;
  }

  public setLastName(lastName: string | null): void {
    this.lastName = lastName;
  }

  public setBirthDateFrom(birthDateFrom: Date | null): void {
    this.birthDateFrom = birthDateFrom;
  }

  public setBirthDateTo(birthDateTo: Date | null): void {
    this.birthDateTo = birthDateTo;
  }
}
