import { type IRouter, type Request, type Response, Router } from 'express';
import { validationResult } from 'express-validator';
import container from '../config/diContainer.js';
import type UserController from '../controllers/UserController.js';
import type { UserInDTO, UsersQuery } from '../models/index.js';
import {
  parseBatchUsersQuery,
  parseLearningPathInBody,
  parseLearningPathUpdateInBody,
  parseLinkedAccountInBody,
  parseLinkedAccountUpdateInBody,
  parsePaginationQuery,
  parseReviewInDTO,
  parseReviewUpdateInDTO,
  parserReviewInQuery,
  parseUserInBody,
  parseUsersQuery,
  parseUserUpdateInBody,
} from '../utils/parsers.js';
import {
  batchUsers,
  booleanQuery,
  emailParam,
  learningPathInDTO,
  linkedAccountInDTO,
  paginationParams,
  reviewBodyInDTO,
  reviewsParams,
  sortingParams,
  stringParam,
  userInDTO,
  usersParams,
} from '../utils/validators.js';

const router: IRouter = Router();

// Obtener instancia del controlador desde el contenedor DI
const userController = container.resolve<UserController>('userController');

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination
 * @access  Public
 */
router.get(
  '/',
  [...usersParams, ...paginationParams, booleanQuery('light_dto', 'Invalid light DTO value', true)],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      throw new Error(
        `Validation error: ${errors
          .array()
          .map((err) => err.msg)
          .join(', ')}`
      );
    const {
      page,
      size,
      sort,
      order,
      lightDTO,
      firstName,
      lastName,
      birthDayFrom,
      birthDayTo,
    }: UsersQuery = parseUsersQuery(req);
    const users = await userController.getUsers(
      page,
      size,
      sort,
      order,
      lightDTO,
      firstName,
      lastName,
      birthDayFrom,
      birthDayTo
    );
    res.json(users);
  }
);

/**
 * @route   GET /api/v1/users/id/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get(
  '/id/:id',
  [
    stringParam('id', 'Invalid user ID'),
    booleanQuery('light_dto', 'Invalid light DTO value', true),
  ],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID');
    }
    const user = await userController.getUserById(req.params.id, req.query.light_dto === 'true');
    res.json(user);
  }
);

/**
 * @route   GET /api/v1/users/email/:email
 * @desc    Get user by email
 * @access  Public
 */
router.get(
  '/email/:email',
  [
    emailParam('email', 'Invalid email format'),
    booleanQuery('light_dto', 'Invalid light DTO value', true),
  ],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid email');
    }
    const user = await userController.getUserByEmail(
      req.params.email,
      req.query.light_dto === 'true'
    );
    res.json(user);
  }
);

/**
 * @route   POST /api/v1/users/batch
 * @desc    Get users by an array of IDs
 * @access  Public
 */
router.post(
  '/batch',
  [...batchUsers, ...sortingParams, booleanQuery('light_dto', 'Invalid light DTO value', true)],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid users array');
    }
    const { users, sort, order, lightDTO } = parseBatchUsersQuery(req);
    const userList = await userController.getUsersByIds(users, sort, order, lightDTO);
    res.json(userList);
  }
);

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Public
 */
router.post('/', [...userInDTO()], async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    throw new Error('Validation error: Invalid user data');
  }

  const userData: UserInDTO = parseUserInBody(req);
  const newUser = await userController.postUser(userData);
  res.status(201).json(newUser);
});

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update an existing user
 * @access  Public
 */
router.put(
  '/:id',
  [stringParam('id', 'Invalid user ID'), ...userInDTO(true)],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user data or ID');
    }

    const userId = req.params.id;
    const userData = parseUserUpdateInBody(req);
    const updatedUser = await userController.updateUser(userId, userData);
    res.json(updatedUser);
  }
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete a user by ID
 * @access  Public
 */
router.delete(
  '/:id',
  [stringParam('id', 'Invalid user ID')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID');
    }

    const userId = req.params.id;
    const response = await userController.deleteUser(userId);
    res.status(200).json(response);
  }
);

/**
 * @route   GET /api/v1/users/:id/learning-path
 * @desc    Get a user's learning path
 * @access  Public
 */
router.get(
  '/:id/learning-path',
  [stringParam('id', 'Invalid user ID')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID');
    }

    const userId = req.params.id;
    const learningPath = await userController.getUserLearningPath(userId);
    res.json(learningPath);
  }
);

/**
 * @route   POST /api/v1/users/:id/learning-path
 * @desc    Create a learning path for a user
 * @access  Public
 */
