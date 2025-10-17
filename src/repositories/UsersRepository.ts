import type {
  FiltersUser,
  PaginatedUsers,
  UserInDTO,
  UserOutDTO,
  UserUpdateDTO,
} from '../models/index.js';

export interface UsersRepository {
  getUsers(
    page: number,
    size: number,
    filters: FiltersUser,
    sort: string,
    order: string,
    ligthDTO: boolean
  ): Promise<PaginatedUsers>;

  getUsersByIds(
    ids: string[],
    lightDTO?: boolean,
    sort?: string,
    order?: 'asc' | 'desc'
  ): Promise<PaginatedUsers>;
  getUserById(userId: string, lightDTO?: boolean): Promise<UserOutDTO>;
  getUserByEmail(email: string, lightDTO?: boolean): Promise<UserOutDTO>;
  userExists(userId: string): Promise<boolean>;
  postUser(userDTO: UserInDTO): Promise<UserOutDTO>;
  updateUser(userId: string, userInDTO: Partial<UserUpdateDTO>): Promise<UserOutDTO>;
  deleteUser(userId: string): Promise<void>;
}
