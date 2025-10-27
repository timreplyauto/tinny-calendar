-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view own events" ON events;
DROP POLICY IF EXISTS "Users can view events as participant" ON events;

-- Create better policies for events
CREATE POLICY "Users can view events they participate in" ON events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_participants
      WHERE event_participants.event_id = events.id
      AND event_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own events" ON events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON events
  FOR DELETE
  USING (auth.uid() = user_id);

-- Fix event_participants policies
DROP POLICY IF EXISTS "Users can view own participations" ON event_participants;
DROP POLICY IF EXISTS "Users can view participations" ON event_participants;

CREATE POLICY "Users can view all participations for their events" ON event_participants
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create participations" ON event_participants
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own participations" ON event_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Event owners can delete participations" ON event_participants
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_participants.event_id
      AND events.user_id = auth.uid()
    )
  );
