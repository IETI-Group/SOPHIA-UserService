import type { ROLE } from '../../db/schema.js';
import type FiltersInstructor from '../../models/filters/FiltersInstructor.js';
import type FiltersRoleAssignation from '../../models/filters/FiltersRoleAssignation.js';
import type { PaginatedResponse } from '../../models/index.js';
import type {
  InstructorInput,
  InstructorRecord,
  RoleAssignationInput,
  RoleAssignationRecord,
  RoleInput,
  RoleRecord,
} from '../../repositories/index.js';

export default interface AdminService {
  // Role management
  getRoles(
    page: number,
    size: number,
    sort?: string,
    order?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<RoleRecord>>;
  getRole(name: string): Promise<RoleRecord>;
  postRole(role: RoleInput): Promise<RoleRecord>;
  updateRole(roleName: string, roleUpdate: Partial<RoleInput>): Promise<RoleRecord>;
  deleteRole(roleName: string): Promise<void>;

  // Role assignation management
  getAssignedRoles(
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    roleFilter: FiltersRoleAssignation
  ): Promise<PaginatedResponse<RoleAssignationRecord>>;
  assignRole(userId: string, role: ROLE): Promise<string>;
  updateAssignationByUserAndRole(
    userId: string,
    role: ROLE,
    assignation: Partial<RoleAssignationInput>
  ): Promise<RoleAssignationRecord>;
  updateAssignationById(
    assignationId: string,
    assignation: Partial<RoleAssignationInput>
  ): Promise<RoleAssignationRecord>;
  revokeRoleByUserAndRole(userId: string, role: ROLE): Promise<void>;
  revokeRoleById(assignationId: string): Promise<void>;

  // Instructor management
  getInstructors(
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    filters: FiltersInstructor
  ): Promise<PaginatedResponse<InstructorRecord>>;
  postInstructor(instructorInput: InstructorInput): Promise<string>;
  updateInstructor(
    instructorId: string,
    instructorUpdate: Partial<InstructorInput>
  ): Promise<InstructorRecord>;
  deleteInstructor(instructorId: string): Promise<void>;
}
