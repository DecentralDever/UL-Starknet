import { ArrowLeft, Trophy, TrendingUp, Users, DollarSign, Award, Star, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePools } from '../hooks/usePools';
import { ReputationBadge } from '../components/ReputationBadge';

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { user } = useAuth();
  const { pools } = usePools();

  if (!user) return null;

  const activePools = pools.filter(p => p.status === 'ACTIVE').length;
  const completedPools = user.completedPools;
  const totalContributions = pools.reduce((acc, pool) => {
    return acc + parseFloat(pool.contributionAmount);
  }, 0) / 1e6;

  const badges = [
    {
      id: 'early-adopter',
      name: 'Early Adopter',
      description: 'One of the first users',
      icon: Star,
      color: 'from-yellow-500 to-amber-600',
      earned: true,
    },
    {
      id: 'reliable',
      name: 'Reliable Member',
      description: 'Never missed a contribution',
      icon: Award,
      color: 'from-blue-500 to-cyan-600',
      earned: user.lateCount === 0 && completedPools > 0,
    },
    {
      id: 'veteran',
      name: 'Circle Veteran',
      description: 'Completed 5+ circles',
      icon: Trophy,
      color: 'from-purple-500 to-pink-600',
      earned: completedPools >= 5,
    },
    {
      id: 'social',
      name: 'Social Butterfly',
      description: 'Active in 3+ circles',
      icon: Users,
      color: 'from-green-500 to-teal-600',
      earned: activePools >= 3,
    },
    {
      id: 'high-roller',
      name: 'High Roller',
      description: 'Total contributions over $1000',
      icon: DollarSign,
      color: 'from-orange-500 to-red-600',
      earned: totalContributions >= 1000,
    },
    {
      id: 'trusted',
      name: 'Trusted Circle Leader',
      description: 'Reputation score over 90',
      icon: TrendingUp,
      color: 'from-indigo-500 to-blue-600',
      earned: user.reputationScore >= 90,
    },
  ];

  const earnedBadges = badges.filter(b => b.earned);
  const unearnedBadges = badges.filter(b => !b.earned);

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
            <h1 className="text-lg sm:text-2xl font-black text-gray-900">Your Profile</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center text-white text-4xl font-black shadow-xl">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-gray-900 mb-2">{user.email}</h2>
                  <p className="text-gray-600 mb-4">Member since {new Date(user.reputationScore).toLocaleDateString()}</p>
                  <div className="flex gap-3">
                    <div className="px-4 py-2 bg-blue-50 rounded-xl">
                      <div className="text-sm text-blue-600 font-medium">Active Circles</div>
                      <div className="text-2xl font-black text-blue-700">{activePools}</div>
                    </div>
                    <div className="px-4 py-2 bg-green-50 rounded-xl">
                      <div className="text-sm text-green-600 font-medium">Completed</div>
                      <div className="text-2xl font-black text-green-700">{completedPools}</div>
                    </div>
                    <div className="px-4 py-2 bg-orange-50 rounded-xl">
                      <div className="text-sm text-orange-600 font-medium">Total Saved</div>
                      <div className="text-2xl font-black text-orange-700">${totalContributions.toFixed(0)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">On-Time Rate</div>
                    <div className="text-xl font-black text-gray-900">
                      {user.lateCount === 0 && completedPools === 0 ? 'N/A' :
                        `${Math.round((1 - user.lateCount / Math.max(completedPools * 5, 1)) * 100)}%`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Late Contributions</div>
                    <div className="text-xl font-black text-gray-900">{user.lateCount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Award className="text-red-600" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Defaults</div>
                    <div className="text-xl font-black text-gray-900">{user.defaultCount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Circles</div>
                    <div className="text-xl font-black text-gray-900">{activePools + completedPools}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <ReputationBadge user={user} size="large" />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-black text-gray-900 mb-6">Earned Badges</h3>
          {earnedBadges.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy size={40} className="text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No badges earned yet. Keep contributing to unlock achievements!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.id} className="glass-card rounded-2xl p-6 border-2 border-teal-200">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon size={32} className="text-white" />
                    </div>
                    <h4 className="font-black text-lg text-gray-900 mb-1">{badge.name}</h4>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {unearnedBadges.length > 0 && (
          <div>
            <h3 className="text-2xl font-black text-gray-900 mb-6">Locked Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unearnedBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.id} className="glass-card rounded-2xl p-6 opacity-50 grayscale">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${badge.color} flex items-center justify-center mb-4`}>
                      <Icon size={32} className="text-white" />
                    </div>
                    <h4 className="font-black text-lg text-gray-900 mb-1">{badge.name}</h4>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
