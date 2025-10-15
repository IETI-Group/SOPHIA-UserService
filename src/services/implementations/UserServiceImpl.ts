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
import type {
  LearningPathsRepository,
  ReviewsRepository,
  UsersRepository,
} from '../../repositories/index.js';
import type UserService from '../interfaces/UserService.js';

export default class UserServiceImpl implements UserService {
  private readonly userRepository: UsersRepository;
  private readonly learningPathsRepository: LearningPathsRepository;
  private readonly reviewsRepository: ReviewsRepository;

  constructor(
    userRepository: UsersRepository,
    learningPathsRepository: LearningPathsRepository,
    reviewsRepository: ReviewsRepository
  ) {
    this.userRepository = userRepository;
    this.learningPathsRepository = learningPathsRepository;
    this.reviewsRepository = reviewsRepository;
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
    reviewerId: string,
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    showInstructors?: boolean,
    showCourses?: boolean,
    reviewedId?: string
  ): Promise<PaginatedReviews> {
    return this.reviewsRepository.getUserReviews(
      reviewerId,
      page,
      size,
      sort,
      order,
      showInstructors,
      showCourses,
      reviewedId
    );
  }
  async postReview(reviewIn: ReviewInDTO): Promise<ReviewOutDTO> {
    return this.reviewsRepository.postReview(reviewIn);
  }
  async updateReview(
    _userId: string,
    reviewId: string,
    reviewedDTO: Partial<ReviewInDTO>
  ): Promise<ReviewOutDTO> {
    return this.reviewsRepository.updateReview(reviewId, reviewedDTO);
  }
  async deleteReview(_userId: string, reviewId: string): Promise<void> {
    return this.reviewsRepository.deleteReview(reviewId);
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
