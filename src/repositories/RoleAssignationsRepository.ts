import type { ROLE, ROLE_STATUS } from '../db/schema.js';
import type FiltersRoleAssignation from '../models/filters/FiltersRoleAssignation.js';
import type { PaginatedResponse } from '../models/index.js';

// Types based on DB schema
export type RoleAssignationRecord = {
  id_user_role: string;
  user_id: string;
  role_id: string;
  role_name: ROLE;
  assigned_at: Date;
  expires_at: Date | null;
  status: ROLE_STATUS;
};

export type RoleAssignationInput = {
  userId: string;
  role: ROLE;
  expiresAt?: Date;
  status?: ROLE_STATUS;
};

export interface RoleAssignationsRepository {
  getAssignedRoles(
    page: number,
    size: number,
    roleFilter: FiltersRoleAssignation,
    sort?: string,
    order?: string
  ): Promise<PaginatedResponse<RoleAssignationRecord>>;
  createAssignation(userId: string, role: ROLE): Promise<string>;
  updateAssignationByUserAndRole(
    userId: string,
    role: ROLE,
    assignation: Partial<RoleAssignationInput>
  ): Promise<RoleAssignationRecord>;
  updateAssignationById(
    assignationId: string,
    assignation: Partial<RoleAssignationInput>
  ): Promise<RoleAssignationRecord>;
  deleteAssignationByUserAndRole(userId: string, role: ROLE): Promise<void>;
  deleteAssignationById(assignationId: string): Promise<void>;
}
