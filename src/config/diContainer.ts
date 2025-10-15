import { asClass, asValue, createContainer, InjectionMode, Lifetime } from 'awilix';
import UserController from '../controllers/UserController.js';
import { UsersRepositoryPostgreSQL } from '../repositories/index.js';
import { UserServiceImpl } from '../services/index.js';
import { logger } from '../utils/logger.js';
import { db } from './db.js';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  logger: asValue(logger),
  drizzleClient: asValue(db),

  userRepository: asClass(UsersRepositoryPostgreSQL, {
    lifetime: Lifetime.SINGLETON,
  }),

  userService: asClass(UserServiceImpl, {
    lifetime: Lifetime.SINGLETON,
  }),

  userController: asClass(UserController, {
    lifetime: Lifetime.SINGLETON,
  }),
});

export default container;
