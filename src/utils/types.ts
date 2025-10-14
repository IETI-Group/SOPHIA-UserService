/**
 * Re-export types and enums from schema.ts for backward compatibility
 * All database-related types are now defined in schema.ts to avoid
 * circular dependencies and TypeScript ESM module issues with drizzle-kit
 */
export {
  LEARNING_STYLES,
  PACE_PREFERENCE,
  REVIEW_DISCRIMINANT,
  ROLE,
  ROLE_STATUS,
  type ValidUserSortFields,
  VERIFICATION_STATUS,
} from '../db/schema.js';

export interface HealthInfo {
  success: boolean;
  message: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
}
