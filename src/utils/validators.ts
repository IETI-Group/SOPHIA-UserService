import type { Request } from 'express';
import { body, param, query, type ValidationChain } from 'express-validator';
import type { UsersQuery } from '../models/index.js';
import { APP_CONFIG } from './constants.js';

export const validateUsersQuery = (req: Request): UsersQuery => {
  const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : 1;
  const size = req.query.size
    ? Number.parseInt(req.query.size as string, 10)
    : APP_CONFIG.DEFAULT_PAGE_SIZE;
  const sort = req.query.sort as string;
  const order = (req.query.order as 'asc' | 'desc') || APP_CONFIG.DEFAULT_SORT_ORDER;
  const firstName = req.query.firstName as string;
  const lastName = req.query.lastName as string;
  const birthDayFrom = new Date(req.query.birthDayFrom as string);
  const birthDayTo = new Date(req.query.birthDayTo as string);
  return { page, size, sort, order, firstName, lastName, birthDayFrom, birthDayTo };
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

export const paginationParams: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('size')
    .optional()
    .optional()
    .isInt({ min: 1, max: APP_CONFIG.MAX_PAGE_SIZE })
    .withMessage('Size must be a positive integer'),
  query('sort').optional().isString().withMessage('Sort must be a string'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be either asc or desc'),
];

export const stringParam = (
  pathVariable: string = 'id',
  message: string,
  optional: boolean = false
): ValidationChain => {
  return param(pathVariable).isString().withMessage(message).optional(optional);
};

export const booleanQuery = (
  queryName: string,
  message: string,
  optional: boolean = false
): ValidationChain => {
  return query(queryName).isBoolean().withMessage(message).optional(optional);
};

export const batchUsers: ValidationChain = body('users')
  .isArray({ min: 1, max: APP_CONFIG.MAX_BATCH_USERS })
  .withMessage('Users must be a non-empty array');
