import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // First, let's try a simple query without joins to see if we can get reviews
    const { data: reviews, error: reviewsError } = await supabaseServer
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Reviews fetch error:', reviewsError)
      return NextResponse.json({ error: 'Failed to fetch reviews', details: reviewsError.message }, { status: 500 })
    }

    // For now, return reviews without restaurant/food details since the foreign keys aren't set up
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      review_text: review.review_text,
      review_images: review.review_images || [],
      likes_count: review.likes_count || 0,
      comments_count: review.comments_count || 0,
      created_at: review.created_at,
      restaurant: {
        id: review.restaurant_id,
        name: 'Restaurant Name', // Placeholder until we fix the foreign keys
        image_url: null
      },
      food: review.food_id ? {
        id: review.food_id,
        name: 'Food Name', // Placeholder until we fix the foreign keys
        image_url: null
      } : null
    }))

    return NextResponse.json({
      success: true,
      reviews: formattedReviews
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}