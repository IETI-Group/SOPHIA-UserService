import type UserOutDTO from './UserOutDTO.js';

interface UserUpdateDTO extends UserOutDTO {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  bio: string;
}

export type { UserUpdateDTO };
export default UserUpdateDTO;
