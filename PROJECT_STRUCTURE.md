# 📂 TINNY Project Structure Guide

## Overview
This document explains every file and folder in the TINNY project.

---

## 📄 Root Level Files

### Documentation Files
- **README.md** - Main project documentation with features, tech stack, and overview
- **SETUP_GUIDE.md** - Complete step-by-step setup instructions (30-45 min)
- **DATABASE_SCHEMA.md** - Full database structure with SQL commands
- **PHASE_1_COMPLETE.md** - Summary of what's built and what's next
- **QUICK_START.md** - Quick reference card for common tasks

### Configuration Files
- **package.json** - Node.js dependencies and scripts
- **next.config.js** - Next.js framework configuration
- **tsconfig.json** - TypeScript compiler configuration
- **tailwind.config.js** - Tailwind CSS styling configuration
- **postcss.config.js** - PostCSS processing configuration
- **.gitignore** - Files to exclude from Git version control
- **.env.local.example** - Template for environment variables

---

## 📁 Source Directory (`src/`)

### `/src/app/` - Next.js 14 App Router (To Be Built)
This will contain all pages and layouts using Next.js App Router:
```
app/
├── (auth)/          # Authentication pages
│   ├── login/       # Sign in page
│   ├── signup/      # Sign up page
│   └── callback/    # OAuth callback handler
├── (dashboard)/     # Main application
│   ├── calendar/    # Calendar view
│   ├── friends/     # Friend management
│   ├── groups/      # Group management
│   └── settings/    # User settings
├── api/             # API routes
│   ├── events/      # Event CRUD endpoints
│   ├── friends/     # Friend operations
│   ├── ai/          # AI assistant endpoints
│   └── auth/        # Auth helpers
├── layout.tsx       # Root layout (wraps all pages)
├── page.tsx         # Home page
└── globals.css      # Global styles
```

### `/src/components/` - React Components (To Be Built)
Reusable UI components organized by feature:
```
components/
├── calendar/
│   ├── CalendarGrid.tsx      # Main calendar display
│   ├── EventCard.tsx          # Individual event display
│   ├── DayView.tsx            # Day view component
│   ├── WeekView.tsx           # Week view component
│   └── MonthView.tsx          # Month view component
├── friends/
│   ├── FriendList.tsx         # Display list of friends
│   ├── FriendRequest.tsx      # Friend request card
│   └── AddFriendModal.tsx     # Add friend dialog
├── groups/
│   ├── GroupList.tsx          # Display groups
│   ├── GroupCalendar.tsx      # Group calendar view
│   └── CreateGroupModal.tsx   # Create group dialog
├── events/
│   ├── CreateEventForm.tsx    # Event creation form
│   ├── EventDetails.tsx       # Event detail view
│   └── EventInvites.tsx       # Manage invitations
├── ai/
│   ├── AIAssistant.tsx        # AI chat interface
│   └── SmartScheduler.tsx     # Smart scheduling UI
└── ui/
    ├── Button.tsx             # Reusable button
    ├── Modal.tsx              # Modal dialog
    ├── Input.tsx              # Form input
    └── Card.tsx               # Card container
```

### `/src/lib/` - Utility Functions
Helper functions and integrations:
```
lib/
├── supabase/
│   ├── client.ts              # Browser Supabase client
│   ├── server.ts              # Server Supabase client
│   └── middleware.ts          # Auth middleware (to be built)
├── ai/
│   ├── anthropic.ts           # Claude AI integration
│   ├── event-parser.ts        # Parse natural language events
│   └── scheduling.ts          # Smart scheduling logic
├── calendar/
│   ├── sync.ts                # External calendar sync
│   ├── timezone.ts            # Timezone utilities
│   └── recurrence.ts          # Recurring events
└── utils/
    ├── date.ts                # Date formatting utilities
    └── validation.ts          # Form validation
```

### `/src/types/` - TypeScript Types ✅ Built
Type definitions for the entire application:
- **index.ts** - Core types (Profile, Event, Friendship, etc.)
- **database.ts** - Supabase database types (placeholder)

### `/src/hooks/` - Custom React Hooks (To Be Built)
Reusable React hooks:
```
hooks/
├── useUser.ts                 # Current user data
├── useEvents.ts               # Event management
├── useFriends.ts              # Friend operations
├── useGroups.ts               # Group operations
└── useAI.ts                   # AI assistant
```

---

## 🎯 File Purposes Explained

### Why Next.js 14?
- **App Router**: Modern routing with layouts and nested routes
- **Server Components**: Better performance by default
- **API Routes**: Backend API in the same codebase
- **SEO**: Server-side rendering for better search rankings

### Why TypeScript?
- **Type Safety**: Catch errors before runtime
- **IntelliSense**: Better code completion in editors
- **Documentation**: Types serve as inline documentation
- **Refactoring**: Safer code changes

