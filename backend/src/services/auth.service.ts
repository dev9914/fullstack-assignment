import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import {
  employeeRepository,
  SafeEmployee,
  toSafeEmployee,
} from '../repositories/employee.repository';

export interface AuthResult {
  employee: SafeEmployee;
  token: string;
}

const SALT_ROUNDS = 12;

const signToken = (employeeId: string): string => {
  return jwt.sign({ sub: employeeId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const existing = await employeeRepository.findByEmail(email);
    if (existing) {
      throw new AppError('An employee with that email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const employee = await employeeRepository.create(name, email, passwordHash);
    const token = signToken(employee.id);

    return {
      employee: toSafeEmployee(employee),
      token,
    };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const employee = await employeeRepository.findByEmail(email);
    if (!employee) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isValid = await bcrypt.compare(password, employee.password_hash);
    if (!isValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = signToken(employee.id);

    return {
      employee: toSafeEmployee(employee),
      token,
    };
  },
};
