export default class FiltersUser {
  public firstName: string | null;
  public lastName: string | null;
  public birthDateFrom: Date | null;
  public birthDateTo: Date | null;

  constructor(
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    birthDateFrom: Date | null | undefined,
    birthDateTo: Date | null | undefined
  ) {
    this.firstName = firstName || null;
    this.lastName = lastName || null;
    this.birthDateFrom = birthDateFrom || null;
    this.birthDateTo = birthDateTo || null;
  }
}
