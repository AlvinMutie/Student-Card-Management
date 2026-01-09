-- Create Parent accounts and User records from existing student data
-- This script processes the 'parent_name' and 'parent_email' columns in the students table

DO $$
DECLARE
    parent_rec RECORD;
    new_user_id INTEGER;
    new_parent_id INTEGER;
    pw_hash TEXT := '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa'; -- 'parent123'
BEGIN
    FOR parent_rec IN 
        SELECT DISTINCT parent_name, parent_email 
        FROM students 
        WHERE parent_email IS NOT NULL AND parent_email != ''
    LOOP
        -- 1. Create User account if it doesn't exist
        INSERT INTO users (email, password, role, status, full_name)
        VALUES (parent_rec.parent_email, pw_hash, 'parent', 'approved', parent_rec.parent_name)
        ON CONFLICT (email) DO UPDATE SET 
            full_name = EXCLUDED.full_name,
            role = 'parent',
            status = 'approved'
        RETURNING id INTO new_user_id;

        -- 2. Create Parent record link if it doesn't exist
        INSERT INTO parents (user_id, name, email)
        VALUES (new_user_id, parent_rec.parent_name, parent_rec.parent_email)
        ON CONFLICT (email) DO UPDATE SET
            user_id = EXCLUDED.user_id,
            name = EXCLUDED.name
        RETURNING id INTO new_parent_id;

        -- 3. Link existing students to this newly created parent record
        UPDATE students 
        SET parent_id = new_parent_id 
        WHERE parent_email = parent_rec.parent_email;
        
        RAISE NOTICE 'Processed parent: % (%)', parent_rec.parent_name, parent_rec.parent_email;
    END LOOP;
END $$;
