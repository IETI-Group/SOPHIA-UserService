import type { ROLE } from '../../../db/schema.js';

interface UserOutDTO {
  userId: string;
  role: ROLE;
}

export type { UserOutDTO };
export default UserOutDTO;
