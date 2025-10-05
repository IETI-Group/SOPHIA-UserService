import type UserOutDTO from './UserOutDTO.js';

export default interface UserUpdateDTO extends UserOutDTO {
  email: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  bio: string;
}
