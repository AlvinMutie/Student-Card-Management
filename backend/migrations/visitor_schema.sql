-- 1. Support the 'guard' role
-- Since 'role' might be a VARCHAR, we just need to ensure the system allows it.
-- We also add a specific 'visitors' table.

CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_number VARCHAR(50),
    phone VARCHAR(50),
    plate_number VARCHAR(20),
    purpose TEXT,
    host_name VARCHAR(255), -- Who they are visiting
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'checked_out', 'blacklisted')), -- pending, approved, rejected, checked_out, blacklisted
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    qr_token VARCHAR(255) UNIQUE, -- Secure token for scanning
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: In the existing 'users' table, the 'role' column is VARCHAR(20). 
-- No changes needed there, we just need to start using 'guard' as a value.
