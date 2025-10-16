import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, TrendingUp, AlertCircle, AlertTriangle, Share2, Loader2 } from 'lucide-react';
import { Pool, PoolMember } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ContributionPanel } from './ContributionPanel';
import { PayoutPanel } from './PayoutPanel';
import { DisputeModal } from './DisputeModal';
import { InviteModal } from './InviteModal';
import { useToast } from '../contexts/ToastContext';
import { usePools } from '../hooks/usePools';

interface PoolDetailProps {
  pool: Pool;
  onBack: () => void;
}

export function PoolDetail({ pool, onBack }: PoolDetailProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { joinPool, triggerPayout, refreshPools } = usePools();
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [pool.id]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('pool_members')
        .select('*')
        .eq('pool_id', pool.id)
        .order('payout_position');

      if (error) throw error;

      const mappedMembers = (data || []).map((m: any) => ({
        id: m.id,
        poolId: m.pool_id,
        userId: m.user_id,
        payoutPosition: m.payout_position,
        hasReceivedPayout: m.has_received_payout,
        reputationSnapshot: m.reputation_snapshot,
        status: m.status,
        joinedAt: m.joined_at,
      }));

      setMembers(mappedMembers);
      setIsMember(mappedMembers.some(m => m.userId === user?.id));
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPool = async () => {
    if (!user || isMember || members.length >= pool.size) return;

    setJoining(true);
    const success = await joinPool(pool.id);
    if (success) {
      await loadMembers();
      refreshPools();
    }
    setJoining(false);
  };

  const handleTriggerPayout = async () => {
    setPayoutLoading(true);
    const success = await triggerPayout(pool.id);
    if (success) {
      await loadMembers();
      refreshPools();
    }
    setPayoutLoading(false);
  };

  const canTriggerPayout = () => {
    if (pool.status !== 'ACTIVE') return false;
    if (!pool.nextCycleTime) return false;
    return new Date(pool.nextCycleTime) <= new Date();
  };

  const contributionUSDC = (parseFloat(pool.contributionAmount) / 1e6).toFixed(2);
  const totalPool = (parseFloat(pool.contributionAmount) * pool.size / 1e6).toFixed(2);
  const cadenceText = pool.cadenceSeconds === 604800 ? 'Weekly' : 'Monthly';

  const nextCycleDate = pool.nextCycleTime
    ? new Date(pool.nextCycleTime).toLocaleDateString()
    : 'Not started';

  return (
    <div className="min-h-screen page-container">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-semibold hover:scale-105"
          >
            <ArrowLeft size={20} />
            <span>Back to Pools</span>
          </button>
          {isMember && (
            <button
              onClick={() => setShowDisputeModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all font-semibold hover:scale-105"
            >
              <AlertTriangle size={20} />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </button>
          )}
        </div>

        <div className="glass-card overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all mb-8">
          <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-black mb-4 tracking-tight">{pool.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl font-bold">
                  <Users size={20} />
                  {members.length}/{pool.size} Members
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl font-bold">
                  <Clock size={20} />
                  {cadenceText}
                </div>
                {pool.stakeEnabled && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl font-bold">
                    <TrendingUp size={20} />
                    Earning Yield
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6 border-2 border-blue-100 hover:border-blue-300 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <Users size={16} className="text-white" />
                  </div>
                  <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Contribution</div>
                </div>
                <div className="text-3xl font-black text-gray-900">${contributionUSDC}</div>
                <div className="text-sm text-gray-600 mt-1 font-semibold">USDC per cycle</div>
              </div>

              <div className="glass-card p-6 border-2 border-cyan-100 hover:border-cyan-300 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Total Pool</div>
                </div>
                <div className="text-3xl font-black text-gray-900">${totalPool}</div>
                <div className="text-sm text-gray-600 mt-1 font-semibold">USDC total value</div>
              </div>

              <div className="glass-card p-6 border-2 border-teal-100 hover:border-teal-300 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg">
                    <Clock size={16} className="text-white" />
                  </div>
                  <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Next Cycle</div>
                </div>
                <div className="text-2xl font-black text-gray-900">{nextCycleDate}</div>
                <div className="text-sm text-gray-600 mt-1 font-semibold">Cycle {pool.currentCycle + 1}</div>
              </div>
            </div>

            {pool.status === 'PENDING' && !isMember && members.length < pool.size && (
              <div className="mb-8">
                <button
                  onClick={handleJoinPool}
                  disabled={joining}
                  className="btn-primary w-full py-5 text-xl justify-center"
                >
                  {joining ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join This Pool'
                  )}
                </button>
              </div>
            )}

            {pool.status === 'PENDING' && pool.creatorId === user?.id && members.length < pool.size && (
              <div className="mb-8">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Share2 size={20} />
                  Invite Members ({members.length}/{pool.size} joined)
                </button>
              </div>
            )}

            {isMember && (
              <div className="space-y-6 mb-8">
                <ContributionPanel pool={pool} onContributionComplete={loadMembers} />

                {canTriggerPayout() && pool.creatorId === user?.id && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="text-amber-600" size={24} />
                      <div>
                        <h3 className="font-bold text-gray-900">Payout Ready</h3>
                        <p className="text-sm text-gray-600">
                          All contributions received. You can now distribute the payout.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleTriggerPayout}
                      disabled={payoutLoading}
                      className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl hover:from-amber-700 hover:to-yellow-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      {payoutLoading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Distributing...
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

                <PayoutPanel pool={pool} onPayoutComplete={loadMembers} />
              </div>
            )}

            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <Users size={24} className="text-white" />
                </div>
                Members & Payout Order
              </h2>

              {loading ? (
                <div className="text-center py-12 text-gray-600 font-medium">Loading members...</div>
              ) : members.length === 0 ? (
                <div className="text-center py-12 text-gray-600 font-medium">No members yet</div>
              ) : (
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      className="glass-card p-5 border-2 border-gray-200 hover:border-blue-300 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 text-lg">
                              {member.userId === user?.id ? 'You' : `Member ${member.userId.substring(0, 8)}`}
                            </div>
                            <div className="text-sm text-gray-600 font-semibold">
                              Position {member.payoutPosition + 1} • Rep: {member.reputationSnapshot}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.hasReceivedPayout && (
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-bold border-2 border-green-200">
                              Paid
                            </span>
                          )}
                          {member.status === 'DEFAULTED' && (
                            <span className="px-4 py-2 bg-red-100 text-red-800 rounded-xl text-sm font-bold border-2 border-red-200">
                              Defaulted
                            </span>
                          )}
                          {member.status === 'ACTIVE' && !member.hasReceivedPayout && (
                            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-bold border-2 border-blue-200">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pool.defaultFundEnabled && (
              <div className="mt-8 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-6 flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle size={24} className="text-yellow-600" />
                </div>
                <div>
                  <div className="font-black text-yellow-900 text-lg mb-1">Default Protection Enabled</div>
                  <div className="text-sm text-yellow-700 font-semibold">
                    This pool has insurance coverage for missed payments
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DisputeModal
          isOpen={showDisputeModal}
          onClose={() => setShowDisputeModal(false)}
          poolId={pool.id}
          poolName={pool.name}
          members={members.map(m => ({ userId: m.userId, name: `Member ${m.payoutPosition + 1}` }))}
        />

        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          poolId={pool.id}
          poolName={pool.name}
        />
      </div>
    </div>
  );
}
