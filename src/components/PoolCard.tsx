import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Pool } from '../types';

interface PoolCardProps {
  pool: Pool;
  onClick: () => void;
}

export function PoolCard({ pool, onClick }: PoolCardProps) {
  const contributionUSDC = (parseFloat(pool.contributionAmount) / 1e6).toFixed(2);
  const totalPool = (parseFloat(pool.contributionAmount) * pool.size / 1e6).toFixed(2);
  const cadenceText = pool.cadenceSeconds === 604800 ? 'Weekly' : 'Monthly';

  const statusColors = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
    ACTIVE: 'bg-green-100 text-green-800 border-green-300',
    COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
    PAUSED: 'bg-red-100 text-red-800 border-red-300',
  };

  return (
    <div
      onClick={onClick}
      className="glass-card p-6 group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 border-gray-200 hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-6 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors truncate">
            {pool.name}
          </h3>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border-2 ${statusColors[pool.status]} uppercase tracking-wide`}>
            {pool.status}
          </span>
        </div>
        {pool.stakeEnabled && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-2 rounded-xl text-sm font-bold border-2 border-green-200 flex-shrink-0 shadow-sm">
            <TrendingUp size={16} />
            <span className="hidden sm:inline">Earning</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
              <Users size={14} className="text-white" />
            </div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Members</div>
          </div>
          <div className="text-2xl font-black text-gray-900">{pool.size}</div>
        </div>

        <div className="glass-card p-4 border-2 border-cyan-100 hover:border-cyan-300 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg">
              <DollarSign size={14} className="text-white" />
            </div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Per Cycle</div>
          </div>
          <div className="text-2xl font-black text-gray-900">${contributionUSDC}</div>
        </div>

        <div className="glass-card p-4 border-2 border-teal-100 hover:border-teal-300 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
              <Calendar size={14} className="text-white" />
            </div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Frequency</div>
          </div>
          <div className="text-xl font-black text-gray-900">{cadenceText}</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-bold mb-1.5 opacity-90 uppercase tracking-wider">Total Value</div>
            <div className="text-3xl font-black">${totalPool}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold mb-1.5 opacity-90 uppercase tracking-wider">Progress</div>
            <div className="text-3xl font-black">{pool.currentCycle + 1}/{pool.size}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
