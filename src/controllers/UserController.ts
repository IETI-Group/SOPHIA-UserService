//import type { Request, Response, NextFunction } from 'express';

import type { Logger } from 'winston';
import {
  type ApiResponse,
  FiltersUser,
  type LearningPathInDTO,
  type LearningPathOutDTO,
  type LinkedAccountInDTO,
  type LinkedAccountOutDTO,
  type PaginatedLinkedAccounts,
  type PaginatedReviews,
  type PaginatedUsers,
  type ReviewInDTO,
  type ReviewOutDTO,
  type UserInDTO,
  type UserOutDTO,
  type UserUpdateDTO,
} from '../models/index.js';
import type { UserService } from '../services/index.js';
import { parseApiResponse } from '../utils/parsers.js';

export default class UserController {
  private userService: UserService;
  private logger: Logger;

  constructor(userService: UserService, logger: Logger) {
    this.userService = userService;
    this.logger = logger;
  }

  public async getUsers(
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    lightDto?: boolean,
    firstName?: string,
    lastName?: string,
    birthDayFrom?: Date,
    birthDayTo?: Date
  ): Promise<PaginatedUsers> {
    const filters = new FiltersUser(firstName, lastName, birthDayFrom, birthDayTo);
    const searchSort = sort || 'firstName';

    const response = await this.userService.getUsers(
      page,
      size,
      searchSort,
      order,
      lightDto,
      filters
    );
    return response;
  }
  public async getUserById(userId: string, lightDTO?: boolean): Promise<ApiResponse<UserOutDTO>> {
    const response = await this.userService.getUserById(userId, lightDTO);
    return parseApiResponse(response);
  }

  public async getUserByEmail(email: string, lightDTO?: boolean): Promise<ApiResponse<UserOutDTO>> {
    const response = await this.userService.getUserByEmail(email, lightDTO);
    return parseApiResponse(response);
  }

  public async postUser(userDTO: UserInDTO): Promise<ApiResponse<UserOutDTO>> {
    const response = await this.userService.postUser(userDTO);
    return parseApiResponse(response);
  }
  public async updateUser(
    userId: string,
    userInDTO: Partial<UserUpdateDTO>
  ): Promise<ApiResponse<UserOutDTO>> {
    const response = await this.userService.updateUser(userId, userInDTO);
    return parseApiResponse(response);
  }
  public async deleteUser(userId: string): Promise<ApiResponse<string>> {
    await this.userService.deleteUser(userId);
    return parseApiResponse(`User with id ${userId} deleted successfully`);
  }
  public async getUserLearningPath(userId: string): Promise<ApiResponse<LearningPathOutDTO>> {
    const response = await this.userService.getUserLearningPath(userId);
    return parseApiResponse(response);
  }
  public async postUserLearningPath(
    userId: string,
    learningPathInDTO: LearningPathInDTO
  ): Promise<ApiResponse<LearningPathOutDTO>> {
    const response = await this.userService.postUserLearningPath(userId, learningPathInDTO);
    return parseApiResponse(response);
  }
  public async updateLearningPath(
    userId: string,
    learningPathUpdateDTO: Partial<LearningPathInDTO>
  ): Promise<ApiResponse<LearningPathOutDTO>> {
    const response = await this.userService.updateLearningPath(userId, learningPathUpdateDTO);
    return parseApiResponse(response);
  }
  public async getUserReviews(
    reviewerId: string,
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    showInstructors?: boolean,
    showCourses?: boolean,
    reviewedId?: string
  ): Promise<PaginatedReviews> {
    const response = await this.userService.getUserReviews(
      reviewerId,
      page,
      size,
      sort,
      order,
      showInstructors,
      showCourses,
      reviewedId
    );
    return response;
  }
  public async getInstructorReviews(
    instructorId: string,
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc'
  ): Promise<PaginatedReviews> {
    const response = await this.userService.getInstructorReviews(
      instructorId,
      page,
      size,
      sort,
      order
    );
    return response;
  }
  public async getCourseReviews(
    courseId: string,
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc'
  ): Promise<PaginatedReviews> {
    const response = await this.userService.getCourseReviews(courseId, page, size, sort, order);
    return response;
  }
  public async postReview(reviewIn: ReviewInDTO): Promise<ApiResponse<ReviewOutDTO>> {
    const response = await this.userService.postReview(reviewIn);
    return parseApiResponse(response);
  }
  public async updateReview(
    userId: string,
    reviewId: string,
    reviewedDTO: Partial<ReviewInDTO>
  ): Promise<ApiResponse<ReviewOutDTO>> {
    const response = await this.userService.updateReview(userId, reviewId, reviewedDTO);
    return parseApiResponse(response);
  }
  public async deleteReview(userId: string, reviewId: string): Promise<ApiResponse<string>> {
    await this.userService.deleteReview(userId, reviewId);
    return parseApiResponse(`Review with id ${reviewId} deleted successfully`);
  }
  public async getLinkedAccounts(
    userId: string,
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc'
  ): Promise<PaginatedLinkedAccounts> {
    const response = await this.userService.getLinkedAccounts(userId, page, size, sort, order);
    return response;
  }
  public async getLinkedAccount(
    userId: string,
    accountId: string
  ): Promise<ApiResponse<LinkedAccountOutDTO>> {
    const response = await this.userService.getLinkedAccount(userId, accountId);
    return parseApiResponse(response);
  }
  public async postLinkedAccount(
    userId: string,
    linkedAccountIn: LinkedAccountInDTO
  ): Promise<ApiResponse<LinkedAccountOutDTO>> {
    const response = await this.userService.postLinkedAccount(userId, linkedAccountIn);
    return parseApiResponse(response);
  }
  public async updateLinkedAccount(
    userId: string,
    accountId: string,
    linkedAccountUpdate: Partial<LinkedAccountInDTO>
  ): Promise<ApiResponse<LinkedAccountOutDTO>> {
    const response = await this.userService.updateLinkedAccount(
      userId,
      accountId,
      linkedAccountUpdate
    );
    return parseApiResponse(response);
  }
  public async deleteLinkedAccount(
    userId: string,
    accountId: string
  ): Promise<ApiResponse<string>> {
    await this.userService.deleteLinkedAccount(userId, accountId);
    return parseApiResponse(`Linked account with id ${accountId} deleted successfully`);
  }

  public async getUsersByIds(
    userIds: string[],
    sort: string | undefined,
    order: 'asc' | 'desc',
    lightDTO?: boolean
  ): Promise<PaginatedUsers> {
    return this.userService.getUsersByIds(userIds, sort, order, lightDTO);
  }
}
