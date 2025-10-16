import { useState, useEffect } from 'react';
import { TrendingUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Pool } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAegis } from '@cavos/aegis';
import { supabase } from '../lib/supabase';

interface PayoutPanelProps {
  pool: Pool;
  onPayoutComplete?: () => void;
}

interface Payout {
  id: string;
  user_id: string;
  cycle: number;
  base_amount: string;
  yield_amount: string;
  total_amount: string;
  tx_hash: string | null;
  paid_at: string;
}

export function PayoutPanel({ pool, onPayoutComplete }: PayoutPanelProps) {
  const { user } = useAuth();
  const { aegisAccount } = useAegis();
  const [loading, setLoading] = useState(false);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [canTriggerPayout, setCanTriggerPayout] = useState(false);

  useEffect(() => {
    loadPayouts();
    checkPayoutEligibility();
  }, [pool.id, pool.currentCycle]);

  const loadPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('pool_id', pool.id)
        .order('cycle', { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (error) {
      console.error('Error loading payouts:', error);
    }
  };

  const checkPayoutEligibility = async () => {
    if (pool.status !== 'ACTIVE' || !user?.id) {
      setCanTriggerPayout(false);
      return;
    }

    try {
      const { error: memberError } = await supabase
        .from('pool_members')
        .select('payout_position')
        .eq('pool_id', pool.id)
        .eq('payout_position', pool.currentCycle)
        .maybeSingle();

      if (memberError) throw memberError;


      const { data: existingPayout, error: payoutError } = await supabase
        .from('payouts')
        .select('id')
        .eq('pool_id', pool.id)
        .eq('cycle', pool.currentCycle)
        .maybeSingle();

      if (payoutError) throw payoutError;

      const { count, error: countError } = await supabase
        .from('contributions')
        .select('*', { count: 'exact', head: true })
        .eq('pool_id', pool.id)
        .eq('cycle', pool.currentCycle);

      if (countError) throw countError;

      const allContributed = count === pool.size;
      const noPayoutYet = !existingPayout;
      const isCreator = pool.creatorId === user.id;

      setCanTriggerPayout(allContributed && noPayoutYet && isCreator);
    } catch (error) {
      console.error('Error checking payout eligibility:', error);
      setCanTriggerPayout(false);
    }
  };

  const handleTriggerPayout = async () => {
    if (!aegisAccount || !aegisAccount.address) {
      alert('Please sign in first');
      return;
    }

    if (!user) {
      alert('User data missing');
      return;
    }

    setLoading(true);

    try {
      const result = await aegisAccount.execute(
        pool.contractAddress!,
        'trigger_payout',
        []
      );

      const txHash = result.transactionHash;

      const { data: member, error: memberError } = await supabase
        .from('pool_members')
        .select('user_id')
        .eq('pool_id', pool.id)
        .eq('payout_position', pool.currentCycle)
        .maybeSingle();

      if (memberError) throw memberError;

      if (!member) {
        throw new Error('Recipient member not found');
      }

      const totalAmount = (BigInt(pool.contributionAmount) * BigInt(pool.size)).toString();

      const { error } = await supabase.from('payouts').insert({
        pool_id: pool.id,
        user_id: member.user_id,
        cycle: pool.currentCycle,
        base_amount: totalAmount,
        yield_amount: '0',
        total_amount: totalAmount,
        tx_hash: txHash,
        paid_at: new Date().toISOString(),
      });

      if (error) throw error;

      await supabase
        .from('pool_members')
        .update({ has_received_payout: true })
        .eq('pool_id', pool.id)
        .eq('payout_position', pool.currentCycle);

      alert(`Payout triggered successfully! Transaction: ${txHash}`);
      loadPayouts();
      if (onPayoutComplete) onPayoutComplete();
    } catch (error: any) {
      console.error('Error triggering payout:', error);
      alert(error.message || 'Failed to trigger payout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    return (parseFloat(amount) / 1e6).toFixed(2);
  };

  if (pool.status !== 'ACTIVE') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <TrendingUp size={24} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Payouts</h3>
            <p className="text-sm text-gray-600">{payouts.length} payouts completed</p>
          </div>
        </div>
      </div>

      {canTriggerPayout && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-900 mb-1">Ready to Trigger Payout</p>
              <p className="text-sm text-emerald-800">
                All members have contributed for Cycle {pool.currentCycle + 1}. You can now trigger
                the payout.
              </p>
            </div>
          </div>
          <button
            onClick={handleTriggerPayout}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <TrendingUp size={20} />
                Trigger Payout
              </>
            )}
          </button>
        </div>
      )}

      {payouts.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Payout History</h4>
          {payouts.map((payout) => (
            <div key={payout.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="font-semibold text-gray-900">Cycle {payout.cycle + 1}</span>
                </div>
                <span className="text-lg font-bold text-emerald-600">
                  {formatAmount(payout.total_amount)} USDC
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Paid on {new Date(payout.paid_at).toLocaleDateString()}
              </div>
              {payout.tx_hash && (
                <div className="mt-2 text-xs text-gray-500 font-mono truncate">
                  Tx: {payout.tx_hash}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No payouts yet</p>
        </div>
      )}
    </div>
  );
}
