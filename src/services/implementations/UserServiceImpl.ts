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
import type { LearningPathsRepository, UsersRepository } from '../../repositories/index.js';
import type UserService from '../interfaces/UserService.js';

export default class UserServiceImpl implements UserService {
  private readonly userRepository: UsersRepository;
  private readonly learningPathsRepository: LearningPathsRepository;

  constructor(userRepository: UsersRepository, learningPathsRepository: LearningPathsRepository) {
    this.userRepository = userRepository;
    this.learningPathsRepository = learningPathsRepository;
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
    return this.userRepository.getUsers(page, size, filters, sort, order, lightDTO ?? true);
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
  async postUser(userDTO: UserInDTO): Promise<UserOutDTO> {
    return this.userRepository.postUser(userDTO);
  }
  async updateUser(userId: string, userInDTO: Partial<UserUpdateDTO>): Promise<UserOutDTO> {
    return this.userRepository.updateUser(userId, userInDTO);
  }
  async deleteUser(userId: string): Promise<void> {
    return this.userRepository.deleteUser(userId);
  }
  async getUserLearningPath(userId: string): Promise<LearningPathOutDTO> {
    return this.learningPathsRepository.getUserLearningPath(userId);
  }
  async postUserLearningPath(
    userId: string,
    learningPathInDTO: LearningPathInDTO
  ): Promise<LearningPathOutDTO> {
    return this.learningPathsRepository.postUserLearningPath(userId, learningPathInDTO);
  }
  async updateLearningPath(
    userId: string,
    learningPathUpdateDTO: Partial<LearningPathInDTO>
  ): Promise<LearningPathOutDTO> {
    return this.learningPathsRepository.updateLearningPath(userId, learningPathUpdateDTO);
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
