/*
  # Add Disputes and Default Fund Tables

  ## Overview
  This migration adds dispute resolution and default fund protection features.

  ## New Tables

  ### `disputes`
  Tracks disputes between pool members
  - `id` (uuid, primary key) - Dispute identifier
  - `pool_id` (uuid, foreign key) - References pools.id
  - `raised_by` (uuid, foreign key) - User who raised the dispute
  - `against` (uuid, foreign key) - User the dispute is against
  - `type` (text) - 'LATE_PAYMENT', 'NON_PAYMENT', 'MISCONDUCT', 'OTHER'
  - `description` (text) - Detailed description of the issue
  - `status` (text) - 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'
  - `resolution` (text) - Final resolution details
  - `resolved_by` (uuid, foreign key) - Admin who resolved it
  - `resolved_at` (timestamptz) - When it was resolved
  - `created_at` (timestamptz) - When dispute was created

  ### `default_fund_contributions`
  Tracks contributions to the default insurance fund
  - `id` (uuid, primary key) - Record identifier
  - `pool_id` (uuid, foreign key) - References pools.id
  - `user_id` (uuid, foreign key) - References users.id
  - `amount` (numeric) - Contribution amount to default fund
  - `tx_hash` (text) - Transaction hash
  - `contributed_at` (timestamptz) - Timestamp

  ### `default_fund_claims`
  Tracks claims against the default fund
  - `id` (uuid, primary key) - Claim identifier
  - `pool_id` (uuid, foreign key) - References pools.id
  - `cycle` (integer) - Cycle when default occurred
  - `defaulter_id` (uuid, foreign key) - User who defaulted
  - `amount_covered` (numeric) - Amount covered by fund
  - `tx_hash` (text) - Transaction hash
  - `claimed_at` (timestamptz) - When claim was processed

  ### `notifications`
  Tracks all notifications sent to users
  - `id` (uuid, primary key) - Notification identifier
  - `user_id` (uuid, foreign key) - References users.id
  - `type` (text) - Type of notification
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `pool_id` (uuid, foreign key, nullable) - Related pool if any
  - `read` (boolean) - Whether user has read it
  - `metadata` (jsonb) - Additional data
  - `created_at` (timestamptz) - When notification was created

  ## Security
  All tables have RLS enabled with appropriate policies.
*/

CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES pools(id) ON DELETE CASCADE NOT NULL,
  raised_by uuid REFERENCES users(id) NOT NULL,
  against uuid REFERENCES users(id),
  type text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'OPEN',
  resolution text,
  resolved_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS default_fund_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES pools(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  amount numeric NOT NULL,
  tx_hash text,
  contributed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS default_fund_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES pools(id) ON DELETE CASCADE NOT NULL,
  cycle integer NOT NULL,
  defaulter_id uuid REFERENCES users(id) NOT NULL,
  amount_covered numeric NOT NULL,
  tx_hash text,
  claimed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  pool_id uuid REFERENCES pools(id) ON DELETE SET NULL,
  read boolean DEFAULT false,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_disputes_pool ON disputes(pool_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_default_fund_contributions_pool ON default_fund_contributions(pool_id);
CREATE INDEX IF NOT EXISTS idx_default_fund_claims_pool ON default_fund_claims(pool_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_fund_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_fund_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pool members can view disputes in their pools"
  ON disputes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pool_members
      WHERE pool_members.pool_id = disputes.pool_id
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Pool members can create disputes"
  ON disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    raised_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM pool_members
      WHERE pool_members.pool_id = disputes.pool_id
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Pool members can view default fund contributions"
  ON default_fund_contributions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pool_members
      WHERE pool_members.pool_id = default_fund_contributions.pool_id
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own default fund contributions"
  ON default_fund_contributions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Pool members can view default fund claims"
  ON default_fund_claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pool_members
      WHERE pool_members.pool_id = default_fund_claims.pool_id
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);
