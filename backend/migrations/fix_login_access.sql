-- Fix Login Access for Shuleni Advantage
-- This script standardizes the password column and approves all test users

-- 1. Ensure the column name is 'password' (as expected by auth.js)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        -- If 'password' column doesn't exist, rename 'password_hash'
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN
            ALTER TABLE users RENAME COLUMN password_hash TO password;
        ELSE
            -- If both exist, sync data and drop the hash one
            UPDATE users SET password = password_hash WHERE password IS NULL;
            ALTER TABLE users DROP COLUMN password_hash;
        END IF;
    END IF;
END $$;

-- 2. Approve all existing users so they can log in
UPDATE users SET status = 'approved' WHERE status = 'pending';

-- 3. Ensure name column exists (for some older seeds that might have missed it)
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
UPDATE users SET full_name = 'Demo User' WHERE full_name IS NULL;
