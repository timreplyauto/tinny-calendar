import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

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

    const { email, phone } = await request.json()

    // Generate unique token
    const token = randomBytes(32).toString('hex')

    // Create invitation
    const { data, error } = await supabase
      .from('invitations')
      .insert({
        inviter_id: user.id,
        email,
        phone,
        token
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`

    return NextResponse.json({ success: true, inviteLink, invitation: data })
  } catch (error) {
    console.error('Create Invite Error:', error)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}
