import { afterEach, describe, expect, it } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { ROLE, ROLE_STATUS, VERIFICATION_STATUS } from '../../../src/db/schema.js';
import { FiltersInstructor, FiltersRoleAssignation } from '../../../src/models/index.js';
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
} from '../../../src/repositories/index.js';
import AdminServiceImpl from '../../../src/services/implementations/AdminServiceImpl.js';

describe('AdminServiceImpl tests', () => {
  const rolesRepository = mockDeep<RolesRepository>();
  const roleAssignationsRepository = mockDeep<RoleAssignationsRepository>();
  const instructorsRepository = mockDeep<InstructorsRepository>();
  const adminService = new AdminServiceImpl(
    rolesRepository,
    roleAssignationsRepository,
    instructorsRepository
  );

  afterEach(() => {
    mockReset(rolesRepository);
    mockReset(roleAssignationsRepository);
    mockReset(instructorsRepository);
  });

  // ============================================
  // ROLE MANAGEMENT TESTS
  // ============================================

  describe('getRoles', () => {
    it('should call rolesRepository.getRoles and return the result', async () => {
      const page = 1;
      const size = 10;
      const sort = 'name';
      const order = 'asc';
      const mockResponse = {
        success: true,
        message: 'Roles retrieved successfully',
        data: [] as RoleRecord[],
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      rolesRepository.getRoles.mockResolvedValue(mockResponse);

      const result = await adminService.getRoles(page, size, sort, order);

      expect(result).toEqual(mockResponse);
      expect(rolesRepository.getRoles).toHaveBeenCalledTimes(1);
      expect(rolesRepository.getRoles).toHaveBeenCalledWith(page, size, sort, order);
    });
  });

  describe('getRole', () => {
    it('should call rolesRepository.getRole and return the result', async () => {
      const roleName = 'admin';
      const mockRole: RoleRecord = {
        id_role: '1',
        name: ROLE.ADMIN,
        description: 'Admin role',
      };

      rolesRepository.getRole.mockResolvedValue(mockRole);

      const result = await adminService.getRole(roleName);

      expect(result).toEqual(mockRole);
      expect(rolesRepository.getRole).toHaveBeenCalledTimes(1);
      expect(rolesRepository.getRole).toHaveBeenCalledWith(roleName);
    });
  });

  describe('postRole', () => {
    it('should call rolesRepository.postRole and return the result', async () => {
      const roleInput: RoleInput = {
        name: ROLE.INSTRUCTOR,
        description: 'Instructor role',
      };
      const mockRole: RoleRecord = {
        id_role: '2',
        name: ROLE.INSTRUCTOR,
        description: 'Instructor role',
      };

      rolesRepository.postRole.mockResolvedValue(mockRole);

      const result = await adminService.postRole(roleInput);

      expect(result).toEqual(mockRole);
      expect(rolesRepository.postRole).toHaveBeenCalledTimes(1);
      expect(rolesRepository.postRole).toHaveBeenCalledWith(roleInput);
    });
  });

  describe('updateRole', () => {
    it('should call rolesRepository.updateRole and return the result', async () => {
      const roleName = 'instructor';
      const roleUpdate: Partial<RoleInput> = {
        description: 'Updated instructor role',
      };
      const mockRole: RoleRecord = {
        id_role: '2',
        name: ROLE.INSTRUCTOR,
        description: 'Updated instructor role',
      };

      rolesRepository.updateRole.mockResolvedValue(mockRole);

      const result = await adminService.updateRole(roleName, roleUpdate);

      expect(result).toEqual(mockRole);
      expect(rolesRepository.updateRole).toHaveBeenCalledTimes(1);
      expect(rolesRepository.updateRole).toHaveBeenCalledWith(roleName, roleUpdate);
    });
  });

  describe('deleteRole', () => {
    it('should call rolesRepository.deleteRole', async () => {
      const roleName = 'guest';

      rolesRepository.deleteRole.mockResolvedValue();

      await adminService.deleteRole(roleName);

      expect(rolesRepository.deleteRole).toHaveBeenCalledTimes(1);
      expect(rolesRepository.deleteRole).toHaveBeenCalledWith(roleName);
    });
  });

  // ============================================
  // ROLE ASSIGNATION TESTS
  // ============================================

  describe('getAssignedRoles', () => {
    it('should call roleAssignationsRepository.getAssignedRoles with filters', async () => {
      const page = 1;
      const size = 10;
      const sort = 'assigned_at';
      const order = 'desc';
      const filters = new FiltersRoleAssignation(null, null, null, null, ROLE_STATUS.ACTIVE, null);
      const mockResponse = {
        success: true,
        message: 'Role assignations retrieved successfully',
        data: [] as RoleAssignationRecord[],
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      roleAssignationsRepository.getAssignedRoles.mockResolvedValue(mockResponse);

      const result = await adminService.getAssignedRoles(page, size, sort, order, filters);

      expect(result).toEqual(mockResponse);
      expect(roleAssignationsRepository.getAssignedRoles).toHaveBeenCalledTimes(1);
      expect(roleAssignationsRepository.getAssignedRoles).toHaveBeenCalledWith(
        page,
        size,
        filters,
        sort,
        order
      );
    });
  });

  describe('assignRole', () => {
    it('should call roleAssignationsRepository.createAssignation and return the result', async () => {
      const userId = 'user123';
      const role = ROLE.INSTRUCTOR;
      const assignationId = 'assignation123';

      roleAssignationsRepository.createAssignation.mockResolvedValue(assignationId);

      const result = await adminService.assignRole(userId, role);

      expect(result).toBe(assignationId);
      expect(roleAssignationsRepository.createAssignation).toHaveBeenCalledTimes(1);
      expect(roleAssignationsRepository.createAssignation).toHaveBeenCalledWith(userId, role);
    });
  });

  describe('updateAssignationByUserAndRole', () => {
    it('should call roleAssignationsRepository.updateAssignationByUserAndRole', async () => {
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

      roleAssignationsRepository.updateAssignationByUserAndRole.mockResolvedValue(mockAssignation);

      const result = await adminService.updateAssignationByUserAndRole(
        userId,
        role,
        assignationUpdate
      );

      expect(result).toEqual(mockAssignation);
      expect(roleAssignationsRepository.updateAssignationByUserAndRole).toHaveBeenCalledTimes(1);
      expect(roleAssignationsRepository.updateAssignationByUserAndRole).toHaveBeenCalledWith(
        userId,
        role,
        assignationUpdate
      );
    });
  });

  describe('updateAssignationById', () => {
    it('should call roleAssignationsRepository.updateAssignationById', async () => {
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

      roleAssignationsRepository.updateAssignationById.mockResolvedValue(mockAssignation);

      const result = await adminService.updateAssignationById(assignationId, assignationUpdate);

      expect(result).toEqual(mockAssignation);
      expect(roleAssignationsRepository.updateAssignationById).toHaveBeenCalledTimes(1);
      expect(roleAssignationsRepository.updateAssignationById).toHaveBeenCalledWith(
        assignationId,
        assignationUpdate
      );
    });
  });

  describe('revokeRoleByUserAndRole', () => {
    it('should call roleAssignationsRepository.deleteAssignationByUserAndRole', async () => {
      const userId = 'user123';
      const role = ROLE.INSTRUCTOR;

      roleAssignationsRepository.deleteAssignationByUserAndRole.mockResolvedValue();

      await adminService.revokeRoleByUserAndRole(userId, role);

      expect(roleAssignationsRepository.deleteAssignationByUserAndRole).toHaveBeenCalledTimes(1);
      expect(roleAssignationsRepository.deleteAssignationByUserAndRole).toHaveBeenCalledWith(
        userId,
        role
      );
    });
  });

  describe('revokeRoleById', () => {
    it('should call roleAssignationsRepository.deleteAssignationById', async () => {
      const assignationId = 'assignation123';

      roleAssignationsRepository.deleteAssignationById.mockResolvedValue();

      await adminService.revokeRoleById(assignationId);

      expect(roleAssignationsRepository.deleteAssignationById).toHaveBeenCalledTimes(1);
      expect(roleAssignationsRepository.deleteAssignationById).toHaveBeenCalledWith(assignationId);
    });
  });

  // ============================================
  // INSTRUCTOR MANAGEMENT TESTS
  // ============================================

  describe('getInstructors', () => {
    it('should call instructorsRepository.getInstructors with filters', async () => {
      const page = 1;
      const size = 10;
      const sort = 'average_rating';
      const order = 'desc';
      const filters = new FiltersInstructor(VERIFICATION_STATUS.VERIFIED, null, null, null, null, false);
      const mockResponse = {
        success: true,
        message: 'Instructors retrieved successfully',
        data: [] as InstructorRecord[],
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      instructorsRepository.getInstructors.mockResolvedValue(mockResponse);

      const result = await adminService.getInstructors(page, size, sort, order, filters);

      expect(result).toEqual(mockResponse);
      expect(instructorsRepository.getInstructors).toHaveBeenCalledTimes(1);
      expect(instructorsRepository.getInstructors).toHaveBeenCalledWith(
        page,
        size,
        filters,
        sort,
        order
      );
    });
  });

  describe('postInstructor', () => {
    it('should call instructorsRepository.postInstructor and return the result', async () => {
      const instructorInput: InstructorInput = {
        instructorId: 'user123',
        verificationStatus: VERIFICATION_STATUS.PENDING,
      };
      const instructorId = 'user123';

      instructorsRepository.postInstructor.mockResolvedValue(instructorId);

      const result = await adminService.postInstructor(instructorInput);

      expect(result).toBe(instructorId);
      expect(instructorsRepository.postInstructor).toHaveBeenCalledTimes(1);
      expect(instructorsRepository.postInstructor).toHaveBeenCalledWith(instructorInput);
    });
  });

  describe('updateInstructor', () => {
    it('should call instructorsRepository.updateInstructor and return the result', async () => {
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

      instructorsRepository.updateInstructor.mockResolvedValue(mockInstructor);

      const result = await adminService.updateInstructor(instructorId, instructorUpdate);

      expect(result).toEqual(mockInstructor);
      expect(instructorsRepository.updateInstructor).toHaveBeenCalledTimes(1);
      expect(instructorsRepository.updateInstructor).toHaveBeenCalledWith(
        instructorId,
        instructorUpdate
      );
    });
  });

  describe('deleteInstructor', () => {
    it('should call instructorsRepository.deleteInstructor', async () => {
      const instructorId = 'instructor123';

      instructorsRepository.deleteInstructor.mockResolvedValue();

      await adminService.deleteInstructor(instructorId);

      expect(instructorsRepository.deleteInstructor).toHaveBeenCalledTimes(1);
      expect(instructorsRepository.deleteInstructor).toHaveBeenCalledWith(instructorId);
    });
  });
});
