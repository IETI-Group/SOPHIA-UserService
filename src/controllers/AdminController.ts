import type { Logger } from 'winston';
import type { ROLE, ROLE_STATUS, VERIFICATION_STATUS } from '../db/schema.js';
import {
  type ApiResponse,
  FiltersInstructor,
  FiltersRoleAssignation,
  type PaginatedResponse,
} from '../models/index.js';
import type {
  InstructorInput,
  InstructorRecord,
  RoleAssignationInput,
  RoleAssignationRecord,
  RoleInput,
  RoleRecord,
} from '../repositories/index.js';
import type { AdminService } from '../services/index.js';
import { parseApiResponse } from '../utils/parsers.js';

export default class AdminController {
  private adminService: AdminService;
  private logger: Logger;

  constructor(adminService: AdminService, logger: Logger) {
    this.adminService = adminService;
    this.logger = logger;
  }

  // ============================================
  // ROLE MANAGEMENT
  // ============================================

  public async getRoles(page: number, size: number): Promise<PaginatedResponse<RoleRecord>> {
    const response = await this.adminService.getRoles(page, size);
    return response;
  }

  public async getRole(name: string): Promise<ApiResponse<RoleRecord>> {
    const response = await this.adminService.getRole(name);
    return parseApiResponse(response);
  }

  public async postRole(role: RoleInput): Promise<ApiResponse<RoleRecord>> {
    const response = await this.adminService.postRole(role);
    return parseApiResponse(response);
  }

  public async updateRole(
    roleName: string,
    roleUpdate: Partial<RoleInput>
  ): Promise<ApiResponse<RoleRecord>> {
    const response = await this.adminService.updateRole(roleName, roleUpdate);
    return parseApiResponse(response);
  }

  public async deleteRole(roleName: string): Promise<ApiResponse<string>> {
    await this.adminService.deleteRole(roleName);
    return parseApiResponse(`Role ${roleName} deleted successfully`);
  }

  // ============================================
  // ROLE ASSIGNATION MANAGEMENT
  // ============================================

  public async getAssignedRoles(
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    assignmentStartDate?: Date,
    assignmentEndDate?: Date,
    expirationStartDate?: Date,
    expirationEndDate?: Date,
    roleStatus?: ROLE_STATUS,
    role?: ROLE
  ): Promise<PaginatedResponse<RoleAssignationRecord>> {
    const filters = new FiltersRoleAssignation(
      assignmentStartDate,
      assignmentEndDate,
      expirationStartDate,
      expirationEndDate,
      roleStatus,
      role
    );

    const response = await this.adminService.getAssignedRoles(page, size, sort, order, filters);
    return response;
  }

  public async assignRole(userId: string, role: ROLE): Promise<ApiResponse<string>> {
    const assignationId = await this.adminService.assignRole(userId, role);
    return parseApiResponse(assignationId, `Role ${role} assigned to user ${userId} successfully`);
  }

  public async updateAssignationByUserAndRole(
    userId: string,
    role: ROLE,
    assignation: Partial<RoleAssignationInput>
  ): Promise<ApiResponse<RoleAssignationRecord>> {
    const response = await this.adminService.updateAssignationByUserAndRole(
      userId,
      role,
      assignation
    );
    return parseApiResponse(response);
  }

  public async updateAssignationById(
    assignationId: string,
    assignation: Partial<RoleAssignationInput>
  ): Promise<ApiResponse<RoleAssignationRecord>> {
    const response = await this.adminService.updateAssignationById(assignationId, assignation);
    return parseApiResponse(response);
  }

  public async revokeRoleByUserAndRole(userId: string, role: ROLE): Promise<ApiResponse<string>> {
    await this.adminService.revokeRoleByUserAndRole(userId, role);
    return parseApiResponse(`Role ${role} revoked from user ${userId} successfully`);
  }

  public async revokeRoleById(assignationId: string): Promise<ApiResponse<string>> {
    await this.adminService.revokeRoleById(assignationId);
    return parseApiResponse(`Role assignation ${assignationId} revoked successfully`);
  }

  // ============================================
  // INSTRUCTOR MANAGEMENT
  // ============================================

  public async getInstructors(
    page: number,
    size: number,
    sort: string | undefined,
    order: 'asc' | 'desc',
    verificationStatus?: VERIFICATION_STATUS,
    totalRatings?: number,
    totalStudents?: number,
    totalCourses?: number,
    averageRating?: number,
    detailedDTO?: boolean
  ): Promise<PaginatedResponse<InstructorRecord>> {
    const filters = new FiltersInstructor(
      verificationStatus,
      totalRatings,
      totalStudents,
      totalCourses,
      averageRating,
      detailedDTO
    );

    const response = await this.adminService.getInstructors(page, size, sort, order, filters);
    return response;
  }

  public async postInstructor(instructorInput: InstructorInput): Promise<ApiResponse<string>> {
    const instructorId = await this.adminService.postInstructor(instructorInput);
    return parseApiResponse(instructorId, 'Instructor created successfully');
  }

  public async updateInstructor(
    instructorId: string,
    instructorUpdate: Partial<InstructorInput>
  ): Promise<ApiResponse<InstructorRecord>> {
    const response = await this.adminService.updateInstructor(instructorId, instructorUpdate);
    return parseApiResponse(response);
  }

  public async deleteInstructor(instructorId: string): Promise<ApiResponse<string>> {
    await this.adminService.deleteInstructor(instructorId);
    return parseApiResponse(`Instructor ${instructorId} deleted successfully`);
  }
}
