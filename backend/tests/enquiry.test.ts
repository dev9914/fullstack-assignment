import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import pool from '../src/config/database';
import {
  mockEnquiry,
  mockClaimedEnquiry,
  uuid,
  uuid2,
  uuid3,
} from './helpers';

const query = (pool as any).query as jest.Mock;

const signToken = (sub: string): string => {
  return jwt.sign({ sub }, process.env.JWT_SECRET as string, { expiresIn: '1d' });
};

const authHeader = (sub: string = uuid) => ({
  Authorization: `Bearer ${signToken(sub)}`,
});

describe('Enquiry endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/enquiries (public)', () => {
    it('creates an enquiry without authentication', async () => {
      query.mockResolvedValueOnce({ rows: [mockEnquiry] });

      const res = await request(app).post('/api/v1/enquiries').send({
        name: 'Prospect',
        email: 'prospect@example.com',
        course_interest: 'Data Science',
        message: 'Interested in the course.',
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.enquiry.id).toBe(uuid2);
      expect(res.body.data.enquiry.claimed_by).toBeNull();
    });

    it('creates an enquiry with optional phone omitted', async () => {
      query.mockResolvedValueOnce({ rows: [{ ...mockEnquiry, phone: null }] });

      const res = await request(app).post('/api/v1/enquiries').send({
        name: 'Prospect',
        email: 'prospect@example.com',
        course_interest: 'Data Science',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.enquiry.phone).toBeNull();
    });

    it('rejects missing required fields', async () => {
      const res = await request(app).post('/api/v1/enquiries').send({
        name: 'Prospect',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/enquiries/unclaimed', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/v1/enquiries/unclaimed');
      expect(res.status).toBe(401);
    });

    it('returns unclaimed enquiries for an authenticated employee', async () => {
      query.mockResolvedValueOnce({ rows: [mockEnquiry] });

      const res = await request(app)
        .get('/api/v1/enquiries/unclaimed')
        .set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.enquiries).toHaveLength(1);
      expect(res.body.data.enquiries[0].claimed_by).toBeNull();
    });

    it('does not include claimed enquiries in unclaimed list', async () => {
      query.mockResolvedValueOnce({ rows: [mockEnquiry] });

      const res = await request(app)
        .get('/api/v1/enquiries/unclaimed')
        .set(authHeader());

      expect(res.status).toBe(200);
      for (const e of res.body.data.enquiries) {
        expect(e.claimed_by).toBeNull();
      }
    });
  });

  describe('PATCH /api/v1/enquiries/:id/claim', () => {
    it('claims an unclaimed enquiry', async () => {
      query.mockResolvedValueOnce({ rows: [mockClaimedEnquiry] });

      const res = await request(app)
        .patch(`/api/v1/enquiries/${uuid2}/claim`)
        .set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.enquiry.claimed_by).toBe(uuid);
      expect(res.body.data.enquiry.claimed_at).toBeDefined();
      expect(query.mock.calls[0][0]).toContain('claimed_by IS NULL');
    });

    it('returns 401 without authentication', async () => {
      const res = await request(app).patch(`/api/v1/enquiries/${uuid2}/claim`);
      expect(res.status).toBe(401);
    });

    it('returns 404 when the enquiry does not exist', async () => {
      query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .patch(`/api/v1/enquiries/${uuid3}/claim`)
        .set(authHeader());

      expect(res.status).toBe(404);
    });

    it('returns 409 when the enquiry is already claimed', async () => {
      query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [mockClaimedEnquiry] });

      const res = await request(app)
        .patch(`/api/v1/enquiries/${uuid2}/claim`)
        .set(authHeader(uuid3));

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already been claimed');
    });

    it('rejects malformed UUID in params', async () => {
      const res = await request(app)
        .patch('/api/v1/enquiries/not-a-uuid/claim')
        .set(authHeader());

      expect(res.status).toBe(400);
    });

    it('uses the authenticated employee id, not a client-supplied one', async () => {
      query.mockResolvedValueOnce({ rows: [mockClaimedEnquiry] });

      const res = await request(app)
        .patch(`/api/v1/enquiries/${uuid2}/claim`)
        .set(authHeader(uuid3));

      expect(res.status).toBe(200);
      const params = query.mock.calls[0][1];
      expect(params[0]).toBe(uuid3);
    });
  });

  describe('GET /api/v1/enquiries/my', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/v1/enquiries/my');
      expect(res.status).toBe(401);
    });

    it('returns only enquiries claimed by the authenticated employee', async () => {
      query.mockResolvedValueOnce({ rows: [mockClaimedEnquiry] });

      const res = await request(app)
        .get('/api/v1/enquiries/my')
        .set(authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.enquiries).toHaveLength(1);
      expect(res.body.data.enquiries[0].claimed_by).toBe(uuid);
    });

    it('isolates ownership — another employee sees their own list', async () => {
      const otherClaimed = {
        ...mockClaimedEnquiry,
        id: uuid3,
        claimed_by: uuid3,
      };
      query.mockResolvedValueOnce({ rows: [otherClaimed] });

      const res = await request(app)
        .get('/api/v1/enquiries/my')
        .set(authHeader(uuid3));

      expect(res.status).toBe(200);
      const params = query.mock.calls[0][1];
      expect(params[0]).toBe(uuid3);
      expect(res.body.data.enquiries[0].claimed_by).toBe(uuid3);
    });
  });

  describe('GET /health', () => {
    it('returns 200 ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
    });
  });
});
