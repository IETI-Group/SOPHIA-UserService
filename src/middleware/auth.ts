import type { NextFunction, Request, Response } from 'express';
import container from '../config/diContainer.js';
import type { LinkedAccountsRepository } from '../repositories/LinkedAccountsRepository.js';
import type { UsersRepository } from '../repositories/UsersRepository.js';
import type { CognitoAuthService } from '../services/cognitoAuth.service.js';
import { logger } from '../utils/logger.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string; // ID de la base de datos (usuario interno)
        cognitoSub: string; // ID de Cognito
        username: string;
        email?: string;
        emailVerified?: boolean;
        phoneNumber?: string;
        phoneNumberVerified?: boolean;
        groups?: string[];
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No authorization token provided',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    const authService = container.resolve<CognitoAuthService>('cognitoAuthService');
    const linkedAccountsRepo = container.resolve<LinkedAccountsRepository>(
      'linkedAccountsRepository'
    );
    const usersRepo = container.resolve<UsersRepository>('userRepository');

    const cognitoUserInfo = await authService.getUserInfo(token);

    // Buscar el usuario en linked_accounts usando el Cognito SUB
    const linkedAccount = await linkedAccountsRepo.getLinkedAccountByProviderAndExternalId(
      'cognito',
      cognitoUserInfo.userId
    );

    if (!linkedAccount) {
      logger.warn(`Linked account not found for Cognito SUB: ${cognitoUserInfo.userId}`);
      res.status(404).json({
        success: false,
        message: 'User account not found in the system',
        error: 'USER_NOT_FOUND',
      });
      return;
    }

    // Obtener información adicional del usuario desde la base de datos
    const userInfo = await usersRepo.getUserById(linkedAccount.userId, true);

    // Construir el objeto user con el ID de la base de datos
    req.user = {
      id: linkedAccount.userId, // ID de la base de datos
      cognitoSub: cognitoUserInfo.userId, // ID de Cognito
      username: cognitoUserInfo.username,
      email: cognitoUserInfo.email,
      emailVerified: cognitoUserInfo.emailVerified,
      phoneNumber: cognitoUserInfo.phoneNumber,
      phoneNumberVerified: cognitoUserInfo.phoneNumberVerified,
      groups: cognitoUserInfo.groups,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
    };

    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: 'UNAUTHORIZED',
    });
  }
};

export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7);
  const authService = container.resolve<CognitoAuthService>('cognitoAuthService');
  const linkedAccountsRepo = container.resolve<LinkedAccountsRepository>(
    'linkedAccountsRepository'
  );
  const usersRepo = container.resolve<UsersRepository>('usersRepository');

  try {
    const cognitoUserInfo = await authService.getUserInfo(token);

    // Buscar el usuario en linked_accounts
    const linkedAccount = await linkedAccountsRepo.getLinkedAccountByProviderAndExternalId(
      'cognito',
      cognitoUserInfo.userId
    );

    if (linkedAccount) {
      // Obtener información adicional del usuario desde la base de datos
      const userInfo = await usersRepo.getUserById(linkedAccount.userId, true);

      req.user = {
        id: linkedAccount.userId,
        cognitoSub: cognitoUserInfo.userId,
        username: cognitoUserInfo.username,
        email: cognitoUserInfo.email,
        emailVerified: cognitoUserInfo.emailVerified,
        phoneNumber: cognitoUserInfo.phoneNumber,
        phoneNumberVerified: cognitoUserInfo.phoneNumberVerified,
        groups: cognitoUserInfo.groups,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
      };
    }
  } catch (error) {
    logger.debug('Optional authentication failed:', error);
  }

  next();
};

export const requireGroup = (groupName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const userGroups = req.user.groups || [];

    if (!userGroups.includes(groupName)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required group: ${groupName}`,
        error: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
};

export const requireAnyGroup = (groupNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      });
      return;
    }

    const userGroups = req.user.groups || [];
    const hasRequiredGroup = groupNames.some((group) => userGroups.includes(group));

    if (!hasRequiredGroup) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required groups: ${groupNames.join(', ')}`,
        error: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
};
