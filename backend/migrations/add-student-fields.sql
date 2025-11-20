-- Migration: Add additional student fields for QR code and ID card data
-- Adds: stream, house, date_of_admission, date_of_completion, meal_card_validity

-- Add new columns to students table if they don't exist
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS stream VARCHAR(50),
ADD COLUMN IF NOT EXISTS house VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_of_admission DATE,
ADD COLUMN IF NOT EXISTS date_of_completion DATE,
ADD COLUMN IF NOT EXISTS meal_card_validity DATE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_stream ON students(stream);
CREATE INDEX IF NOT EXISTS idx_students_house ON students(house);

