import type { Request } from 'express';
import type {
  ApiRequestQuery,
  ApiResponse,
  LearningPathInDTO,
  LinkedAccountInDTO,
  ReviewInDTO,
  UserInDTO,
  UsersQuery,
  UserUpdateDTO,
} from '../models/index.js';
import { APP_CONFIG } from './constants.js';
import type { REVIEW_DISCRIMINANT } from './types.js';

const getLearningPathInDTO = (req: Request) => {
  return {
    primaryStyle: req.body.primaryStyle,
    secondaryStyle: req.body.secondaryStyle,
    pacePreference: req.body.pacePreference,
    interactivityPreference: req.body.interactivityPreference,
    gamificationEnabled: req.body.gamificationEnabled,
  };
};

const getLinkedAccountInDTO = (userId: string, req: Request): LinkedAccountInDTO => {
  return {
    userId,
    provider: req.body.provider,
    issuer: req.body.issuer,
    idExternal: req.body.idExternal,
    email: req.body.email,
    isPrimary: req.body.isPrimary,
  };
};

export const parseApiResponse = <T>(data: T, message = 'Request successful'): ApiResponse<T> => ({
  data,
  message,
  success: true,
  timestamp: new Date().toISOString(),
});

export const parseUsersQuery = (req: Request): UsersQuery => {
  const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : 1;
  const size = req.query.size
    ? Number.parseInt(req.query.size as string, 10)
    : APP_CONFIG.DEFAULT_PAGE_SIZE;
  const sort = req.query.sort as string;
  const order = (req.query.order as 'asc' | 'desc') || APP_CONFIG.DEFAULT_SORT_ORDER;
  const firstName = req.query.firstName as string;
  const lastName = req.query.lastName as string;
  const lightDTO = req.query.light_dto ? req.query.light_dto === 'true' : undefined;

  // Validar fechas
  const birthDayFrom = req.query.birthDayFrom
    ? new Date(req.query.birthDayFrom as string)
    : undefined;
  const birthDayTo = req.query.birthDayTo ? new Date(req.query.birthDayTo as string) : undefined;

  if (birthDayFrom && Number.isNaN(birthDayFrom.getTime())) {
    throw new Error('Invalid birthDayFrom date format');
  }
  if (birthDayTo && Number.isNaN(birthDayTo.getTime())) {
    throw new Error('Invalid birthDayTo date format');
  }
  if (birthDayFrom && birthDayTo && birthDayFrom > birthDayTo) {
    throw new Error('birthDayFrom must be before birthDayTo');
  }

  return { page, size, sort, order, lightDTO, firstName, lastName, birthDayFrom, birthDayTo };
};

export const parsePaginationQuery = (req: Request): ApiRequestQuery => {
  const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : 1;
  const size = req.query.size
    ? Number.parseInt(req.query.size as string, 10)
    : APP_CONFIG.DEFAULT_PAGE_SIZE;
  const sort = req.query.sort ? (req.query.sort as string) : undefined;
  const order = (req.query.order as 'asc' | 'desc') || APP_CONFIG.DEFAULT_SORT_ORDER;
  return { page, size, sort, order };
};

export const parseUserInBody = (req: Request): UserInDTO => {
  return {
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    birthDate: new Date(req.body.birthDate),
  };
};

export const parseLinkedAccountInBody = (userId: string, req: Request): LinkedAccountInDTO => {
  return getLinkedAccountInDTO(userId, req);
};

export const parseLinkedAccountUpdateInBody = (
  userId: string,
  req: Request
): Partial<LinkedAccountInDTO> => {
  return getLinkedAccountInDTO(userId, req);
};

export const parseUserUpdateInBody = (req: Request): Partial<UserUpdateDTO> => {
  const userUpdate: Partial<UserUpdateDTO> = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    birthDate: req.body.birthDate ? new Date(req.body.birthDate) : undefined,
  } as Partial<UserUpdateDTO>;
  return userUpdate;
};

export const parseLearningPathInBody = (req: Request): LearningPathInDTO => {
  return getLearningPathInDTO(req);
};

export const parseLearningPathUpdateInBody = (req: Request): Partial<LearningPathInDTO> => {
  return getLearningPathInDTO(req);
};

export const parserReviewInQuery = (
  req: Request
): { showInstructors?: boolean; showCourses?: boolean; reviewedId?: string } => {
  const showInstructors = req.query.showInstructors
    ? req.query.showInstructors === 'true'
    : undefined;
  const showCourses = req.query.showCourses ? req.query.showCourses === 'true' : undefined;
  const reviewedId = req.query.reviewedId ? (req.query.reviewedId as string) : undefined;
  return { showInstructors, showCourses, reviewedId };
};

export const parseReviewInDTO = (reviewerId: string, req: Request): ReviewInDTO => {
  const reviewedId = req.body.reviewedId as string;
  const rate = Number.parseInt(req.body.rate as string, 10);
  const comments = req.body.comments as string | undefined;
  const discriminant = req.body.discriminant as REVIEW_DISCRIMINANT;
  const recommended = req.body.recommended as boolean;
  return { reviewerId, reviewedId, rate, comments, discriminant, recommended };
};

export const parseReviewUpdateInDTO = (req: Request): Partial<ReviewInDTO> => {
  const rate = req.body.rate ? Number.parseInt(req.body.rate as string, 10) : undefined;
  const comments = req.body.comments as string | undefined;
  const discriminant = req.body.discriminant as REVIEW_DISCRIMINANT | undefined;
  const recommended = req.body.recommended as boolean | undefined;
  return { rate, comments, discriminant, recommended };
};
