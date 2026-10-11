import { jest } from '@jest/globals';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-with-at-least-16-chars';
process.env.JWT_EXPIRES_IN = '1d';
process.env.PORT = '4000';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USER = 'fastor';
process.env.DB_PASSWORD = 'fastor_password';
process.env.DB_NAME = 'fastor_crm';
process.env.CORS_ORIGIN = 'http://localhost:5173';

type QueryFn = (...args: any[]) => Promise<{ rows: any[] }>;
type AnyFn = (...args: any[]) => any;

jest.mock('../src/config/database', () => {
  const mockQuery = jest.fn<QueryFn>();
  const mockClientQuery = jest.fn<QueryFn>();
  mockClientQuery.mockResolvedValue({ rows: [] });
  const mockClient = {
    query: mockClientQuery,
    release: jest.fn<AnyFn>(),
  };
  const mockConnect = jest.fn<AnyFn>();
  mockConnect.mockResolvedValue(mockClient);
  const mockEnd = jest.fn<AnyFn>();
  mockEnd.mockResolvedValue(undefined);
  const mockPool = {
    query: mockQuery,
    connect: mockConnect,
    on: jest.fn<AnyFn>(),
    end: mockEnd,
  };
  return {
    __esModule: true,
    default: mockPool,
    mockQuery,
  };
});
