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

    let foundUser = null

    // Remove @ if present
    const cleanQuery = searchQuery.startsWith('@') ? searchQuery.slice(1) : searchQuery

    // Check if it's a phone number
    const phoneDigits = cleanQuery.replace(/\D/g, '')
    if (phoneDigits.length === 10) {
      const { data: byPhone } = await supabase
        .from('profiles')
        .select('id, email, full_name, username, phone_number')
        .eq('phone_number', `+1${phoneDigits}`)
        .neq('id', user.id)
        .single()

      if (byPhone) {
        foundUser = byPhone
      }
    }

    // Search by username if not found by phone
    if (!foundUser) {
      const { data: byUsername } = await supabase
        .from('profiles')
        .select('id, email, full_name, username, phone_number')
        .ilike('username', cleanQuery)
        .neq('id', user.id)
        .single()

      if (byUsername) {
        foundUser = byUsername
      }
    }

    // Search by email
    if (!foundUser) {
      const { data: byEmail } = await supabase
        .from('profiles')
        .select('id, email, full_name, username, phone_number')
        .ilike('email', cleanQuery)
        .neq('id', user.id)
        .single()

      if (byEmail) {
        foundUser = byEmail
      }
    }

    // Search by name
    if (!foundUser) {
      const { data: byName } = await supabase
        .from('profiles')
        .select('id, email, full_name, username, phone_number')
        .ilike('full_name', `%${cleanQuery}%`)
        .neq('id', user.id)
        .limit(1)
        .single()

      if (byName) {
        foundUser = byName
      }
    }

    if (!foundUser) {
      // Check if phone number is valid but user doesn't exist
      if (phoneDigits.length === 10) {
        return NextResponse.json({
          error: 'User not found',
          canInvite: true,
          phone: `+1${phoneDigits}`
        }, { status: 404 })
      }
      
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
