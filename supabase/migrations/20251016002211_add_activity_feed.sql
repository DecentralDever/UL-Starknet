/*
  # Add Activity Feed Table

  ## Overview
  This migration creates an activity feed table to track all pool-related activities
  for real-time updates and historical tracking.

  ## New Table

  ### `activity_feed`
  Tracks all activities in pools for display in real-time feeds
  - `id` (uuid, primary key) - Activity identifier
  - `pool_id` (uuid, foreign key) - References pools.id
  - `user_id` (uuid, foreign key, nullable) - User who performed the action
  - `activity_type` (text) - Type of activity:
    - 'POOL_CREATED'
    - 'MEMBER_JOINED'
    - 'CONTRIBUTION_MADE'
    - 'PAYOUT_RECEIVED'
    - 'POOL_COMPLETED'
    - 'DISPUTE_RAISED'
    - 'LATE_CONTRIBUTION'
    - 'DEFAULT_OCCURRED'
  - `title` (text) - Short title for the activity
  - `description` (text) - Detailed description
  - `metadata` (jsonb) - Additional structured data (amounts, cycle, etc.)
  - `created_at` (timestamptz) - Timestamp of activity

  ## Security
  RLS enabled with policies for pool members to view activities in their pools.
*/

CREATE TABLE IF NOT EXISTS activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES pools(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  activity_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_feed_pool ON activity_feed(pool_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON activity_feed(activity_type);

ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pool members can view activity feed"
  ON activity_feed FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pool_members
      WHERE pool_members.pool_id = activity_feed.pool_id
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can create activity feed entries"
  ON activity_feed FOR INSERT
  TO authenticated
  WITH CHECK (true);
