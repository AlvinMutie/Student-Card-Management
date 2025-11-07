-- Clean Seed Data - Deletes all existing data and creates fresh test data
-- This script ensures all test accounts work properly
-- Passwords: admin123 (admin), parent123 (parents), staff123 (staff)

-- ============================================
-- STEP 1: DELETE ALL EXISTING DATA
-- ============================================
-- Delete in reverse order of dependencies
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE parents CASCADE;
TRUNCATE TABLE staff CASCADE;
TRUNCATE TABLE users CASCADE;

-- ============================================
-- STEP 2: GENERATE FRESH PASSWORD HASHES
-- ============================================
-- Run: node migrations/generate-fresh-hashes.js
-- Then replace the hashes below with the generated ones
-- For now, using known working hashes

-- ============================================
-- STEP 3: INSERT ADMIN USER
-- ============================================
-- Admin: admin@hechlink.edu / admin123
INSERT INTO users (email, password_hash, role) VALUES
('admin@hechlink.edu', '$2b$10$RpghsiPkFR7w.t8i2DX.WuIUpvuXJPW9AeukRN0LvvmsMd6cQ4Ftq', 'admin')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- ============================================
-- STEP 4: INSERT PARENTS WITH STUDENTS
-- ============================================
-- All parents: password is parent123
-- Each parent has 1-2 students with matching last names

DO $$
DECLARE
    parent_user_id INTEGER;
    parent_id_var INTEGER;
    -- Known working hash for parent123
    parent_hash TEXT := '$2b$10$1ppmn63W6DkXHucr.QnnD.KY2NqYfkSbLwuau04lBT1EinI/Sl4IS';
BEGIN
    -- Parent 1: Sarah Onyango - 2 students
    INSERT INTO users (email, password_hash, role) VALUES
    ('sarah.onyango@example.com', parent_hash, 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Sarah Onyango', 'sarah.onyango@example.com', '+254712345001')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3501', 'Emma Onyango', 'NEMIS-7894561001', 'Grade 5 - Red Section', 8500.00, parent_id_var),
    ('ST3502', 'James Onyango', 'NEMIS-7894561002', 'Grade 3 - Blue Section', 12000.00, parent_id_var)
    ON CONFLICT (adm) DO UPDATE SET parent_id = EXCLUDED.parent_id;
    
    -- Parent 2: John Mwangi - 1 student
    INSERT INTO users (email, password_hash, role) VALUES
    ('john.mwangi@example.com', parent_hash, 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'John Mwangi', 'john.mwangi@example.com', '+254712345002')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3503', 'Sophia Mwangi', 'NEMIS-7894561003', 'Grade 7 - Red Section', 15000.00, parent_id_var)
    ON CONFLICT (adm) DO UPDATE SET parent_id = EXCLUDED.parent_id;
    
    -- Parent 3: Mary Kipchoge - 2 students
    INSERT INTO users (email, password_hash, role) VALUES
    ('mary.kipchoge@example.com', parent_hash, 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Mary Kipchoge', 'mary.kipchoge@example.com', '+254712345003')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3504', 'Michael Kipchoge', 'NEMIS-7894561004', 'Grade 4 - Blue Section', 9500.00, parent_id_var),
    ('ST3505', 'Olivia Kipchoge', 'NEMIS-7894561005', 'Grade 2 - Red Section', 11000.00, parent_id_var)
    ON CONFLICT (adm) DO UPDATE SET parent_id = EXCLUDED.parent_id;
    
    -- Parent 4: Peter Njoroge - 1 student
    INSERT INTO users (email, password_hash, role) VALUES
    ('peter.njoroge@example.com', parent_hash, 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Peter Njoroge', 'peter.njoroge@example.com', '+254712345004')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3506', 'William Njoroge', 'NEMIS-7894561006', 'Grade 6 - Blue Section', 13000.00, parent_id_var)
    ON CONFLICT (adm) DO UPDATE SET parent_id = EXCLUDED.parent_id;
    
    -- Parent 5: Jane Wanjiku - 2 students
    INSERT INTO users (email, password_hash, role) VALUES
    ('jane.wanjiku@example.com', parent_hash, 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Jane Wanjiku', 'jane.wanjiku@example.com', '+254712345005')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3507', 'Ava Wanjiku', 'NEMIS-7894561007', 'Grade 8 - Red Section', 18000.00, parent_id_var),
    ('ST3508', 'Alexander Wanjiku', 'NEMIS-7894561008', 'Grade 1 - Blue Section', 7500.00, parent_id_var)
    ON CONFLICT (adm) DO UPDATE SET parent_id = EXCLUDED.parent_id;
    
    -- Parent 6: David Kamau - 1 student
    INSERT INTO users (email, password_hash, role) VALUES
    ('david.kamau@example.com', parent_hash, 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'David Kamau', 'david.kamau@example.com', '+254712345006')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3509', 'Isabella Kamau', 'NEMIS-7894561009', 'Grade 3 - Red Section', 10000.00, parent_id_var)
    ON CONFLICT (adm) DO UPDATE SET parent_id = EXCLUDED.parent_id;
    
    -- Parent 7: Grace Achieng - 2 students
    INSERT INTO users (email, password_hash, role) VALUES
    ('grace.achieng@example.com', parent_hash, 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Grace Achieng', 'grace.achieng@example.com', '+254712345007')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3510', 'Daniel Achieng', 'NEMIS-7894561010', 'Grade 5 - Blue Section', 9000.00, parent_id_var),
    ('ST3511', 'Mia Achieng', 'NEMIS-7894561011', 'Grade 2 - Blue Section', 10500.00, parent_id_var)
    ON CONFLICT (adm) DO UPDATE SET parent_id = EXCLUDED.parent_id;
    
    -- Parent 8: Robert Ochieng - 1 student
    INSERT INTO users (email, password_hash, role) VALUES
    ('robert.ochieng@example.com', parent_hash, 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Robert Ochieng', 'robert.ochieng@example.com', '+254712345008')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3512', 'Matthew Ochieng', 'NEMIS-7894561012', 'Grade 7 - Blue Section', 16000.00, parent_id_var)
    ON CONFLICT (adm) DO UPDATE SET parent_id = EXCLUDED.parent_id;
    
    -- Parent 9: Linda Waweru - 2 students
    INSERT INTO users (email, password_hash, role) VALUES
    ('linda.waweru@example.com', parent_hash, 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Linda Waweru', 'linda.waweru@example.com', '+254712345009')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3513', 'Charlotte Waweru', 'NEMIS-7894561013', 'Grade 4 - Red Section', 9200.00, parent_id_var),
    ('ST3514', 'Joseph Waweru', 'NEMIS-7894561014', 'Grade 1 - Red Section', 7000.00, parent_id_var)
    ON CONFLICT (adm) DO UPDATE SET parent_id = EXCLUDED.parent_id;
    
    -- Parent 10: Thomas Kariuki - 1 student
    INSERT INTO users (email, password_hash, role) VALUES
    ('thomas.kariuki@example.com', parent_hash, 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Thomas Kariuki', 'thomas.kariuki@example.com', '+254712345010')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3515', 'Amelia Kariuki', 'NEMIS-7894561015', 'Grade 6 - Red Section', 14000.00, parent_id_var)
    ON CONFLICT (adm) DO UPDATE SET parent_id = EXCLUDED.parent_id;
    
