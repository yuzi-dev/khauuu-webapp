-- =====================================================
-- Migration: 005_create_follows_table.sql
-- Description: Creates follows table for user following relationships
-- Dependencies: Run after 001_create_profiles_table.sql
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FOLLOWS TABLE
-- =====================================================

-- Create follows table for user following relationships
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User relationships
    follower_user_id UUID NOT NULL,
    followed_user_id UUID NOT NULL,
    
    -- Follow status (for future private account support)
    status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(follower_user_id, followed_user_id),
    CHECK (follower_user_id != followed_user_id)
);

-- Add foreign key constraints to profiles table (not auth.users for better data integrity)
ALTER TABLE public.follows 
ADD CONSTRAINT fk_follows_follower 
FOREIGN KEY (follower_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.follows 
ADD CONSTRAINT fk_follows_followed 
FOREIGN KEY (followed_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- =====================================================
-- INDEXES
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_user_id ON public.follows(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed_user_id ON public.follows(followed_user_id);
CREATE INDEX IF NOT EXISTS idx_follows_status ON public.follows(status);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON public.follows(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_follows_follower_status ON public.follows(follower_user_id, status);
CREATE INDEX IF NOT EXISTS idx_follows_followed_status ON public.follows(followed_user_id, status);

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Function to update follower stats (ensure it exists)
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

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Create trigger for updated_at column
CREATE TRIGGER update_follows_updated_at 
    BEFORE UPDATE ON public.follows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update follower/following counts in profiles table
CREATE TRIGGER on_follow_change
    AFTER INSERT OR DELETE OR UPDATE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION update_follower_stats();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view all follows (for public profiles and follow suggestions)
CREATE POLICY "Anyone can view follows" 
    ON public.follows FOR SELECT 
    USING (true);

-- Users can only create follows where they are the follower
CREATE POLICY "Users can create their own follows" 
    ON public.follows FOR INSERT 
    WITH CHECK (auth.uid() = follower_user_id);

-- Users can update their own follows (for changing status)
CREATE POLICY "Users can update their own follows" 
    ON public.follows FOR UPDATE 
    USING (auth.uid() = follower_user_id)
    WITH CHECK (auth.uid() = follower_user_id);

-- Users can delete their own follows (unfollow)
CREATE POLICY "Users can delete their own follows" 
    ON public.follows FOR DELETE 
    USING (auth.uid() = follower_user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user A follows user B
CREATE OR REPLACE FUNCTION is_following(follower_id UUID, followed_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.follows 
        WHERE follower_user_id = follower_id 
        AND followed_user_id = followed_id 
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get follower count for a user
CREATE OR REPLACE FUNCTION get_follower_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM public.follows 
        WHERE followed_user_id = user_id 
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get following count for a user
CREATE OR REPLACE FUNCTION get_following_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM public.follows 
        WHERE follower_user_id = user_id 
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get mutual follows (friends)
CREATE OR REPLACE FUNCTION get_mutual_follows(user_id UUID)
RETURNS TABLE(mutual_user_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT f1.followed_user_id
    FROM public.follows f1
    INNER JOIN public.follows f2 ON f1.followed_user_id = f2.follower_user_id
    WHERE f1.follower_user_id = user_id
    AND f2.followed_user_id = user_id
    AND f1.status = 'accepted'
    AND f2.status = 'accepted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON TABLE public.follows TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions to anon users (for viewing public follows)
GRANT SELECT ON TABLE public.follows TO anon;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.follows IS 'User following relationships for Nepal Food Finder';
COMMENT ON COLUMN public.follows.follower_user_id IS 'User who is following';
COMMENT ON COLUMN public.follows.followed_user_id IS 'User who is being followed';
COMMENT ON COLUMN public.follows.status IS 'Follow status: pending, accepted, or blocked';
COMMENT ON FUNCTION is_following(UUID, UUID) IS 'Check if user A follows user B';
COMMENT ON FUNCTION get_follower_count(UUID) IS 'Get number of followers for a user';
COMMENT ON FUNCTION get_following_count(UUID) IS 'Get number of users a user is following';
COMMENT ON FUNCTION get_mutual_follows(UUID) IS 'Get users who mutually follow each other';