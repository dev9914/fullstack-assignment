import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .default('4000')
    .transform((v) => parseInt(v, 10))
    .refine((v) => !Number.isNaN(v), 'PORT must be a valid number'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z
    .string()
    .default('5432')
    .transform((v) => parseInt(v, 10))
    .refine((v) => !Number.isNaN(v), 'DB_PORT must be a valid number'),
  DB_USER: z.string().default('fastor'),
  DB_PASSWORD: z.string().default('fastor_password'),
  DB_NAME: z.string().default('fastor_crm'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
