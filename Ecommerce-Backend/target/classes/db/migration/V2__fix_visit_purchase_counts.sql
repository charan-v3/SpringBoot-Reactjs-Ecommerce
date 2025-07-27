-- Fix null visit and purchase counts for existing users and customers

-- Update User table - set null visit_count and purchase_count to 0
UPDATE users 
SET visit_count = 0 
WHERE visit_count IS NULL;

UPDATE users 
SET purchase_count = 0 
WHERE purchase_count IS NULL;

-- Update Customer table - set null visit_count and purchase_count to 0
UPDATE customers 
SET visit_count = 0 
WHERE visit_count IS NULL;

UPDATE customers 
SET purchase_count = 0 
WHERE purchase_count IS NULL;

-- Ensure columns are not nullable going forward
ALTER TABLE users 
ALTER COLUMN visit_count SET NOT NULL,
ALTER COLUMN purchase_count SET NOT NULL;

ALTER TABLE customers 
ALTER COLUMN visit_count SET NOT NULL,
ALTER COLUMN purchase_count SET NOT NULL;
