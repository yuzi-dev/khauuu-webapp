-- Create profiles table with all necessary fields from the profile page
-- This table will store user profile information for the Nepal Food Finder app

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Basic profile information
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    
    -- Contact and location information
    website VARCHAR(255),
    location VARCHAR(100),
    
    -- User preferences and settings
    is_vegetarian BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    
    -- Privacy settings
    reviews_public BOOLEAN DEFAULT true,
    saved_public BOOLEAN DEFAULT false,
    
    -- Statistics (these will be calculated from other tables)
    reviews_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at column
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Policy: Users can view all public profiles
CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (true);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete their own profile" 
    ON profiles FOR DELETE 
    USING (auth.uid() = user_id);

-- Function to handle new user signup and create profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    username_base TEXT;
    username_candidate TEXT;
    username_counter INTEGER := 1;
    username_exists BOOLEAN;
BEGIN
    -- Extract username base from email (part before @)
    username_base := LOWER(SPLIT_PART(NEW.email, '@', 1));
    
    -- Remove any non-alphanumeric characters and replace with underscore
    username_base := REGEXP_REPLACE(username_base, '[^a-zA-Z0-9]', '_', 'g');
    
    -- Ensure username is not too long
    IF LENGTH(username_base) > 20 THEN
        username_base := LEFT(username_base, 20);
    END IF;
    
    -- Find a unique username
    username_candidate := username_base;
    
    LOOP
        SELECT EXISTS(SELECT 1 FROM profiles WHERE username = username_candidate) INTO username_exists;
        
        IF NOT username_exists THEN
            EXIT;
        END IF;
        
        username_candidate := username_base || '_' || username_counter;
        username_counter := username_counter + 1;
    END LOOP;
    
    -- Insert the new profile
    INSERT INTO public.profiles (
        user_id,
        username,
        full_name,
        bio,
        profile_image_url,
        website,
        location,
        is_vegetarian,
        is_verified,
        reviews_public,
        saved_public
    ) VALUES (
        NEW.id,
        username_candidate,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        NULL, -- bio starts empty
        NEW.raw_user_meta_data->>'avatar_url', -- for Google OAuth profile pictures
        NULL, -- website starts empty
        NULL, -- location starts empty
        false, -- default to non-vegetarian
        false, -- not verified by default
        true,  -- reviews public by default
        false  -- saved items private by default
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile statistics (to be called by other triggers)
CREATE OR REPLACE FUNCTION update_profile_stats(profile_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update reviews count (assuming you'll have a reviews table)
    UPDATE profiles 
    SET reviews_count = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE user_id = profile_user_id
    )
    WHERE user_id = profile_user_id;
    
    -- Update followers count (assuming you'll have a follows table)
    UPDATE profiles 
    SET followers_count = (
        SELECT COUNT(*) 
        FROM follows 
        WHERE followed_user_id = profile_user_id
    )
    WHERE user_id = profile_user_id;
    
    -- Update following count
    UPDATE profiles 
    SET following_count = (
        SELECT COUNT(*) 
        FROM follows 
        WHERE follower_user_id = profile_user_id
    )
    WHERE user_id = profile_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_profile_stats(UUID) TO anon, authenticated;

-- Insert a comment for documentation
COMMENT ON TABLE profiles IS 'User profiles table for Nepal Food Finder app with automatic creation on signup';
COMMENT ON COLUMN profiles.user_id IS 'References auth.users(id) - the authenticated user';
COMMENT ON COLUMN profiles.username IS 'Unique username for the user, auto-generated from email';
COMMENT ON COLUMN profiles.full_name IS 'Full display name of the user';
COMMENT ON COLUMN profiles.bio IS 'User bio/description text';
COMMENT ON COLUMN profiles.profile_image_url IS 'URL to profile picture (can be Cloudinary URL)';
COMMENT ON COLUMN profiles.is_vegetarian IS 'Dietary preference indicator';
COMMENT ON COLUMN profiles.reviews_public IS 'Privacy setting for reviews visibility';
COMMENT ON COLUMN profiles.saved_public IS 'Privacy setting for saved items visibility';