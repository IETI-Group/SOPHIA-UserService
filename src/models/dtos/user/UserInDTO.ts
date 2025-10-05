export default class UserInDTO {
  public email: string;
  public firstName: string;
  public lastName: string;
  public birthDate: Date;
  constructor(email: string, firstName: string, lastName: string, birthDate: Date) {
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthDate = birthDate;
  }
}
