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
  UserOutDTO,
  UserUpdateDTO,
} from '../../models/index.js';

export default interface UserService {
  getUsers(
    page: number,
    size: number,
    sort: string,
    order: 'asc' | 'desc',
    filters: FiltersUser
  ): Promise<PaginatedUsers>;
  getUserById(userId: string, lightDTO?: boolean): Promise<UserOutDTO>;
  getUserByEmail(email: string, lightDTO?: boolean): Promise<UserOutDTO>;
  postUser(userDTO: UserUpdateDTO): Promise<UserOutDTO>;
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
    showInstructors?: boolean,
    showCourses?: boolean
  ): Promise<PaginatedReviews>;
  postReview(reviewIn: ReviewInDTO): Promise<ReviewOutDTO>;
  updateReview(reviewId: string, reviewInstructor: Partial<ReviewInDTO>): Promise<ReviewOutDTO>;
  deleteReview(reviewId: string): Promise<void>;
  getLinkedAccounts(userId: string, page: number, size: number): Promise<PaginatedLinkedAccounts>;
  getLinkedAccount(accountId: string): Promise<LinkedAccountOutDTO>;
  postLinkedAccount(linkedAccountIn: LinkedAccountInDTO): Promise<LinkedAccountOutDTO>;
  updateLinkedAccount(
    accountId: string,
    linkedAccountUpdate: Partial<LinkedAccountInDTO>
  ): Promise<LinkedAccountOutDTO>;
  deleteLinkedAccount(accountId: string): Promise<void>;
}
