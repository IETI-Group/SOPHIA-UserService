interface LinkedAccountInDTO {
  userId: string;
  provider: string;
  issuer: string;
  idExternal: string;
  email: string;
  isPrimary: boolean;
}

export type { LinkedAccountInDTO };
export default LinkedAccountInDTO;
