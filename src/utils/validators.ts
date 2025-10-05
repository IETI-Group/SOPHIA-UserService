import type { Request } from 'express';
import { body, param, query, type ValidationChain } from 'express-validator';
import {
  type ApiRequestQuery,
  UserInDTO,
  type UsersQuery,
  type UserUpdateDTO,
} from '../models/index.js';
import { APP_CONFIG } from './constants.js';

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
  return new UserInDTO(
    req.body.firstName,
    req.body.lastName,
    req.body.email,
    new Date(req.body.birthDate)
  );
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

export const usersParams: ValidationChain[] = [
  query('firstName').optional().isString().withMessage('First name must be a string'),
  query('lastName').optional().isString().withMessage('Last name must be a string'),
  query('birthDayFrom')
    .optional()
    .isString()
    .withMessage('Birth day from must be a valid date in format YYYY-MM-DD'),
  query('birthDayTo')
    .optional()
    .isString()
    .withMessage('Birth day to must be a valid date in format YYYY-MM-DD'),
];

const VALID_SORT_FIELDS = ['firstName', 'lastName', 'email', 'birthDate', 'createdAt', 'updatedAt'];

export const paginationParams: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('size')
    .optional()
    .isInt({ min: 1, max: APP_CONFIG.MAX_PAGE_SIZE })
    .withMessage('Size must be a positive integer'),
  query('sort')
    .optional()
    .isString()
    .isIn(VALID_SORT_FIELDS)
    .withMessage(`Sort must be one of: ${VALID_SORT_FIELDS.join(', ')}`),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be either asc or desc'),
];

export const stringParam = (
  pathVariable: string = 'id',
  message: string,
  optional: boolean = false
): ValidationChain => {
  return param(pathVariable).isString().withMessage(message).optional(optional);
};

export const emailParam = (
  pathVariable: string = 'email',
  message: string = 'Invalid email format',
  optional: boolean = false
): ValidationChain => {
  return param(pathVariable).isEmail().withMessage(message).optional(optional);
};

export const booleanQuery = (
  queryName: string,
  message: string,
  optional: boolean = false
): ValidationChain => {
  return query(queryName).isBoolean().withMessage(message).optional(optional);
};

export const userInDTO = (partial = false): ValidationChain[] => {
  return [
    body('firstName')
      .isString()
      .notEmpty()
      .withMessage('First name is required and must be a string')
      .isLength({ max: 60 })
      .withMessage('First name must be at most 60 characters long'),
    body('lastName')
      .isString()
      .notEmpty()
      .withMessage('Last name is required and must be a string')
      .isLength({ max: 100 })
      .withMessage('Last name must be at most 100 characters long'),
    body('email').isEmail().isLength({ max: 254 }).withMessage('A valid email is required'),
    body('birthDate')
      .isISO8601()
      .toDate()
      .isBefore(new Date().toISOString().split('T')[0])
      .withMessage('Birth date must be a valid date in format YYYY-MM-DD'),
  ].map((validation) => (partial ? validation.optional() : validation));
};

export const batchUsers: ValidationChain[] = [
  body('users')
    .isArray({ min: 1, max: APP_CONFIG.MAX_BATCH_USERS })
    .withMessage('Users must be a non-empty array'),
  body('users.*').isString().notEmpty().withMessage('Each user ID must be a non-empty string'),
];
