import { defineConfig } from 'drizzle-kit';
import envConfig from './env.config.js';

/**
 * Configuración de Drizzle Kit para migraciones y Drizzle Studio
 * CLI de drizzle-kit
 *
 * Comandos:
 * - pnpm db:generate: Genera archivos de migración
 * - pnpm db:migrate: Ejecuta migraciones pendientes
 * - pnpm db:push: Push directo del schema a la DB
 * - pnpm db:studio: Drizzle Studio
 */
export default defineConfig({
  schema: './src/db/schema.ts',

  out: './src/db/migrations',

  dialect: 'postgresql',

  dbCredentials: {
    host: envConfig.database.host,
    port: envConfig.database.port,
    user: envConfig.database.user,
    password: envConfig.database.password,
    database: envConfig.database.name,
    ssl: envConfig.database.ssl,
  },

  verbose: true,
  strict: true,
});
