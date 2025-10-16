import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface Transaction {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  description: string;
}

interface TransactionStatusProps {
  transactions: Transaction[];
  onClose: () => void;
}

export function TransactionStatus({ transactions, onClose }: TransactionStatusProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const allComplete = transactions.every(tx => tx.status !== 'pending');
    if (allComplete && transactions.length > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [transactions, onClose]);

  if (!visible || transactions.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
          <h3 className="text-white font-bold">Transaction Status</h3>
        </div>
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {tx.status === 'pending' && (
                <Loader2 className="text-blue-600 animate-spin flex-shrink-0" size={20} />
              )}
              {tx.status === 'success' && (
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              )}
              {tx.status === 'failed' && (
                <XCircle className="text-red-600 flex-shrink-0" size={20} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{tx.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500 truncate font-mono">{tx.hash.substring(0, 20)}...</p>
                  <a
                    href={`https://sepolia.starkscan.co/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function useTransactionTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (hash: string, description: string) => {
    setTransactions(prev => [...prev, { hash, status: 'pending', description }]);
  };

  const updateTransaction = (hash: string, status: 'success' | 'failed') => {
    setTransactions(prev =>
      prev.map(tx => (tx.hash === hash ? { ...tx, status } : tx))
    );
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    clearTransactions,
  };
}
