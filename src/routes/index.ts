import { type IRouter, Router } from 'express';
import healthRoutes from './health.js';
import userRoutes from './users.js';

const router: IRouter = Router();

// Rutas de la aplicación
router.use('/health', healthRoutes);
router.use('/users', userRoutes);

// Aquí se pueden agregar más rutas en el futuro
// router.use('/auth', authRoutes);

export default router;
