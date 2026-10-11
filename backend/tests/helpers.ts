import pool from '../src/config/database';

export const getMockQuery = (): jest.Mock => {
  return (pool as any).query as jest.Mock;
};

export const uuid = '123e4567-e89b-12d3-a456-426614174000';
export const uuid2 = '123e4567-e89b-12d3-a456-426614174001';
export const uuid3 = '123e4567-e89b-12d3-a456-426614174002';

export const mockEmployee = {
  id: uuid,
  name: 'Jane Counselor',
  email: 'jane@example.com',
  password_hash: 'hashed-password',
  created_at: new Date('2026-01-01T00:00:00.000Z'),
};

export const mockSafeEmployee = {
  id: uuid,
  name: 'Jane Counselor',
  email: 'jane@example.com',
  created_at: new Date('2026-01-01T00:00:00.000Z'),
};

export const mockEnquiry = {
  id: uuid2,
  name: 'Prospect Student',
  email: 'prospect@example.com',
  phone: '+919999999999',
  course_interest: 'Full Stack Development',
  message: 'I want to enroll.',
  claimed_by: null,
  created_at: new Date('2026-01-02T00:00:00.000Z'),
  claimed_at: null,
};

export const mockClaimedEnquiry = {
  ...mockEnquiry,
  claimed_by: uuid,
  claimed_at: new Date('2026-01-03T00:00:00.000Z'),
};
