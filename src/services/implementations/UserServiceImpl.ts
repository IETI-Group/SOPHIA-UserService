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
import type UserService from '../interfaces/UserService.js';

export default class UserServiceImpl implements UserService {
  getUserByEmail(_email: string, _lightDTO: boolean): Promise<UserOutDTO> {
    throw new Error('Method not implemented.');
  }
  async getUsers(
    _page: number,
    _size: number,
    _sort: string,
    _order: 'asc' | 'desc',
    _filters: FiltersUser
  ): Promise<PaginatedUsers> {
    throw new Error('Method not implemented.');
  }
  async getUserById(_userId: string, _lightDTO: boolean): Promise<UserOutDTO> {
    throw new Error('Method not implemented.');
  }
  async postUser(_userDTO: UserUpdateDTO): Promise<UserOutDTO> {
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
    _showInstructors?: boolean,
    _showCourses?: boolean
  ): Promise<PaginatedReviews> {
    throw new Error('Method not implemented.');
  }
  async postReview(_reviewIn: ReviewInDTO): Promise<ReviewOutDTO> {
    throw new Error('Method not implemented.');
  }
  async updateReview(
    _reviewId: string,
    _reviewInstructor: Partial<ReviewInDTO>
  ): Promise<ReviewOutDTO> {
    throw new Error('Method not implemented.');
  }
  async deleteReview(_reviewId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async getLinkedAccounts(
    _userId: string,
    _page: number,
    _size: number
  ): Promise<PaginatedLinkedAccounts> {
    throw new Error('Method not implemented.');
  }
  async getLinkedAccount(_accountId: string): Promise<LinkedAccountOutDTO> {
    throw new Error('Method not implemented.');
  }
  async postLinkedAccount(_linkedAccountIn: LinkedAccountInDTO): Promise<LinkedAccountOutDTO> {
    throw new Error('Method not implemented.');
  }
  async updateLinkedAccount(
    _accountId: string,
    _linkedAccountUpdate: Partial<LinkedAccountInDTO>
  ): Promise<LinkedAccountOutDTO> {
    throw new Error('Method not implemented.');
  }
  async deleteLinkedAccount(_accountId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
