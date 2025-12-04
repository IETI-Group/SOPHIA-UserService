import { body, param, query, type ValidationChain } from 'express-validator';
import { APP_CONFIG } from './constants.js';
import { LEARNING_STYLES, PACE_PREFERENCE, REVIEW_DISCRIMINANT } from './types.js';

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

export const sortingParams: ValidationChain[] = [
  query('sort')
    .optional()
    .isString()
    .isIn(VALID_SORT_FIELDS)
    .withMessage(`Sort must be one of: ${VALID_SORT_FIELDS.join(', ')}`),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be either asc or desc'),
];

export const paginationParams: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('size')
    .optional()
    .isInt({ min: 1, max: APP_CONFIG.MAX_PAGE_SIZE })
    .withMessage('Size must be a positive integer'),
  ...sortingParams,
];

export const reviewsParams: ValidationChain[] = [
  query('showInstructors')
    .optional()
    .isBoolean()
    .withMessage('showInstructors must be a boolean value'),
  query('showCourses').optional().isBoolean().withMessage('showCourses must be a boolean value'),
  query('reviewedId').optional().isString().notEmpty().withMessage('reviewedId must be a string'),
];

export const batchUsers: ValidationChain[] = [
  body('users')
    .isArray({ min: 1, max: APP_CONFIG.MAX_BATCH_USERS })
    .withMessage('Users must be a non-empty array'),
  body('users.*').isString().notEmpty().withMessage('Each user ID must be a non-empty string'),
];

export const reviewBodyInDTO = (optional = false): ValidationChain[] => {
  return [
    body('reviewedId')
      .isString()
      .notEmpty()
      .withMessage('Reviewed ID is required and must be a string'),
    body('rate').isInt({ min: 1, max: 5 }).withMessage('Rate must be an integer between 1 and 5'),
    body('comments').isString().optional().withMessage('Comments must be a string'),
    body('discriminant')
      .isIn(Object.values(REVIEW_DISCRIMINANT))
      .withMessage(`Discriminant must be one of: ${Object.values(REVIEW_DISCRIMINANT).join(', ')}`),
    body('recommended').isBoolean().withMessage('Recommended must be a boolean value'),
  ].map((validation) => (optional ? validation.optional() : validation));
};

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

export const learningPathInDTO = (optional = false): ValidationChain[] => {
  return [
    body('primaryStyle')
      .isIn([LEARNING_STYLES.VISUAL, LEARNING_STYLES.AUDITORY, LEARNING_STYLES.KINESTHETIC])
      .notEmpty()
      .withMessage('Primary style is required and must be a string')
      .isLength({ max: 50 })
      .withMessage('Primary style must be at most 50 characters long'),
    body('secondaryStyle')
      .isIn([LEARNING_STYLES.VISUAL, LEARNING_STYLES.AUDITORY, LEARNING_STYLES.KINESTHETIC])
      .notEmpty()
      .withMessage('Secondary style is required and must be a string')
      .isLength({ max: 50 })
      .withMessage('Secondary style must be at most 50 characters long'),
    body('pacePreference')
      .isIn([PACE_PREFERENCE.SLOW, PACE_PREFERENCE.NORMAL, PACE_PREFERENCE.FAST])
      .notEmpty()
      .withMessage('Pace preference is required and must be a string')
      .isLength({ max: 50 })
      .withMessage('Pace preference must be at most 50 characters long'),
    body('interactivityPreference')
      .isNumeric()
      .notEmpty()
      .withMessage('Interactivity preference is required and must be a number'),
    body('gamificationEnabled')
      .isBoolean()
      .withMessage('Gamification enabled must be a boolean value'),
  ].map((validation) => (optional ? validation.optional() : validation));
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

export const linkedAccountInDTO = (optional = false): ValidationChain[] => {
  return [
    body('provider')
      .isString()
      .notEmpty()
      .withMessage('Provider is required and must be a string')
      .isLength({ min: 2, max: 100 }),
    body('issuer')
      .isString()
      .notEmpty()
      .withMessage('Issuer is required and must be a string')
      .isLength({ min: 2, max: 100 }),
    body('idExternal')
      .isString()
      .notEmpty()
      .withMessage('External ID is required and must be a string')
      .isLength({ max: 255 })
      .withMessage('External ID must be at most 255 characters long'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('isPrimary').isBoolean().withMessage('isPrimary is required and must be a boolean value'),
  ].map((validation) => (optional ? validation.optional() : validation));
};

// ============================================
// AUTH VALIDATORS
// ============================================

export const signUpInDTO: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('A valid email is required'),
  body('password')
    .isString()
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage('Password is required and must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  body('firstName')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('First name is required and must be a string')
    .isLength({ min: 2, max: 60 })
    .withMessage('First name must be between 2 and 60 characters long'),
  body('lastName')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Last name is required and must be a string')
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters long'),
  body('birthDate')
    .isString()
    .notEmpty()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Birth date must be a valid date in format YYYY-MM-DD')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      const minAge = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
      const maxAge = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());

      if (date > now) {
        throw new Error('Birth date cannot be in the future');
      }
      if (date > minAge) {
        throw new Error('User must be at least 13 years old');
      }
      if (date < maxAge) {
        throw new Error('Birth date is too far in the past');
      }
      return true;
    }),
];

export const loginInDTO: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('A valid email is required'),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

// ============================================
// ADMIN VALIDATORS
// ============================================

export const roleInDTO = (optional = false): ValidationChain[] => {
  return [
    body('name')
      .isString()
      .notEmpty()
      .isIn(['admin', 'instructor', 'student', 'guest'])
      .withMessage('Role name must be one of: admin, instructor, student, guest'),
    body('description').isString().optional().withMessage('Description must be a string'),
  ].map((validation) => (optional ? validation.optional() : validation));
};

export const roleAssignationInDTO = (optional = false): ValidationChain[] => {
  return [
    body('userId').isString().notEmpty().withMessage('User ID is required and must be a string'),
    body('role')
      .isString()
      .notEmpty()
      .isIn(['admin', 'instructor', 'student', 'guest'])
      .withMessage('Role must be one of: admin, instructor, student, guest'),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'suspended'])
      .withMessage('Status must be one of: active, inactive, suspended'),
    body('expiresAt')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Expires at must be a valid date in ISO 8601 format'),
  ].map((validation) => (optional ? validation.optional() : validation));
};

export const instructorInDTO = (optional = false): ValidationChain[] => {
  return [
    body('instructorId')
      .isString()
      .notEmpty()
      .withMessage('Instructor ID is required and must be a string'),
    body('verificationStatus')
      .optional()
      .isIn(['verified', 'pending', 'rejected'])
      .withMessage('Verification status must be one of: verified, pending, rejected'),
    body('verifiedAt')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Verified at must be a valid date in ISO 8601 format'),
  ].map((validation) => (optional ? validation.optional() : validation));
};

export const enumQuery = (
  queryName: string,
  message: string,
  values: string[],
  optional = false
): ValidationChain => {
  return query(queryName)
    .isIn(values)
    .withMessage(`${message}. Must be one of: ${values.join(', ')}`)
    .optional(optional);
};
