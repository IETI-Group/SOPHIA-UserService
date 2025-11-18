import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { type DBDrizzleProvider, schema } from '../db/index.js';
import envConfig from './env.config.js';

/**
 * PostgreSQL connections pool
 */
export const pool = new Pool({
  connectionString: envConfig.database.url,
  ssl: envConfig.database.ssl,
  max: 20, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Drizzle ORM client with full schema
 * Includes automatic typing and relations
 */
export const db: DBDrizzleProvider = drizzle(pool, { schema });

/**
 * Function to check database connection
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

/**
 * Function to close the connection (useful for testing and shutdown)
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  await pool.end();
  console.log('Database connection closed');
};
