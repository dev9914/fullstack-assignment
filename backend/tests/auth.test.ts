import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/database';
import { mockEmployee, mockSafeEmployee } from './helpers';

const query = (pool as any).query as jest.Mock;

describe('Auth endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a new employee and returns a token', async () => {
      query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ ...mockEmployee, email: 'new@example.com' }] });

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'New User',
        email: 'NEW@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.employee.email).toBe('new@example.com');
      expect(res.body.data.employee.password_hash).toBeUndefined();
      expect(res.body.data.token).toBeDefined();
      expect(query).toHaveBeenCalledTimes(2);
    });

    it('rejects duplicate emails with 409', async () => {
      query.mockResolvedValueOnce({ rows: [mockEmployee] });

      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Jane',
        email: 'jane@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('already exists');
    });

    it('rejects weak passwords', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test',
        email: 'test@example.com',
        password: 'short',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Password');
    });

    it('rejects invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test',
        email: 'not-an-email',
        password: 'Password123',
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('email');
    });

    it('rejects missing fields', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        email: 'test@example.com',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('logs in with valid credentials', async () => {
      query.mockResolvedValueOnce({ rows: [mockEmployee] });

      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'jane@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.employee).toMatchObject({
        id: mockSafeEmployee.id,
        name: mockSafeEmployee.name,
        email: mockSafeEmployee.email,
        created_at: mockSafeEmployee.created_at.toISOString(),
      });
      expect(res.body.data.employee.password_hash).toBeUndefined();
      expect(res.body.data.token).toBeDefined();
    });

    it('rejects wrong password with 401', async () => {
      query.mockResolvedValueOnce({ rows: [mockEmployee] });

      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'jane@example.com',
        password: 'WrongPassword123',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid');
    });

    it('rejects non-existent email with 401', async () => {
      query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'nobody@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid');
    });

    it('does case-insensitive email lookup', async () => {
      query.mockResolvedValueOnce({ rows: [mockEmployee] });

      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'JANE@EXAMPLE.COM',
        password: 'Password123',
      });

      expect(res.status).toBe(200);
      const firstCallSql = query.mock.calls[0][0];
      expect(firstCallSql).toContain('LOWER');
    });
  });
});
