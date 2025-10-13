import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import type * as schema from './schema.js';

export interface DBDrizzleProvider extends NodePgDatabase<typeof schema> {
  $client: Pool;
}
