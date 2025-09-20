-- =====================================================
-- Migration: 008_add_is_private_column.sql
-- Description: Add is_private column to profiles table for privacy settings
-- Dependencies: Run after existing migrations
-- =====================================================

-- Add is_private column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Update existing profiles to have default privacy setting
UPDATE public.profiles 
SET is_private = false 
WHERE is_private IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.is_private IS 'Whether the user profile is private (requires follow approval)';

-- Migration completed - is_private column added to profiles table