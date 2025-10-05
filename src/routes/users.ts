import { type IRouter, type Request, type Response, Router } from 'express';
import { validationResult } from 'express-validator';
import container from '../config/diContainer.js';
import type UserController from '../controllers/UserController.js';
import type { UsersQuery } from '../models/index.js';
import {
  batchUsers,
  booleanQuery,
  emailParam,
  paginationParams,
  parsePaginationQuery,
  parseUsersQuery,
  stringParam,
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
router.get('/', [...usersParams, ...paginationParams], async (req: Request, res: Response) => {
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
});

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

router.post('/batch', [...batchUsers, ...paginationParams], async (req: Request, res: Response) => {
  if (!validationResult(req).isEmpty()) {
    throw new Error('Validation error: Invalid users array');
  }

  const { users } = req.body as { users: string[] };
  const { page, size, sort, order } = parsePaginationQuery(req);
  const userList = await userController.getUsersByIds(users, page, size, sort, order, false);
  res.json(userList);
});

export default router;
