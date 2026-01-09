-- Create visitors table if it doesn't exist, or update it
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    id_number VARCHAR(50),
    phone VARCHAR(50),
    vehicle_model VARCHAR(100),
    plate_number VARCHAR(20),
    purpose TEXT,
    host_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    qr_token VARCHAR(255) UNIQUE,
    processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add columns if they were missing from previous versions
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='visitors' AND column_name='vehicle_model') THEN
        ALTER TABLE visitors ADD COLUMN vehicle_model VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='visitors' AND column_name='processed_by') THEN
        ALTER TABLE visitors ADD COLUMN processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='visitors' AND column_name='updated_at') THEN
        ALTER TABLE visitors ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Associate visitor with QR code logic
CREATE INDEX IF NOT EXISTS idx_visitors_id_number ON visitors(id_number);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_check_in_time ON visitors(check_in_time);
CREATE INDEX IF NOT EXISTS idx_visitors_qr_token ON visitors(qr_token);

-- Update status constraint if needed
ALTER TABLE visitors DROP CONSTRAINT IF EXISTS visitors_status_check;
ALTER TABLE visitors ADD CONSTRAINT visitors_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'checked_out', 'blacklisted', 'waiting', 'checkedOut'));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_visitors_updated_at ON visitors;
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
