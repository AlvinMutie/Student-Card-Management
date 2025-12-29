-- Tables for prioritized fee payments

-- 1. Fee Categories (Defines the tiers of payment)
CREATE TABLE IF NOT EXISTS fee_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    priority INTEGER NOT NULL UNIQUE, -- 1 is highest priority
    cap_amount DECIMAL(10, 2) NOT NULL, -- The total required for this category
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Payments (Records the actual money sent by the parent)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_ref VARCHAR(100) UNIQUE,
    payment_method VARCHAR(50) DEFAULT 'mobile_app',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fee Allocations (How each payment was distributed across categories)
CREATE TABLE IF NOT EXISTS fee_allocations (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
    amount_allocated DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data
INSERT INTO fee_categories (name, priority, cap_amount, description) VALUES
('Tuition Fees', 1, 50000.00, 'Main school tuition fees'),
('Food & Boarding', 2, 25000.00, 'Meals and accommodation'),
('Extracurricular Activities', 3, 10000.00, 'Sports, music, and clubs'),
('School Bus', 4, 15000.00, 'Transport services')
ON CONFLICT (priority) DO UPDATE SET cap_amount = EXCLUDED.cap_amount;
