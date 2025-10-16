import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          external_user_id: string;
          email: string;
          wallet_public_key: string | null;
          wallet_encrypted: string | null;
          reputation_score: number;
          completed_pools: number;
          late_count: number;
          default_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_user_id: string;
          email: string;
          wallet_public_key?: string | null;
          wallet_encrypted?: string | null;
          reputation_score?: number;
          completed_pools?: number;
          late_count?: number;
          default_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_user_id?: string;
          email?: string;
          wallet_public_key?: string | null;
          wallet_encrypted?: string | null;
          reputation_score?: number;
          completed_pools?: number;
          late_count?: number;
          default_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      pools: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          token_address: string;
          contract_address: string | null;
          size: number;
          contribution_amount: string;
          cadence_seconds: number;
          payout_mode: string;
          stake_enabled: boolean;
          platform_fee_bps: number;
          default_fund_enabled: boolean;
          status: string;
          current_cycle: number;
          next_cycle_time: string | null;
          start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          token_address: string;
          contract_address?: string | null;
          size: number;
          contribution_amount: string;
          cadence_seconds: number;
          payout_mode?: string;
          stake_enabled?: boolean;
          platform_fee_bps?: number;
          default_fund_enabled?: boolean;
          status?: string;
          current_cycle?: number;
          next_cycle_time?: string | null;
          start_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          name?: string;
          token_address?: string;
          contract_address?: string | null;
          size?: number;
          contribution_amount?: string;
          cadence_seconds?: number;
          payout_mode?: string;
          stake_enabled?: boolean;
          platform_fee_bps?: number;
          default_fund_enabled?: boolean;
          status?: string;
          current_cycle?: number;
          next_cycle_time?: string | null;
          start_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pool_members: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          payout_position: number;
          has_received_payout: boolean;
          reputation_snapshot: number;
          status: string;
          joined_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          user_id: string;
          payout_position: number;
          has_received_payout?: boolean;
          reputation_snapshot: number;
          status?: string;
          joined_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pool_id?: string;
          user_id?: string;
          payout_position?: number;
          has_received_payout?: boolean;
          reputation_snapshot?: number;
          status?: string;
          joined_at?: string;
          created_at?: string;
        };
      };
      contributions: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          cycle: number;
          amount: string;
          tx_hash: string | null;
          contributed_at: string;
          is_late: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          user_id: string;
          cycle: number;
          amount: string;
          tx_hash?: string | null;
          contributed_at?: string;
          is_late?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          pool_id?: string;
          user_id?: string;
          cycle?: number;
          amount?: string;
          tx_hash?: string | null;
          contributed_at?: string;
          is_late?: boolean;
          created_at?: string;
        };
      };
      payouts: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          cycle: number;
          base_amount: string;
          yield_amount: string;
          total_amount: string;
          tx_hash: string | null;
          paid_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          user_id: string;
          cycle: number;
          base_amount: string;
          yield_amount?: string;
          total_amount: string;
          tx_hash?: string | null;
          paid_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pool_id?: string;
          user_id?: string;
          cycle?: number;
          base_amount?: string;
          yield_amount?: string;
          total_amount?: string;
          tx_hash?: string | null;
          paid_at?: string;
          created_at?: string;
        };
      };
      reputation_events: {
        Row: {
          id: string;
          user_id: string;
          pool_id: string | null;
          event_type: string;
          score_change: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pool_id?: string | null;
          event_type: string;
          score_change: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pool_id?: string | null;
          event_type?: string;
          score_change?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
