import type {
  FiltersUser,
  LearningPathInDTO,
  LearningPathOutDTO,
  LinkedAccountInDTO,
  LinkedAccountOutDTO,
  PaginatedLinkedAccounts,
  PaginatedReviews,
  PaginatedUsers,
  ReviewInDTO,
  ReviewOutDTO,
  UserInDTO,
  UserOutDTO,
  UserUpdateDTO,
} from '../../models/index.js';
import type { UsersRepository } from '../../repositories/index.js';
import type UserService from '../interfaces/UserService.js';

export default class UserServiceImpl implements UserService {
  private readonly userRepository: UsersRepository;

  constructor(userRepository: UsersRepository) {
    this.userRepository = userRepository;
  }

  getUserByEmail(email: string, lightDTO: boolean): Promise<UserOutDTO> {
    return this.userRepository.getUserByEmail(email, lightDTO);
  }
  async getUsers(
    page: number,
    size: number,
    sort: string,
    order: 'asc' | 'desc',
    lightDTO: boolean | undefined,
    filters: FiltersUser
  ): Promise<PaginatedUsers> {
    return this.userRepository.getUsers(page, size, filters, sort, order, lightDTO ?? false);
  }
  async getUserById(userId: string, lightDTO: boolean): Promise<UserOutDTO> {
    return this.userRepository.getUserById(userId, lightDTO);
  }
  async getUsersByIds(
    userIds: string[],
    sort: string | undefined,
    order: 'asc' | 'desc',
    lightDTO?: boolean
  ): Promise<PaginatedUsers> {
    const users = await this.userRepository.getUsersByIds(userIds, lightDTO, sort, order);
    return users;
  }
  async postUser(_userDTO: UserInDTO): Promise<UserOutDTO> {
    throw new Error('Method not implemented.');
  }
  async updateUser(_userId: string, _userInDTO: Partial<UserUpdateDTO>): Promise<UserOutDTO> {
    throw new Error('Method not implemented.');
  }
  async deleteUser(_userId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async getUserLearningPath(_userId: string): Promise<LearningPathOutDTO> {
    throw new Error('Method not implemented.');
  }
  async postUserLearningPath(
    _userId: string,
    _learningPathInDTO: LearningPathInDTO
  ): Promise<LearningPathOutDTO> {
    throw new Error('Method not implemented.');
  }
  async updateLearningPath(
    _userId: string,
    _learningPathUpdateDTO: Partial<LearningPathInDTO>
  ): Promise<LearningPathOutDTO> {
    throw new Error('Method not implemented.');
  }
  async getUserReviews(
    _reviewerId: string,
    _page: number,
    _size: number,
    _sort: string | undefined,
    _order: 'asc' | 'desc',
    _showInstructors?: boolean,
    _showCourses?: boolean,
    _reviewedId?: string
  ): Promise<PaginatedReviews> {
    throw new Error('Method not implemented.');
  }
  async postReview(_reviewIn: ReviewInDTO): Promise<ReviewOutDTO> {
    throw new Error('Method not implemented.');
  }
  async updateReview(
    _userId: string,
    _reviewId: string,
    _reviewedDTO: Partial<ReviewInDTO>
  ): Promise<ReviewOutDTO> {
    throw new Error('Method not implemented.');
  }
  async deleteReview(_userId: string, _reviewId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async getLinkedAccounts(
    _userId: string,
    _page: number,
    _size: number,
    _sort: string | undefined,
    _order: 'asc' | 'desc'
  ): Promise<PaginatedLinkedAccounts> {
    throw new Error('Method not implemented.');
  }
  async getLinkedAccount(_userId: string, _accountId: string): Promise<LinkedAccountOutDTO> {
    throw new Error('Method not implemented.');
  }
  async postLinkedAccount(
    _userId: string,
    _linkedAccountIn: LinkedAccountInDTO
  ): Promise<LinkedAccountOutDTO> {
    throw new Error('Method not implemented.');
  }
  async updateLinkedAccount(
    _userId: string,
    _accountId: string,
    _linkedAccountUpdate: Partial<LinkedAccountInDTO>
  ): Promise<LinkedAccountOutDTO> {
    throw new Error('Method not implemented.');
  }
  async deleteLinkedAccount(_userId: string, _accountId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
