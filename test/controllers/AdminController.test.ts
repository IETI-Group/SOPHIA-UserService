import { afterEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type { Logger } from 'winston';
import AdminController from '../../src/controllers/AdminController.js';
import { ROLE, ROLE_STATUS, VERIFICATION_STATUS } from '../../src/db/schema.js';
import { FiltersInstructor, FiltersRoleAssignation } from '../../src/models/index.js';
import type {
  InstructorInput,
  InstructorRecord,
  RoleAssignationInput,
  RoleAssignationRecord,
  RoleInput,
  RoleRecord,
} from '../../src/repositories/index.js';
import type { AdminService } from '../../src/services/index.js';

describe('Admin Controller tests', () => {
  const adminService = mockDeep<AdminService>();
  const logger = mockDeep<Logger>();
  const adminController = new AdminController(adminService, logger);

  afterEach(() => {
    mockReset(adminService);
    mockReset(logger);
  });

  // ============================================
  // ROLE MANAGEMENT TESTS
  // ============================================

  describe('getRoles', () => {
    it('should return a paginated list of roles', async () => {
      const params = { page: 1, size: 10 };
      const timestamp = new Date().toISOString();
      const mockRoles: RoleRecord[] = [
        { id_role: '1', name: ROLE.ADMIN, description: 'Admin role' },
        { id_role: '2', name: ROLE.INSTRUCTOR, description: 'Instructor role' },
        { id_role: '3', name: ROLE.STUDENT, description: 'Student role' },
      ];

      adminService.getRoles.mockResolvedValue({
        success: true,
        message: 'Roles retrieved successfully',
        data: mockRoles,
        timestamp,
        pagination: {
          page: params.page,
          limit: params.size,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      const result = await adminController.getRoles(params.page, params.size);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Roles retrieved successfully');
      expect(result.data).toHaveLength(3);
      expect(result.pagination?.total).toBe(3);

      expect(adminService.getRoles).toHaveBeenCalledTimes(1);
      expect(adminService.getRoles).toHaveBeenCalledWith(params.page, params.size);
    });
  });

  describe('getRole', () => {
    it('should return a role by name', async () => {
      const roleName = 'admin';
      const mockRole: RoleRecord = {
        id_role: '1',
        name: ROLE.ADMIN,
        description: 'Admin role',
      };

      adminService.getRole.mockResolvedValue(mockRole);

      const result = await adminController.getRole(roleName);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRole);

      expect(adminService.getRole).toHaveBeenCalledTimes(1);
      expect(adminService.getRole).toHaveBeenCalledWith(roleName);
    });
  });

  describe('postRole', () => {
    it('should create a new role and return it', async () => {
      const roleInput: RoleInput = {
        name: ROLE.INSTRUCTOR,
        description: 'Instructor role',
      };
      const mockRole: RoleRecord = {
        id_role: '2',
        name: ROLE.INSTRUCTOR,
        description: 'Instructor role',
      };

      adminService.postRole.mockResolvedValue(mockRole);

      const result = await adminController.postRole(roleInput);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRole);

      expect(adminService.postRole).toHaveBeenCalledTimes(1);
      expect(adminService.postRole).toHaveBeenCalledWith(roleInput);
    });
  });

  describe('updateRole', () => {
    it('should update a role and return it', async () => {
      const roleName = 'instructor';
      const roleUpdate: Partial<RoleInput> = {
        description: 'Updated instructor role',
      };
      const mockRole: RoleRecord = {
        id_role: '2',
        name: ROLE.INSTRUCTOR,
        description: 'Updated instructor role',
      };

      adminService.updateRole.mockResolvedValue(mockRole);

      const result = await adminController.updateRole(roleName, roleUpdate);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRole);

      expect(adminService.updateRole).toHaveBeenCalledTimes(1);
      expect(adminService.updateRole).toHaveBeenCalledWith(roleName, roleUpdate);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role and return success message', async () => {
      const roleName = 'guest';

      adminService.deleteRole.mockResolvedValue();

      const result = await adminController.deleteRole(roleName);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBe(`Role ${roleName} deleted successfully`);

      expect(adminService.deleteRole).toHaveBeenCalledTimes(1);
      expect(adminService.deleteRole).toHaveBeenCalledWith(roleName);
    });
  });

  // ============================================
  // ROLE ASSIGNATION TESTS
  // ============================================

  describe('getAssignedRoles', () => {
    it('should return a paginated list of role assignations with filters', async () => {
      const params = {
        page: 1,
        size: 10,
        sort: 'assigned_at',
        order: 'desc' as 'asc' | 'desc',
        roleStatus: ROLE_STATUS.ACTIVE,
        role: ROLE.INSTRUCTOR,
      };
      const timestamp = new Date().toISOString();
      const mockAssignations: RoleAssignationRecord[] = [
        {
          id_user_role: '1',
          user_id: 'user1',
          role_id: 'role1',
          assigned_at: new Date(),
          expires_at: null,
          status: ROLE_STATUS.ACTIVE,
          role_name: ROLE.INSTRUCTOR,
        },
      ];

      adminService.getAssignedRoles.mockResolvedValue({
        success: true,
        message: 'Role assignations retrieved successfully',
        data: mockAssignations,
        timestamp,
        pagination: {
          page: params.page,
          limit: params.size,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      const result = await adminController.getAssignedRoles(
        params.page,
        params.size,
        params.sort,
        params.order,
        undefined,
        undefined,
        undefined,
        undefined,
        params.roleStatus,
        params.role
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);

      expect(adminService.getAssignedRoles).toHaveBeenCalledTimes(1);
    });
  });

  describe('assignRole', () => {
    it('should assign a role to a user and return assignation ID', async () => {
      const userId = 'user123';
      const role = ROLE.INSTRUCTOR;
      const assignationId = 'assignation123';

      adminService.assignRole.mockResolvedValue(assignationId);

      const result = await adminController.assignRole(userId, role);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBe(assignationId);

      expect(adminService.assignRole).toHaveBeenCalledTimes(1);
      expect(adminService.assignRole).toHaveBeenCalledWith(userId, role);
    });
  });

  describe('updateAssignationByUserAndRole', () => {
    it('should update a role assignation by user and role', async () => {
      const userId = 'user123';
      const role = ROLE.INSTRUCTOR;
      const assignationUpdate: Partial<RoleAssignationInput> = {
        status: ROLE_STATUS.INACTIVE,
      };
      const mockAssignation: RoleAssignationRecord = {
        id_user_role: '1',
        user_id: userId,
        role_id: 'role1',
        assigned_at: new Date(),
        expires_at: null,
        status: ROLE_STATUS.INACTIVE,
        role_name: ROLE.INSTRUCTOR,
      };

      adminService.updateAssignationByUserAndRole.mockResolvedValue(mockAssignation);

      const result = await adminController.updateAssignationByUserAndRole(
        userId,
        role,
        assignationUpdate
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAssignation);

      expect(adminService.updateAssignationByUserAndRole).toHaveBeenCalledTimes(1);
      expect(adminService.updateAssignationByUserAndRole).toHaveBeenCalledWith(
        userId,
        role,
        assignationUpdate
      );
    });
  });

  describe('updateAssignationById', () => {
    it('should update a role assignation by ID', async () => {
      const assignationId = 'assignation123';
      const assignationUpdate: Partial<RoleAssignationInput> = {
        expiresAt: new Date('2025-12-31'),
      };
      const mockAssignation: RoleAssignationRecord = {
        id_user_role: assignationId,
        user_id: 'user123',
        role_id: 'role1',
        assigned_at: new Date(),
        expires_at: new Date('2025-12-31'),
        status: ROLE_STATUS.ACTIVE,
        role_name: ROLE.INSTRUCTOR,
      };

      adminService.updateAssignationById.mockResolvedValue(mockAssignation);

      const result = await adminController.updateAssignationById(assignationId, assignationUpdate);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAssignation);

      expect(adminService.updateAssignationById).toHaveBeenCalledTimes(1);
      expect(adminService.updateAssignationById).toHaveBeenCalledWith(
        assignationId,
        assignationUpdate
      );
    });
  });

  describe('revokeRoleByUserAndRole', () => {
    it('should revoke a role from a user by user and role', async () => {
      const userId = 'user123';
      const role = ROLE.INSTRUCTOR;

      adminService.revokeRoleByUserAndRole.mockResolvedValue();

      const result = await adminController.revokeRoleByUserAndRole(userId, role);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBe(`Role ${role} revoked from user ${userId} successfully`);

      expect(adminService.revokeRoleByUserAndRole).toHaveBeenCalledTimes(1);
      expect(adminService.revokeRoleByUserAndRole).toHaveBeenCalledWith(userId, role);
    });
  });

  describe('revokeRoleById', () => {
    it('should revoke a role assignation by ID', async () => {
      const assignationId = 'assignation123';

      adminService.revokeRoleById.mockResolvedValue();

      const result = await adminController.revokeRoleById(assignationId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBe(`Role assignation ${assignationId} revoked successfully`);

      expect(adminService.revokeRoleById).toHaveBeenCalledTimes(1);
      expect(adminService.revokeRoleById).toHaveBeenCalledWith(assignationId);
    });
  });

  // ============================================
  // INSTRUCTOR MANAGEMENT TESTS
  // ============================================

  describe('getInstructors', () => {
    it('should return a paginated list of instructors', async () => {
      const params = {
        page: 1,
        size: 10,
        sort: 'average_rating',
        order: 'desc' as 'asc' | 'desc',
      };
      const timestamp = new Date().toISOString();
      const mockInstructors: InstructorRecord[] = [
        {
          id_instructor: 'instructor1',
          total_students: 100,
          total_courses: 5,
          average_rating: '4.75',
          total_reviews: 50,
          verification_status: VERIFICATION_STATUS.VERIFIED,
          verified_at: new Date(),
        },
      ];

      adminService.getInstructors.mockResolvedValue({
        success: true,
        message: 'Instructors retrieved successfully',
        data: mockInstructors,
        timestamp,
        pagination: {
          page: params.page,
          limit: params.size,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });

      const result = await adminController.getInstructors(
        params.page,
        params.size,
        params.sort,
        params.order
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);

      expect(adminService.getInstructors).toHaveBeenCalledTimes(1);
    });
  });

  describe('postInstructor', () => {
    it('should create a new instructor and return instructor ID', async () => {
      const instructorInput: InstructorInput = {
        instructorId: 'user123',
        verificationStatus: VERIFICATION_STATUS.PENDING,
      };
      const instructorId = 'user123';

      adminService.postInstructor.mockResolvedValue(instructorId);

      const result = await adminController.postInstructor(instructorInput);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBe(instructorId);
      expect(result.message).toBe('Instructor created successfully');

      expect(adminService.postInstructor).toHaveBeenCalledTimes(1);
      expect(adminService.postInstructor).toHaveBeenCalledWith(instructorInput);
    });
  });

  describe('updateInstructor', () => {
    it('should update an instructor and return it', async () => {
      const instructorId = 'instructor123';
      const instructorUpdate: Partial<InstructorInput> = {
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        verifiedAt: new Date(),
      };
      const mockInstructor: InstructorRecord = {
        id_instructor: instructorId,
        total_students: 100,
        total_courses: 5,
        average_rating: '4.75',
        total_reviews: 50,
        verification_status: VERIFICATION_STATUS.VERIFIED,
        verified_at: new Date(),
      };

      adminService.updateInstructor.mockResolvedValue(mockInstructor);

      const result = await adminController.updateInstructor(instructorId, instructorUpdate);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInstructor);

      expect(adminService.updateInstructor).toHaveBeenCalledTimes(1);
      expect(adminService.updateInstructor).toHaveBeenCalledWith(instructorId, instructorUpdate);
    });
  });

  describe('deleteInstructor', () => {
    it('should delete an instructor and return success message', async () => {
      const instructorId = 'instructor123';

      adminService.deleteInstructor.mockResolvedValue();

      const result = await adminController.deleteInstructor(instructorId);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data).toBe(`Instructor ${instructorId} deleted successfully`);

      expect(adminService.deleteInstructor).toHaveBeenCalledTimes(1);
      expect(adminService.deleteInstructor).toHaveBeenCalledWith(instructorId);
    });
  });
});
