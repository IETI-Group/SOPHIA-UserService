import type LinkedAccountInDTO from './LinkedAccountInDTO.js';

export default interface LinkedAccountOutDTO extends LinkedAccountInDTO {
  idLinkedAccount: string;
  linkedAt: Date;
  emailVerified: boolean;
}
