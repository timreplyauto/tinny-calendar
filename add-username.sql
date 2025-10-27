-- Add username column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Update RLS policy to allow username searches
CREATE POLICY IF NOT EXISTS "Users can search by username" ON profiles
  FOR SELECT
  USING (true);
