/**
 * Basic Drizzle configuration file.
 * 
 * This file uses environment variables directly instead of importing
 * from TypeScript modules to avoid ESM module resolution issues with drizzle-kit.
 * 
 * Make sure to load .env file before running drizzle-kit commands.
 */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sophia_users',
    ssl: process.env.DB_SSL === 'true',
  },
  verbose: true,
  strict: true,
});