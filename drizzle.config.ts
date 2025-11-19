import { defineConfig } from 'drizzle-kit';

if (process.env.DATABASE_URL === undefined || process.env.DATABASE_URL === '') {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' || false,
  },
  verbose: true,
  strict: true,
});