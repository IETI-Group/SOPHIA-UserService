import { type IRouter, type Request, type Response, Router } from 'express';
import { validationResult } from 'express-validator';
import container from '../config/diContainer.js';
import type UserController from '../controllers/UserController.js';
import type { UsersQuery } from '../models/index.js';
import {
  batchUsers,
  booleanQuery,
  paginationParams,
  stringParam,
  usersParams,
  validateUsersQuery,
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
  const { page, size, sort, order, firstName, lastName, birthDayFrom, birthDayTo }: UsersQuery =
    validateUsersQuery(req);
  const users = await userController.getUsers(
    page,
    size,
    sort,
    order,
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
    booleanQuery('heavy_dto', 'Invalid heavy DTO value', true),
  ],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid user ID');
    }
    const user = await userController.getUserById(req.params.id, req.query.heavy_dto === 'true');
    res.json(user);
  }
);

router.get(
  '/email/:email',
  [
    stringParam('email', 'Invalid email'),
    booleanQuery('heavy_dto', 'Invalid heavy DTO value', true),
  ],
  async (req: Request, res: Response) => {
    if (!validationResult(req).isEmpty()) {
      throw new Error('Validation error: Invalid email');
    }
    const user = await userController.getUserByEmail(
      req.params.email,
      req.query.heavy_dto === 'true'
    );
    res.json(user);
  }
);

// router.post('/', async (req: Request, res: Response) => {

// });

router.get('/batch', [batchUsers, ...paginationParams], async (req: Request, _res: Response) => {
  if (!validationResult(req).isEmpty()) {
    throw new Error('Validation error: Invalid users array');
  }

  // TODO:
  // Implementar lógica para obtener usuarios en batch
});

export default router;
