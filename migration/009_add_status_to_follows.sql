-- Add status column to follows table if it doesn't exist
DO $$ 
BEGIN
    -- Check if status column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'follows' AND column_name = 'status'
    ) THEN
        ALTER TABLE follows ADD COLUMN status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'rejected'));
        
        -- Create index for status column
        CREATE INDEX IF NOT EXISTS idx_follows_status ON follows(status);
        
        -- Update existing records to have 'accepted' status
        UPDATE follows SET status = 'accepted' WHERE status IS NULL;
    END IF;
END $$;