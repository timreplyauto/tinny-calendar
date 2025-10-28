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

    const { phone } = await request.json()

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .single()

    const senderName = profile?.full_name || profile?.username || 'Someone'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tinny-calendar.vercel.app'
    
    // Generate invite link
    const inviteLink = `${appUrl}/signup?ref=${user.id}`

    // In production, you would integrate with Twilio or similar SMS service
    // For now, we'll create a shareable link
    const smsBody = encodeURIComponent(
      `${senderName} invited you to TINNY Calendar! Join here: ${inviteLink}`
    )
    const smsLink = `sms:${phone}?&body=${smsBody}`

    return NextResponse.json({
      success: true,
      smsLink,
      inviteLink,
      message: 'SMS invite link generated'
    })
  } catch (error) {
    console.error('SMS Invite Error:', error)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}
