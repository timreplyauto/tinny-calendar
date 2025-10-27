import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { validateAIPrompt, sanitizeString } from '@/lib/validation'

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

    const { prompt } = await request.json()

    // Validate input
    const validation = validateAIPrompt(prompt)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const sanitizedPrompt = sanitizeString(prompt, 1000)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that extracts event information from natural language. 
          Current date: ${new Date().toISOString()}
          
          Return JSON with: title, description, start_time (ISO 8601), end_time (ISO 8601), location.
          If information is missing, use reasonable defaults.`
        },
        {
          role: 'user',
          content: sanitizedPrompt
        }
      ],
      response_format: { type: 'json_object' }
    })

    const eventData = JSON.parse(completion.choices[0].message.content || '{}')

    // Sanitize AI output
    const sanitizedEventData = {
      title: sanitizeString(eventData.title || 'New Event', 200),
      description: sanitizeString(eventData.description || '', 5000),
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      location: sanitizeString(eventData.location || '', 500),
      timezone: 'UTC',
      created_by_ai: true
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        ...sanitizedEventData
      })
      .select()
      .single()

    if (error) {
      console.error('Event creation error:', error)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    // Add user as participant
    await supabase.from('event_participants').insert({
      event_id: event.id,
      user_id: user.id,
      status: 'accepted',
      is_organizer: true
    })

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('AI Create Event Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
