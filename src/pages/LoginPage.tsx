import { useState } from 'react';
import { Mail, ArrowRight, Lock, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../hooks/useWallet';
import { LandingPage } from './LandingPage';
import { useToast } from '../contexts/ToastContext';

export function LoginPage() {
  const { signIn, setStoredPassword } = useAuth();
  const { createWallet, signInWallet, isCreating } = useWallet();
  const { showToast } = useToast();
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'signing_in' | 'creating_wallet' | 'success'>('idle');
  const [passwordError, setPasswordError] = useState<string>('');

  const validatePassword = (pwd: string): string => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number';
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      setPasswordError(validatePassword(newPassword));
    } else {
      setPasswordError('');
    }
  };

  const isFormValid = email && password && !passwordError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }

    setLoading(true);
    setStatus('signing_in');

    try {
      const userData = await signIn(email);

      if (userData.walletPublicKey && userData.walletEncrypted) {
        setStatus('creating_wallet');

        try {
          console.log('🔐 Signing in existing wallet...');
          const wallet = await signInWallet(email, password);
          console.log('✅ Wallet signed in successfully:', wallet?.publicKey);

          console.log('💾 Storing password directly for:', email);
          sessionStorage.setItem(`wallet_pwd_${email}`, password);
          setStoredPassword(password, email);

          const verify = sessionStorage.getItem(`wallet_pwd_${email}`);
          console.log('✅ Password storage verified:', !!verify);

          showToast('Welcome back!', 'success');

          setStatus('success');
          setLoading(false);
        } catch (signInError: any) {
          console.error('❌ Wallet sign in error:', signInError);
          showToast('Failed to sign in. Please check your password.', 'error');
          setStatus('idle');
        }
      } else {
        setStatus('creating_wallet');

        try {
          console.log('🆕 Creating new wallet...');
          const wallet = await createWallet(email, password, userData);

          if (!wallet) {
            throw new Error('Wallet creation failed');
          }

          console.log('✅ Wallet created successfully:', wallet.publicKey);

          console.log('💾 Storing password directly for:', email);
          sessionStorage.setItem(`wallet_pwd_${email}`, password);
          setStoredPassword(password, email);

          const verify = sessionStorage.getItem(`wallet_pwd_${email}`);
          console.log('✅ Password storage verified:', !!verify);

          showToast('Welcome to UnityLedger! Your account has been created.', 'success');

          setStatus('success');
          setLoading(false);
        } catch (walletError: any) {
          console.error('❌ Wallet creation error:', walletError);
          const errorMessage = walletError.message || 'Unknown error';
          showToast('Failed to create wallet: ' + errorMessage, 'error');
          setStatus('idle');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Failed to sign in. Please try again.', 'error');
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  if (!showAuth) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowAuth(false)}
            className="mb-6 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            ← Back to Home
          </button>

          <div className="glass-card rounded-3xl shadow-2xl p-10 border border-white/20">
            <div className="text-center mb-10">
              <img src="/UL copy.png" alt="UnityLedger" className="h-20 w-20 mx-auto mb-6 animate-float" />
              <h2 className="text-4xl font-black text-gray-900 mb-3">Welcome to UnityLedger</h2>
              <p className="text-gray-600 text-lg font-medium">Sign in or create your account to get started</p>
            </div>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600">Taking you to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-12"
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Password (for wallet)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className={`input-field pl-12 ${
                        passwordError
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                          : ''
                      }`}
                      placeholder="Your secure password"
                      required
                      minLength={8}
                      disabled={loading}
                    />
                  </div>
                  {passwordError ? (
                    <p className="text-xs text-red-600 mt-2 font-medium">
                      {passwordError}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      Must be at least 8 characters with uppercase, lowercase, and a number
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || isCreating || !isFormValid}
                  className="btn-primary w-full py-4 justify-center"
                >
                  {loading || isCreating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {status === 'signing_in' && 'Checking Account...'}
                      {status === 'creating_wallet' && 'Setting Up Wallet...'}
                      {status === 'idle' && 'Processing...'}
                    </>
                  ) : (
                    <>
                      Sign In / Sign Up
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                {status === 'creating_wallet' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800 text-center">
                      Setting up your wallet... This may take 30-60 seconds.
                    </p>
                  </div>
                )}
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 border-2 border-blue-200 rounded-xl p-5">
                <p className="text-center text-sm text-gray-900 font-bold mb-1">
                  ✨ Automatic Wallet Setup
                </p>
                <p className="text-center text-sm text-gray-700 font-medium">
                  Your gasless Starknet wallet is created automatically on first sign up!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
