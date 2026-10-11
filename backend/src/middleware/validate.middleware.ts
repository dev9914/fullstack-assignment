import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

type Source = 'body' | 'params' | 'query';

export const validate =
  (schema: ZodSchema, source: Source = 'body'): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      return next(new AppError(messages.join('; '), 400));
    }
    (req as any)[source] = result.data;
    next();
  };
