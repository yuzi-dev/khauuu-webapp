-- =====================================================
-- Migration: 003_create_restaurants_and_foods_tables.sql
-- Description: Creates restaurants and foods tables with all required fields
-- Dependencies: Run after 001_create_profiles_table.sql and 002_create_supporting_tables.sql
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- RESTAURANTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cuisine VARCHAR(100) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(255),
    email VARCHAR(255),
    
    -- Location data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name VARCHAR(255), -- e.g., "Thamel, Kathmandu"
    
    -- Business hours
    opening_hours JSONB, -- Store as {"monday": "10:00-22:00", "tuesday": "10:00-22:00", ...}
    is_open BOOLEAN DEFAULT true,
    
    -- Ratings and reviews
    rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    
    -- Pricing
    price_range VARCHAR(10) DEFAULT '₹₹', -- ₹, ₹₹, ₹₹₹, ₹₹₹₹
    
    -- Features and amenities
    features JSONB, -- ["WiFi", "Parking", "Credit Cards", "Air Conditioning", etc.]
    tags JSONB, -- ["Traditional", "Family Friendly", "Quick Bite", etc.]
    
    -- Media
    images JSONB, -- Array of image URLs
    cover_image VARCHAR(500),
    
    -- Status and verification
    is_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    
    -- Owner information
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Search optimization
    search_vector tsvector
);

-- =====================================================
-- FOODS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.foods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Restaurant relationship
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    
    -- Pricing
    price DECIMAL(8, 2),
    
    -- Ratings and reviews
    rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    
    -- Dietary information
    is_vegetarian BOOLEAN DEFAULT false,
    
    -- Media
    images JSONB, -- Array of image URLs
    cover_image VARCHAR(500),
    
    -- Availability and status
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    
    -- Tags and categories
    tags JSONB, -- ["Traditional", "Popular", "Healthy", "Street Food", etc.]
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Search optimization
    search_vector tsvector
);

-- =====================================================
-- RESTAURANT CATEGORIES TABLE (for better organization)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.restaurant_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100), -- Icon name or URL
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FOOD CATEGORIES TABLE (for better organization)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.food_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100), -- Icon name or URL
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MENU TABLE
-- =====================================================

CREATE TABLE menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- e.g., "Appetizers", "Main Course", "Desserts", "Beverages"
    dish_name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for menu table
CREATE INDEX idx_menu_restaurant_id ON menu(restaurant_id);
CREATE INDEX idx_menu_category ON menu(category);
CREATE INDEX idx_menu_available ON menu(is_available);

-- Restaurants indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON public.restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON public.restaurants(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON public.restaurants(rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_price_range ON public.restaurants(price_range);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON public.restaurants(status);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_open ON public.restaurants(is_open);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_search ON public.restaurants USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_restaurants_tags ON public.restaurants USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_restaurants_features ON public.restaurants USING GIN(features);

-- Foods indexes
CREATE INDEX IF NOT EXISTS idx_foods_restaurant ON public.foods(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_foods_category ON public.foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_rating ON public.foods(rating DESC);
CREATE INDEX IF NOT EXISTS idx_foods_price ON public.foods(price);
CREATE INDEX IF NOT EXISTS idx_foods_vegetarian ON public.foods(is_vegetarian);
CREATE INDEX IF NOT EXISTS idx_foods_available ON public.foods(is_available);
CREATE INDEX IF NOT EXISTS idx_foods_status ON public.foods(status);
CREATE INDEX IF NOT EXISTS idx_foods_search ON public.foods USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_foods_tags ON public.foods USING GIN(tags);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for menu table
CREATE TRIGGER update_menu_updated_at
    BEFORE UPDATE ON menu
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for updated_at
CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON public.restaurants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at 
    BEFORE UPDATE ON public.foods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update search vectors
CREATE OR REPLACE FUNCTION update_restaurant_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.cuisine, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.location_name, '')), 'D');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_food_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for search vectors
CREATE TRIGGER update_restaurant_search_vector_trigger
    BEFORE INSERT OR UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_restaurant_search_vector();

CREATE TRIGGER update_food_search_vector_trigger
    BEFORE INSERT OR UPDATE ON public.foods
    FOR EACH ROW EXECUTE FUNCTION update_food_search_vector();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS for menu table
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for menu table
CREATE POLICY "Menu items are viewable by everyone" ON menu
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert menu items" ON menu
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update menu items" ON menu
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can delete menu items" ON menu
    FOR DELETE USING (auth.role() = 'authenticated');

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_categories ENABLE ROW LEVEL SECURITY;

-- Restaurants policies
CREATE POLICY "Restaurants are viewable by everyone" ON public.restaurants
    FOR SELECT USING (status = 'active');

CREATE POLICY "Restaurant owners can update their restaurants" ON public.restaurants
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Restaurant owners can insert their restaurants" ON public.restaurants
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Restaurant owners can delete their restaurants" ON public.restaurants
    FOR DELETE USING (auth.uid() = owner_id);

