import type UserUpdateDTO from './UserUpdateDTO.js';

interface UserHeavyOutDTO extends UserUpdateDTO {
  createdAt: Date;
  updatedAt: Date | null;
}

export type { UserHeavyOutDTO };
export default UserHeavyOutDTO;
