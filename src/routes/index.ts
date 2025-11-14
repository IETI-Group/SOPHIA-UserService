import { type IRouter, Router } from 'express';
import adminRoutes from './admin.js';
import healthRoutes from './health.js';
import instructorRoutes from './instructors.js';
import userRoutes from './users.js';

const router: IRouter = Router();

// Rutas de la aplicación
router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/instructors', instructorRoutes);

// Aquí se pueden agregar más rutas en el futuro
// router.use('/auth', authRoutes);

export default router;
