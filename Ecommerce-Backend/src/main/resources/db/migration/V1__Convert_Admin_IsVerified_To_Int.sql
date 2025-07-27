-- Migration script to convert is_verified from BIT/BOOLEAN to INT
-- This script handles the conversion safely with data preservation

-- Step 1: Check if the column exists and its current type
-- (This is informational - the actual conversion will be handled by the ALTER statements)

-- Step 2: Add a temporary integer column
ALTER TABLE admins ADD COLUMN is_verified_temp INT DEFAULT 0;

-- Step 3: Copy data from boolean/bit column to integer column
-- Handle different possible boolean representations
UPDATE admins SET is_verified_temp = CASE 
    WHEN is_verified = 1 OR is_verified = TRUE OR is_verified = 'true' THEN 1 
    WHEN is_verified = 0 OR is_verified = FALSE OR is_verified = 'false' THEN 0 
    ELSE 0 
END;

-- Step 4: Drop the old boolean/bit column
ALTER TABLE admins DROP COLUMN is_verified;

-- Step 5: Rename the temporary column to the original name
ALTER TABLE admins CHANGE COLUMN is_verified_temp is_verified INT NOT NULL DEFAULT 0;

-- Step 6: Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_admins_is_verified ON admins(is_verified);

-- Step 7: Add a comment to document the column values
ALTER TABLE admins MODIFY COLUMN is_verified INT NOT NULL DEFAULT 0 COMMENT '0=not verified, 1=verified';

-- Verification query (commented out - uncomment to test)
-- SELECT id, username, email, is_verified, 
--        CASE WHEN is_verified = 1 THEN 'Verified' ELSE 'Not Verified' END as verification_status
-- FROM admins 
-- ORDER BY created_at DESC 
-- LIMIT 10;
