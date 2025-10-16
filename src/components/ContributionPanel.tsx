import { useState, useEffect } from 'react';
import { DollarSign, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Pool } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAegis } from '@cavos/aegis';
import { supabase } from '../lib/supabase';
import {
  checkUSDCAllowance,
  getUSDCBalance,
} from '../lib/starknet';
import { CallData, uint256 } from 'starknet';
import { useToast } from '../contexts/ToastContext';
import { useWalletSession } from '../hooks/useWalletSession';

const USDC_ADDRESS = import.meta.env.VITE_USDC_CONTRACT_ADDRESS;

interface ContributionPanelProps {
  pool: Pool;
  onContributionComplete?: () => void;
}

interface Contribution {
  id: string;
  user_id: string;
  cycle: number;
  amount: string;
  tx_hash: string | null;
  contributed_at: string;
  is_late: boolean;
}

export function ContributionPanel({ pool, onContributionComplete }: ContributionPanelProps) {
  const { user } = useAuth();
  const { aegisAccount } = useAegis();
  const { showToast } = useToast();
  const { ensureSession } = useWalletSession();
  const [loading, setLoading] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [hasContributed, setHasContributed] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [needsApproval, setNeedsApproval] = useState(false);

  useEffect(() => {
    loadContributions();
    checkUserContribution();
    if (user?.walletPublicKey) {
      loadBalance();
      checkAllowance();
    }
  }, [pool.id, pool.currentCycle, user?.walletPublicKey]);

  const loadBalance = async () => {
    if (!user?.walletPublicKey) return;
    try {
      const balance = await getUSDCBalance(user.walletPublicKey);
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const checkAllowance = async () => {
    if (!user?.walletPublicKey || !pool.contractAddress) return;
    try {
      const allowance = await checkUSDCAllowance(user.walletPublicKey, pool.contractAddress);
      const required = pool.contributionAmount;
      setNeedsApproval(BigInt(allowance) < BigInt(required));
    } catch (error) {
      console.error('Error checking allowance:', error);
      setNeedsApproval(true);
    }
  };

  const loadContributions = async () => {
    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('pool_id', pool.id)
        .eq('cycle', pool.currentCycle)
        .order('contributed_at', { ascending: false });

      if (error) throw error;
      setContributions(data || []);
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  const checkUserContribution = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('contributions')
        .select('id')
        .eq('pool_id', pool.id)
        .eq('user_id', user.id)
        .eq('cycle', pool.currentCycle)
        .maybeSingle();

      if (error) throw error;
      setHasContributed(!!data);
    } catch (error) {
      console.error('Error checking contribution:', error);
    }
  };

  const handleApprove = async () => {
    if (!aegisAccount) {
      showToast('Wallet not initialized', 'error');
      return;
    }

    const sessionValid = await ensureSession();
    if (!sessionValid) {
      showToast('Unable to restore wallet session. Please refresh the page.', 'error');
      return;
    }

    setLoading(true);

    try {
      const amount = (BigInt(pool.contributionAmount) * BigInt(pool.size)).toString();
      const amountU256 = uint256.bnToUint256(amount);

      const calldata = CallData.compile({
        spender: pool.contractAddress!,
        amount: amountU256,
      });

      const result = await aegisAccount.execute(
        USDC_ADDRESS,
        'approve',
        calldata
      );

      const txHash = result.transactionHash;
      showToast('USDC approved successfully!', 'success');
      setNeedsApproval(false);
    } catch (error: any) {
      console.error('Error approving USDC:', error);
      showToast(error.message || 'Failed to approve USDC. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!aegisAccount) {
      showToast('Wallet not initialized', 'error');
      return;
    }

    if (!user) {
      showToast('User data missing', 'error');
      return;
    }

    const sessionValid = await ensureSession();
    if (!sessionValid) {
      showToast('Unable to restore wallet session. Please refresh the page.', 'error');
      return;
    }

    setLoading(true);

    try {
      const calldata = CallData.compile({ cycle: pool.currentCycle });

      const result = await aegisAccount.execute(
        pool.contractAddress!,
        'contribute',
        calldata
      );

      const txHash = result.transactionHash;

      const { error } = await supabase.from('contributions').insert({
        pool_id: pool.id,
        user_id: user.id,
        cycle: pool.currentCycle,
        amount: pool.contributionAmount,
        tx_hash: txHash,
        contributed_at: new Date().toISOString(),
        is_late: false,
      });

      if (error) throw error;

      showToast('Contribution successful!', 'success');
      setHasContributed(true);
      loadContributions();
      if (onContributionComplete) onContributionComplete();
    } catch (error: any) {
      console.error('Error contributing:', error);
      showToast(error.message || 'Failed to contribute. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    return (parseFloat(amount) / 1e6).toFixed(2);
  };

  const balanceInUSDC = parseFloat(usdcBalance) / 1e6;
  const requiredAmount = parseFloat(pool.contributionAmount) / 1e6;
  const hasEnoughBalance = balanceInUSDC >= requiredAmount;

  if (pool.status !== 'ACTIVE') {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 text-gray-600">
          <Clock size={24} />
          <div>
            <p className="font-semibold">Contributions Not Yet Active</p>
            <p className="text-sm">Pool must be ACTIVE before contributions can be made</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <DollarSign size={24} className="text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Cycle {pool.currentCycle + 1} Contributions</h3>
            <p className="text-sm text-gray-600">
              {contributions.length} of {pool.size} members contributed
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Your USDC Balance</span>
          <span className="text-lg font-bold text-gray-900">{balanceInUSDC.toFixed(2)} USDC</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Required Amount</span>
          <span className="text-lg font-bold text-teal-600">{requiredAmount.toFixed(2)} USDC</span>
        </div>
      </div>

      {!hasEnoughBalance && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Insufficient USDC Balance</p>
              <p>You need to add more USDC to your wallet before contributing.</p>
            </div>
          </div>
        </div>
      )}

      {hasContributed ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Contribution Complete</p>
              <p className="text-sm text-green-800">
                You have contributed {requiredAmount.toFixed(2)} USDC for this cycle
              </p>
            </div>
          </div>
        </div>
      ) : needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={!hasEnoughBalance || loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Approving...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Approve USDC
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleContribute}
          disabled={!hasEnoughBalance || loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Contributing...
            </>
          ) : (
            <>
              <DollarSign size={20} />
              Contribute {requiredAmount.toFixed(2)} USDC
            </>
          )}
        </button>
      )}

      {contributions.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Recent Contributions</h4>
          <div className="space-y-2">
            {contributions.map((contribution) => (
              <div
                key={contribution.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm text-gray-600">
                    {new Date(contribution.contributed_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatAmount(contribution.amount)} USDC
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
