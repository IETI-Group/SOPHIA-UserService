import type { NextFunction, Request, Response } from 'express';
import container from '../config/diContainer.js';
import type { CognitoAuthService } from '../services/cognitoAuth.service.js';
import { logger } from '../utils/logger.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        email?: string;
        emailVerified?: boolean;
        phoneNumber?: string;
        phoneNumberVerified?: boolean;
        groups?: string[];
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

    const userInfo = await authService.getUserInfo(token);

    req.user = userInfo;

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

  try {
    const userInfo = await authService.getUserInfo(token);
    req.user = userInfo;
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
