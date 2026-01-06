-- Realistic Test Data for Student Card Management System
-- This file contains consistent, realistic test data with proper parent-student relationships
-- Each parent has 1-2 students with matching last names

-- Insert Admin User (password: admin123)
INSERT INTO users (email, password, role, status) VALUES
('admin@hechlink.edu', '$2b$10$Qbh6FQoHiV9yNZba57Duqekx6wSwB31Y5BoswIyMbiIjJDqEi73Ou', 'admin', 'approved')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, status = EXCLUDED.status;

-- Insert Parents with Students (password: parent123 for all)
-- Each parent has 1-2 students with matching family names
DO $$
DECLARE
    parent_user_id INTEGER;
    parent_id_var INTEGER;
    student_adm TEXT;
    i INTEGER;
    j INTEGER;
    num_students INTEGER;
    class_names TEXT[] := ARRAY[
        'Grade 1 - Red Section', 'Grade 1 - Blue Section',
        'Grade 2 - Red Section', 'Grade 2 - Blue Section',
        'Grade 3 - Red Section', 'Grade 3 - Blue Section',
        'Grade 4 - Red Section', 'Grade 4 - Blue Section',
        'Grade 5 - Red Section', 'Grade 5 - Blue Section',
        'Grade 6 - Red Section', 'Grade 6 - Blue Section',
        'Grade 7 - Red Section', 'Grade 7 - Blue Section',
        'Grade 8 - Red Section', 'Grade 8 - Blue Section'
    ];
    -- Parent data: name, email, phone
    parent_data RECORD;
    -- Student first names
    student_first_names TEXT[] := ARRAY[
        'Emma', 'James', 'Sophia', 'Michael', 'Olivia', 'William', 'Ava', 'Alexander',
        'Isabella', 'Daniel', 'Mia', 'Matthew', 'Charlotte', 'Joseph', 'Amelia', 'David',
        'Harper', 'Andrew', 'Evelyn', 'Joshua', 'Abigail', 'Christopher', 'Emily', 'Anthony',
        'Elizabeth', 'Mark', 'Sofia', 'Steven', 'Aria', 'Madison'
    ];