### Why Tailwind CSS?
- **Rapid Development**: Style directly in components
- **Consistency**: Design system with utility classes
- **Small Bundle**: Only includes used classes
- **Responsive**: Mobile-first responsive design

### Why Supabase?
- **All-in-One**: Auth, database, storage, real-time
- **PostgreSQL**: Powerful relational database
- **Free Tier**: Generous free plan for startups
- **Easy Setup**: No server management needed

---

## 🔄 Data Flow

### User Authentication Flow
```
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. Google returns to Supabase callback
4. Supabase creates session
5. User redirected to dashboard
6. Profile created/updated in database
```

### Event Creation Flow
```
1. User types natural language event
2. Sent to AI API endpoint
3. Claude parses event details
4. Structured event data returned
5. Event saved to database
6. Real-time updates sent to friends
7. Notifications created
```

### Friend Calendar View Flow
```
1. User clicks on friend's calendar
2. Check friendship privacy level
3. If "full": Show all event details
4. If "busy_only": Show just busy times
5. Respect event sharing preferences
6. Display in user's timezone
```

---

## 🗄️ Database Table Relationships

```
profiles (users)
    ↓
    ├→ events (created by user)
    │   ↓
    │   └→ event_participants (who's invited)
    │
    ├→ friendships (connections)
    │   ↓
    │   └→ friend's events (with privacy)
    │
    ├→ groups (created groups)
    │   ↓
    │   └→ group_members (members)
    │       ↓
    │       └→ member events (group calendar)
    │
    └→ notifications (user alerts)
```

---

## 🚀 Development Workflow

### Step 1: Make Changes
Edit files in `src/` directory

### Step 2: See Changes
Development server auto-refreshes (http://localhost:3000)

### Step 3: Test
Verify functionality in browser

### Step 4: Commit
```bash
git add .
git commit -m "Add feature X"
git push
```

### Step 5: Deploy
Vercel automatically deploys on push to main branch

---

## 📦 Package Dependencies Explained

### Production Dependencies
- **next**: React framework for production apps
- **react** & **react-dom**: React library for UI
- **@supabase/supabase-js**: Supabase client SDK
- **@supabase/auth-helpers-nextjs**: Auth integration for Next.js
- **date-fns**: Date manipulation library
- **date-fns-tz**: Timezone support for dates
- **lucide-react**: Beautiful icon library
- **tailwindcss**: Utility-first CSS framework
- **@anthropic-ai/sdk**: Claude AI SDK

### Development Dependencies
- **typescript**: TypeScript compiler
- **@types/***: Type definitions for libraries
- **eslint**: Code linting for quality
- **autoprefixer**: CSS vendor prefixes
- **postcss**: CSS processing

---

## 🎨 Styling Approach

### Tailwind Utility Classes
```tsx
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Click Me
</button>
```

### Global Styles
In `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles here */
```

### Component-Specific Styles
Use Tailwind classes directly in components

---

## 🔐 Security Layers

1. **Supabase RLS**: Database-level access control
2. **Server Components**: Sensitive operations on server
3. **Environment Variables**: Secrets never in client code
4. **Type Safety**: TypeScript prevents common errors
5. **Input Validation**: Validate all user inputs

---

## 📊 Performance Optimizations

1. **Server Components**: Reduce JavaScript sent to browser
2. **Image Optimization**: Next.js automatic image optimization
3. **Code Splitting**: Automatic by Next.js
4. **Database Indexes**: Fast queries (see DATABASE_SCHEMA.md)
5. **Caching**: Supabase automatic caching

---

## 🧪 Testing Strategy (To Be Built)

### Unit Tests
Test individual functions in isolation

### Integration Tests
Test multiple components working together

### E2E Tests
Test complete user workflows

---

## 🌐 Deployment Architecture

```
User Browser
    ↓
Vercel CDN (Next.js app)
    ↓
    ├→ Supabase (Database & Auth)
    │
    └→ Anthropic API (AI features)
```

---

## 💡 Best Practices Used

1. **Separation of Concerns**: Each file has single responsibility
2. **DRY (Don't Repeat Yourself)**: Reusable components
3. **Type Safety**: TypeScript everywhere
4. **Documentation**: Clear comments and docs
5. **Version Control**: Git for all changes
6. **Environment Config**: Never hardcode secrets
7. **Error Handling**: Graceful error messages
8. **Accessibility**: ARIA labels, keyboard navigation
9. **Responsive Design**: Mobile-first approach
10. **Performance**: Optimize from the start

---

This structure is designed for:
- ✅ Easy navigation
- ✅ Quick understanding
- ✅ Scalable growth
- ✅ Team collaboration
- ✅ Maintenance

**Everything is organized, documented, and ready for Phase 2!**
