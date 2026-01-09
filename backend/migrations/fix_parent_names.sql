-- Fix missing parent names and emails in students table
-- This script updates the students table with data from the linked parents table

UPDATE students
SET 
    parent_name = p.name,
    parent_email = p.email
FROM parents p
WHERE students.parent_id = p.id;

-- Output confirmation
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % student records with parent details.', updated_count;
END $$;
