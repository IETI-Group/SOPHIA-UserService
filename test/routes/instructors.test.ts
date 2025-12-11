import express, { type Express, type Router } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type InstructorController from '../../src/controllers/InstructorController.js';
import { VERIFICATION_STATUS } from '../../src/db/schema.js';

const instructorController = mockDeep<InstructorController>();

vi.mock('../../src/config/diContainer.js', () => ({
  default: {
    resolve: vi.fn(() => instructorController),
  },
}));

let instructorsRouter: Router;

describe('Instructors Routes Validation Tests', () => {
  let app: Express;

  beforeEach(async () => {
    mockReset(instructorController);

    const routerModule = await import('../../src/routes/instructors.js');
    instructorsRouter = routerModule.default;

    app = express();
    app.use(express.json());
    app.use('/api/v1/instructors', instructorsRouter);

    app.use(
      (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(400).json({ error: err.message });
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/instructors/:instructorId', () => {
    it('should accept valid instructor ID', async () => {
      instructorController.getInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_instructor: 'instructor123',
          total_students: 100,
          total_courses: 5,
          average_rating: '4.5',
          total_reviews: 50,
          verification_status: VERIFICATION_STATUS.VERIFIED,
          verified_at: new Date('2024-01-01'),
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).get('/api/v1/instructors/instructor123');

      expect(response.status).toBe(200);
    });

    it('should return list of instructors when no ID is provided', async () => {
      // Mock para el método getInstructors del controlador
      instructorController.getInstructors.mockResolvedValue({
        success: true,
        message: 'Instructors retrieved successfully',
        data: [],
        timestamp: new Date().toISOString(),
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });

      const response = await request(app).get('/api/v1/instructors/');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/instructors', () => {
    it('should accept valid instructor creation', async () => {
      instructorController.postInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_instructor: 'instructor123',
          total_students: 0,
          total_courses: 0,
          average_rating: '0',
          total_reviews: 0,
          verification_status: VERIFICATION_STATUS.PENDING,
          verified_at: null,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/instructors').send({
        instructorId: 'user123',
        verificationStatus: 'pending',
      });

      expect(response.status).toBe(201);
    });

    it('should reject missing instructor ID', async () => {
      const response = await request(app).post('/api/v1/instructors').send({
        verificationStatus: 'pending',
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid verification status', async () => {
      const response = await request(app).post('/api/v1/instructors').send({
        instructorId: 'user123',
        verificationStatus: 'INVALID_STATUS',
      });

      expect(response.status).toBe(400);
    });

    it('should accept instructor creation without optional fields', async () => {
      instructorController.postInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_instructor: 'instructor456',
          total_students: 0,
          total_courses: 0,
          average_rating: '0',
          total_reviews: 0,
          verification_status: VERIFICATION_STATUS.PENDING,
          verified_at: null,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/instructors').send({
        instructorId: 'user456',
      });

      expect(response.status).toBe(201);
    });

    it('should accept instructor creation with verified status and date', async () => {
      instructorController.postInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_instructor: 'instructor789',
          total_students: 0,
          total_courses: 0,
          average_rating: '0',
          total_reviews: 0,
          verification_status: VERIFICATION_STATUS.VERIFIED,
          verified_at: new Date('2024-01-15'),
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/instructors').send({
        instructorId: 'user789',
        verificationStatus: 'verified',
        verifiedAt: '2024-01-15',
      });

      expect(response.status).toBe(201);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app).post('/api/v1/instructors').send({
        instructorId: 'user123',
        verificationStatus: 'verified',
        verifiedAt: 'invalid-date',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/instructors/:instructorId', () => {
    it('should accept valid instructor update', async () => {
      instructorController.updateInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
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

      const response = await request(app).put('/api/v1/instructors/instructor123').send({
        verificationStatus: 'verified',
        verifiedAt: '2024-01-15',
      });

      expect(response.status).toBe(200);
    });

    it('should accept update with only verification status', async () => {
      instructorController.updateInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id_instructor: 'instructor123',
          total_students: 100,
          total_courses: 5,
          average_rating: '4.5',
          total_reviews: 50,
          verification_status: VERIFICATION_STATUS.REJECTED,
          verified_at: null,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).put('/api/v1/instructors/instructor123').send({
        verificationStatus: 'rejected',
      });

      expect(response.status).toBe(200);
    });

    it('should reject invalid verification status', async () => {
      const response = await request(app).put('/api/v1/instructors/instructor123').send({
        verificationStatus: 'INVALID_STATUS',
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app).put('/api/v1/instructors/instructor123').send({
        verifiedAt: 'invalid-date',
      });

      expect(response.status).toBe(400);
    });

    it('should reject empty instructor ID', async () => {
      const response = await request(app).put('/api/v1/instructors/').send({
        verificationStatus: 'verified',
      });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/instructors/:instructorId', () => {
    it('should accept valid instructor deletion', async () => {
      instructorController.deleteInstructor.mockResolvedValue({
        success: true,
        message: 'Success',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).delete('/api/v1/instructors/instructor123');

      expect(response.status).toBe(200);
    });

    it('should reject empty instructor ID', async () => {
      const response = await request(app).delete('/api/v1/instructors/');

      expect(response.status).toBe(404);
    });
  });
});