END $$;

-- ============================================
-- STEP 5: INSERT STAFF MEMBERS
-- ============================================
-- All staff: password is staff123
DO $$
DECLARE
    staff_user_id INTEGER;
    staff_hash TEXT := '$2b$10$qvhkCE5gOHid7Nv9O5GsVOx3aKZEqi.GwI7cdGxmx1qxJ9whTgOnm';
BEGIN
    -- Staff 1: Teacher
    INSERT INTO users (email, password_hash, role) VALUES
    ('staff1@hechlink.edu', staff_hash, 'staff')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO staff_user_id;
    
    INSERT INTO staff (user_id, name, email, phone, staff_no, department, approved) VALUES
    (staff_user_id, 'John Mwangi', 'staff1@hechlink.edu', '+254712346001', 'STF0001', 'Teaching', true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
    
    -- Staff 2: Administrator
    INSERT INTO users (email, password_hash, role) VALUES
    ('staff2@hechlink.edu', staff_hash, 'staff')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO staff_user_id;
    
    INSERT INTO staff (user_id, name, email, phone, staff_no, department, approved) VALUES
    (staff_user_id, 'Mary Wanjiku', 'staff2@hechlink.edu', '+254712346002', 'STF0002', 'Administration', true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
    
    -- Staff 3: Librarian
    INSERT INTO users (email, password_hash, role) VALUES
    ('staff3@hechlink.edu', staff_hash, 'staff')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO staff_user_id;
    
    INSERT INTO staff (user_id, name, email, phone, staff_no, department, approved) VALUES
    (staff_user_id, 'Peter Kamau', 'staff3@hechlink.edu', '+254712346003', 'STF0003', 'Library', true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
    
    -- Staff 4: Nurse
    INSERT INTO users (email, password_hash, role) VALUES
    ('staff4@hechlink.edu', staff_hash, 'staff')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO staff_user_id;
    
    INSERT INTO staff (user_id, name, email, phone, staff_no, department, approved) VALUES
    (staff_user_id, 'Jane Njeri', 'staff4@hechlink.edu', '+254712346004', 'STF0004', 'Health', true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
    
    -- Staff 5: Security
    INSERT INTO users (email, password_hash, role) VALUES
    ('staff5@hechlink.edu', staff_hash, 'staff')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO staff_user_id;
    
    INSERT INTO staff (user_id, name, email, phone, staff_no, department, approved) VALUES
    (staff_user_id, 'Robert Kariuki', 'staff5@hechlink.edu', '+254712346005', 'STF0005', 'Security', true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
DECLARE
    user_count INTEGER;
    parent_count INTEGER;
    student_count INTEGER;
    staff_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO parent_count FROM parents;
    SELECT COUNT(*) INTO student_count FROM students;
    SELECT COUNT(*) INTO staff_count FROM staff;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Clean Seed Data Loaded Successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Users: %', user_count;
    RAISE NOTICE 'Total Parents: %', parent_count;
    RAISE NOTICE 'Total Students: %', student_count;
    RAISE NOTICE 'Total Staff: %', staff_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Test Accounts:';
    RAISE NOTICE 'Admin: admin@hechlink.edu / admin123';
    RAISE NOTICE 'Parent: sarah.onyango@example.com / parent123';
    RAISE NOTICE 'Staff: staff1@hechlink.edu / staff123';
    RAISE NOTICE '========================================';
END $$;

