-- 1. Support the 'guard' role
-- Since 'role' might be a VARCHAR, we just need to ensure the system allows it.
-- We also add a specific 'visitors' table.

CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_number VARCHAR(50),
    phone VARCHAR(50),
    vehicle VARCHAR(20), -- Changed from plate_number
    purpose TEXT,
    host VARCHAR(255), -- Changed from host_name
    status VARCHAR(20) DEFAULT 'WAITING', -- Changed default to WAITING
    check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Changed from check_in_time
    check_out TIMESTAMP, -- Changed from check_out_time
    qr_token VARCHAR(255) UNIQUE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: In the existing 'users' table, the 'role' column is VARCHAR(20). 
-- No changes needed there, we just need to start using 'guard' as a value.
