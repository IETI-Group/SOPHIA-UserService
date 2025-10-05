import type UserUpdateDTO from './UserUpdateDTO.js';
export default interface UserHeavyOutDTO extends UserUpdateDTO {
  createdAt: Date;
  updatedAt: Date;
}
