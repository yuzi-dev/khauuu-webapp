import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseServer;
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's profile to check for restaurant ownership
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Fetch recent activity notifications
    // This includes reviews on user's restaurants, likes on reviews, etc.
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles!reviews_user_id_fkey (
          user_id,
          username,
          full_name,
          profile_image_url
        ),
        restaurants (
          id,
          name,
          owner_id
        )
      `)
      .eq('restaurants.owner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch accepted follow notifications (recent followers)
    const { data: followers, error: followersError } = await supabase
      .from('follows')
      .select(`
        id,
        created_at,
        updated_at,
        profiles!follows_follower_user_id_fkey (
          user_id,
          username,
          full_name,
          profile_image_url
        )
      `)
      .eq('followed_user_id', user.id)
      .eq('status', 'accepted')
      .order('updated_at', { ascending: false })
      .limit(5);

    const notifications: any[] = [];

    // Add review notifications
    if (reviews && !reviewsError) {
      reviews.forEach((review: any) => {
        notifications.push({
          id: `review_${review.id}`,
          type: 'review',
          message: `${review.profiles?.full_name || review.profiles?.username} left a ${review.rating}-star review on ${review.restaurants?.name}`,
          user: review.profiles,
          timestamp: review.created_at,
          data: {
            rating: review.rating,
            comment: review.comment,
            restaurant: review.restaurants
          }
        });
      });
    }

    // Add follower notifications
    if (followers && !followersError) {
      followers.forEach((follow: any) => {
        notifications.push({
          id: `follow_${follow.id}`,
          type: 'follow',
          message: `${follow.profiles?.full_name || follow.profiles?.username} started following you`,
          user: follow.profiles,
          timestamp: follow.updated_at || follow.created_at,
          data: {}
        });
      });
    }

    // Sort all notifications by timestamp
    notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      notifications: notifications.slice(0, 20) // Limit to 20 most recent
    });

  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}