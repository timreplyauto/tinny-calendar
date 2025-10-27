# 🗓️ TINNY - Collaborative Calendar Sharing App

A modern calendar sharing application that allows friends and groups to view each other's schedules with smart privacy controls and AI-powered scheduling assistance.

## ✨ Features

### Phase 1 & 2 (Complete Build)
- ✅ **User Authentication**: Sign up with Google, Apple, Email, or Phone
- ✅ **Calendar Management**: Create, edit, and delete events
- ✅ **Friend System**: Add friends, send/accept requests
- ✅ **Privacy Controls**: Share full calendar or just "busy" status
- ✅ **Groups**: Create family/team groups with shared calendars
- ✅ **External Calendar Sync**: Sync with Google Calendar, Apple Calendar, Outlook
- ✅ **AI Assistant**: Natural language event creation and smart scheduling
- ✅ **Time Zone Support**: Handle different time zones automatically
- ✅ **Notifications**: Email and push notifications
- ✅ **Event Invitations**: Invite friends, accept/decline invites

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (Google, Apple, Email, Phone)
- **AI**: Anthropic Claude API
- **Hosting**: Vercel (recommended)
- **Real-time**: Supabase Realtime

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Anthropic API key (for AI features)
- Google Cloud Console (for Google Calendar sync)
- Apple Developer account (for Apple sign-in)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd tinny-app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `DATABASE_SCHEMA.md`
3. Enable authentication providers:
   - Go to Authentication → Providers
   - Enable Google, Apple, Email, and Phone
4. Get your project credentials:
   - Go to Settings → API
   - Copy `Project URL` and `anon public` key

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
tinny-app/
├── src/
│   ├── app/                # Next.js 14 App Router
│   │   ├── (auth)/        # Auth pages (login, signup)
│   │   ├── (dashboard)/   # Main app pages
│   │   ├── api/           # API routes
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   │   ├── calendar/      # Calendar components
│   │   ├── friends/       # Friend management
│   │   ├── groups/        # Group components
│   │   └── ui/            # Reusable UI components
│   ├── lib/               # Utility functions
│   │   ├── supabase/      # Supabase client
│   │   ├── ai/            # AI integration
│   │   └── calendar/      # Calendar utilities
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript types
├── public/                # Static assets
└── DATABASE_SCHEMA.md     # Database schema documentation
```

## 🔧 Configuration

### Supabase Authentication Setup

#### Google Sign-In
1. Create OAuth credentials in Google Cloud Console
2. Add authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Add credentials to Supabase (Authentication → Providers → Google)

#### Apple Sign-In
1. Create App ID and Service ID in Apple Developer
2. Configure Sign in with Apple
3. Add credentials to Supabase (Authentication → Providers → Apple)

### External Calendar Integration

#### Google Calendar
1. Enable Google Calendar API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add scopes: `calendar.readonly`, `calendar.events`

#### Apple Calendar (iCloud)
1. Generate app-specific password
2. Use CalDAV protocol for sync

#### Microsoft Outlook
1. Register app in Azure Portal
2. Add Microsoft Graph permissions
3. Implement OAuth 2.0 flow

## 🤖 AI Features

The AI assistant can:

1. **Natural Language Event Creation**
   ```
   "Create a dinner date Friday at 7pm until 10pm"
   "Schedule team meeting tomorrow at 2pm, add Bob and Alice"
   ```

2. **Smart Scheduling**
   ```
   "Find time this week when Bob, Alice, and I are all free for 2 hours"
   ```

3. **Event Management**
   ```
   "Move my 3pm meeting to tomorrow"
   "Cancel all events on Thursday"
   ```

4. **Group Availability**
   ```
   "When is my family group free this weekend?"
   ```

## 🔒 Privacy & Security

- Row Level Security (RLS) enabled on all database tables
- Friend requests required before viewing calendars
- Two privacy levels: Full calendar or Busy-only
- Users manually choose which external events to share
- Encrypted storage of external calendar tokens

## 📱 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Environment Variables for Production

Make sure to add all environment variables from `.env.local.example` to your Vercel project settings.

## 🧪 Development Phases

- ✅ **Phase 1**: Project foundation & database schema
- ⏳ **Phase 2**: Authentication system (NEXT)
- ⏳ **Phase 3**: Core calendar functionality
- ⏳ **Phase 4**: Friend system
- ⏳ **Phase 5**: Privacy & sharing controls
- ⏳ **Phase 6**: Groups functionality
- ⏳ **Phase 7**: AI integration
- ⏳ **Phase 8**: Notifications & polish

## 📚 API Documentation

API routes will be documented in `/docs/api` as we build them.

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📄 License

MIT License - feel free to use this project as a learning resource.

## 🆘 Support

- Check the [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for database structure
- Review Supabase docs: https://supabase.com/docs
- Anthropic Claude docs: https://docs.anthropic.com
- Next.js docs: https://nextjs.org/docs

---

Built with ❤️ using Next.js, Supabase, and Claude AI
