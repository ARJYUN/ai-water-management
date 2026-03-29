const request = require('supertest');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Mock Database
jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

// Mock Middlewares before importing the router
jest.mock('../../middleware/auth', () => (req, res, next) => {
  req.user = { id: 'test-user-id', role: 'Admin' };
  next();
});

jest.mock('../../middleware/role', () => (...roles) => (req, res, next) => {
  next();
});

const db = require('../../config/db');
const workloadRouter = require('../../routes/workloads');

// Setup a minimal express app for testing
const app = express();
app.use(express.json());

// Mock Auth and Role Middlewares
app.use((req, res, next) => {
  req.user = { role: 'Admin', id: 'test-user-id' };
  next();
});

app.use('/api/workloads', workloadRouter);

describe('Workloads Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/workloads - should submit a new workload', async () => {
    db.query.mockResolvedValue([{ insertId: 1 }]);

    const response = await request(app)
      .post('/api/workloads')
      .send({ type: 'training', region: 'us-central' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Workload submitted.');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO ai_workloads'),
      expect.any(Array)
    );
  });

  test('POST /api/workloads - should fail if type is missing', async () => {
    const response = await request(app)
      .post('/api/workloads')
      .send({ region: 'us-central' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('type and region required.');
  });
});