BEGIN
    -- Create 20 parents with realistic data
    -- Each parent will have 1-2 students
    
    -- Parent 1: Onyango Family (2 students)
    INSERT INTO users (email, password, role, status) VALUES
    ('sarah.onyango@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent', 'approved')
    ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, status = EXCLUDED.status
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Sarah Onyango', 'sarah.onyango@example.com', '+254712345001')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3501', 'Emma Onyango', 'NEMIS-7894561001', 'Grade 5 - Red Section', 8500.00, parent_id_var),
    ('ST3502', 'James Onyango', 'NEMIS-7894561002', 'Grade 3 - Blue Section', 12000.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 2: Mwangi Family (1 student)
    INSERT INTO users (email, password, role, status) VALUES
    ('john.mwangi@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent', 'approved')
    ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, status = EXCLUDED.status
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'John Mwangi', 'john.mwangi@example.com', '+254712345002')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3503', 'Sophia Mwangi', 'NEMIS-7894561003', 'Grade 7 - Red Section', 15000.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 3: Kipchoge Family (2 students)
    INSERT INTO users (email, password, role, status) VALUES
    ('mary.kipchoge@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent', 'approved')
    ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, status = EXCLUDED.status
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Mary Kipchoge', 'mary.kipchoge@example.com', '+254712345003')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3504', 'Michael Kipchoge', 'NEMIS-7894561004', 'Grade 4 - Blue Section', 9500.00, parent_id_var),
    ('ST3505', 'Olivia Kipchoge', 'NEMIS-7894561005', 'Grade 2 - Red Section', 11000.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 4: Njoroge Family (1 student)
    INSERT INTO users (email, password, role, status) VALUES
    ('peter.njoroge@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent', 'approved')
    ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, status = EXCLUDED.status
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Peter Njoroge', 'peter.njoroge@example.com', '+254712345004')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3506', 'William Njoroge', 'NEMIS-7894561006', 'Grade 6 - Blue Section', 13000.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 5: Wanjiku Family (2 students)
    INSERT INTO users (email, password_hash, role) VALUES
    ('jane.wanjiku@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Jane Wanjiku', 'jane.wanjiku@example.com', '+254712345005')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3507', 'Ava Wanjiku', 'NEMIS-7894561007', 'Grade 8 - Red Section', 18000.00, parent_id_var),
    ('ST3508', 'Alexander Wanjiku', 'NEMIS-7894561008', 'Grade 1 - Blue Section', 7500.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 6: Kamau Family (1 student)
    INSERT INTO users (email, password_hash, role) VALUES
    ('david.kamau@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'David Kamau', 'david.kamau@example.com', '+254712345006')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3509', 'Isabella Kamau', 'NEMIS-7894561009', 'Grade 3 - Red Section', 10000.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 7: Achieng Family (2 students)
    INSERT INTO users (email, password_hash, role) VALUES
    ('grace.achieng@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Grace Achieng', 'grace.achieng@example.com', '+254712345007')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3510', 'Daniel Achieng', 'NEMIS-7894561010', 'Grade 5 - Blue Section', 9000.00, parent_id_var),
    ('ST3511', 'Mia Achieng', 'NEMIS-7894561011', 'Grade 2 - Blue Section', 10500.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 8: Ochieng Family (1 student)
    INSERT INTO users (email, password_hash, role) VALUES
    ('robert.ochieng@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Robert Ochieng', 'robert.ochieng@example.com', '+254712345008')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3512', 'Matthew Ochieng', 'NEMIS-7894561012', 'Grade 7 - Blue Section', 16000.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 9: Waweru Family (2 students)
    INSERT INTO users (email, password_hash, role) VALUES
    ('linda.waweru@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Linda Waweru', 'linda.waweru@example.com', '+254712345009')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3513', 'Charlotte Waweru', 'NEMIS-7894561013', 'Grade 4 - Red Section', 9200.00, parent_id_var),
    ('ST3514', 'Joseph Waweru', 'NEMIS-7894561014', 'Grade 1 - Red Section', 7000.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 10: Kariuki Family (1 student)
    INSERT INTO users (email, password_hash, role) VALUES
    ('thomas.kariuki@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Thomas Kariuki', 'thomas.kariuki@example.com', '+254712345010')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3515', 'Amelia Kariuki', 'NEMIS-7894561015', 'Grade 6 - Red Section', 14000.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 11: Njeri Family (2 students)
    INSERT INTO users (email, password_hash, role) VALUES
    ('susan.njeri@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Susan Njeri', 'susan.njeri@example.com', '+254712345011')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3516', 'David Njeri', 'NEMIS-7894561016', 'Grade 8 - Blue Section', 19000.00, parent_id_var),
    ('ST3517', 'Harper Njeri', 'NEMIS-7894561017', 'Grade 3 - Blue Section', 9800.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 12: Mutua Family (1 student)
    INSERT INTO users (email, password_hash, role) VALUES
    ('brian.mutua@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Brian Mutua', 'brian.mutua@example.com', '+254712345012')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3518', 'Andrew Mutua', 'NEMIS-7894561018', 'Grade 5 - Red Section', 8800.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 13: Wambui Family (2 students)
    INSERT INTO users (email, password_hash, role) VALUES
    ('esther.wambui@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Esther Wambui', 'esther.wambui@example.com', '+254712345013')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3519', 'Evelyn Wambui', 'NEMIS-7894561019', 'Grade 2 - Red Section', 10200.00, parent_id_var),
    ('ST3520', 'Joshua Wambui', 'NEMIS-7894561020', 'Grade 4 - Blue Section', 9400.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 14: Kinyua Family (1 student)
    INSERT INTO users (email, password_hash, role) VALUES
    ('samuel.kinyua@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Samuel Kinyua', 'samuel.kinyua@example.com', '+254712345014')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3521', 'Abigail Kinyua', 'NEMIS-7894561021', 'Grade 7 - Red Section', 15500.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 15: Nyambura Family (2 students)
    INSERT INTO users (email, password_hash, role) VALUES
    ('ruth.nyambura@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Ruth Nyambura', 'ruth.nyambura@example.com', '+254712345015')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3522', 'Christopher Nyambura', 'NEMIS-7894561022', 'Grade 6 - Blue Section', 13500.00, parent_id_var),
    ('ST3523', 'Emily Nyambura', 'NEMIS-7894561023', 'Grade 1 - Blue Section', 7200.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 16: Gitau Family (1 student)
    INSERT INTO users (email, password_hash, role) VALUES
    ('paul.gitau@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Paul Gitau', 'paul.gitau@example.com', '+254712345016')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3524', 'Anthony Gitau', 'NEMIS-7894561024', 'Grade 8 - Red Section', 17500.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 17: Akinyi Family (2 students)
    INSERT INTO users (email, password_hash, role) VALUES
    ('florence.akinyi@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Florence Akinyi', 'florence.akinyi@example.com', '+254712345017')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3525', 'Elizabeth Akinyi', 'NEMIS-7894561025', 'Grade 3 - Red Section', 9600.00, parent_id_var),
    ('ST3526', 'Mark Akinyi', 'NEMIS-7894561026', 'Grade 5 - Blue Section', 8700.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 18: Omondi Family (1 student)
    INSERT INTO users (email, password_hash, role) VALUES
    ('joseph.omondi@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Joseph Omondi', 'joseph.omondi@example.com', '+254712345018')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3527', 'Sofia Omondi', 'NEMIS-7894561027', 'Grade 4 - Red Section', 9100.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 19: Atieno Family (2 students)
    INSERT INTO users (email, password_hash, role) VALUES
    ('monica.atieno@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Monica Atieno', 'monica.atieno@example.com', '+254712345019')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3528', 'Steven Atieno', 'NEMIS-7894561028', 'Grade 7 - Blue Section', 16200.00, parent_id_var),
    ('ST3529', 'Aria Atieno', 'NEMIS-7894561029', 'Grade 2 - Blue Section', 10300.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
    -- Parent 20: Oloo Family (1 student)
    INSERT INTO users (email, password_hash, role) VALUES
    ('charles.oloo@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
    RETURNING id INTO parent_user_id;
    
    INSERT INTO parents (user_id, name, email, phone) VALUES
    (parent_user_id, 'Charles Oloo', 'charles.oloo@example.com', '+254712345020')
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING id INTO parent_id_var;
    
    INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
    ('ST3530', 'Madison Oloo', 'NEMIS-7894561030', 'Grade 6 - Red Section', 14200.00, parent_id_var)
    ON CONFLICT (adm) DO NOTHING;
    
END $$;

-- Insert Staff Members (password: parent123 for all - same as parents for testing)
INSERT INTO users (email, password_hash, role) VALUES
('staff1@hechlink.edu', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'staff'),
('staff2@hechlink.edu', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'staff'),
('staff3@hechlink.edu', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'staff'),
('staff4@hechlink.edu', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'staff'),
('staff5@hechlink.edu', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'staff')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Insert Staff Records
DO $$
DECLARE
    staff_user_id INTEGER;
    staff_data RECORD;
BEGIN
    -- Staff 1: Teacher
    SELECT id INTO staff_user_id FROM users WHERE email = 'staff1@hechlink.edu';
    INSERT INTO staff (user_id, name, email, phone, staff_no, department, approved) VALUES
    (staff_user_id, 'John Mwangi', 'staff1@hechlink.edu', '+254712346001', 'STF0001', 'Teaching', true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
    
    -- Staff 2: Administrator
    SELECT id INTO staff_user_id FROM users WHERE email = 'staff2@hechlink.edu';
    INSERT INTO staff (user_id, name, email, phone, staff_no, department, approved) VALUES
    (staff_user_id, 'Mary Wanjiku', 'staff2@hechlink.edu', '+254712346002', 'STF0002', 'Administration', true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
    
    -- Staff 3: Librarian
    SELECT id INTO staff_user_id FROM users WHERE email = 'staff3@hechlink.edu';
    INSERT INTO staff (user_id, name, email, phone, staff_no, department, approved) VALUES
    (staff_user_id, 'Peter Kamau', 'staff3@hechlink.edu', '+254712346003', 'STF0003', 'Library', true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
    
    -- Staff 4: Nurse
    SELECT id INTO staff_user_id FROM users WHERE email = 'staff4@hechlink.edu';
    INSERT INTO staff (user_id, name, email, phone, staff_no, department, approved) VALUES
    (staff_user_id, 'Jane Njeri', 'staff4@hechlink.edu', '+254712346004', 'STF0004', 'Health', true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
    
    -- Staff 5: Security
    SELECT id INTO staff_user_id FROM users WHERE email = 'staff5@hechlink.edu';
    INSERT INTO staff (user_id, name, email, phone, staff_no, department, approved) VALUES
    (staff_user_id, 'Robert Kariuki', 'staff5@hechlink.edu', '+254712346005', 'STF0005', 'Security', true)
    ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id;
END $$;

-- Summary Statistics
DO $$
DECLARE
    student_count INTEGER;
    parent_count INTEGER;
    staff_count INTEGER;
    total_fees NUMERIC;
BEGIN
    SELECT COUNT(*) INTO student_count FROM students;
    SELECT COUNT(*) INTO parent_count FROM parents;
    SELECT COUNT(*) INTO staff_count FROM staff;
    SELECT COALESCE(SUM(fee_balance), 0) INTO total_fees FROM students;
    
    RAISE NOTICE '=== Realistic Seed Data Summary ===';
    RAISE NOTICE 'Students created: %', student_count;
    RAISE NOTICE 'Parents created: %', parent_count;
    RAISE NOTICE 'Staff created: %', staff_count;
    RAISE NOTICE 'Total fee balance: KES %', total_fees;
    RAISE NOTICE '====================================';
END $$;

