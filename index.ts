// Core type definitions for TINNY app

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  is_all_day: boolean;
  timezone: string;
  external_calendar_id: string | null;
  external_calendar_type: 'google' | 'apple' | 'outlook' | null;
  is_shared: boolean;
  created_by_ai: boolean;
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  privacy_level: 'full' | 'busy_only';
  created_at: string;
  updated_at: string;
  friend_profile?: Profile; // Joined data
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  is_organizer: boolean;
  created_at: string;
  updated_at: string;
  profile?: Profile; // Joined data
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator_profile?: Profile; // Joined data
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  privacy_level: 'full' | 'busy_only';
  joined_at: string;
  profile?: Profile; // Joined data
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'event_invite' | 'event_update' | 'group_invite';
  title: string;
  message: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface CalendarConnection {
  id: string;
  user_id: string;
  provider: 'google' | 'apple' | 'outlook';
  access_token: string;
  refresh_token: string | null;
  expires_at: string | null;
  calendar_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types with joined data
export interface EventWithParticipants extends Event {
  participants: EventParticipant[];
  participant_count: number;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
  member_count: number;
}

// AI types
export interface AIEventRequest {
  prompt: string;
  user_timezone: string;
  user_id: string;
}

export interface AIEventResponse {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_all_day: boolean;
  suggested_participants?: string[]; // Friend names or emails
}

export interface AISchedulingRequest {
  prompt: string;
  user_id: string;
  participant_ids: string[];
  duration_minutes?: number;
}

export interface AISchedulingResponse {
  suggested_times: Array<{
    start_time: string;
    end_time: string;
    all_available: boolean;
    available_participants: string[];
  }>;
  explanation: string;
}

// Form types
export interface CreateEventForm {
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  location?: string;
  is_all_day: boolean;
  participants?: string[]; // User IDs
}

export interface UpdateProfileForm {
  full_name?: string;
  timezone?: string;
  avatar_url?: string;
}

// Calendar view types
export type CalendarView = 'day' | 'week' | 'month' | 'agenda';

export interface CalendarDateRange {
  start: Date;
  end: Date;
}

// Privacy settings
export interface PrivacySettings {
  default_event_privacy: 'private' | 'shared';
  default_friend_privacy: 'full' | 'busy_only';
  allow_friend_requests: boolean;
}
