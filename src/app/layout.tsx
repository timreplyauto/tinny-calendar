import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TINNY - Calendar Sharing App',
  description: 'Share calendars with friends and family',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
