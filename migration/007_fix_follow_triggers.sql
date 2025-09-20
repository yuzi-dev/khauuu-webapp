-- =====================================================
-- Migration: 007_fix_follow_triggers.sql
-- Description: Fix follow triggers to use correct function names and ensure they work
-- Dependencies: Run after existing migrations
-- =====================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
DROP TRIGGER IF EXISTS update_follower_stats_trigger ON public.follows;

-- Drop old function if it exists
DROP FUNCTION IF EXISTS update_follower_stats();

-- Create the correct trigger function that matches what's expected
CREATE OR REPLACE FUNCTION update_follower_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update follower count for the followed user
        UPDATE public.profiles 
        SET followers_count = (
            SELECT COUNT(*) FROM public.follows 
            WHERE followed_user_id = NEW.followed_user_id AND status = 'accepted'
        )
        WHERE user_id = NEW.followed_user_id;
        
        -- Update following count for the follower user
        UPDATE public.profiles 
        SET following_count = (
            SELECT COUNT(*) FROM public.follows 
            WHERE follower_user_id = NEW.follower_user_id AND status = 'accepted'
        )
        WHERE user_id = NEW.follower_user_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update follower count for the followed user
        UPDATE public.profiles 
        SET followers_count = (
            SELECT COUNT(*) FROM public.follows 
            WHERE followed_user_id = OLD.followed_user_id AND status = 'accepted'
        )
        WHERE user_id = OLD.followed_user_id;
        
        -- Update following count for the follower user
        UPDATE public.profiles 
        SET following_count = (
            SELECT COUNT(*) FROM public.follows 
            WHERE follower_user_id = OLD.follower_user_id AND status = 'accepted'
        )
        WHERE user_id = OLD.follower_user_id;
        
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update counts for both users in case status changed
        UPDATE public.profiles 
        SET followers_count = (
            SELECT COUNT(*) FROM public.follows 
            WHERE followed_user_id = NEW.followed_user_id AND status = 'accepted'
        )
        WHERE user_id = NEW.followed_user_id;
        
        UPDATE public.profiles 
        SET following_count = (
            SELECT COUNT(*) FROM public.follows 
            WHERE follower_user_id = NEW.follower_user_id AND status = 'accepted'
        )
        WHERE user_id = NEW.follower_user_id;
        
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger to update follower/following counts in profiles table
CREATE TRIGGER on_follow_change
    AFTER INSERT OR DELETE OR UPDATE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION update_follower_stats();

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_follower_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION update_follower_stats() TO anon;

-- Test the trigger by updating all existing profiles to have correct counts
UPDATE public.profiles 
SET followers_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE followed_user_id = profiles.user_id 
    AND status = 'accepted'
),
following_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE follower_user_id = profiles.user_id 
    AND status = 'accepted'
);

-- Migration completed - triggers have been recreated and counts updated