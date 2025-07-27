-- Manual Database Migration Script
-- Convert admin is_verified from BIT/BOOLEAN to INT
-- Run this script manually if automatic migration doesn't work

-- IMPORTANT: Backup your database before running this script!

-- Step 1: Check current table structure
DESCRIBE admins;

-- Step 2: Check current data
SELECT id, username, email, is_verified, 
       CASE 
           WHEN is_verified = 1 THEN 'Verified' 
           WHEN is_verified = 0 THEN 'Not Verified' 
           ELSE 'Unknown' 
       END as current_status
FROM admins 
LIMIT 5;

-- Step 3: Create backup table (optional but recommended)
CREATE TABLE admins_backup AS SELECT * FROM admins;

-- Step 4: Perform the conversion
-- Method 1: If column is currently BIT or TINYINT(1)
ALTER TABLE admins MODIFY COLUMN is_verified INT NOT NULL DEFAULT 0 COMMENT '0=not verified, 1=verified';

-- Method 2: If the above doesn't work, use the safe approach
-- Uncomment the following lines if Method 1 fails:

/*
-- Add temporary column
ALTER TABLE admins ADD COLUMN is_verified_new INT DEFAULT 0;

-- Copy data with proper conversion
UPDATE admins SET is_verified_new = CASE 
    WHEN is_verified = 1 OR is_verified = TRUE THEN 1 
    WHEN is_verified = 0 OR is_verified = FALSE THEN 0 
    ELSE 0 
END;

-- Drop old column
ALTER TABLE admins DROP COLUMN is_verified;

-- Rename new column
ALTER TABLE admins CHANGE COLUMN is_verified_new is_verified INT NOT NULL DEFAULT 0;
*/

-- Step 5: Add index for performance
CREATE INDEX IF NOT EXISTS idx_admins_is_verified ON admins(is_verified);

-- Step 6: Verify the conversion
SELECT id, username, email, is_verified,
       CASE 
           WHEN is_verified = 1 THEN 'Verified' 
           WHEN is_verified = 0 THEN 'Not Verified' 
           ELSE 'Invalid Value' 
       END as verification_status
FROM admins 
ORDER BY created_at DESC;

-- Step 7: Check table structure after conversion
DESCRIBE admins;

-- Step 8: Test queries that will be used by the application
SELECT COUNT(*) as total_admins FROM admins;
SELECT COUNT(*) as verified_admins FROM admins WHERE is_verified = 1;
SELECT COUNT(*) as unverified_admins FROM admins WHERE is_verified = 0;

-- If everything looks good, you can drop the backup table:
-- DROP TABLE admins_backup;
