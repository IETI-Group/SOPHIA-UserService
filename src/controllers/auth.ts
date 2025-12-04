import type { Request, Response } from 'express';
import container from '../config/diContainer.js';
import type { LoginInDTO, SignUpInDTO, UserInDTO, UserOutDTO } from '../models/index.js';
import type { CognitoAuthService } from '../services/cognitoAuth.service.js';
import type { UserService } from '../services/index.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  private readonly authService: CognitoAuthService;
  private readonly userService: UserService;

  constructor() {
    this.authService = container.resolve<CognitoAuthService>('cognitoAuthService');
    this.userService = container.resolve<UserService>('userService');
  }

  /**
   * Login con email y password (sin OAuth2)
   * Usa el flujo USER_PASSWORD_AUTH de Cognito
   */
  loginWithCredentials = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginInDTO = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
          error: 'BAD_REQUEST',
        });
        return;
      }

      const tokens = await this.authService.loginWithPassword(email, password);

      const userInfo = await this.authService.getUserInfo(tokens.idToken);

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          idToken: tokens.idToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
          tokenType: tokens.tokenType,
          user: userInfo,
        },
        message: 'Login successful',
      });
    } catch (error) {
      logger.error('Error during login with credentials:', error);

      const errorMessage = error instanceof Error ? error.message : 'Login failed';

      if (errorMessage.includes('Incorrect username or password')) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS',
        });
      } else if (errorMessage.includes('User is not confirmed')) {
        res.status(403).json({
          success: false,
          message: 'Please verify your email before logging in',
          error: 'USER_NOT_CONFIRMED',
        });
      } else if (errorMessage.includes('User does not exist')) {
        res.status(404).json({
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'An error occurred during login',
          error: 'LOGIN_FAILED',
        });
      }
    }
  };

  /**
   * Obtiene la URL de login OAuth2 de Cognito (flujo alternativo)
   */
  getLoginUrl = (_req: Request, res: Response): void => {
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

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const signUpData: SignUpInDTO = req.body;
      const { email, password, firstName, lastName, birthDate } = signUpData;

      try {
        const existingUser = await this.userService.getUserByEmail(email, true);
        if (existingUser) {
          res.status(409).json({
            success: false,
            message: 'User already exists with this email',
            error: 'USER_ALREADY_EXISTS',
          });
          return;
        }
      } catch {}

      let cognitoResult: { userSub: string; userConfirmed: boolean };
      try {
        cognitoResult = await this.authService.signUp({
          email,
          password,
          givenName: firstName,
          familyName: lastName,
          birthdate: birthDate,
        });
      } catch (error) {
        logger.error('Error creating user in Cognito:', error);
        res.status(500).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : 'Failed to create user in authentication system',
          error: 'COGNITO_SIGNUP_FAILED',
        });
        return;
      }

      let dbUser: UserOutDTO;
      try {
        const userInDTO: UserInDTO = {
          email,
          firstName,
          lastName,
          birthDate: new Date(birthDate),
        };
        dbUser = await this.userService.postUser(userInDTO);
      } catch (error) {
        logger.error('Error creating user in database:', error);
        res.status(500).json({
          success: false,
          message: 'User created in authentication system but failed to save in database',
          error: 'DATABASE_CREATE_FAILED',
        });
        return;
      }

      try {
        await this.userService.postLinkedAccount(dbUser.userId, {
          userId: dbUser.userId,
          provider: 'cognito',
          issuer: 'cognito-idp.amazonaws.com',
          idExternal: cognitoResult.userSub,
          email,
          isPrimary: true,
        });
      } catch (error) {
        logger.error('Error creating linked account:', error);
      }

      res.status(201).json({
        success: true,
        data: {
          user: dbUser,
          cognitoSub: cognitoResult.userSub,
          message: cognitoResult.userConfirmed
            ? 'User registered successfully'
            : 'User registered successfully. Please check your email to verify your account.',
          emailVerificationRequired: !cognitoResult.userConfirmed,
        },
        message: 'User registered successfully',
      });
    } catch (error) {
      logger.error('Unexpected error during signup:', error);
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred during signup',
        error: 'INTERNAL_SERVER_ERROR',
      });
    }
  };
}
