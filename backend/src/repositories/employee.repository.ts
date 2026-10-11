import pool from '../config/database';

export interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

export interface SafeEmployee {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

export const employeeRepository = {
  async findByEmail(email: string): Promise<EmployeeRecord | null> {
    const result = await pool.query<EmployeeRecord>(
      `SELECT id, name, email, password_hash, created_at
       FROM employees
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );
    return result.rows[0] ?? null;
  },

  async findById(id: string): Promise<EmployeeRecord | null> {
    const result = await pool.query<EmployeeRecord>(
      `SELECT id, name, email, password_hash, created_at
       FROM employees
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return result.rows[0] ?? null;
  },

  async create(name: string, email: string, passwordHash: string): Promise<EmployeeRecord> {
    const result = await pool.query<EmployeeRecord>(
      `INSERT INTO employees (id, name, email, password_hash)
       VALUES (gen_random_uuid(), $1, LOWER($2), $3)
       RETURNING id, name, email, password_hash, created_at`,
      [name, email, passwordHash]
    );
    return result.rows[0];
  },
};

export const toSafeEmployee = (emp: EmployeeRecord): SafeEmployee => ({
  id: emp.id,
  name: emp.name,
  email: emp.email,
  created_at: emp.created_at,
});
