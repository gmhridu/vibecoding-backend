// Test setup file
import { beforeAll, afterAll } from 'vitest';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.PORT = '3001';

// Global test setup
beforeAll(async () => {
  // Setup test database or mocks
  console.log('Setting up tests...');
});

afterAll(async () => {
  // Cleanup test database or mocks
  console.log('Cleaning up tests...');
});
