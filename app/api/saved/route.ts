import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Query the saved_items table directly (as per the migration schema)
    const { data: savedItems, error } = await supabaseServer
      .from('saved_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Saved items fetch error:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch saved items', 
        details: error.message 
      }, { status: 500 })
    }

    // Separate items by type and format them
    const savedRestaurants = savedItems
      .filter(item => item.item_type === 'restaurant')
      .map(item => ({
        id: item.id,
        created_at: item.created_at,
        restaurant_id: item.restaurant_id,
        collection_name: item.collection_name,
        notes: item.notes,
        // Placeholder data until we fix foreign keys
        restaurants: {
          id: item.restaurant_id,
          name: 'Restaurant Name',
          image_url: null,
          cuisine_type: 'Cuisine Type',
          rating: 4.5,
          location: 'Location'
        }
      }))

    const savedFoods = savedItems
      .filter(item => item.item_type === 'food')
      .map(item => ({
        id: item.id,
        created_at: item.created_at,
        food_id: item.food_id,
        collection_name: item.collection_name,
        notes: item.notes,
        // Placeholder data until we fix foreign keys
        foods: {
          id: item.food_id,
          name: 'Food Name',
          image_url: null,
          price: 0,
          description: 'Food description',
          restaurants: {
            id: 'restaurant-id',
            name: 'Restaurant Name'
          }
        }
      }))

    return NextResponse.json({ 
      savedRestaurants, 
      savedFoods 
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, itemId, itemType } = body

    if (!userId || !itemId || !itemType) {
      return NextResponse.json({ error: 'User ID, item ID, and item type are required' }, { status: 400 })
    }

    if (itemType === 'restaurant') {
      const { data, error } = await supabaseServer
        .from('saved_restaurants')
        .insert({ user_id: userId, restaurant_id: itemId })
        .select()

      if (error) {
        console.error('Save restaurant error:', error)
        return NextResponse.json({ error: 'Failed to save restaurant' }, { status: 500 })
      }

      return NextResponse.json({ saved: data })
    } else if (itemType === 'food') {
      const { data, error } = await supabaseServer
        .from('saved_foods')
        .insert({ user_id: userId, food_id: itemId })
        .select()

      if (error) {
        console.error('Save food error:', error)
        return NextResponse.json({ error: 'Failed to save food' }, { status: 500 })
      }

      return NextResponse.json({ saved: data })
    } else {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 })
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const itemId = searchParams.get('itemId')
    const itemType = searchParams.get('itemType')

    if (!userId || !itemId || !itemType) {
      return NextResponse.json({ error: 'User ID, item ID, and item type are required' }, { status: 400 })
    }

    if (itemType === 'restaurant') {
      const { error } = await supabaseServer
        .from('saved_restaurants')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', itemId)

      if (error) {
        console.error('Delete saved restaurant error:', error)
        return NextResponse.json({ error: 'Failed to remove saved restaurant' }, { status: 500 })
      }
    } else if (itemType === 'food') {
      const { error } = await supabaseServer
        .from('saved_foods')
        .delete()
        .eq('user_id', userId)
        .eq('food_id', itemId)

      if (error) {
        console.error('Delete saved food error:', error)
        return NextResponse.json({ error: 'Failed to remove saved food' }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}