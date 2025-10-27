# TINNY Database Schema

## Overview
This schema supports all TINNY features including user auth, calendar management, friend connections, groups, privacy controls, and AI event creation.

## Tables

### 1. profiles
Extends Supabase auth.users with additional user information
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
```

### 2. events
Core calendar events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_all_day BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'UTC',
  external_calendar_id TEXT, -- For synced events (Google, Apple, Outlook)
  external_calendar_type TEXT, -- 'google', 'apple', 'outlook', null for native
  is_shared BOOLEAN DEFAULT false, -- Manually shared by user
  created_by_ai BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_external_id ON events(external_calendar_id);
```

### 3. friendships
Friend connections between users
```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  privacy_level TEXT CHECK (privacy_level IN ('full', 'busy_only')) DEFAULT 'busy_only',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);
```

### 4. event_participants
Tracks who is invited to events
```sql
CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')) DEFAULT 'pending',
  is_organizer BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);
```

### 5. groups
User-created groups (family, team, etc.)
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_created_by ON groups(created_by);
```

### 6. group_members
Members of groups
```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  privacy_level TEXT CHECK (privacy_level IN ('full', 'busy_only')) DEFAULT 'busy_only',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
```

### 7. notifications
User notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'friend_request', 'event_invite', 'event_update', etc.
  title TEXT NOT NULL,
  message TEXT,
  related_id UUID, -- ID of related event, friendship, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

### 8. calendar_connections
External calendar integrations
```sql
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL, -- 'google', 'apple', 'outlook'
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT, -- Encrypted
  expires_at TIMESTAMPTZ,
  calendar_id TEXT, -- External calendar ID
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_connections_user_id ON calendar_connections(user_id);
```

## Row Level Security (RLS) Policies

### profiles
- Users can view their own profile
- Users can view profiles of their accepted friends
- Users can update only their own profile

### events
- Users can CRUD their own events
- Users can view events they're invited to
- Users can view friend's events based on friendship privacy settings

### friendships
- Users can view their own friendships
- Users can create friendship requests
- Only the recipient can update friendship status

### event_participants
- Event organizer can CRUD participants
- Participants can view and update their own status

### groups
- Group creator can update/delete group
- Group members can view the group
- Anyone can create a group

### group_members
- Group creator can add/remove members
- Members can view other members
- Members can leave the group (delete themselves)

## Setup Instructions

1. Create a Supabase project at https://supabase.com
2. Run the SQL commands above in the Supabase SQL Editor
3. Enable Row Level Security on all tables
4. Configure authentication providers (Google, Apple, Email, Phone)
5. Add your Supabase URL and keys to .env.local

## Next Steps
- Set up Supabase Auth with Google, Apple, Email, Phone providers
- Configure email templates for notifications
- Set up real-time subscriptions for calendar updates
