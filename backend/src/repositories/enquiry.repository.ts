import pool from '../config/database';

export interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  course_interest: string;
  message: string | null;
  claimed_by: string | null;
  created_at: Date;
  claimed_at: Date | null;
}

export interface EnquiryInput {
  name: string;
  email: string;
  phone?: string;
  course_interest: string;
  message?: string;
}

export interface Pagination {
  limit?: number;
  offset?: number;
}

export const enquiryRepository = {
  async create(input: EnquiryInput): Promise<EnquiryRecord> {
    const result = await pool.query<EnquiryRecord>(
      `INSERT INTO enquiries (id, name, email, phone, course_interest, message)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, course_interest, message, claimed_by, created_at, claimed_at`,
      [input.name, input.email, input.phone ?? null, input.course_interest, input.message ?? null]
    );
    return result.rows[0];
  },

  async findUnclaimed(pagination: Pagination = {}): Promise<EnquiryRecord[]> {
    const limit = pagination.limit ?? 50;
    const offset = pagination.offset ?? 0;
    const result = await pool.query<EnquiryRecord>(
      `SELECT id, name, email, phone, course_interest, message, claimed_by, created_at, claimed_at
       FROM enquiries
       WHERE claimed_by IS NULL
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  async findByClaimedBy(employeeId: string, pagination: Pagination = {}): Promise<EnquiryRecord[]> {
    const limit = pagination.limit ?? 50;
    const offset = pagination.offset ?? 0;
    const result = await pool.query<EnquiryRecord>(
      `SELECT id, name, email, phone, course_interest, message, claimed_by, created_at, claimed_at
       FROM enquiries
       WHERE claimed_by = $1
       ORDER BY claimed_at DESC, created_at DESC
       LIMIT $2 OFFSET $3`,
      [employeeId, limit, offset]
    );
    return result.rows;
  },

  async findById(id: string): Promise<EnquiryRecord | null> {
    const result = await pool.query<EnquiryRecord>(
      `SELECT id, name, email, phone, course_interest, message, claimed_by, created_at, claimed_at
       FROM enquiries
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return result.rows[0] ?? null;
  },

  async claimIfUnclaimed(enquiryId: string, employeeId: string): Promise<EnquiryRecord | null> {
    const result = await pool.query<EnquiryRecord>(
      `UPDATE enquiries
       SET claimed_by = $1, claimed_at = NOW()
       WHERE id = $2 AND claimed_by IS NULL
       RETURNING id, name, email, phone, course_interest, message, claimed_by, created_at, claimed_at`,
      [employeeId, enquiryId]
    );
    return result.rows[0] ?? null;
  },
};
