-- Migration to fix visitor table columns
ALTER TABLE visitors RENAME COLUMN plate_number TO vehicle;
ALTER TABLE visitors RENAME COLUMN host_name TO host;
ALTER TABLE visitors RENAME COLUMN check_in_time TO check_in;
ALTER TABLE visitors RENAME COLUMN check_out_time TO check_out;

-- Update status constraint if it exists (dropping if it might block 'WAITING')
ALTER TABLE visitors DROP CONSTRAINT IF EXISTS visitors_status_check;
ALTER TABLE visitors ALTER COLUMN status SET DEFAULT 'WAITING';

-- Update existing 'pending' statuses to 'WAITING'
UPDATE visitors SET status = 'WAITING' WHERE status = 'pending';
