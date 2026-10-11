import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import enquiryRoutes from './routes/enquiry.routes';
import { errorHandler } from './middleware/error.middleware';
import { AppError } from './utils/AppError';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: { status: 'ok', timestamp: new Date().toISOString() },
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/enquiries', enquiryRoutes);

app.all('*', (_req: Request, _res: Response, next) => {
  next(new AppError(`Route not found: ${_req.method} ${_req.originalUrl}`, 404));
});

app.use(errorHandler);

export default app;
