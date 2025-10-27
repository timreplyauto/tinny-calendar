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
      console.error('No user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('User ID:', user.id)

    const eventData = await request.json()
    console.log('Event data received:', eventData)

    const { participants, ...eventFields } = eventData

    // Create event
    console.log('Creating event...')
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        title: eventFields.title,
        description: eventFields.description,
        start_time: eventFields.start_time,
        end_time: eventFields.end_time,
        location: eventFields.location,
        is_all_day: eventFields.is_all_day || false,
        timezone: eventFields.timezone || 'UTC',
        created_by_ai: eventFields.created_by_ai || false,
      })
      .select()
      .single()

    if (eventError) {
      console.error('Event creation error:', eventError)
      return NextResponse.json(
        { error: eventError.message, details: eventError },
        { status: 500 }
      )
    }

    console.log('Event created:', event)

    // Add organizer as participant with accepted status
    console.log('Adding organizer as participant...')
    const { error: participantError } = await supabase
      .from('event_participants')
      .insert({
        event_id: event.id,
        user_id: user.id,
        status: 'accepted',
        is_organizer: true
      })

    if (participantError) {
      console.error('Participant error:', participantError)
      return NextResponse.json(
        { error: participantError.message, details: participantError },
        { status: 500 }
      )
    }

    console.log('Organizer added as participant')

    // Add invited participants with pending status
    if (participants && participants.length > 0) {
      console.log('Adding invited participants:', participants)
      const participantInserts = participants.map((participantId: string) => ({
        event_id: event.id,
        user_id: participantId,
        status: 'pending',
        is_organizer: false
      }))

      const { error: inviteError } = await supabase
        .from('event_participants')
        .insert(participantInserts)

      if (inviteError) {
        console.error('Invite error:', inviteError)
      }
    }

    console.log('Event created successfully')
    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Create Event Error:', error)
    return NextResponse.json(
      { error: 'Failed to create event', details: error },
      { status: 500 }
    )
  }
}

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get URL params to check if we want to see a specific friend's calendar
    const { searchParams } = new URL(request.url)
    const friendId = searchParams.get('friendId')

    if (friendId) {
      // Get specific friend's events (only if they're friends)
      const { data: friendship } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId},status.eq.accepted),and(user_id.eq.${friendId},friend_id.eq.${user.id},status.eq.accepted)`)
        .single()

      if (!friendship) {
        return NextResponse.json({ error: 'Not friends with this user' }, { status: 403 })
      }

      // Get events where friend is a participant
      const { data: participantData } = await supabase
        .from('event_participants')
        .select('event_id')
        .eq('user_id', friendId)
        .in('status', ['accepted', 'pending'])

      const eventIds = participantData?.map(p => p.event_id) || []

      if (eventIds.length === 0) {
        return NextResponse.json({ success: true, events: [] })
      }

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .order('start_time', { ascending: true })

      return NextResponse.json({ success: true, events: events || [] })
    }

    // Get events where current user is a participant (invited or created)
    const { data: participantData, error: participantError } = await supabase
      .from('event_participants')
      .select('event_id, status, is_organizer')
      .eq('user_id', user.id)

    if (participantError) {
      console.error('Participant error:', participantError)
      return NextResponse.json({ success: true, events: [] })
    }

    const eventIds = participantData.map(p => p.event_id)

    if (eventIds.length === 0) {
      return NextResponse.json({ success: true, events: [] })
    }

    // Get the actual events with participant info
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds)
      .order('start_time', { ascending: true })

    if (eventsError) {
      console.error('Events error:', eventsError)
      return NextResponse.json(
        { error: eventsError.message },
        { status: 500 }
      )
    }

    // Attach participation status to each event
    const eventsWithStatus = events?.map(event => {
      const participation = participantData.find(p => p.event_id === event.id)
      return {
        ...event,
        participation_status: participation?.status,
        is_organizer: participation?.is_organizer
      }
    })

    return NextResponse.json({ success: true, events: eventsWithStatus || [] })
  } catch (error) {
    console.error('Get Events Error:', error)
    return NextResponse.json(
      { error: 'Failed to get events' },
      { status: 500 }
    )
  }
}
