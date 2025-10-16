import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolId: string;
  poolName: string;
  members: Array<{ userId: string; name: string }>;
}

export function DisputeModal({ isOpen, onClose, poolId, poolName, members }: DisputeModalProps) {
  const { user } = useAuth();
  const [disputeType, setDisputeType] = useState<string>('LATE_PAYMENT');
  const [againstUser, setAgainstUser] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.from('disputes').insert({
        pool_id: poolId,
        raised_by: user.id,
        against: againstUser || null,
        type: disputeType,
        description,
        status: 'OPEN',
      });

      if (error) throw error;

      alert('Dispute submitted successfully. Our team will review it shortly.');
      onClose();
      setDescription('');
      setDisputeType('LATE_PAYMENT');
      setAgainstUser('');
    } catch (error: any) {
      console.error('Error submitting dispute:', error);
      alert('Failed to submit dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Report Dispute</h2>
              <p className="text-sm text-gray-600">{poolName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Disputes should only be raised for legitimate concerns.
              False or malicious disputes may affect your reputation.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dispute Type
            </label>
            <select
              value={disputeType}
              onChange={(e) => setDisputeType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
              required
            >
              <option value="LATE_PAYMENT">Late Payment</option>
              <option value="NON_PAYMENT">Non-Payment / Default</option>
              <option value="MISCONDUCT">Misconduct</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Against Member (Optional)
            </label>
            <select
              value={againstUser}
              onChange={(e) => setAgainstUser(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none"
            >
              <option value="">Select a member or leave blank</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 transition-all outline-none resize-none"
              rows={6}
              placeholder="Please provide detailed information about the issue..."
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Include dates, amounts, and any relevant details
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
