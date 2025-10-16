import { Wallet, Copy, CheckCircle, ExternalLink, CreditCard, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUSDCBalance } from '../lib/starknet';

export function WalletCard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState('0');

  useEffect(() => {
    if (user?.walletPublicKey) {
      loadUSDCBalance();
    }
  }, [user?.walletPublicKey]);

  const loadUSDCBalance = async () => {
    if (!user?.walletPublicKey) return;
    try {
      const balance = await getUSDCBalance(user.walletPublicKey);
      setUsdcBalance(balance);
    } catch (error) {
      console.error('Error loading USDC balance:', error);
    }
  };

  const handleCopy = () => {
    if (user?.walletPublicKey) {
      navigator.clipboard.writeText(user.walletPublicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleViewExplorer = () => {
    if (user?.walletPublicKey) {
      window.open(`https://sepolia.starkscan.co/contract/${user.walletPublicKey}`, '_blank');
    }
  };

  const formatCardNumber = (address: string) => {
    const first4 = address.substring(2, 6).toUpperCase();
    const second4 = address.substring(6, 10).toUpperCase();
    const third4 = address.substring(10, 14).toUpperCase();
    const last4 = address.substring(address.length - 4).toUpperCase();
    return `${first4} ${second4} ${third4} ${last4}`;
  };

  return (
    <div className="relative">
      {user?.walletPublicKey ? (
        <>
          <div className="relative w-full aspect-[1.586/1] max-w-full sm:max-w-[450px] group">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl sm:rounded-3xl shadow-2xl transform rotate-3 opacity-40 group-hover:rotate-6 transition-all duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl transform rotate-1.5 opacity-60 group-hover:rotate-3 transition-all duration-500"></div>

            <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-black rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] p-4 sm:p-6 md:p-8 h-full flex flex-col justify-between overflow-hidden border border-gray-800/50 group-hover:border-cyan-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5"></div>

              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/15 via-cyan-600/10 to-teal-600/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-cyan-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl"></div>

              <div className="absolute top-4 left-4 right-4 flex items-center justify-between opacity-30">
                <div className="flex gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-4">
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 border border-yellow-400/30 rounded-full mb-3 backdrop-blur-sm">
                      <Sparkles size={12} className="text-yellow-300" />
                      <span className="text-yellow-200 text-xs font-black tracking-wider uppercase">Elite</span>
                    </div>
                    <div className="text-gray-300 text-sm font-bold tracking-wide mb-1">UnityLedger</div>
                    <div className="text-white/60 text-xs font-medium tracking-wider">PREMIUM MEMBER</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src="/UL copy.png"
                      alt="UnityLedger"
                      className="h-16 w-16 drop-shadow-[0_0_20px_rgba(14,165,233,0.3)] group-hover:drop-shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all duration-500"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="relative h-12 w-16 bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-xl shadow-[0_4px_20px_rgba(251,191,36,0.4)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent"></div>
                    <div className="absolute top-2 left-2 w-4 h-4 border border-yellow-600/40 rounded-full"></div>
                    <div className="absolute bottom-2 right-2 text-[8px] font-bold text-yellow-900/40">EMV</div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-3">Card Number</div>
                  <div className="font-mono text-white text-2xl font-bold tracking-[0.3em] drop-shadow-lg">
                    {formatCardNumber(user.walletPublicKey)}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Available Balance</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-black text-4xl tracking-tight drop-shadow-lg">
                        ${(parseFloat(usdcBalance) / 1e6).toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-base font-bold tracking-wider">USDC</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">Valid Thru</div>
                    <div className="text-white font-mono text-xl font-black tracking-wider drop-shadow-lg">∞</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-blue-600/10 via-cyan-600/15 to-teal-600/10 backdrop-blur-md border-t border-white/5"></div>

              <div className="absolute bottom-4 right-8 z-20">
                <div className="text-white/80 font-black text-xs tracking-[0.15em]">STARKNET</div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2.5 px-5 py-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-600 hover:bg-blue-50 hover:shadow-lg hover:scale-105 transition-all font-bold text-gray-900 shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle size={20} className="text-green-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={20} />
                  <span>Copy Address</span>
                </>
              )}
            </button>
            <button
              onClick={handleViewExplorer}
              className="flex items-center justify-center gap-2.5 px-5 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white rounded-2xl hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 hover:shadow-xl hover:scale-105 transition-all font-bold shadow-lg"
            >
              <ExternalLink size={20} />
              <span>View Explorer</span>
            </button>
          </div>

          <div className="mt-5 p-5 bg-gradient-to-r from-gray-50 via-blue-50 to-cyan-50 border-2 border-gray-200 rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <CreditCard size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-600 font-bold mb-1.5 uppercase tracking-wider">Full Wallet Address</div>
                <div className="font-mono text-sm font-black text-gray-900 break-all leading-relaxed">{formatAddress(user.walletPublicKey)}</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 rounded-3xl p-16 text-center border-2 border-gray-200 shadow-lg">
          <div className="p-8 bg-gradient-to-br from-gray-200 to-blue-200 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center shadow-xl">
            <Wallet size={56} className="text-gray-700" />
          </div>
          <div className="font-black text-3xl mb-4 text-gray-900">No Wallet Yet</div>
          <div className="text-gray-600 font-semibold text-lg max-w-md mx-auto">
            Create your wallet during signup to join savings circles and unlock premium benefits
          </div>
        </div>
      )}
    </div>
  );
}
