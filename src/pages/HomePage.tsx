import { useState, useEffect } from 'react';
import { Plus, LogOut, Link as LinkIcon, BarChart3, Wallet, User, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePools } from '../hooks/usePools';
import { useWallet } from '../hooks/useWallet';
import { WalletCard } from '../components/WalletCard';
import { PoolCard } from '../components/PoolCard';
import { ReputationBadge } from '../components/ReputationBadge';
import { CreatePoolModal } from '../components/CreatePoolModal';
import { PoolDetail } from '../components/PoolDetail';
import { TransactionHistory } from '../components/TransactionHistory';
import { NotificationBell } from '../components/NotificationBell';
import { ActivityFeed } from '../components/ActivityFeed';
import { AnalyticsPage } from './AnalyticsPage';
import { ProfilePage } from './ProfilePage';
import { LeaderboardPage } from './LeaderboardPage';
import { Pool } from '../types';

export function HomePage() {
  const { user, signOut } = useAuth();
  const { pools, availablePools, loading, joinPool, refreshPools } = usePools();
  const { hasWallet } = useWallet();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [walletReady, setWalletReady] = useState(false);

  useEffect(() => {
    if (user?.walletPublicKey) {
      loadBalance();
      checkWalletSession();
    }
  }, [user?.walletPublicKey]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinPoolId = params.get('join');
    if (joinPoolId && availablePools.length > 0) {
      const poolToJoin = availablePools.find(p => p.id === joinPoolId);
      if (poolToJoin) {
        setSelectedPool(poolToJoin);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [availablePools]);

  const checkWalletSession = async () => {
    const hasSession = localStorage.getItem(`aegis_session_${user?.email}`);
    if (!hasSession && user?.email) {
      console.warn('⚠️ No active wallet session detected. You may need to sign in again to perform transactions.');
    }
    setWalletReady(true);
  };

  const loadBalance = async () => {
    if (!user?.walletPublicKey) return;
    try {
      const { getUSDCBalance } = await import('../lib/starknet');
      const balance = await getUSDCBalance(user.walletPublicKey);
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  if (!user) return null;

  if (selectedPool) {
    return <PoolDetail pool={selectedPool} onBack={() => setSelectedPool(null)} />;
  }

  if (showAnalytics) {
    return <AnalyticsPage onBack={() => setShowAnalytics(false)} />;
  }

  if (showProfile) {
    return <ProfilePage onBack={() => setShowProfile(false)} />;
  }

  if (showLeaderboard) {
    return <LeaderboardPage onBack={() => setShowLeaderboard(false)} />;
  }


  return (
    <div className="page-container">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <img src="/UL copy.png" alt="UnityLedger" className="h-10 w-10 sm:h-12 sm:w-12 animate-float" />
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                  UnityLedger
                </h1>
                <p className="text-xs font-semibold gradient-text leading-none hidden sm:block">Secure Savings Circles</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {hasWallet && (
                <div className="hidden lg:flex items-center gap-3 px-5 py-3 glass-card rounded-xl mr-2 border-2 border-gray-200 hover:border-blue-300 transition-all">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <Wallet size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-0.5">Balance</div>
                    <div className="font-black text-gray-900 text-lg">${(parseFloat(usdcBalance) / 1e6).toFixed(2)} <span className="text-sm font-semibold text-gray-600">USDC</span></div>
                  </div>
                </div>
              )}
              <div className="hidden xl:flex items-center gap-2 px-4 py-2.5 glass-card rounded-xl mr-2">
                <div className="text-xs text-gray-600 font-medium">Signed in as</div>
                <div className="font-bold text-gray-900">{user.email}</div>
              </div>
              {hasWallet && (
                <>
                  <button
                    onClick={() => setShowAnalytics(true)}
                    className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 duration-300"
                    title="View Analytics"
                  >
                    <BarChart3 size={22} />
                  </button>
                  <button
                    onClick={() => setShowLeaderboard(true)}
                    className="p-3 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all hover:scale-110 duration-300"
                    title="View Leaderboard"
                  >
                    <Trophy size={22} />
                  </button>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="p-3 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all hover:scale-110 duration-300"
                    title="View Profile"
                  >
                    <User size={22} />
                  </button>
                  <NotificationBell />
                </>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 sm:px-5 py-2.5 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all rounded-xl font-semibold hover:scale-105 duration-300"
              >
                <LogOut size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-2 sm:mb-3 tracking-tight">Dashboard</h2>
              <p className="text-base sm:text-xl text-gray-600 font-medium">Manage your savings circles and track your progress</p>
            </div>
            {hasWallet && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              >
                <Plus size={20} className="sm:w-6 sm:h-6" />
                Create Circle
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <WalletCard />

            {!hasWallet && (
              <div className="mt-6 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <LinkIcon size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Wallet Not Found</h3>
                    <p className="text-white/90 mb-4 text-lg">
                      Your wallet wasn't created during signup. Please sign out and sign in again to create your wallet.
                    </p>
                    <button
                      onClick={signOut}
                      className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all font-bold hover:scale-105 duration-300"
                    >
                      Sign Out and Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <ReputationBadge user={user} size="large" />
          </div>
        </div>

        {hasWallet && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <TransactionHistory />
              </div>
              <div>
                <ActivityFeed limit={10} />
              </div>
            </div>

            <div>
              <div className="mb-10">
                <h3 className="text-3xl font-black text-gray-900 mb-2">Your Circles</h3>
                <p className="text-lg text-gray-600 font-medium">Manage your active savings circles</p>
              </div>

              {loading ? (
                <div className="text-center py-24">
                  <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-gray-600 font-semibold text-lg">Loading your circles...</p>
                </div>
              ) : pools.length === 0 ? (
                <div className="glass-card rounded-3xl p-16 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-float">
                    <Plus size={48} className="text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-4">Start Your First Circle</h3>
                  <p className="text-gray-600 mb-10 max-w-md mx-auto text-xl font-medium">
                    Create a savings circle or join an existing one below.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary inline-flex items-center gap-3 px-8 py-4 text-lg"
                  >
                    <Plus size={24} />
                    Create Your First Circle
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pools.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} onClick={() => setSelectedPool(pool)} />
                  ))}
                </div>
              )}
            </div>

            {availablePools.length > 0 && (
              <div className="mt-20">
                <div className="mb-10">
                  <h3 className="text-3xl font-black text-gray-900 mb-2">Available Circles to Join</h3>
                  <p className="text-lg text-gray-600 font-medium">Discover and join circles created by the community</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availablePools.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} onClick={() => setSelectedPool(pool)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <CreatePoolModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
