import { type IRouter, type NextFunction, type Request, type Response, Router } from 'express';
import { validationResult } from 'express-validator';
import { AuthController } from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';
import { loginInDTO, signUpInDTO } from '../utils/validators.js';

const router: IRouter = Router();
const authController = new AuthController();

/**
 * @route   GET /auth/login/url
 * @desc    Obtiene la URL de login OAuth2 de AWS Cognito (flujo alternativo)
 * @access  Public
 */
router.get('/login/url', authController.getLoginUrl);

/**
 * @route   POST /auth/login
 * @desc    Login con email y contraseña (flujo principal)
 * @access  Public
 */
router.post('/login', loginInDTO, async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  return authController.loginWithCredentials(req, res).catch(next);
});

/**
 * @route   GET /auth/callback
 * @desc    Callback de AWS Cognito después del login
 * @access  Public
 */
router.get('/callback', authController.callback);

/**
 * @route   GET /auth/logout
 * @desc    Obtiene la URL de logout de AWS Cognito
 * @access  Public
 */
router.get('/logout', authController.logout);

/**
 * @route   GET /auth/me
 * @desc    Obtiene la información del usuario autenticado
 * @access  Private (requiere token)
 */
router.get('/me', authenticate, authController.me);

/**
 * @route   POST /auth/verify
 * @desc    Verifica un token JWT
 * @access  Public
 */
router.post('/verify', authController.verify);

/**
 * @route   POST /auth/signup
 * @desc    Registra un nuevo usuario en la base de datos y en Cognito
 * @access  Public
 */
router.post('/signup', signUpInDTO, async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  return authController.signup(req, res).catch(next);
});

export default router;
