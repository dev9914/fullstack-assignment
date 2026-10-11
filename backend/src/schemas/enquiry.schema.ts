import { z } from 'zod';

const uuidSchema = z.string().uuid('Invalid UUID format');

export const createEnquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  course_interest: z.string().trim().min(1, 'Course interest is required').max(100),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const enquiryIdParamSchema = z.object({
  id: uuidSchema,
});

export const listQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : parseInt(v, 10)))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 1 && v <= 100), {
      message: 'limit must be an integer between 1 and 100',
    })
    .optional(),
  offset: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : parseInt(v, 10)))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0), {
      message: 'offset must be a non-negative integer',
    })
    .optional(),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type EnquiryIdParam = z.infer<typeof enquiryIdParamSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
