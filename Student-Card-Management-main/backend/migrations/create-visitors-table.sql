-- Create visitors table
CREATE TABLE IF NOT EXISTS visitors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    national_id VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    purpose TEXT NOT NULL,
    person_visited VARCHAR(255) NOT NULL,
    vehicle_model VARCHAR(100),
    plate_number VARCHAR(20),
    status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'approved', 'rejected', 'checkedOut')),
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP,
    processed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Associate visitor with QR code logic
CREATE INDEX IF NOT EXISTS idx_visitors_national_id ON visitors(national_id);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_check_in_time ON visitors(check_in_time);

-- Trigger for updated_at
CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
