-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT employees_email_unique UNIQUE (email)
);

-- Case-insensitive email lookup index
CREATE UNIQUE INDEX IF NOT EXISTS employees_email_lower_idx
  ON employees (LOWER(email));

-- Enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  course_interest VARCHAR(100) NOT NULL,
  message TEXT,
  claimed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  CONSTRAINT enquiries_claim_state_valid
    CHECK (
      (claimed_by IS NULL AND claimed_at IS NULL)
      OR
      (claimed_by IS NOT NULL AND claimed_at IS NOT NULL)
    )
);

-- Index for unclaimed enquiries lookup
CREATE INDEX IF NOT EXISTS enquiries_unclaimed_idx
  ON enquiries (created_at DESC)
  WHERE claimed_by IS NULL;

-- Index for enquiries claimed by a specific employee
CREATE INDEX IF NOT EXISTS enquiries_claimed_by_idx
  ON enquiries (claimed_by, claimed_at DESC)
  WHERE claimed_by IS NOT NULL;
