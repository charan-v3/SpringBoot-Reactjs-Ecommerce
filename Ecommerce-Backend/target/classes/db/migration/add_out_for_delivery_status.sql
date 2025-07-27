-- Add OUT_FOR_DELIVERY status to existing orders table
-- This script handles the case where the enum value doesn't exist in the database

-- For MySQL/MariaDB
-- ALTER TABLE orders MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

-- For PostgreSQL
-- ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'OUT_FOR_DELIVERY';

-- For H2 Database (if using for testing)
-- No specific action needed as H2 handles enum changes automatically

-- Note: The exact SQL depends on your database type
-- Uncomment the appropriate line based on your database
