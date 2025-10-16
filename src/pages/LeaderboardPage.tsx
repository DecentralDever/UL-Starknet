import { ArrowLeft, Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { ReputationBadge } from '../components/ReputationBadge';

interface LeaderboardPageProps {
  onBack: () => void;
}

export function LeaderboardPage({ onBack }: LeaderboardPageProps) {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('reputation_score', { ascending: false })
        .limit(50);

      if (error) throw error;

      const users: User[] = (data || []).map(row => ({
        id: row.id,
        externalUserId: row.external_user_id,
        email: row.email,
        walletPublicKey: row.wallet_public_key,
        walletEncrypted: row.wallet_encrypted,
        reputationScore: row.reputation_score,
        completedPools: row.completed_pools,
        lateCount: row.late_count,
        defaultCount: row.default_count,
      }));

      setTopUsers(users);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="text-yellow-500" size={28} />;
    if (index === 1) return <Medal className="text-gray-400" size={28} />;
    if (index === 2) return <Medal className="text-amber-600" size={28} />;
    return null;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-500 to-amber-600';
    if (index === 1) return 'from-gray-400 to-gray-600';
    if (index === 2) return 'from-amber-600 to-orange-700';
    return 'from-blue-500 to-cyan-600';
  };

  return (
    <div className="page-container">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-semibold">Back to Dashboard</span>
            </button>
            <h1 className="text-lg sm:text-2xl font-black text-gray-900">Reputation Leaderboard</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-8">
          <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-1">Top Contributors</h2>
                <p className="text-gray-600 font-medium">See who's leading the way in our community</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-600 font-semibold text-lg">Loading leaderboard...</p>
          </div>
        ) : topUsers.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award size={40} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topUsers.map((user, index) => (
              <div
                key={user.id}
                className={`glass-card rounded-2xl p-6 transition-all hover:shadow-xl ${
                  index < 3 ? 'border-2 border-teal-200' : ''
                }`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getRankColor(index)} flex items-center justify-center text-white font-black text-2xl shadow-lg flex-shrink-0`}>
                    {getRankIcon(index) || `#${index + 1}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-gray-900 truncate">{user.email}</h3>
                      {index < 3 && (
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-bold">
                          TOP {index + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-blue-600" />
                        <span className="text-gray-600">
                          <span className="font-bold text-gray-900">{user.completedPools}</span> circles completed
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-green-600" />
                        <span className="text-gray-600">
                          <span className="font-bold text-gray-900">{user.lateCount}</span> late contributions
                        </span>
                      </div>
                      {user.defaultCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Medal size={16} className="text-red-600" />
                          <span className="text-gray-600">
                            <span className="font-bold text-gray-900">{user.defaultCount}</span> defaults
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <ReputationBadge user={user} size="small" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
