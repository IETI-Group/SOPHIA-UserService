import type { Request, Response } from 'express';
import container from '../config/diContainer.js';
import type { CognitoAuthService } from '../services/cognitoAuth.service.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  private readonly authService: CognitoAuthService;

  constructor() {
    this.authService = container.resolve<CognitoAuthService>('cognitoAuthService');
  }

  login = (_req: Request, res: Response): void => {
    try {
      const state = Math.random().toString(36).substring(7);

      const loginUrl = this.authService.getLoginUrl(state);

      res.json({
        success: true,
        data: {
          loginUrl,
          state,
        },
        message: 'Redirect to this URL to login with Cognito',
      });
    } catch (error) {
      logger.error('Error generating login URL:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate login URL',
        error: 'INTERNAL_SERVER_ERROR',
      });
    }
  };

  callback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Authorization code is required',
          error: 'BAD_REQUEST',
        });
        return;
      }

      const tokens = await this.authService.exchangeCodeForTokens(code);

      const userInfo = await this.authService.getUserInfo(tokens.id_token);

      res.json({
        success: true,
        data: {
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
          tokenType: tokens.token_type,
          user: userInfo,
        },
        message: 'Authentication successful',
      });
    } catch (error) {
      logger.error('Error in auth callback:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed',
        error: 'AUTHENTICATION_FAILED',
      });
    }
  };

  logout = (_req: Request, res: Response): void => {
    try {
      const logoutUrl = this.authService.getLogoutUrl();

      res.json({
        success: true,
        data: {
          logoutUrl,
        },
        message: 'Redirect to this URL to logout',
      });
    } catch (error) {
      logger.error('Error generating logout URL:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate logout URL',
        error: 'INTERNAL_SERVER_ERROR',
      });
    }
  };

  me = (req: Request, res: Response): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
          error: 'UNAUTHORIZED',
        });
        return;
      }

      res.json({
        success: true,
        data: req.user,
        message: 'User information retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting user info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user information',
        error: 'INTERNAL_SERVER_ERROR',
      });
    }
  };

  verify = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Token is required',
          error: 'BAD_REQUEST',
        });
        return;
      }

      const userInfo = await this.authService.getUserInfo(token);

      res.json({
        success: true,
        data: {
          valid: true,
          user: userInfo,
        },
        message: 'Token is valid',
      });
    } catch (error) {
      logger.error('Token verification failed:', error);
      res.status(401).json({
        success: false,
        data: {
          valid: false,
        },
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN',
      });
    }
  };
}
