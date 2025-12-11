import type { ROLE } from '../../../db/schema.js';

interface UserOutDTO {
  userId: string;
  role: ROLE;
  firstName: string;
  lastName: string;
}

export type { UserOutDTO };
export default UserOutDTO;
