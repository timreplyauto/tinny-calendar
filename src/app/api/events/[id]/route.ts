import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const eventData = await request.json()
    const { participants, ...eventFields } = eventData
    const eventId = params.id

    // Update event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .update({
        title: eventFields.title,
        description: eventFields.description,
        start_time: eventFields.start_time,
        end_time: eventFields.end_time,
        location: eventFields.location,
        timezone: eventFields.timezone || 'UTC',
      })
      .eq('id', eventId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (eventError) {
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      )
    }

    // Update participants if provided
    if (participants) {
      // Remove old non-organizer participants
      await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('is_organizer', false)

      // Add new participants
      if (participants.length > 0) {
        const participantInserts = participants.map((participantId: string) => ({
          event_id: eventId,
          user_id: participantId,
          status: 'pending',
          is_organizer: false
        }))

        await supabase
          .from('event_participants')
          .insert(participantInserts)
      }
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Update Event Error:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const eventId = params.id

    // Delete event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete Event Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
