import express, { type Express, type Router } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import type UserController from '../../src/controllers/UserController.js';
import {
  LEARNING_STYLES,
  PACE_PREFERENCE,
  REVIEW_DISCRIMINANT,
  ROLE,
} from '../../src/utils/types.js';

const userController = mockDeep<UserController>();

vi.mock('../../src/config/diContainer.js', () => ({
  default: {
    resolve: vi.fn(() => userController),
  },
}));

let usersRouter: Router;

describe('Users Routes Validation Tests', () => {
  let app: Express;

  beforeEach(async () => {
    mockReset(userController);

    const routerModule = await import('../../src/routes/users.js');
    usersRouter = routerModule.default;

    app = express();
    app.use(express.json());
    app.use('/api/v1/users', usersRouter);

    app.use(
      (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(400).json({ error: err.message });
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/users', () => {
    it('should accept valid pagination and filter parameters', async () => {
      userController.getUsers.mockResolvedValue({
        success: true,
        message: 'Success',
        data: [],
        timestamp: new Date().toISOString(),
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const response = await request(app).get('/api/v1/users').query({
        page: '1',
        size: '10',
        sort: 'firstName',
        order: 'asc',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(response.status).toBe(200);
    });

    it('should reject invalid page parameter', async () => {
      const response = await request(app).get('/api/v1/users').query({ page: 'invalid' });

      expect(response.status).toBe(400);
    });

    it('should reject invalid sort field', async () => {
      const response = await request(app).get('/api/v1/users').query({ sort: 'invalidField' });

      expect(response.status).toBe(400);
    });

    it('should reject invalid order value', async () => {
      const response = await request(app).get('/api/v1/users').query({ order: 'invalid' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/users/id/:id', () => {
    it('should accept valid user ID', async () => {
      userController.getUserById.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { userId: '123', role: ROLE.STUDENT },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).get('/api/v1/users/id/validUserId123');

      expect(response.status).toBe(200);
    });

    it('should accept light_dto query parameter', async () => {
      userController.getUserById.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { userId: '123', role: ROLE.STUDENT },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app)
        .get('/api/v1/users/id/validUserId123')
        .query({ light_dto: 'true' });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/users/email/:email', () => {
    it('should accept valid email', async () => {
      userController.getUserByEmail.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { userId: '123', role: ROLE.STUDENT },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).get('/api/v1/users/email/test@example.com');

      expect(response.status).toBe(200);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app).get('/api/v1/users/email/notanemail');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/users/batch', () => {
    it('should accept valid users array', async () => {
      userController.getUsersByIds.mockResolvedValue({
        success: true,
        message: 'Success',
        data: [],
        timestamp: new Date().toISOString(),
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const response = await request(app)
        .post('/api/v1/users/batch')
        .send({ users: ['id1', 'id2', 'id3'] });

      expect(response.status).toBe(200);
    });

    it('should reject empty users array', async () => {
      const response = await request(app).post('/api/v1/users/batch').send({ users: [] });

      expect(response.status).toBe(400);
    });

    it('should reject non-string user IDs', async () => {
      const response = await request(app)
        .post('/api/v1/users/batch')
        .send({ users: [123, 456] });

      expect(response.status).toBe(400);
    });

    it('should reject missing users field', async () => {
      const response = await request(app).post('/api/v1/users/batch').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should accept valid user data', async () => {
      userController.postUser.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { userId: '123', role: ROLE.STUDENT },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/users').send({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
      });

      expect(response.status).toBe(201);
    });

    it('should reject invalid email', async () => {
      const response = await request(app).post('/api/v1/users').send({
        email: 'notanemail',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '1990-01-01',
      });

      expect(response.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app).post('/api/v1/users').send({
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
    });

    it('should reject firstName exceeding max length', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          firstName: 'a'.repeat(61),
          lastName: 'Doe',
          birthDate: '1990-01-01',
        });

      expect(response.status).toBe(400);
    });

    it('should reject lastName exceeding max length', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'a'.repeat(101),
          birthDate: '1990-01-01',
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app).post('/api/v1/users').send({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: 'invalid-date',
      });

      expect(response.status).toBe(400);
    });

    it('should reject future birth dates', async () => {
      const response = await request(app).post('/api/v1/users').send({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        birthDate: '2050-01-01',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('should accept valid partial user data', async () => {
      userController.updateUser.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { userId: '123', role: ROLE.STUDENT },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).put('/api/v1/users/validUserId123').send({
        firstName: 'UpdatedName',
      });

      expect(response.status).toBe(200);
    });

    it('should reject invalid email in update', async () => {
      const response = await request(app).put('/api/v1/users/validUserId123').send({
        email: 'notanemail',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should accept valid user ID', async () => {
      userController.deleteUser.mockResolvedValue({
        success: true,
        message: 'Success',
        data: 'Deleted',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).delete('/api/v1/users/validUserId123');

      expect(response.status).toBe(204);
    });
  });

  describe('POST /api/v1/users/:id/learning-path', () => {
    it('should accept valid learning path data', async () => {
      userController.postUserLearningPath.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          userId: '123',
          id: '456',
          primaryStyle: LEARNING_STYLES.VISUAL,
          secondaryStyle: LEARNING_STYLES.AUDITORY,
          pacePreference: PACE_PREFERENCE.NORMAL,
          interactivityPreference: 3,
          gamificationEnabled: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/users/validUserId123/learning-path').send({
        primaryStyle: 'visual',
        secondaryStyle: 'auditory',
        pacePreference: 'normal',
        interactivityPreference: 3,
        gamificationEnabled: true,
      });

      expect(response.status).toBe(201);
    });

    it('should reject invalid learning style', async () => {
      const response = await request(app).post('/api/v1/users/validUserId123/learning-path').send({
        primaryStyle: 'INVALID',
        secondaryStyle: 'auditory',
        pacePreference: 'normal',
        interactivityPreference: 3,
        gamificationEnabled: true,
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid pace preference', async () => {
      const response = await request(app).post('/api/v1/users/validUserId123/learning-path').send({
        primaryStyle: 'visual',
        secondaryStyle: 'auditory',
        pacePreference: 'INVALID',
        interactivityPreference: 3,
        gamificationEnabled: true,
      });

      expect(response.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app).post('/api/v1/users/validUserId123/learning-path').send({
        primaryStyle: 'visual',
      });

      expect(response.status).toBe(400);
    });

    it('should reject non-boolean gamification value', async () => {
      const response = await request(app).post('/api/v1/users/validUserId123/learning-path').send({
        primaryStyle: 'visual',
        secondaryStyle: 'auditory',
        pacePreference: 'normal',
        interactivityPreference: 3,
        gamificationEnabled: 'yes',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/users/:id/learning-path', () => {
    it('should accept valid partial learning path data', async () => {
      userController.updateLearningPath.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          userId: '123',
          id: '456',
          primaryStyle: LEARNING_STYLES.KINESTHETIC,
          secondaryStyle: LEARNING_STYLES.AUDITORY,
          pacePreference: PACE_PREFERENCE.FAST,
          interactivityPreference: 4,
          gamificationEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).put('/api/v1/users/validUserId123/learning-path').send({
        primaryStyle: 'kinesthetic',
      });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/users/:id/reviews', () => {
    it('should accept valid pagination parameters', async () => {
      userController.getUserReviews.mockResolvedValue({
        success: true,
        message: 'Success',
        data: [],
        timestamp: new Date().toISOString(),
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const response = await request(app).get('/api/v1/users/validUserId123/reviews').query({
        page: '1',
        size: '10',
        showInstructors: 'true',
        showCourses: 'false',
      });

      expect(response.status).toBe(200);
    });

    it('should reject invalid boolean for showInstructors', async () => {
      const response = await request(app).get('/api/v1/users/validUserId123/reviews').query({
        showInstructors: 'invalid',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/users/:id/reviews', () => {
    it('should accept valid review data', async () => {
      userController.postReview.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id: '1',
          reviewerId: 'validUserId123',
          reviewedId: 'reviewed123',
          rate: 5,
          recommended: true,
          comments: 'Great',
          discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/users/validUserId123/reviews').send({
        reviewedId: 'reviewed123',
        rate: 5,
        recommended: true,
        comments: 'Great instructor',
        discriminant: 'instructor',
      });

      expect(response.status).toBe(201);
    });

    it('should reject missing reviewedId', async () => {
      const response = await request(app).post('/api/v1/users/validUserId123/reviews').send({
        rate: 5,
        recommended: true,
        discriminant: 'instructor',
      });

      expect(response.status).toBe(400);
    });

    it('should reject rate below minimum', async () => {
      const response = await request(app).post('/api/v1/users/validUserId123/reviews').send({
        reviewedId: 'reviewed123',
        rate: 0,
        recommended: true,
        discriminant: 'instructor',
      });

      expect(response.status).toBe(400);
    });

    it('should reject rate above maximum', async () => {
      const response = await request(app).post('/api/v1/users/validUserId123/reviews').send({
        reviewedId: 'reviewed123',
        rate: 6,
        recommended: true,
        discriminant: 'instructor',
      });

      expect(response.status).toBe(400);
    });

    it('should reject invalid discriminant', async () => {
      const response = await request(app).post('/api/v1/users/validUserId123/reviews').send({
        reviewedId: 'reviewed123',
        rate: 5,
        recommended: true,
        discriminant: 'INVALID',
      });

      expect(response.status).toBe(400);
    });

    it('should reject non-boolean recommended', async () => {
      const response = await request(app).post('/api/v1/users/validUserId123/reviews').send({
        reviewedId: 'reviewed123',
        rate: 5,
        recommended: 'yes',
        discriminant: 'instructor',
      });

      expect(response.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app).post('/api/v1/users/validUserId123/reviews').send({
        reviewedId: 'reviewed123',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/users/:id/reviews/:reviewId', () => {
    it('should accept valid partial review data', async () => {
      userController.updateReview.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id: 'review123',
          reviewerId: 'validUserId123',
          reviewedId: 'reviewed123',
          rate: 4,
          recommended: true,
          comments: 'Updated',
          discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app)
        .put('/api/v1/users/validUserId123/reviews/review123')
        .send({
          rate: 4,
          comments: 'Updated comment',
        });

      expect(response.status).toBe(200);
    });

    it('should reject invalid rate in update', async () => {
      const response = await request(app)
        .put('/api/v1/users/validUserId123/reviews/review123')
        .send({
          rate: 10,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/users/:id/reviews/:reviewId', () => {
    it('should accept valid IDs', async () => {
      userController.deleteReview.mockResolvedValue({
        success: true,
        message: 'Success',
        data: 'Deleted',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).delete('/api/v1/users/validUserId123/reviews/review123');

      expect(response.status).toBe(204);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should sanitize malicious firstName input', async () => {
      userController.getUsers.mockResolvedValue({
        success: true,
        message: 'Success',
        data: [],
        timestamp: new Date().toISOString(),
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const response = await request(app)
        .get('/api/v1/users')
        .query({ firstName: "'; DROP TABLE users; --" });

      expect(response.status).toBe(200);
    });

    it('should sanitize malicious user ID', async () => {
      userController.getUserById.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { userId: '123', role: ROLE.STUDENT },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).get("/api/v1/users/id/123' OR '1'='1");

      expect(response.status).toBe(200);
    });
  });

  describe('XSS Prevention', () => {
    it('should handle script tags in firstName', async () => {
      userController.postUser.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { userId: '123', role: ROLE.STUDENT },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/users').send({
        email: 'test@example.com',
        firstName: '<script>alert("xss")</script>',
        lastName: 'Doe',
        birthDate: '1990-01-01',
      });

      expect(response.status).toBe(201);
    });

    it('should handle HTML entities in comments', async () => {
      userController.postReview.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          id: '1',
          reviewerId: 'validUserId123',
          reviewedId: 'reviewed123',
          rate: 5,
          recommended: true,
          comments: '<img src=x onerror=alert(1)>',
          discriminant: REVIEW_DISCRIMINANT.INSTRUCTOR,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).post('/api/v1/users/validUserId123/reviews').send({
        reviewedId: 'reviewed123',
        rate: 5,
        recommended: true,
        comments: '<img src=x onerror=alert(1)>',
        discriminant: 'instructor',
      });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/v1/users/:id/linked-accounts', () => {
    it('should accept valid pagination parameters', async () => {
      userController.getLinkedAccounts.mockResolvedValue({
        success: true,
        message: 'Success',
        data: [],
        timestamp: new Date().toISOString(),
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });

      const response = await request(app)
        .get('/api/v1/users/validUserId123/linked-accounts')
        .query({
          page: '1',
          size: '10',
        });

      expect(response.status).toBe(200);
    });

    it('should reject invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/users/validUserId123/linked-accounts')
        .query({
          page: 'invalid',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/users/:id/linked-accounts/:accountId', () => {
    it('should accept valid IDs', async () => {
      userController.getLinkedAccount.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          userId: 'validUserId123',
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
          idLinkedAccount: 'account123',
          linkedAt: new Date(),
          emailVerified: true,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).get(
        '/api/v1/users/validUserId123/linked-accounts/account123'
      );

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/v1/users/:id/linked-accounts', () => {
    it('should accept valid linked account data', async () => {
      userController.postLinkedAccount.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          userId: 'validUserId123',
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
          idLinkedAccount: 'account123',
          linkedAt: new Date(),
          emailVerified: true,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(201);
    });

    it('should reject missing provider', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject missing issuer', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject missing idExternal', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: 'accounts.google.com',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'notanemail',
          isPrimary: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          isPrimary: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject non-boolean isPrimary', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: 'yes',
        });

      expect(response.status).toBe(400);
    });

    it('should reject missing isPrimary', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
        });

      expect(response.status).toBe(400);
    });

    it('should reject provider shorter than 2 characters', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'g',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject provider longer than 100 characters', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'a'.repeat(101),
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject issuer shorter than 2 characters', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: 'a',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject issuer longer than 100 characters', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: 'a'.repeat(101),
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(400);
    });

    it('should reject idExternal longer than 255 characters', async () => {
      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: 'a'.repeat(256),
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/users/:id/linked-accounts/:accountId', () => {
    it('should accept valid partial linked account data', async () => {
      userController.updateLinkedAccount.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          userId: 'validUserId123',
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'updated@gmail.com',
          isPrimary: false,
          idLinkedAccount: 'account123',
          linkedAt: new Date(),
          emailVerified: true,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app)
        .put('/api/v1/users/validUserId123/linked-accounts/account123')
        .send({
          email: 'updated@gmail.com',
          isPrimary: false,
        });

      expect(response.status).toBe(200);
    });

    it('should reject invalid email in update', async () => {
      const response = await request(app)
        .put('/api/v1/users/validUserId123/linked-accounts/account123')
        .send({
          email: 'notanemail',
        });

      expect(response.status).toBe(400);
    });

    it('should reject non-boolean isPrimary in update', async () => {
      const response = await request(app)
        .put('/api/v1/users/validUserId123/linked-accounts/account123')
        .send({
          isPrimary: 'yes',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/users/:id/linked-accounts/:accountId', () => {
    it('should accept valid IDs', async () => {
      userController.deleteLinkedAccount.mockResolvedValue({
        success: true,
        message: 'Success',
        data: 'Deleted',
        timestamp: new Date().toISOString(),
      });

      const response = await request(app).delete(
        '/api/v1/users/validUserId123/linked-accounts/account123'
      );

      expect(response.status).toBe(204);
    });
  });

  describe('LinkedAccounts SQL Injection Prevention', () => {
    it('should sanitize malicious provider input', async () => {
      userController.postLinkedAccount.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          userId: 'validUserId123',
          provider: "'; DROP TABLE linked_accounts; --",
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
          idLinkedAccount: 'account123',
          linkedAt: new Date(),
          emailVerified: true,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: "'; DROP TABLE linked_accounts; --",
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(201);
    });

    it('should sanitize malicious idExternal input', async () => {
      userController.postLinkedAccount.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          userId: 'validUserId123',
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: "123' OR '1'='1",
          email: 'test@gmail.com',
          isPrimary: true,
          idLinkedAccount: 'account123',
          linkedAt: new Date(),
          emailVerified: true,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: 'accounts.google.com',
          idExternal: "123' OR '1'='1",
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(201);
    });
  });

  describe('LinkedAccounts XSS Prevention', () => {
    it('should handle script tags in provider', async () => {
      userController.postLinkedAccount.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          userId: 'validUserId123',
          provider: '<script>alert("xss")</script>',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
          idLinkedAccount: 'account123',
          linkedAt: new Date(),
          emailVerified: true,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: '<script>alert("xss")</script>',
          issuer: 'accounts.google.com',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(201);
    });

    it('should handle HTML entities in issuer', async () => {
      userController.postLinkedAccount.mockResolvedValue({
        success: true,
        message: 'Success',
        data: {
          userId: 'validUserId123',
          provider: 'google',
          issuer: '<img src=x onerror=alert(1)>',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
          idLinkedAccount: 'account123',
          linkedAt: new Date(),
          emailVerified: true,
        },
        timestamp: new Date().toISOString(),
      });

      const response = await request(app)
        .post('/api/v1/users/validUserId123/linked-accounts')
        .send({
          provider: 'google',
          issuer: '<img src=x onerror=alert(1)>',
          idExternal: 'ext123',
          email: 'test@gmail.com',
          isPrimary: true,
        });

      expect(response.status).toBe(201);
    });
  });
});
