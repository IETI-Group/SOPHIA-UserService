import type { UserOutDTO } from '../user/UserOutDTO.js';

interface SignUpOutDTO {
  user: UserOutDTO;
  cognitoSub: string;
  message: string;
  emailVerificationRequired: boolean;
}

export type { SignUpOutDTO };
export default SignUpOutDTO;