router.post(
  '/:id/learning-path',
  [stringParam('id', 'Invalid user ID'), ...learningPathInDTO()],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID');
    }

    const userId = req.params.id;
    const learningPathData = parseLearningPathInBody(req);
    const newLearningPath = await userController.postUserLearningPath(userId, learningPathData);
    res.status(201).json(newLearningPath);
  }
);

/**
 * @route   PUT /api/v1/users/:id/learning-path
 * @desc    Update a user's learning path
 * @access  Public
 */
router.put(
  '/:id/learning-path',
  [stringParam('id', 'Invalid user ID'), ...learningPathInDTO(true)],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID');
    }

    const userId = req.params.id;
    const learningPathData = parseLearningPathUpdateInBody(req);
    const updatedLearningPath = await userController.updateLearningPath(userId, learningPathData);
    res.json(updatedLearningPath);
  }
);

router.get(
  '/:id/reviews',
  [stringParam('id', 'Invalid user ID'), ...paginationParams, ...reviewsParams],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID');
    }

    const id = req.params.id;
    const { page, size, sort, order } = parsePaginationQuery(req);
    const { showInstructors, showCourses, reviewedId } = parserReviewInQuery(req);
    const reviews = await userController.getUserReviews(
      id,
      page,
      size,
      sort,
      order,
      showInstructors,
      showCourses,
      reviewedId
    );
    res.json(reviews);
  }
);

router.post(
  '/:id/reviews',
  [stringParam('id', 'Invalid user ID'), ...reviewBodyInDTO()],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID');
    }

    const reviewerId = req.params.id;
    const reviewData = parseReviewInDTO(reviewerId, req);
    const newReview = await userController.postReview(reviewData);
    res.status(201).json(newReview);
  }
);

router.put(
  '/:id/reviews/:reviewId',
  [
    stringParam('id', 'Invalid user ID'),
    stringParam('reviewId', 'Invalid review ID'),
    ...reviewBodyInDTO(true),
  ],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid review ID');
    }

    const userId = req.params.id;
    const reviewId = req.params.reviewId;
    const reviewData = parseReviewUpdateInDTO(req);
    const updatedReview = await userController.updateReview(userId, reviewId, reviewData);
    res.json(updatedReview);
  }
);

router.delete(
  '/:id/reviews/:reviewId',
  [stringParam('id', 'Invalid user ID'), stringParam('reviewId', 'Invalid review ID')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid review ID');
    }

    const reviewId = req.params.reviewId;
    const userId = req.params.id;
    const response = await userController.deleteReview(userId, reviewId);
    res.status(204).json(response);
  }
);

router.get(
  '/:id/linked-accounts',
  [stringParam('id', 'Invalid user ID'), ...paginationParams],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID');
    }

    const userId = req.params.id;
    const { page, size, sort, order } = parsePaginationQuery(req);
    const linkedAccounts = await userController.getLinkedAccounts(userId, page, size, sort, order);
    res.json(linkedAccounts);
  }
);

router.get(
  '/:id/linked-accounts/:accountId',
  [stringParam('id', 'Invalid user ID'), stringParam('accountId', 'Invalid account ID')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID or account ID');
    }
    const userId = req.params.id;
    const accountId = req.params.accountId;
    const linkedAccount = await userController.getLinkedAccount(userId, accountId);
    res.json(linkedAccount);
  }
);

router.post(
  '/:id/linked-accounts',
  [stringParam('id', 'Invalid user ID'), ...linkedAccountInDTO()],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID');
    }
    const userId = req.params.id;
    const linkedAccountInDTO = parseLinkedAccountInBody(userId, req);
    const linkedAccount = await userController.postLinkedAccount(userId, linkedAccountInDTO);
    res.status(201).json(linkedAccount);
  }
);

router.put(
  '/:id/linked-accounts/:accountId',
  [
    stringParam('id', 'Invalid user ID'),
    stringParam('accountId', 'Invalid account ID'),
    ...linkedAccountInDTO(true),
  ],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID or account ID');
    }
    const userId = req.params.id;
    const accountId = req.params.accountId;
    const linkedAccountInDTO = parseLinkedAccountUpdateInBody(userId, req);
    const linkedAccount = await userController.updateLinkedAccount(
      userId,
      accountId,
      linkedAccountInDTO
    );
    res.json(linkedAccount);
  }
);

router.delete(
  '/:id/linked-accounts/:accountId',
  [stringParam('id', 'Invalid user ID'), stringParam('accountId', 'Invalid account ID')],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID or account ID');
    }
    const userId = req.params.id;
    const accountId = req.params.accountId;
    await userController.deleteLinkedAccount(userId, accountId);
    res.status(204).end();
  }
);

export default router;
