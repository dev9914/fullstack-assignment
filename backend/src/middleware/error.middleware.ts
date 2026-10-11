import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { ZodError } from 'zod';

const handleZodError = (err: ZodError): AppError => {
  const messages = err.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
  return new AppError(messages.join('; '), 400);
};

const handleCastError = (err: any): AppError => {
  if (err.code === '22P02' || err.routine === 'string_to_uuid') {
    return new AppError('Invalid UUID format.', 400);
  }
  return new AppError('Invalid request data.', 400);
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (env.NODE_ENV === 'development') {
    if (err instanceof Error) {
      console.error('[error]', err.message);
      if (err.stack) console.error(err.stack);
    } else {
      console.error('[error]', err);
    }
  }

  if (err instanceof ZodError) {
    const appErr = handleZodError(err);
    res.status(appErr.statusCode).json({
      status: 'fail',
      message: appErr.message,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
    return;
  }

  const anyErr = err as any;
  if (anyErr && (anyErr.code === '22P02' || anyErr.routine === 'string_to_uuid')) {
    const appErr = handleCastError(anyErr);
    res.status(appErr.statusCode).json({
      status: 'fail',
      message: appErr.message,
    });
    return;
  }

  if (anyErr && anyErr.code === '23505') {
    res.status(409).json({
      status: 'fail',
      message: 'A record with that value already exists.',
    });
    return;
  }

  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : anyErr instanceof Error
        ? anyErr.message
        : 'Internal server error';

  res.status(500).json({
    status: 'error',
    message,
  });
};
