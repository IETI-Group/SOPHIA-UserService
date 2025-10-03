import app from './app.js';
import { envConfig, validateEnvConfig } from './config/env.config.js';
import { logger } from './utils/logger.js';

try {
  validateEnvConfig();
} catch (error) {
  logger.error('Environment configuration error:', error);
  process.exit(1);
}

const PORT = envConfig.server.port;

process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const startServer = (): void => {
  try {
    const server = app.listen(PORT, () => {
      logger.info(`🚀 SOPHIA User Service started successfully`);
      logger.info(`🌍 Environment: ${envConfig.server.nodeEnv}`);
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(
        `🔗 Health check: http://localhost:${PORT}${envConfig.api.prefix}${envConfig.api.version}/health`
      );
      logger.info(`🏠 Home: http://localhost:${PORT}/`);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        logger.info('Process terminated gracefully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
