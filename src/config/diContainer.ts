import { asClass, asValue, createContainer, InjectionMode, Lifetime } from 'awilix';
import AdminController from '../controllers/AdminController.js';
import InstructorController from '../controllers/InstructorController.js';
import UserController from '../controllers/UserController.js';
import {
  InstructorsRepositoryPostgreSQL,
  LearningPathsRepositoryPostgreSQL,
  LinkedAccountsRepositoryPostgreSQL,
  ReviewsRepositoryPostgreSQL,
  RoleAssignationsRepositoryPostgreSQL,
  RolesRepositoryPostgreSQL,
  UsersRepositoryPostgreSQL,
} from '../repositories/index.js';
import { AdminServiceImpl, InstructorServiceImpl, UserServiceImpl } from '../services/index.js';
import { logger } from '../utils/logger.js';
import { db } from './db.js';

const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  logger: asValue(logger),
  drizzleClient: asValue(db),

  linkedAccountsRepository: asClass(LinkedAccountsRepositoryPostgreSQL, {
    lifetime: Lifetime.SINGLETON,
  }),

  learningPathsRepository: asClass(LearningPathsRepositoryPostgreSQL, {
    lifetime: Lifetime.SINGLETON,
  }),

  reviewsRepository: asClass(ReviewsRepositoryPostgreSQL, {
    lifetime: Lifetime.SINGLETON,
  }),

  userRepository: asClass(UsersRepositoryPostgreSQL, {
    lifetime: Lifetime.SINGLETON,
  }),

  rolesRepository: asClass(RolesRepositoryPostgreSQL, {
    lifetime: Lifetime.SINGLETON,
  }),

  roleAssignationsRepository: asClass(RoleAssignationsRepositoryPostgreSQL, {
    lifetime: Lifetime.SINGLETON,
  }),

  instructorsRepository: asClass(InstructorsRepositoryPostgreSQL, {
    lifetime: Lifetime.SINGLETON,
  }),

  userService: asClass(UserServiceImpl, {
    lifetime: Lifetime.SINGLETON,
  }),

  adminService: asClass(AdminServiceImpl, {
    lifetime: Lifetime.SINGLETON,
  }),

  instructorService: asClass(InstructorServiceImpl, {
    lifetime: Lifetime.SINGLETON,
  }),

  userController: asClass(UserController, {
    lifetime: Lifetime.SINGLETON,
  }),

  adminController: asClass(AdminController, {
    lifetime: Lifetime.SINGLETON,
  }),

  instructorController: asClass(InstructorController, {
    lifetime: Lifetime.SINGLETON,
  }),
});

export default container;
