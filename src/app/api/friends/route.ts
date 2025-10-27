import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
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

    // Get friendships where current user is user_id
    const { data: friendsAsUser, error: error1 } = await supabase
      .from('friendships')
      .select(`
        id,
        friend_id,
        status,
        profiles:friend_id (
          id,
          email,
          full_name,
          username
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted')

    // Get friendships where current user is friend_id
    const { data: friendsAsFriend, error: error2 } = await supabase
      .from('friendships')
      .select(`
        id,
        user_id,
        status,
        profiles:user_id (
          id,
          email,
          full_name,
          username
        )
      `)
      .eq('friend_id', user.id)
      .eq('status', 'accepted')

    if (error1 || error2) {
      console.error('Friends error:', error1 || error2)
      return NextResponse.json({ success: true, friends: [] })
    }

    // Combine and format the results
    const allFriends = [
      ...(friendsAsUser || []).map(f => ({
        id: f.id,
        friend_id: f.friend_id,
        status: f.status,
        profiles: f.profiles
      })),
      ...(friendsAsFriend || []).map(f => ({
        id: f.id,
        friend_id: f.user_id,
        status: f.status,
        profiles: f.profiles
      }))
    ]

    return NextResponse.json({ success: true, friends: allFriends })
  } catch (error) {
    console.error('Get Friends Error:', error)
    return NextResponse.json({ error: 'Failed to get friends' }, { status: 500 })
  }
}