-- Foods policies
CREATE POLICY "Foods are viewable by everyone" ON public.foods
    FOR SELECT USING (status = 'active' AND is_available = true);

CREATE POLICY "Restaurant owners can manage their foods" ON public.foods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.restaurants 
            WHERE restaurants.id = foods.restaurant_id 
            AND restaurants.owner_id = auth.uid()
        )
    );

-- Categories policies (read-only for public)
CREATE POLICY "Restaurant categories are viewable by everyone" ON public.restaurant_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Food categories are viewable by everyone" ON public.food_categories
    FOR SELECT USING (is_active = true);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for menu table
GRANT ALL ON menu TO authenticated;
GRANT SELECT ON menu TO anon;

-- Grant permissions to authenticated users
GRANT SELECT ON public.restaurants TO authenticated;
GRANT SELECT ON public.foods TO authenticated;
GRANT SELECT ON public.restaurant_categories TO authenticated;
GRANT SELECT ON public.food_categories TO authenticated;

-- Grant insert/update/delete to restaurant owners (handled by RLS policies)
GRANT INSERT, UPDATE, DELETE ON public.restaurants TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.foods TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SAMPLE DATA FOR CATEGORIES
-- =====================================================

-- Insert restaurant categories
INSERT INTO public.restaurant_categories (name, description, icon, sort_order) VALUES
('Traditional Nepali', 'Authentic Nepali cuisine restaurants', 'utensils', 1),
('Newari', 'Traditional Newari cuisine', 'chef-hat', 2),
('Tibetan', 'Tibetan and Himalayan cuisine', 'mountain', 3),
('Indian', 'Indian cuisine restaurants', 'curry', 4),
('Chinese', 'Chinese cuisine restaurants', 'chopsticks', 5),
('Continental', 'Western and continental cuisine', 'wine', 6),
('Fast Food', 'Quick service restaurants', 'fast-food', 7),
('Street Food', 'Street food vendors and stalls', 'truck', 8),
('Bakery & Cafe', 'Bakeries and coffee shops', 'coffee', 9),
('Fine Dining', 'Upscale dining establishments', 'star', 10)
ON CONFLICT (name) DO NOTHING;

-- Insert food categories
INSERT INTO public.food_categories (name, description, icon, sort_order) VALUES
('Main Course', 'Primary dishes and meals', 'plate', 1),
('Appetizers', 'Starters and small plates', 'appetizer', 2),
('Momos', 'Traditional dumplings', 'dumpling', 3),
('Dal Bhat', 'Traditional rice and lentil meals', 'rice', 4),
('Noodles', 'Noodle dishes and soups', 'noodles', 5),
('Snacks', 'Light snacks and finger foods', 'snack', 6),
('Sweets', 'Desserts and sweet treats', 'cake', 7),
('Beverages', 'Drinks and beverages', 'drink', 8),
('Breakfast', 'Morning meals and breakfast items', 'sunrise', 9),
('Street Food', 'Popular street food items', 'street', 10)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SAMPLE MENU DATA
-- =====================================================

-- No sample data - to be populated by the application

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

-- Add comments for menu table
COMMENT ON TABLE menu IS 'Menu items for restaurants';
COMMENT ON COLUMN menu.restaurant_id IS 'Reference to the restaurant this menu item belongs to';
COMMENT ON COLUMN menu.category IS 'Menu category (e.g., Appetizers, Main Course, Desserts, Beverages)';
COMMENT ON COLUMN menu.dish_name IS 'Name of the dish';
COMMENT ON COLUMN menu.price IS 'Price of the dish in local currency';
COMMENT ON COLUMN menu.description IS 'Description of the dish';
COMMENT ON COLUMN menu.is_available IS 'Whether the dish is currently available';

-- Add comments for restaurants table
COMMENT ON TABLE public.restaurants IS 'Stores restaurant information including location, ratings, and business details';
COMMENT ON TABLE public.foods IS 'Stores food items with their details, pricing, and availability';
COMMENT ON TABLE public.restaurant_categories IS 'Categories for organizing restaurants';
COMMENT ON TABLE public.food_categories IS 'Categories for organizing food items';

COMMENT ON COLUMN public.restaurants.search_vector IS 'Full-text search vector for restaurant search functionality';
COMMENT ON COLUMN public.foods.search_vector IS 'Full-text search vector for food search functionality';
COMMENT ON COLUMN public.restaurants.opening_hours IS 'JSON object storing opening hours for each day of the week';
COMMENT ON COLUMN public.restaurants.features IS 'JSON array of restaurant features like WiFi, Parking, etc.';
COMMENT ON COLUMN public.restaurants.tags IS 'JSON array of restaurant tags for categorization';
COMMENT ON COLUMN public.foods.tags IS 'JSON array of food tags for categorization';