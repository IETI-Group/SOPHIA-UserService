import type LinkedAccountInDTO from './LinkedAccountInDTO.js';

interface LinkedAccountOutDTO extends LinkedAccountInDTO {
  idLinkedAccount: string;
  linkedAt: Date;
  emailVerified: boolean;
}

export type { LinkedAccountOutDTO };
export default LinkedAccountOutDTO;
