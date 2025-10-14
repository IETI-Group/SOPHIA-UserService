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

export default interface UserService {
  getUsers(
    page: number,
    size: number,
    sort: string,
    order: 'asc' | 'desc',
    lightDto: boolean | undefined,
    filters: FiltersUser
  ): Promise<PaginatedUsers>;
  getUserById(userId: string, lightDTO?: boolean): Promise<UserOutDTO>;
  getUserByEmail(email: string, lightDTO?: boolean): Promise<UserOutDTO>;
  getUsersByIds(
    userIds: string[],
    sort: string | undefined,
    order: 'asc' | 'desc',
    lightDTO?: boolean
  ): Promise<PaginatedUsers>;
  postUser(userDTO: UserInDTO): Promise<UserOutDTO>;
  updateUser(userId: string, userInDTO: Partial<UserUpdateDTO>): Promise<UserOutDTO>;
  deleteUser(userId: string): Promise<void>;
  getUserLearningPath(userId: string): Promise<LearningPathOutDTO>;
  postUserLearningPath(
    userId: string,
    learningPathInDTO: LearningPathInDTO
  ): Promise<LearningPathOutDTO>;
  updateLearningPath(
    userId: string,
    learningPathUpdateDTO: Partial<LearningPathInDTO>
  ): Promise<LearningPathOutDTO>;
  getUserReviews(
    reviewerId: string,
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    showInstructors?: boolean,
    showCourses?: boolean,
    reviewedUserId?: string
  ): Promise<PaginatedReviews>;
  postReview(reviewIn: ReviewInDTO): Promise<ReviewOutDTO>;
  updateReview(
    userId: string,
    reviewId: string,
    reviewedDTO: Partial<ReviewInDTO>
  ): Promise<ReviewOutDTO>;
  deleteReview(userId: string, reviewId: string): Promise<void>;
  getLinkedAccounts(
    userId: string,
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc'
  ): Promise<PaginatedLinkedAccounts>;
  getLinkedAccount(userId: string, accountId: string): Promise<LinkedAccountOutDTO>;
  postLinkedAccount(
    userId: string,
    linkedAccountIn: LinkedAccountInDTO
  ): Promise<LinkedAccountOutDTO>;
  updateLinkedAccount(
    userId: string,
    accountId: string,
    linkedAccountUpdate: Partial<LinkedAccountInDTO>
  ): Promise<LinkedAccountOutDTO>;
  deleteLinkedAccount(userId: string, accountId: string): Promise<void>;
}
