import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  sub: string;
}

declare global {
  namespace Express {
    interface Request {
      employeeId?: string;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing bearer token.', 401));
  }

  const token = authHeader.slice(7);
  if (!token) {
    return next(new AppError('Authentication required. Missing bearer token.', 401));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!payload.sub) {
      return next(new AppError('Invalid token payload.', 401));
    }
    req.employeeId = payload.sub;
    next();
  } catch {
    return next(new AppError('Invalid or expired token.', 401));
  }
};
