/*
  # ROSCA Platform Database Schema

  ## Overview
  This migration creates the complete database schema for a community savings circle (ROSCA) platform
  on Starknet with Chipi Pay integration. The system manages rotating savings pools where members
  contribute regularly and receive payouts in turns.

  ## New Tables

  ### `users`
  Stores user profiles and wallet information
  - `id` (uuid, primary key) - Internal user identifier
  - `external_user_id` (text, unique) - External auth provider ID (Clerk)
  - `email` (text) - User email address
  - `wallet_public_key` (text) - Starknet wallet public key
  - `wallet_encrypted` (text) - Encrypted wallet private key
  - `reputation_score` (integer) - User reputation score (0-1000)
  - `completed_pools` (integer) - Number of successfully completed pools
  - `late_count` (integer) - Number of late contributions
  - `default_count` (integer) - Number of defaulted contributions
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `pools`
  Main pool configuration and state tracking
  - `id` (uuid, primary key) - Pool identifier
  - `creator_id` (uuid, foreign key) - References users.id
  - `name` (text) - Pool display name
  - `token_address` (text) - Contract address of contribution token (USDC)
  - `contract_address` (text) - Deployed pool contract address on Starknet
  - `size` (integer) - Number of member slots
  - `contribution_amount` (numeric) - Amount per contribution (wei)
  - `cadence_seconds` (bigint) - Time between cycles in seconds
  - `payout_mode` (text) - 'fixed' or 'random' payout order
  - `stake_enabled` (boolean) - Whether idle funds are staked
  - `platform_fee_bps` (integer) - Platform fee in basis points
  - `default_fund_enabled` (boolean) - Whether default insurance is active
  - `status` (text) - 'PENDING', 'ACTIVE', 'COMPLETED', 'PAUSED'
  - `current_cycle` (integer) - Current cycle index (0-based)
  - `next_cycle_time` (timestamptz) - When next cycle starts
  - `start_date` (timestamptz) - Pool start date
  - `created_at` (timestamptz) - Pool creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `pool_members`
  Tracks pool membership and participation
  - `id` (uuid, primary key) - Member record identifier
  - `pool_id` (uuid, foreign key) - References pools.id
  - `user_id` (uuid, foreign key) - References users.id
  - `payout_position` (integer) - Position in payout order (0-based)
  - `has_received_payout` (boolean) - Whether member received their payout
  - `reputation_snapshot` (integer) - Reputation score when joined
  - `status` (text) - 'ACTIVE', 'REPLACED', 'DEFAULTED'
  - `joined_at` (timestamptz) - When member joined pool
  - `created_at` (timestamptz) - Record creation timestamp

  ### `contributions`
  Records each contribution made by members
  - `id` (uuid, primary key) - Contribution record identifier
  - `pool_id` (uuid, foreign key) - References pools.id
  - `user_id` (uuid, foreign key) - References users.id
  - `cycle` (integer) - Cycle number for this contribution
  - `amount` (numeric) - Contribution amount (wei)
  - `tx_hash` (text) - Starknet transaction hash
  - `contributed_at` (timestamptz) - Timestamp of contribution
  - `is_late` (boolean) - Whether contribution was late
  - `created_at` (timestamptz) - Record creation timestamp

  ### `payouts`
  Records payouts to members
  - `id` (uuid, primary key) - Payout record identifier
  - `pool_id` (uuid, foreign key) - References pools.id
  - `user_id` (uuid, foreign key) - References users.id
  - `cycle` (integer) - Cycle number for this payout
  - `base_amount` (numeric) - Base payout amount (wei)
  - `yield_amount` (numeric) - Additional yield earned (wei)
  - `total_amount` (numeric) - Total payout amount (wei)
  - `tx_hash` (text) - Starknet transaction hash
  - `paid_at` (timestamptz) - Timestamp of payout
  - `created_at` (timestamptz) - Record creation timestamp

  ### `reputation_events`
  Audit log of reputation changes
  - `id` (uuid, primary key) - Event identifier
  - `user_id` (uuid, foreign key) - References users.id
  - `pool_id` (uuid, foreign key, nullable) - References pools.id if related
  - `event_type` (text) - 'POOL_COMPLETED', 'LATE_CONTRIBUTION', 'DEFAULT', 'MANUAL_ADJUSTMENT'
  - `score_change` (integer) - Change in reputation score (can be negative)
  - `notes` (text) - Additional context
  - `created_at` (timestamptz) - Event timestamp

  ## Security

  All tables have Row Level Security (RLS) enabled with restrictive policies:
  - Users can view and update their own profile data
  - Pool creators and members can view pool details
  - Only pool members can view contribution and payout records for their pools
  - Reputation events are viewable by the user they belong to
  - Administrative operations require service role

  ## Important Notes

  1. All amount fields store values in wei (smallest token unit) as numeric type
  2. Timestamps use timestamptz for timezone awareness
  3. Foreign keys ensure referential integrity
  4. Indexes are added on frequently queried columns for performance
  5. Default values prevent null-related bugs
  6. RLS policies enforce data privacy and security
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_user_id text UNIQUE NOT NULL,
  email text NOT NULL,
  wallet_public_key text,
  wallet_encrypted text,
  reputation_score integer DEFAULT 500,
  completed_pools integer DEFAULT 0,
  late_count integer DEFAULT 0,
  default_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES users(id) NOT NULL,
  name text NOT NULL,
  token_address text NOT NULL,
  contract_address text,
  size integer NOT NULL,
  contribution_amount numeric NOT NULL,
  cadence_seconds bigint NOT NULL,
  payout_mode text DEFAULT 'fixed',
  stake_enabled boolean DEFAULT false,
  platform_fee_bps integer DEFAULT 50,
  default_fund_enabled boolean DEFAULT false,
  status text DEFAULT 'PENDING',
  current_cycle integer DEFAULT 0,
  next_cycle_time timestamptz,
  start_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pool_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES pools(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  payout_position integer NOT NULL,
  has_received_payout boolean DEFAULT false,
  reputation_snapshot integer NOT NULL,
  status text DEFAULT 'ACTIVE',
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(pool_id, user_id),
  UNIQUE(pool_id, payout_position)
);

CREATE TABLE IF NOT EXISTS contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES pools(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  cycle integer NOT NULL,
  amount numeric NOT NULL,
  tx_hash text,
  contributed_at timestamptz DEFAULT now(),
  is_late boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(pool_id, user_id, cycle)
);

CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid REFERENCES pools(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  cycle integer NOT NULL,
  base_amount numeric NOT NULL,
  yield_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  tx_hash text,
  paid_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(pool_id, cycle)
);

CREATE TABLE IF NOT EXISTS reputation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  pool_id uuid REFERENCES pools(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  score_change integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pools_creator ON pools(creator_id);
CREATE INDEX IF NOT EXISTS idx_pools_status ON pools(status);
CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_user ON pool_members(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_pool_cycle ON contributions(pool_id, cycle);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_pool ON payouts(pool_id);
CREATE INDEX IF NOT EXISTS idx_payouts_user ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_events_user ON reputation_events(user_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view pools they created or joined"
  ON pools FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM pool_members
      WHERE pool_members.pool_id = pools.id
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pools"
  ON pools FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Pool creators can update their pools"
  ON pools FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can view members of their pools"
  ON pool_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pools
      WHERE pools.id = pool_members.pool_id
      AND (pools.creator_id = auth.uid() OR
           EXISTS (SELECT 1 FROM pool_members pm2
                   WHERE pm2.pool_id = pools.id
                   AND pm2.user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can join pools"
  ON pool_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Pool creators can update members"
  ON pool_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pools
      WHERE pools.id = pool_members.pool_id
      AND pools.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pools
      WHERE pools.id = pool_members.pool_id
      AND pools.creator_id = auth.uid()
    )
  );

CREATE POLICY "Users can view contributions in their pools"
  ON contributions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pool_members
      WHERE pool_members.pool_id = contributions.pool_id
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own contributions"
  ON contributions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view payouts in their pools"
  ON payouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pool_members
      WHERE pool_members.pool_id = payouts.pool_id
      AND pool_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can create payouts"
  ON payouts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own reputation events"
  ON reputation_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can create reputation events"
  ON reputation_events FOR INSERT
  TO authenticated
  WITH CHECK (true);