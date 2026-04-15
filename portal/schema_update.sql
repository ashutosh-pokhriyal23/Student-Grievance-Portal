-- Core verification system columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS student_unique_id text UNIQUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS branch text;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS college_name text;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS year_of_validation text;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending';

-- Ensure email uniqueness
ALTER TABLE users 
ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_student_unique_id 
ON users(student_unique_id);

-- NOTE: DO NOT DROP is_verified yet until full system test passes
