import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

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

    // Parallel data fetching for speed
    const [profileResult, myParticipantResult, friendships1Result, friendships2Result] = await Promise.all([
      supabase.from('profiles').select('full_name, username').eq('id', user.id).single(),
      supabase.from('event_participants').select('event_id').eq('user_id', user.id),
      supabase.from('friendships').select('friend_id, user_id').eq('user_id', user.id).eq('status', 'accepted'),
      supabase.from('friendships').select('friend_id, user_id').eq('friend_id', user.id).eq('status', 'accepted')
    ])

    const profile = profileResult.data
    const myEventIds = myParticipantResult.data?.map(p => p.event_id) || []

    // Get events only if there are any
    let myEvents: any[] = []
    if (myEventIds.length > 0) {
      const { data } = await supabase
        .from('events')
        .select('*')
        .in('id', myEventIds)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) // Only next 7 days for speed
        .order('start_time', { ascending: true })
        .limit(10) // Limit to 10 events for speed

      myEvents = data || []
    }

    // Get friend IDs
    const friendIds = new Set<string>()
    friendships1Result.data?.forEach(f => friendIds.add(f.friend_id))
    friendships2Result.data?.forEach(f => friendIds.add(f.user_id))
    friendIds.delete(user.id)

    // Get friend profiles and events in parallel
    const friendProfiles = await supabase
      .from('profiles')
      .select('id, full_name, username')
      .in('id', Array.from(friendIds))

    const friends = friendProfiles.data?.map(f => ({
      id: f.id,
      name: f.full_name || f.username || 'Unknown'
    })) || []

    // Get friends' events in parallel (limited to 2 friends max for speed)
    const friendEventsMap: Record<string, any[]> = {}
    const friendsToCheck = friends.slice(0, 2) // Only check first 2 friends for speed

    await Promise.all(
      friendsToCheck.map(async (friend) => {
        const { data: friendParticipantData } = await supabase
          .from('event_participants')
          .select('event_id')
          .eq('user_id', friend.id)
          .in('status', ['accepted', 'pending'])
          .limit(10)

        const friendEventIds = friendParticipantData?.map(p => p.event_id) || []

        if (friendEventIds.length > 0) {
          const { data: friendEvents } = await supabase
            .from('events')
            .select('*')
            .in('id', friendEventIds)
            .gte('start_time', new Date().toISOString())
            .lte('start_time', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('start_time', { ascending: true })
            .limit(10)

          friendEventsMap[friend.id] = friendEvents || []
        } else {
          friendEventsMap[friend.id] = []
        }
      })
    )

    // Shorter, more concise context for faster AI response
    const now = new Date()
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    let contextMessage = `You are a fast scheduling assistant. Current: ${now.toLocaleDateString()}

MY SCHEDULE (next 7 days):
${myEvents.length > 0 ? myEvents.map(e => 
  `${new Date(e.start_time).toLocaleDateString()} ${new Date(e.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}: ${e.title}`
).join('\n') : 'Free all week'}

FRIENDS:
${friendsToCheck.map(friend => {
  const events = friendEventsMap[friend.id] || []
  return `${friend.name}: ${events.length > 0 ? events.map(e => 
    `${new Date(e.start_time).toLocaleDateString()} ${new Date(e.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
  ).join(', ') : 'Free all week'}`
}).join('\n')}

Task: Find free times. List 3-5 specific options with dates and times in format "October 28, 2025, 2:00 PM to 4:00 PM". Be brief and specific.`

    // Use gpt-4o-mini with lower temperature for faster response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: contextMessage },
        { role: 'user', content: query }
      ],
      temperature: 0.3, // Lower temperature for faster, more focused responses
      max_tokens: 500 // Limit response length for speed
    })

    const aiResponse = completion.choices[0].message.content

    return NextResponse.json({ 
      success: true, 
      response: aiResponse,
      myEvents,
      friends: friendsToCheck,
      friendEventsMap
    })
  } catch (error: any) {
    console.error('Smart Schedule Error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze schedule',
      details: error?.message || 'Unknown error'
    }, { status: 500 })
  }
}
