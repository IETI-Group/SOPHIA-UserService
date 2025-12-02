import { type IRouter, Router } from 'express';
import { AuthController } from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';

const router: IRouter = Router();
const authController = new AuthController();

/**
 * @route   GET /auth/login
 * @desc    Obtiene la URL de login de AWS Cognito
 * @access  Public
 */
router.get('/login', authController.login);

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

export default router;
