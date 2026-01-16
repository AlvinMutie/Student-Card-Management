-- Create school_settings table for multi-school registration
CREATE TABLE IF NOT EXISTS school_settings (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    school_motto VARCHAR(255),
    school_logo_url VARCHAR(500),
    contact_phone_1 VARCHAR(20),
    contact_phone_2 VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial school data (ST. MARY'S ACADEMY)
INSERT INTO school_settings (school_name, school_motto, contact_phone_1, contact_phone_2)
VALUES (
    'ST. MARY''S ACADEMY',
    'Excellence in Education',
    '0738 934 812',
    '0713 715 956'
) ON CONFLICT DO NOTHING;
