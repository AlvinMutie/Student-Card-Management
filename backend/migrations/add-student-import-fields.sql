-- Migration: add extended import fields for students
-- Adds support columns for contact metadata captured during Excel/CSV imports

ALTER TABLE students
ADD COLUMN IF NOT EXISTS contact VARCHAR(50),
ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS kcpe_score VARCHAR(50);

-- Optional indexes (skip for now to avoid unnecessary bloat). These fields are
-- mostly used for display/filtering without heavy querying.


