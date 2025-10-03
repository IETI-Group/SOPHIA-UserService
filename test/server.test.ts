import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/app.js';

describe('SOPHIA User Service API', () => {
  const prefix = app.get('apiPrefix');
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/').expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Welcome to SOPHIA User Service API',
        version: 'v1',
        endpoints: {
          health: `${prefix}/health`,
        },
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get(`${prefix}/health`).expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'SOPHIA User Service is running successfully',
        service: 'sophia-user-service',
        version: '1.0.0',
      });

      expect(response.body.timestamp).toBeDefined();
      expect(response.body.environment).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.memory).toBeDefined();
      expect(response.body.memory.used).toBeTypeOf('number');
      expect(response.body.memory.total).toBeTypeOf('number');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for nonexistent routes', async () => {
      const response = await request(app).get('/nonexistent').expect(404);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Not found - /nonexistent',
      });
    });
  });
});
