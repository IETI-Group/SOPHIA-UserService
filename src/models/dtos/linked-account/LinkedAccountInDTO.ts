export default interface LinkedAccountInDTO {
  userId: string;
  provider: string;
  issuer: string;
  idExternal: string;
  email: string;
  isPrimary: boolean;
}
