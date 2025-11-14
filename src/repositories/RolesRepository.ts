import type { ROLE } from '../db/schema.js';
import type { PaginatedResponse } from '../models/index.js';

// Types based on DB schema
export type RoleRecord = {
  id_role: string;
  name: ROLE;
  description: string | null;
};

export type RoleInput = {
  name: ROLE;
  description?: string;
};

export interface RolesRepository {
  getRoles(
    page: number,
    size: number,
    sort?: string,
    order?: string
  ): Promise<PaginatedResponse<RoleRecord>>;
  getRole(name: string): Promise<RoleRecord>;
  postRole(role: RoleInput): Promise<RoleRecord>;
  updateRole(roleName: string, roleUpdate: Partial<RoleInput>): Promise<RoleRecord>;
  deleteRole(roleName: string): Promise<void>;
}
