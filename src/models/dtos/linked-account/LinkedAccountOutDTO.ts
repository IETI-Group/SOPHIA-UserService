import LinkedAccountInDTO from './LinkedAccountInDTO.js';

export default class LinkedAccountOutDTO extends LinkedAccountInDTO {
  private idLinkedAccount: string;
  private linkedAt: Date;
  private emailVerified: boolean;

  constructor(
    userId: string,
    provider: string,
    issuer: string,
    idExternal: string,
    email: string,
    isPrimary: boolean,
    idLinkedAccount: string,
    linkedAt: Date,
    emailVerified: boolean
  ) {
    super(userId, provider, issuer, idExternal, email, isPrimary);
    this.idLinkedAccount = idLinkedAccount;
    this.linkedAt = linkedAt;
    this.emailVerified = emailVerified;
  }

  public getIdLinkedAccount(): string {
    return this.idLinkedAccount;
  }

  public getLinkedAt(): Date {
    return this.linkedAt;
  }

  public getEmailVerified(): boolean {
    return this.emailVerified;
  }

  public setIdLinkedAccount(value: string): void {
    this.idLinkedAccount = value;
  }

  public setLinkedAt(value: Date): void {
    this.linkedAt = value;
  }
  public setEmailVerified(value: boolean): void {
    this.emailVerified = value;
  }
}
