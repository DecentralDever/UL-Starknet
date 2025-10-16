import { Award, TrendingUp, TrendingDown } from 'lucide-react';
import { User } from '../types';

interface ReputationBadgeProps {
  user: User;
  size?: 'small' | 'large';
}

export function ReputationBadge({ user, size = 'small' }: ReputationBadgeProps) {
  const getReputationLevel = (score: number) => {
    if (score >= 800) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 600) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (score >= 400) return { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const reputation = getReputationLevel(user.reputationScore);

  if (size === 'small') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${reputation.bgColor}`}>
        <Award size={16} className={reputation.color} />
        <span className={`text-sm font-medium ${reputation.color}`}>
          {user.reputationScore}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${reputation.bgColor}`}>
          <Award size={32} className={reputation.color} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Reputation Score</h3>
          <p className="text-sm text-gray-600">{reputation.label} standing</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">{user.reputationScore}</span>
          <span className="text-gray-600 mb-1">/ 1000</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${reputation.color.replace('text-', 'bg-')}`}
            style={{ width: `${(user.reputationScore / 1000) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-600" />
            <span className="text-xs text-gray-600">Completed</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{user.completedPools}</div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-yellow-600" />
            <span className="text-xs text-gray-600">Late</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{user.lateCount}</div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-red-600" />
            <span className="text-xs text-gray-600">Defaults</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{user.defaultCount}</div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">How to improve your score</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
            Complete pools successfully (+50 points)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
            Contribute on time (+10 points per cycle)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            Avoid late payments (-20 points)
          </li>
        </ul>
      </div>
    </div>
  );
}
