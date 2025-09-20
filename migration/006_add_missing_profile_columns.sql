-- =====================================================
-- Migration: 006_add_missing_profile_columns.sql
-- Description: Add missing followers_count and following_count columns to profiles table
-- Dependencies: Run after existing migrations
-- =====================================================

-- Add followers_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'followers_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added followers_count column to profiles table';
    ELSE
        RAISE NOTICE 'followers_count column already exists in profiles table';
    END IF;
END $$;

-- Add following_count column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'following_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN following_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added following_count column to profiles table';
    ELSE
        RAISE NOTICE 'following_count column already exists in profiles table';
    END IF;
END $$;

-- Update existing profiles to have correct counts
-- Update followers_count for all users
UPDATE public.profiles 
SET followers_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE followed_user_id = profiles.user_id 
    AND status = 'accepted'
)
WHERE followers_count IS NULL OR followers_count = 0;

-- Update following_count for all users
UPDATE public.profiles 
SET following_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE follower_user_id = profiles.user_id 
    AND status = 'accepted'
)
WHERE following_count IS NULL OR following_count = 0;

-- Create or replace the function to update profile statistics
CREATE OR REPLACE FUNCTION update_profile_stats(profile_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update followers count
    UPDATE public.profiles 
    SET followers_count = (
        SELECT COUNT(*) 
        FROM public.follows 
        WHERE followed_user_id = profile_user_id 
        AND status = 'accepted'
    )
    WHERE user_id = profile_user_id;
    
    -- Update following count
    UPDATE public.profiles 
    SET following_count = (
        SELECT COUNT(*) 
        FROM public.follows 
        WHERE follower_user_id = profile_user_id 
        AND status = 'accepted'
    )
    WHERE user_id = profile_user_id;
    
    -- Update reviews count if reviews table exists
    BEGIN
        UPDATE public.profiles 
        SET reviews_count = (
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE user_id = profile_user_id
        )
        WHERE user_id = profile_user_id;
    EXCEPTION WHEN undefined_table THEN
        -- Reviews table doesn't exist yet, skip
        NULL;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_profile_stats(UUID) TO anon, authenticated;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.followers_count IS 'Number of users following this user';
COMMENT ON COLUMN public.profiles.following_count IS 'Number of users this user is following';

-- Log completion
DO $$ 
BEGIN
    RAISE NOTICE 'Migration 006_add_missing_profile_columns.sql completed successfully';
END $$;