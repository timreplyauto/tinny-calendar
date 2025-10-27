import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchValue } = await request.json()

    let friendProfile = null

    // Try to find by username (starts with @)
    if (searchValue.startsWith('@')) {
      const username = searchValue.substring(1)
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()
      
      friendProfile = data
    } 
    // Try to find by email
    else if (searchValue.includes('@')) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', searchValue)
        .single()
      
      friendProfile = data
    }
    // Try phone number
    else {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', searchValue)
        .single()
      
      friendProfile = data
    }

    if (!friendProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (friendProfile.id === user.id) {
      return NextResponse.json({ error: 'Cannot add yourself as friend' }, { status: 400 })
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendProfile.id}),and(user_id.eq.${friendProfile.id},friend_id.eq.${user.id})`)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 })
    }

    // Create friend request
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        user_id: user.id,
        friend_id: friendProfile.id,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Send Friend Request Error:', error)
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 })
  }
}
