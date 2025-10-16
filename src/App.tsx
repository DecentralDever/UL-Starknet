import { useEffect } from 'react';
import { AegisProvider, useAegis } from '@cavos/aegis';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PasswordPromptModal } from './components/PasswordPromptModal';
import { useWalletSession } from './hooks/useWalletSession';

const NETWORK = import.meta.env.VITE_STARKNET_NETWORK || 'sepolia';
const APP_ID = import.meta.env.VITE_CAVOS_APP_ID || '';

function AppContent() {
  const { user, loading } = useAuth();
  const { aegisAccount } = useAegis();
  const { showPasswordPrompt, handlePasswordSubmit, handlePasswordCancel } = useWalletSession();

  useEffect(() => {
    const initAegis = async () => {
      if (aegisAccount && user?.walletPublicKey) {
        try {
          console.log('🔄 Attempting to recover Aegis session...');
          const recovered = await aegisAccount.recoverSession();

          if (recovered && aegisAccount.address) {
            console.log('✅ Aegis session recovered successfully:', aegisAccount.address);
            console.log('✅ Wallet connected:', aegisAccount.isWalletConnected());
          } else {
            console.warn('⚠️ Session recovery returned but no address available');
            console.log('Current aegisAccount.address:', aegisAccount.address);
            console.log('Wallet connected status:', aegisAccount.isWalletConnected ? aegisAccount.isWalletConnected() : 'method not available');
          }
        } catch (error) {
          console.error('❌ Failed to recover Aegis session:', error);
          console.log('User will need to sign out and sign in again to restore wallet connection');
        }
      } else if (aegisAccount && !user?.walletPublicKey) {
        console.log('ℹ️ Aegis available but user has no wallet yet');
      }
    };
    initAegis();
  }, [aegisAccount, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? <HomePage /> : <LoginPage />}
      {user && (
        <PasswordPromptModal
          isOpen={showPasswordPrompt}
          onClose={handlePasswordCancel}
          onSubmit={handlePasswordSubmit}
          email={user.email}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AegisProvider
      config={{
        network: NETWORK === 'sepolia' ? 'SN_SEPOLIA' : 'SN_MAINNET',
        appName: 'UnityLedger',
        appId: APP_ID,
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AegisProvider>
  );
}

export default App;
