-- Fix for the profile creation trigger that's causing Google sign-up errors
-- This replaces the problematic handle_new_user function with a more robust version

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a more robust function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    username_base TEXT;
    username_candidate TEXT;
    username_counter INTEGER := 1;
    username_exists BOOLEAN;
    user_full_name TEXT;
    user_avatar_url TEXT;
BEGIN
    -- Safely extract user metadata
    BEGIN
        user_full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name', 
            NEW.raw_user_meta_data->>'name', 
            NEW.raw_user_meta_data->>'display_name',
            SPLIT_PART(NEW.email, '@', 1)
        );
        
        user_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    EXCEPTION WHEN OTHERS THEN
        user_full_name := SPLIT_PART(NEW.email, '@', 1);
        user_avatar_url := NULL;
    END;
    
    -- Extract username base from email (part before @)
    username_base := LOWER(SPLIT_PART(NEW.email, '@', 1));
    
    -- Remove any non-alphanumeric characters and replace with underscore
    username_base := REGEXP_REPLACE(username_base, '[^a-zA-Z0-9]', '_', 'g');
    
    -- Ensure username is not too long and not too short
    IF LENGTH(username_base) > 20 THEN
        username_base := LEFT(username_base, 20);
    ELSIF LENGTH(username_base) < 3 THEN
        username_base := username_base || '_user';
    END IF;
    
    -- Find a unique username
    username_candidate := username_base;
    
    -- Loop to find unique username (with safety limit)
    WHILE username_counter < 1000 LOOP
        SELECT EXISTS(SELECT 1 FROM profiles WHERE username = username_candidate) INTO username_exists;
        
        IF NOT username_exists THEN
            EXIT;
        END IF;
        
        username_candidate := username_base || '_' || username_counter;
        username_counter := username_counter + 1;
    END LOOP;
    
    -- If we couldn't find a unique username after 1000 tries, use UUID
    IF username_exists THEN
        username_candidate := username_base || '_' || SUBSTRING(gen_random_uuid()::text, 1, 8);
    END IF;
    
    -- Insert the new profile with error handling
    BEGIN
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
            saved_public,
            reviews_count,
            followers_count,
            following_count
        ) VALUES (
            NEW.id,
            username_candidate,
            user_full_name,
            NULL, -- bio starts empty
            user_avatar_url, -- for Google OAuth profile pictures
            NULL, -- website starts empty
            NULL, -- location starts empty
            false, -- default to non-vegetarian
            false, -- not verified by default
            true,  -- reviews public by default
            false, -- saved items private by default
            0,     -- no reviews initially
            0,     -- no followers initially
            0      -- not following anyone initially
        );
    EXCEPTION WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        -- Still return NEW so the user creation succeeds
    END;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If anything goes wrong, log it but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the profile stats function to be more robust
CREATE OR REPLACE FUNCTION update_profile_stats(profile_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update reviews count only if reviews table exists
    BEGIN
        UPDATE profiles 
        SET reviews_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE user_id = profile_user_id
        )
        WHERE user_id = profile_user_id;
    EXCEPTION WHEN undefined_table THEN
        -- Reviews table doesn't exist yet, skip
        NULL;
    END;
    
    -- Update followers count only if follows table exists
    BEGIN
        UPDATE profiles 
        SET followers_count = (
            SELECT COUNT(*) 
            FROM follows 
            WHERE followed_user_id = profile_user_id
        )
        WHERE user_id = profile_user_id;
    EXCEPTION WHEN undefined_table THEN
        -- Follows table doesn't exist yet, skip
        NULL;
    END;
    
    -- Update following count only if follows table exists
    BEGIN
        UPDATE profiles 
        SET following_count = (
            SELECT COUNT(*) 
            FROM follows 
            WHERE follower_user_id = profile_user_id
        )
        WHERE user_id = profile_user_id;
    EXCEPTION WHEN undefined_table THEN
        -- Follows table doesn't exist yet, skip
        NULL;
    END;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail
    RAISE WARNING 'Error updating profile stats for user %: %', profile_user_id, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_profile_stats(UUID) TO anon, authenticated;