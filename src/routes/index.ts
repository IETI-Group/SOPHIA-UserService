import { type IRouter, Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import adminRoutes from './admin.js';
import auth from './auth.js';
import healthRoutes from './health.js';
import instructorRoutes from './instructors.js';
import userRoutes from './users.js';

const router: IRouter = Router();
router.use('/health', healthRoutes);
router.use('/auth', auth);
router.use('/instructors', instructorRoutes); // Public routes
router.use(authenticate);
// Rutas de la aplicación
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
