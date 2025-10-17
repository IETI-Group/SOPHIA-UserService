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
  LinkedAccountsRepository,
  ReviewsRepository,
  UsersRepository,
} from '../../repositories/index.js';
import type UserService from '../interfaces/UserService.js';

export default class UserServiceImpl implements UserService {
  private readonly userRepository: UsersRepository;
  private readonly learningPathsRepository: LearningPathsRepository;
  private readonly reviewsRepository: ReviewsRepository;
  private readonly linkedAccountsRepository: LinkedAccountsRepository;

  constructor(
    userRepository: UsersRepository,
    learningPathsRepository: LearningPathsRepository,
    reviewsRepository: ReviewsRepository,
    linkedAccountsRepository: LinkedAccountsRepository
  ) {
    this.userRepository = userRepository;
    this.learningPathsRepository = learningPathsRepository;
    this.reviewsRepository = reviewsRepository;
    this.linkedAccountsRepository = linkedAccountsRepository;
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
  async getInstructorReviews(
    instructorId: string,
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc'
  ): Promise<PaginatedReviews> {
    return this.reviewsRepository.getInstructorReviews(instructorId, page, size, sort, order);
  }
  async getCourseReviews(
    courseId: string,
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc'
  ): Promise<PaginatedReviews> {
    return this.reviewsRepository.getCourseReviews(courseId, page, size, sort, order);
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
    userId: string,
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc'
  ): Promise<PaginatedLinkedAccounts> {
    return this.linkedAccountsRepository.getLinkedAccounts(userId, page, size, sort, order);
  }
  async getLinkedAccount(_userId: string, accountId: string): Promise<LinkedAccountOutDTO> {
    return this.linkedAccountsRepository.getLinkedAccount(accountId);
  }
  async postLinkedAccount(
    _userId: string,
    linkedAccountIn: LinkedAccountInDTO
  ): Promise<LinkedAccountOutDTO> {
    return this.linkedAccountsRepository.postLinkedAccount(linkedAccountIn);
  }
  async updateLinkedAccount(
    _userId: string,
    accountId: string,
    linkedAccountUpdate: Partial<LinkedAccountInDTO>
  ): Promise<LinkedAccountOutDTO> {
    return this.linkedAccountsRepository.updateLinkedAccount(accountId, linkedAccountUpdate);
  }
  async deleteLinkedAccount(_userId: string, accountId: string): Promise<void> {
    return this.linkedAccountsRepository.deleteLinkedAccount(accountId);
  }
}
