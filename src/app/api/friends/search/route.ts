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

    const { query } = await request.json()

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query too short' }, { status: 400 })
    }

    const searchQuery = query.trim().toLowerCase()

    // Search by username (without @), email, or phone
    let foundUser = null

    // Remove @ if present
    const cleanQuery = searchQuery.startsWith('@') ? searchQuery.slice(1) : searchQuery

    // Search by username first (case-insensitive)
    const { data: byUsername } = await supabase
      .from('profiles')
      .select('id, email, full_name, username')
      .ilike('username', cleanQuery)
      .neq('id', user.id)
      .single()

    if (byUsername) {
      foundUser = byUsername
    }

    // If not found, search by email (case-insensitive)
    if (!foundUser) {
      const { data: byEmail } = await supabase
        .from('profiles')
        .select('id, email, full_name, username')
        .ilike('email', cleanQuery)
        .neq('id', user.id)
        .single()

      if (byEmail) {
        foundUser = byEmail
      }
    }

    // If not found, search by full name (partial match, case-insensitive)
    if (!foundUser) {
      const { data: byName } = await supabase
        .from('profiles')
        .select('id, email, full_name, username')
        .ilike('full_name', `%${cleanQuery}%`)
        .neq('id', user.id)
        .limit(1)
        .single()

      if (byName) {
        foundUser = byName
      }
    }

    if (!foundUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already friends
    const { data: existingFriendship } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${foundUser.id}),and(user_id.eq.${foundUser.id},friend_id.eq.${user.id})`)
      .single()

    return NextResponse.json({
      success: true,
      user: foundUser,
      alreadyFriends: existingFriendship?.status === 'accepted',
      pendingRequest: existingFriendship?.status === 'pending'
    })
  } catch (error) {
    console.error('Friend Search Error:', error)
    return NextResponse.json({ error: 'Failed to search for user' }, { status: 500 })
  }
}
