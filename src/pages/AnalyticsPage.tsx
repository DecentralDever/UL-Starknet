import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Award, ArrowLeft, Target, Star, Activity, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Analytics {
  totalContributed: number;
  totalReceived: number;
  activePoolsCount: number;
  completedPoolsCount: number;
  reputationScore: number;
  onTimeRate: number;
  totalTransactions: number;
}

export function AnalyticsPage({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics>({
    totalContributed: 0,
    totalReceived: 0,
    activePoolsCount: 0,
    completedPoolsCount: 0,
    reputationScore: 0,
    onTimeRate: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user?.id]);

  const loadAnalytics = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [contributionsResult, payoutsResult, poolsResult, userData] = await Promise.all([
        supabase
          .from('contributions')
          .select('amount')
          .eq('user_id', user.id),
        supabase
          .from('payouts')
          .select('total_amount')
          .eq('user_id', user.id),
        supabase
          .from('pool_members')
          .select('pool_id, pools(status)')
          .eq('user_id', user.id),
        supabase
          .from('users')
          .select('reputation_score, completed_pools, late_count, default_count')
          .eq('id', user.id)
          .single(),
      ]);

      const totalContributed = contributionsResult.data?.reduce(
        (sum, c) => sum + parseFloat(c.amount),
        0
      ) || 0;

      const totalReceived = payoutsResult.data?.reduce(
        (sum, p) => sum + parseFloat(p.total_amount),
        0
      ) || 0;

      const pools = poolsResult.data || [];
      const activePoolsCount = pools.filter((p: any) => p.pools?.status === 'ACTIVE').length;
      const completedPoolsCount = pools.filter((p: any) => p.pools?.status === 'COMPLETED').length;

      const totalContributions = contributionsResult.data?.length || 0;
      const lateCount = userData.data?.late_count || 0;
      const onTimeRate = totalContributions > 0
        ? ((totalContributions - lateCount) / totalContributions) * 100
        : 100;

      setAnalytics({
        totalContributed: totalContributed / 1e6,
        totalReceived: totalReceived / 1e6,
        activePoolsCount,
        completedPoolsCount,
        reputationScore: userData.data?.reputation_score || 500,
        onTimeRate,
        totalTransactions: totalContributions + (payoutsResult.data?.length || 0),
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: DollarSign,
      label: 'Total Contributed',
      value: `$${analytics.totalContributed.toFixed(2)}`,
      gradient: 'from-red-500 to-pink-500',
      iconBg: 'from-red-100 to-pink-100',
      iconColor: 'text-red-600',
    },
    {
      icon: TrendingUp,
      label: 'Total Received',
      value: `$${analytics.totalReceived.toFixed(2)}`,
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'from-green-100 to-emerald-100',
      iconColor: 'text-green-600',
    },
    {
      icon: Users,
      label: 'Active Circles',
      value: analytics.activePoolsCount.toString(),
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'from-blue-100 to-cyan-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Award,
      label: 'Completed Circles',
      value: analytics.completedPoolsCount.toString(),
      gradient: 'from-purple-500 to-indigo-500',
      iconBg: 'from-purple-100 to-indigo-100',
      iconColor: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-all font-semibold hover:gap-3 hover:scale-105"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="mb-10">
          <h1 className="text-5xl font-black text-gray-900 mb-3">Your Analytics</h1>
          <p className="text-xl text-gray-600 font-medium">Track your savings performance and build your reputation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="card-interactive p-8 group">
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg`}>
                <stat.icon size={28} className={stat.iconColor} />
              </div>
              <div className="text-sm text-gray-600 font-semibold mb-2 uppercase tracking-wider">{stat.label}</div>
              <div className="text-4xl font-black gradient-text">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 card p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900">Reputation Score</h2>
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                <Star size={28} className="text-blue-600 fill-blue-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex items-center justify-center">
                <div className="relative w-52 h-52">
                  <svg className="transform -rotate-90 w-52 h-52">
                    <circle
                      cx="104"
                      cy="104"
                      r="94"
                      stroke="#E5E7EB"
                      strokeWidth="16"
                      fill="transparent"
                    />
                    <circle
                      cx="104"
                      cy="104"
                      r="94"
                      stroke="url(#gradient)"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${(analytics.reputationScore / 1000) * 590} 590`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#14B8A6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl font-black gradient-text mb-2">{analytics.reputationScore}</div>
                      <div className="text-lg text-gray-600 font-semibold">/ 1000</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                        <Target size={20} className="text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700 font-bold">Rating</span>
                    </div>
                    <span className="font-black text-gray-900 text-lg">
                      {analytics.reputationScore >= 800
                        ? 'Excellent'
                        : analytics.reputationScore >= 600
                        ? 'Good'
                        : analytics.reputationScore >= 400
                        ? 'Fair'
                        : 'Needs Improvement'}
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-100 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-lg">
                        <Zap size={20} className="text-teal-600" />
                      </div>
                      <span className="text-sm text-gray-700 font-bold">On-Time Rate</span>
                    </div>
                    <span className="font-black text-gray-900 text-lg">{analytics.onTimeRate.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-100 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                        <Activity size={20} className="text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-700 font-bold">Total Transactions</span>
                    </div>
                    <span className="font-black text-gray-900 text-lg">{analytics.totalTransactions}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900">Net Flow</h2>
              <div className={`p-3 rounded-xl ${
                analytics.totalReceived - analytics.totalContributed >= 0
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                  : 'bg-gradient-to-br from-red-100 to-pink-100'
              }`}>
                <TrendingUp size={28} className={
                  analytics.totalReceived - analytics.totalContributed >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                } />
              </div>
            </div>

            <div className="mb-8">
              <div className={`text-6xl font-black mb-3 ${
                analytics.totalReceived - analytics.totalContributed >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                ${Math.abs(analytics.totalReceived - analytics.totalContributed).toFixed(2)}
              </div>
              <div className="text-gray-600 font-semibold text-lg">
                {analytics.totalReceived >= analytics.totalContributed ? 'Ahead' : 'Behind'} on returns
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl">
                <div className="text-xs text-gray-600 font-semibold mb-1 uppercase tracking-wider">Average Contribution</div>
                <div className="text-2xl font-black text-gray-900">
                  ${analytics.totalTransactions > 0
                    ? (analytics.totalContributed / analytics.totalTransactions).toFixed(2)
                    : '0.00'}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-teal-50 border border-gray-200 rounded-xl">
                <div className="text-xs text-gray-600 font-semibold mb-1 uppercase tracking-wider">Circles Joined</div>
                <div className="text-2xl font-black text-gray-900">
                  {analytics.activePoolsCount + analytics.completedPoolsCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative p-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 rounded-full mb-6 border border-white/30 backdrop-blur-sm">
                <Star size={18} className="text-white fill-white" />
                <span className="text-white font-bold text-sm">Keep Building Excellence</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-5">Maintain Your Track Record</h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed font-medium">
                Stay on top by contributing on time and completing all your circles.
                High reputation unlocks better rates, exclusive circles, and premium benefits.
              </p>
              <div className="grid grid-cols-2 gap-5">
                <div className="glass-card p-6 border-2 border-white/30 rounded-2xl">
                  <div className="text-5xl font-black text-white mb-2">{analytics.completedPoolsCount}</div>
                  <div className="text-white/90 font-semibold">Circles Completed</div>
                </div>
                <div className="glass-card p-6 border-2 border-white/30 rounded-2xl">
                  <div className="text-5xl font-black text-white mb-2">{analytics.onTimeRate.toFixed(0)}%</div>
                  <div className="text-white/90 font-semibold">On-Time Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
