-- Simple Seed Data for Development
-- This file contains basic test data for quick setup
-- NOTE: Run migrations/generate-hash.js first to get proper bcrypt hashes
-- Then update the password_hash values below with the generated hashes

-- Insert admin user (password: admin123)
INSERT INTO users (email, password, role) VALUES
('admin@example.com', '$2b$10$Qbh6FQoHiV9yNZba57Duqekx6wSwB31Y5BoswIyMbiIjJDqEi73Ou', 'admin')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- Insert sample parent user (password: parent123)
INSERT INTO users (email, password, role) VALUES
('parent@example.com', '$2b$10$X4PgL.4CDQ4kAUn.vHbut.BpS1Dpewf6yha5/E1O14Nz3CppA0.pa', 'parent')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

-- Get the parent user_id and create parent/student records
DO $$
DECLARE
    parent_user_id INTEGER;
    parent_id_var INTEGER;
BEGIN
    SELECT id INTO parent_user_id FROM users WHERE email = 'parent@example.com';
    
    IF parent_user_id IS NOT NULL THEN
        -- Insert sample parent
        INSERT INTO parents (user_id, name, email, phone) VALUES
        (parent_user_id, 'Sarah Onyango', 'parent@example.com', '+254712345678')
        ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id
        RETURNING id INTO parent_id_var;
        
        -- Insert sample students if parent was created/updated
        IF parent_id_var IS NOT NULL THEN
            -- Parent has 2 students (realistic family relationship)
            INSERT INTO students (adm, name, nemis, class, fee_balance, parent_id) VALUES
            ('ST3501', 'Emma Onyango', 'NEMIS-7894561001', 'Grade 5 - Red Section', 8500.00, parent_id_var),
            ('ST3502', 'James Onyango', 'NEMIS-7894561002', 'Grade 3 - Blue Section', 12000.00, parent_id_var)
            ON CONFLICT (adm) DO NOTHING;
        END IF;
    END IF;
END $$;
