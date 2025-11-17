import type { ROLE } from '../../db/schema.js';
import type FiltersInstructor from '../../models/filters/FiltersInstructor.js';
import type FiltersRoleAssignation from '../../models/filters/FiltersRoleAssignation.js';
import type { PaginatedResponse } from '../../models/index.js';
import type {
  InstructorInput,
  InstructorRecord,
  InstructorsRepository,
  RoleAssignationInput,
  RoleAssignationRecord,
  RoleAssignationsRepository,
  RoleInput,
  RoleRecord,
  RolesRepository,
} from '../../repositories/index.js';
import type AdminService from '../interfaces/AdminService.js';

export default class AdminServiceImpl implements AdminService {
  private readonly rolesRepository: RolesRepository;
  private readonly roleAssignationsRepository: RoleAssignationsRepository;
  private readonly instructorsRepository: InstructorsRepository;

  constructor(
    rolesRepository: RolesRepository,
    roleAssignationsRepository: RoleAssignationsRepository,
    instructorsRepository: InstructorsRepository
  ) {
    this.rolesRepository = rolesRepository;
    this.roleAssignationsRepository = roleAssignationsRepository;
    this.instructorsRepository = instructorsRepository;
  }

  // ============================================
  // ROLE MANAGEMENT
  // ============================================

  async getRoles(
    page: number,
    size: number,
    sort?: string,
    order?: 'asc' | 'desc'
  ): Promise<PaginatedResponse<RoleRecord>> {
    return this.rolesRepository.getRoles(page, size, sort, order);
  }

  async getRole(name: string): Promise<RoleRecord> {
    return this.rolesRepository.getRole(name);
  }

  async postRole(role: RoleInput): Promise<RoleRecord> {
    return this.rolesRepository.postRole(role);
  }

  async updateRole(roleName: string, roleUpdate: Partial<RoleInput>): Promise<RoleRecord> {
    return this.rolesRepository.updateRole(roleName, roleUpdate);
  }

  async deleteRole(roleName: string): Promise<void> {
    return this.rolesRepository.deleteRole(roleName);
  }

  // ============================================
  // ROLE ASSIGNATION MANAGEMENT
  // ============================================

  async getAssignedRoles(
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    roleFilter: FiltersRoleAssignation
  ): Promise<PaginatedResponse<RoleAssignationRecord>> {
    return this.roleAssignationsRepository.getAssignedRoles(page, size, roleFilter, sort, order);
  }

  async assignRole(userId: string, role: ROLE): Promise<string> {
    return this.roleAssignationsRepository.createAssignation(userId, role);
  }

  async updateAssignationByUserAndRole(
    userId: string,
    role: ROLE,
    assignation: Partial<RoleAssignationInput>
  ): Promise<RoleAssignationRecord> {
    return this.roleAssignationsRepository.updateAssignationByUserAndRole(
      userId,
      role,
      assignation
    );
  }

  async updateAssignationById(
    assignationId: string,
    assignation: Partial<RoleAssignationInput>
  ): Promise<RoleAssignationRecord> {
    return this.roleAssignationsRepository.updateAssignationById(assignationId, assignation);
  }

  async revokeRoleByUserAndRole(userId: string, role: ROLE): Promise<void> {
    return this.roleAssignationsRepository.deleteAssignationByUserAndRole(userId, role);
  }

  async revokeRoleById(assignationId: string): Promise<void> {
    return this.roleAssignationsRepository.deleteAssignationById(assignationId);
  }

  // ============================================
  // INSTRUCTOR MANAGEMENT
  // ============================================

  async getInstructors(
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    filters: FiltersInstructor
  ): Promise<PaginatedResponse<InstructorRecord>> {
    return this.instructorsRepository.getInstructors(page, size, filters, sort, order);
  }

  async postInstructor(instructorInput: InstructorInput): Promise<string> {
    return this.instructorsRepository.postInstructor(instructorInput);
  }

  async updateInstructor(
    instructorId: string,
    instructorUpdate: Partial<InstructorInput>
  ): Promise<InstructorRecord> {
    return this.instructorsRepository.updateInstructor(instructorId, instructorUpdate);
  }

  async deleteInstructor(instructorId: string): Promise<void> {
    return this.instructorsRepository.deleteInstructor(instructorId);
  }
}
