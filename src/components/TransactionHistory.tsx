import { useState, useEffect } from 'react';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Transaction {
  id: string;
  type: 'contribution' | 'payout';
  pool_name: string;
  amount: string;
  cycle: number;
  tx_hash: string | null;
  timestamp: string;
}

export function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    }
  }, [user?.id]);

  const loadTransactions = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [contributionsResult, payoutsResult] = await Promise.all([
        supabase
          .from('contributions')
          .select(`
            id,
            amount,
            cycle,
            tx_hash,
            contributed_at,
            pools (name)
          `)
          .eq('user_id', user.id)
          .order('contributed_at', { ascending: false })
          .limit(20),
        supabase
          .from('payouts')
          .select(`
            id,
            total_amount,
            cycle,
            tx_hash,
            paid_at,
            pools (name)
          `)
          .eq('user_id', user.id)
          .order('paid_at', { ascending: false })
          .limit(20),
      ]);

      const contributions: Transaction[] =
        contributionsResult.data?.map((c: any) => ({
          id: c.id,
          type: 'contribution' as const,
          pool_name: c.pools?.name || 'Unknown Pool',
          amount: c.amount,
          cycle: c.cycle,
          tx_hash: c.tx_hash,
          timestamp: c.contributed_at,
        })) || [];

      const payouts: Transaction[] =
        payoutsResult.data?.map((p: any) => ({
          id: p.id,
          type: 'payout' as const,
          pool_name: p.pools?.name || 'Unknown Pool',
          amount: p.total_amount,
          cycle: p.cycle,
          tx_hash: p.tx_hash,
          timestamp: p.paid_at,
        })) || [];

      const allTransactions = [...contributions, ...payouts].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    return (parseFloat(amount) / 1e6).toFixed(2);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <History size={24} className="text-gray-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
          <p className="text-sm text-gray-600">{transactions.length} transactions</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <History size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Your contributions and payouts will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    tx.type === 'contribution'
                      ? 'bg-red-100'
                      : 'bg-green-100'
                  }`}
                >
                  {tx.type === 'contribution' ? (
                    <ArrowUpRight size={20} className="text-red-600" />
                  ) : (
                    <ArrowDownRight size={20} className="text-green-600" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {tx.type === 'contribution' ? 'Contribution' : 'Payout'}
                    </p>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      Cycle {tx.cycle + 1}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{tx.pool_name}</p>
                  <p className="text-xs text-gray-500">{formatDate(tx.timestamp)}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    tx.type === 'contribution' ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {tx.type === 'contribution' ? '-' : '+'}
                  {formatAmount(tx.amount)} USDC
                </p>
                {tx.tx_hash && (
                  <a
                    href={`https://sepolia.voyager.online/tx/${tx.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    View on Explorer
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
