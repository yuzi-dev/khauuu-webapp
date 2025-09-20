-- =====================================================
-- Migration: 010_fix_follows_foreign_keys.sql
-- Description: Fix foreign key relationships in follows table
-- The API expects foreign keys to reference profiles(id) but current setup references profiles(user_id)
-- =====================================================

-- Drop existing foreign key constraints if they exist
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS fk_follows_follower;
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS fk_follows_followed;
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_user_id_fkey;
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_followed_user_id_fkey;

-- Add new foreign key constraints with the correct names that the API expects
-- These should reference profiles(user_id) since that's the correct relationship
ALTER TABLE public.follows 
ADD CONSTRAINT follows_follower_user_id_fkey 
FOREIGN KEY (follower_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.follows 
ADD CONSTRAINT follows_followed_user_id_fkey 
FOREIGN KEY (followed_user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Verify the constraints were created
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='follows'
    AND tc.table_schema='public';