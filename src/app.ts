import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { checkDatabaseConnection } from './config/db.js';
import { envConfig } from './config/env.config.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.routes();
    this.errorHandling();
  }

  private config(): void {
    // Middlewares de seguridad
    this.app.use(helmet());

    // CORS
    this.app.use(
      cors({
        origin: envConfig.cors.origin,
        credentials: envConfig.cors.credentials,
      })
    );

    // Logging HTTP requests
    if (!envConfig.server.isTest) {
      this.app.use(
        morgan('combined', {
          stream: {
            write: (message: string) => {
              logger.info(message.trim());
            },
          },
        })
      );
    }

    // Body parsing middleware
    this.app.use(express.json({ limit: '100mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Configurar trust proxy si está detrás de un proxy/load balancer
    this.app.set('trust proxy', 1);
    // check database connection

    if (!envConfig.server.isTest) {
      logger.info('Checking database connection...');
      checkDatabaseConnection().then((isConnected) => {
        if (isConnected) {
          logger.info('Database connection established');
        } else {
          logger.error('Failed to connect to the database');
        }
      });
    }
  }

  private routes(): void {
    // API routes
    const prefix = `${envConfig.api.prefix}/${envConfig.api.version}`;
    this.app.use(prefix, routes);
    this.app.set('apiPrefix', prefix);

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'Welcome to SOPHIA User Service API',
        version: envConfig.api.version,
        endpoints: {
          health: `${prefix}/health`,
        },
        documentation: `${prefix}/docs`, // Para futuro
        timestamp: new Date().toISOString(),
      });
    });
  }

  private errorHandling(): void {
    // 404 handler
    this.app.use(notFound);

    // Error handler
    this.app.use(errorHandler);
  }
}

export default new App().app;
