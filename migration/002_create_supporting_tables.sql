-- Supporting tables for the profiles system
-- These tables are referenced in the profile statistics functions

-- Create reviews table for user reviews
-- This table references existing restaurants and foods in your app
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- References to existing entities in your app
    restaurant_id UUID, -- References your existing restaurants table
    food_id UUID, -- References your existing foods table
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_images TEXT[], -- Array of image URLs for the review
    
    -- Engagement metrics
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- Privacy and status
    is_public BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can only review a restaurant/food combination once
    UNIQUE(user_id, restaurant_id, food_id)
);

-- Create indexes for reviews table
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_food_id ON reviews(food_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_public ON reviews(is_public);

-- Create trigger for reviews updated_at
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews table
CREATE POLICY "Public reviews are viewable by everyone" 
    ON reviews FOR SELECT 
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews" 
    ON reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
    ON reviews FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
    ON reviews FOR DELETE 
    USING (auth.uid() = user_id);

-- Create saved_items table for bookmarked restaurants/foods
-- This table references existing entities in your app
CREATE TABLE IF NOT EXISTS saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- References to existing entities in your app
    restaurant_id UUID, -- References your existing restaurants table
    food_id UUID, -- References your existing foods table
    offer_id UUID, -- References your existing offers table
    
    -- Item type for easier querying
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('restaurant', 'food', 'offer')),
    
    -- Organization
    collection_name VARCHAR(100), -- Optional: user can organize saves into collections
    notes TEXT, -- Optional: user notes about why they saved this
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure user can't save the same item twice
    UNIQUE(user_id, restaurant_id, food_id, offer_id)
);

-- Create indexes for saved_items table
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_type ON saved_items(item_type);
CREATE INDEX IF NOT EXISTS idx_saved_items_restaurant_id ON saved_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_food_id ON saved_items(food_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_offer_id ON saved_items(offer_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_created_at ON saved_items(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_items_collection ON saved_items(collection_name);

-- Enable RLS for saved_items table
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_items table
CREATE POLICY "Users can view their own saved items" 
    ON saved_items FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved items" 
    ON saved_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved items" 
    ON saved_items FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items" 
    ON saved_items FOR DELETE 
    USING (auth.uid() = user_id);

-- Create triggers to update profile statistics when follows/reviews change
CREATE OR REPLACE FUNCTION update_follower_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update follower count for the followed user
        PERFORM update_profile_stats(NEW.followed_user_id);
        -- Update following count for the follower user
        PERFORM update_profile_stats(NEW.follower_user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update follower count for the followed user
        PERFORM update_profile_stats(OLD.followed_user_id);
        -- Update following count for the follower user
        PERFORM update_profile_stats(OLD.follower_user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM update_profile_stats(NEW.user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_profile_stats(OLD.user_id);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM update_profile_stats(NEW.user_id);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_review_change
    AFTER INSERT OR DELETE OR UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_review_stats();

-- Grant permissions
GRANT ALL ON TABLE reviews TO anon, authenticated;
GRANT ALL ON TABLE saved_items TO anon, authenticated;

-- Add comments for documentation
COMMENT ON TABLE reviews IS 'User reviews for restaurants and food items';
COMMENT ON TABLE saved_items IS 'User saved restaurants, offers, and food items';