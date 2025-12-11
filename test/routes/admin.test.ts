import express, { type Express, type Router } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type AdminController from '../../src/controllers/AdminController.js';
import { ROLE, ROLE_STATUS, VERIFICATION_STATUS } from '../../src/db/schema.js';

const adminController = mockDeep<AdminController>();

vi.mock('../../src/config/diContainer.js', () => ({
  default: {
    resolve: vi.fn(() => adminController),
  },
}));

let adminRouter: Router;

describe('Admin Routes Validation Tests', () => {
  let app: Express;

  beforeEach(async () => {
    mockReset(adminController);

    const routerModule = await import('../../src/routes/admin.js');
    adminRouter = routerModule.default;

    app = express();
    app.use(express.json());
    app.use('/api/v1/admin', adminRouter);

    app.use(
      (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(400).json({ error: err.message });
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==================== ROLE ROUTES ====================
  describe('GET /api/v1/admin/roles', () => {
    it('should accept valid pagination and sort parameters', async () => {
      adminController.getRoles.mockResolvedValue({
        success: true,
        message: 'Success',
        data: [],
        timestamp: new Date().toISOString(),
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const response = await request(app).get('/api/v1/admin/roles').query({
        page: '1',
        size: '10',
      });

      expect(response.status).toBe(200);
    });

    it('should reject invalid page parameter', async () => {
      const response = await request(app).get('/api/v1/admin/roles').query({ page: 'invalid' });

      expect(response.status).toBe(400);
    });

    it('should reject invalid sort field', async () => {
      const response = await request(app).get('/api/v1/admin/roles').query({ sort: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/admin/roles/:roleName', () => {
    it('should accept valid role name', async () => {
      adminController.getRole.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_role: '1',
          name: ROLE.ADMIN,
          description: 'Admin role',
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).get(`/api/v1/admin/roles/${ROLE.ADMIN}`);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/v1/admin/roles', () => {
    it('should accept valid role creation', async () => {
      adminController.postRole.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_role: '1',
          name: ROLE.STUDENT,
          description: 'Student role',
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/admin/roles').send({
        name: ROLE.STUDENT,
        description: 'Student role',
      });

      expect(response.status).toBe(201);
    });

    it('should reject missing role name', async () => {
      const response = await request(app).post('/api/v1/admin/roles').send({
        description: 'Role without name',
      });

      expect(response.status).toBe(400);
    });

    it('should accept role creation without description', async () => {
      adminController.postRole.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_role: '1',
          name: ROLE.INSTRUCTOR,
          description: null,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/admin/roles').send({
        name: ROLE.INSTRUCTOR,
      });

      expect(response.status).toBe(201);
    });
  });

  describe('PUT /api/v1/admin/roles/:roleName', () => {
    it('should accept valid role update', async () => {
      adminController.updateRole.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_role: '1',
          name: ROLE.ADMIN,
          description: 'Updated description',
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).put(`/api/v1/admin/roles/${ROLE.ADMIN}`).send({
        description: 'Updated description',
      });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/admin/roles/:roleName', () => {
    it('should accept valid role deletion', async () => {
      adminController.deleteRole.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).delete(`/api/v1/admin/roles/${ROLE.ADMIN}`);

      expect(response.status).toBe(200);
    });
  });

  // ==================== ROLE ASSIGNATION ROUTES ====================
  describe('GET /api/v1/admin/assignations', () => {
    it('should accept valid pagination and filter parameters', async () => {
      adminController.getAssignedRoles.mockResolvedValue({
        success: true,
        message: 'Success',
        data: [],
        timestamp: new Date().toISOString(),
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const response = await request(app).get('/api/v1/admin/assignations').query({
        page: '1',
        size: '10',
        assignmentStartDate: '2024-01-01',
        roleStatus: ROLE_STATUS.ACTIVE,
        role: ROLE.INSTRUCTOR,
      });

      expect(response.status).toBe(200);
    });

    it('should reject invalid role enum', async () => {
      const response = await request(app).get('/api/v1/admin/assignations').query({
        role: 'INVALID_ROLE',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/admin/assignations', () => {
    it('should accept valid role assignment', async () => {
      adminController.assignRole.mockResolvedValue({
        success: true,
        message: 'Success',
        data: 'assignation-id-123',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/admin/assignations').send({
        userId: 'user123',
        role: ROLE.INSTRUCTOR,
      });

      expect(response.status).toBe(201);
    });

    it('should reject missing userId', async () => {
      const response = await request(app).post('/api/v1/admin/assignations').send({
        role: ROLE.INSTRUCTOR,
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/admin/assignations/user/:userId/role/:role', () => {
    it('should accept valid assignation update', async () => {
      adminController.updateAssignationByUserAndRole.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_user_role: '1',
          user_id: 'user123',
          role_id: 'role-1',
          assigned_at: new Date(),
          expires_at: new Date('2025-12-31'),
          status: ROLE_STATUS.ACTIVE,
          role_name: ROLE.INSTRUCTOR,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app)
        .put(`/api/v1/admin/assignations/user/user123/role/${ROLE.INSTRUCTOR}`)
        .send({
          expiresAt: '2025-12-31',
          status: ROLE_STATUS.ACTIVE,
        });

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/v1/admin/assignations/:assignationId', () => {
    it('should accept valid assignation update by ID', async () => {
      adminController.updateAssignationById.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_user_role: 'assignation123',
          user_id: 'user123',
          role_id: 'role-1',
          assigned_at: new Date(),
          expires_at: null,
          status: ROLE_STATUS.INACTIVE,
          role_name: ROLE.INSTRUCTOR,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).put('/api/v1/admin/assignations/assignation123').send({
        status: ROLE_STATUS.INACTIVE,
      });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/admin/assignations/user/:userId/role/:role', () => {
    it('should accept valid assignation deletion', async () => {
      adminController.revokeRoleByUserAndRole.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).delete(
        `/api/v1/admin/assignations/user/user123/role/${ROLE.INSTRUCTOR}`
      );

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/admin/assignations/:assignationId', () => {
    it('should accept valid assignation deletion by ID', async () => {
      adminController.revokeRoleById.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).delete('/api/v1/admin/assignations/assignation123');

      expect(response.status).toBe(200);
    });
  });

  // ==================== INSTRUCTOR ROUTES ====================
  describe('GET /api/v1/admin/instructors', () => {
    it('should accept valid pagination and filter parameters', async () => {
      adminController.getInstructors.mockResolvedValue({
        success: true,
        message: 'Success',
        data: [],
        timestamp: new Date().toISOString(),
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const response = await request(app).get('/api/v1/admin/instructors').query({
        page: '1',
        size: '10',
        verification_status: 'verified',
      });

      expect(response.status).toBe(200);
    });

    it('should reject invalid verification status enum', async () => {
      const response = await request(app).get('/api/v1/admin/instructors').query({
        verification_status: 'INVALID_STATUS',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/admin/instructors', () => {
    it('should accept valid instructor creation', async () => {
      adminController.postInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        data: 'instructor-id-123',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/admin/instructors').send({
        instructorId: 'user123',
        verificationStatus: 'pending',
      });

      expect(response.status).toBe(201);
    });

    it('should reject missing instructor ID', async () => {
      const response = await request(app).post('/api/v1/admin/instructors').send({
        verificationStatus: 'pending',
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid verification status', async () => {
      const response = await request(app).post('/api/v1/admin/instructors').send({
        instructorId: 'user123',
        verificationStatus: 'INVALID_STATUS',
      });

      expect(response.status).toBe(400);
    });

    it('should accept instructor creation with verified status and date', async () => {
      adminController.postInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        data: 'instructor-id-456',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/admin/instructors').send({
        instructorId: 'user456',
        verificationStatus: 'verified',
        verifiedAt: '2024-01-15',
      });

      expect(response.status).toBe(201);
    });
  });

  describe('PUT /api/v1/admin/instructors/:instructorId', () => {
    it('should accept valid instructor update', async () => {
      adminController.updateInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          first_name: 'John',
          last_name: 'Mack',
          id_instructor: 'instructor123',
          total_students: 100,
          total_courses: 5,
          average_rating: '4.5',
          total_reviews: 50,
          verification_status: VERIFICATION_STATUS.VERIFIED,
          verified_at: new Date('2024-01-15'),
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).put('/api/v1/admin/instructors/instructor123').send({
        verificationStatus: 'verified',
        verifiedAt: '2024-01-15',
      });

      expect(response.status).toBe(200);
    });

    it('should reject invalid verification status', async () => {
      const response = await request(app).put('/api/v1/admin/instructors/instructor123').send({
        verificationStatus: 'INVALID',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/admin/instructors/:instructorId', () => {
    it('should accept valid instructor deletion', async () => {
      adminController.deleteInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).delete('/api/v1/admin/instructors/instructor123');

      expect(response.status).toBe(200);
    });

    it('should reject empty instructor ID', async () => {
      const response = await request(app).delete('/api/v1/admin/instructors/');

      expect(response.status).toBe(404);
    });
  });
});
