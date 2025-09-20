# Database Migration Scripts for Nepal Food Finder

This directory contains SQL migration scripts for setting up the database schema for the Nepal Food Finder application.

## Migration Files

### 001_create_profiles_table.sql
Creates the main profiles table with user information, statistics, and necessary triggers.

### 002_create_supporting_tables.sql  
Creates supporting tables for reviews and saved items with RLS policies.

### 003_create_restaurants_and_foods_tables.sql
Creates restaurants and foods tables with all required fields and relationships.

### 004_fix_profile_trigger.sql
Fixes profile triggers and statistics calculation functions.

### 005_create_follows_table.sql
Creates the follows table for user following relationships with comprehensive RLS policies, triggers, and helper functions.

## Running Migrations

Execute the migration files in order:

1. Run `001_create_profiles_table.sql`
2. Run `002_create_supporting_tables.sql`
3. Run `003_create_restaurants_and_foods_tables.sql`
4. Run `004_fix_profile_trigger.sql`
5. Run `005_create_follows_table.sql`

## Features Included

- **User Profiles**: Complete profile management with statistics
- **Reviews System**: User reviews for restaurants and foods
- **Saved Items**: Bookmarking system for restaurants, foods, and offers
- **Following System**: User-to-user following relationships with status support
- **Row Level Security**: Comprehensive RLS policies for data protection
- **Triggers**: Automatic statistics updates and timestamp management
- **Helper Functions**: Utility functions for common operations

This folder contains SQL migration scripts to set up the complete profile system for the Nepal Food Finder application.

## Files

1. **001_create_profiles_table.sql** - Main profiles table with all user profile fields
2. **002_create_supporting_tables.sql** - Supporting tables for follows, reviews, and saved items

## How to Run in Supabase

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `001_create_profiles_table.sql`
5. Click **Run** to execute
6. Repeat steps 3-5 for `002_create_supporting_tables.sql`

### Method 2: Using Supabase CLI

```bash
# Make sure you're in your project directory
supabase db reset

# Or apply migrations individually
supabase db push
```

## What These Scripts Do

### 001_create_profiles_table.sql

- Creates the main `profiles` table with all fields from the profile page
- Sets up Row Level Security (RLS) policies
- Creates automatic profile creation trigger for new user signups
- Handles both email/password and Google OAuth signups
- Generates unique usernames automatically
- Includes all privacy settings and user preferences

### 002_create_supporting_tables.sql

- Creates `follows` table for user following relationships
- Creates `reviews` table for user reviews and ratings
- Creates `saved_items` table for saved restaurants, offers, and foods
- Sets up triggers to automatically update profile statistics
- Includes proper RLS policies for all tables

## Key Features

### Automatic Profile Creation
- When a user signs up (email/password or Google OAuth), a profile is automatically created
- Username is generated from email address with uniqueness checks
- Google profile pictures are automatically imported
- Full name is extracted from OAuth data when available

### Privacy Controls
- Users can control visibility of their reviews (public/private)
- Users can control visibility of their saved items (public/private)
- All data respects user privacy settings

### Statistics Tracking
- Automatic counting of reviews, followers, and following
- Statistics are updated in real-time via database triggers

### Security
- Full Row Level Security implementation
- Users can only modify their own data
- Public data is viewable by everyone
- Private data is only accessible to the owner

## Environment Variables Required

Make sure these are set in your `.env.local`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary (for image uploads)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing

After running the migrations:

1. Test user signup (both email/password and Google OAuth)
2. Verify profile is created automatically
3. Test profile editing functionality
4. Test privacy settings
5. Test following/unfollowing users
6. Test creating and viewing reviews
7. Test saving/unsaving items

## Troubleshooting

If you encounter any issues:

1. Check that all environment variables are set correctly
2. Ensure you have the necessary permissions in Supabase
3. Verify that the auth.users table exists (it should be created automatically by Supabase Auth)
4. Check the Supabase logs for any error messages

## Notes

- The scripts are idempotent - you can run them multiple times safely
- All tables use UUIDs as primary keys for better performance and security
- Timestamps are stored with timezone information
- All text fields have appropriate length limits to prevent abuse