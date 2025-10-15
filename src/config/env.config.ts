import { config } from 'dotenv';

config();

export const envConfig = {
  server: {
    port: Number.parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  pagination: {
    defaultPageSize: Number.parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
    maxPageSize: Number.parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
    maxBatchUsers: Number.parseInt(process.env.MAX_BATCH_USERS || '100', 10),
    defaultSortOrder: (process.env.DEFAULT_SORT_ORDER || 'desc') as 'asc' | 'desc',
  },

  api: {
    version: process.env.API_VERSION || 'v1',
    prefix: process.env.API_PREFIX || '/api',
  },

  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    ssl: process.env.DB_SSL === 'true' || false,
    port: Number.parseInt(process.env.DB_PORT || '5433', 10),
    name: process.env.DB_NAME || 'dev_db',
    user: process.env.DB_USER || 'dev_user',
    password: process.env.DB_PASSWORD || 'dev_password',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRE || '30d',
  },

  apiKeys: {
    key: process.env.API_KEY,
  },
} as const;

/**
 * Valida que las variables de entorno críticas estén configuradas
 * @throws Error si falta alguna variable crítica en producción
 */
export const validateEnvConfig = (): void => {
  const criticalVars = [];

  if (envConfig.server.isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-in-production') {
      criticalVars.push('JWT_SECRET');
    }
    if (!process.env.DATABASE_URL) {
      criticalVars.push('DATABASE_URL');
    }
  }

  if (envConfig.pagination.defaultPageSize > envConfig.pagination.maxPageSize) {
    throw new Error(
      `DEFAULT_PAGE_SIZE (${envConfig.pagination.defaultPageSize}) cannot be greater than MAX_PAGE_SIZE (${envConfig.pagination.maxPageSize})`
    );
  }

  if (envConfig.pagination.maxPageSize < 1 || envConfig.pagination.maxPageSize > 1000) {
    throw new Error('MAX_PAGE_SIZE must be between 1 and 1000');
  }

  if (criticalVars.length > 0) {
    throw new Error(
      `Missing critical environment variables in production: ${criticalVars.join(', ')}`
    );
  }
};

export default envConfig;
