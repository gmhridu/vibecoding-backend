import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { userRoutes } from '../routes/v1/users';

const app = new Hono();
app.route('/users', userRoutes);

describe('User API', () => {
  describe('GET /users', () => {
    it('should return empty array when no users exist', async () => {
      const res = await app.request('/users');
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST /users', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const res = await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.email).toBe(userData.email);
      expect(data.data.firstName).toBe(userData.firstName);
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const res = await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe('Validation Error');
    });

    it('should return validation error for short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
      };

      const res = await app.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe('Validation Error');
    });
  });

  describe('GET /users/:id', () => {
    it('should return 404 for non-existent user', async () => {
      const res = await app.request('/users/non-existent-id');
      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.error).toBe('User not found');
    });
  });
});
