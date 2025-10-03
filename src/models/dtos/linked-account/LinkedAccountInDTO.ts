export default class LinkedAccountInDTO {
  protected userId: string;
  protected provider: string;
  protected issuer: string;
  protected idExternal: string;
  protected email: string;
  protected isPrimary: boolean;

  constructor(
    userId: string,
    provider: string,
    issuer: string,
    idExternal: string,
    email: string,
    isPrimary: boolean
  ) {
    this.userId = userId;
    this.provider = provider;
    this.issuer = issuer;
    this.idExternal = idExternal;
    this.email = email;
    this.isPrimary = isPrimary;
  }

  public getUserId(): string {
    return this.userId;
  }

  public setUserId(value: string): void {
    this.userId = value;
  }

  public getProvider(): string {
    return this.provider;
  }

  public setProvider(value: string): void {
    this.provider = value;
  }

  public getIssuer(): string {
    return this.issuer;
  }

  public setIssuer(value: string): void {
    this.issuer = value;
  }

  public getIdExternal(): string {
    return this.idExternal;
  }

  public setIdExternal(value: string): void {
    this.idExternal = value;
  }

  public getEmail(): string {
    return this.email;
  }

  public setEmail(value: string): void {
    this.email = value;
  }

  public isPrimaryAccount(): boolean {
    return this.isPrimary;
  }

  public setPrimaryAccount(value: boolean): void {
    this.isPrimary = value;
  }
}
