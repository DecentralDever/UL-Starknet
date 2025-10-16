import { useState, useCallback } from 'react';
import { useAegis } from '@cavos/aegis';
import { useAuth } from '../contexts/AuthContext';
import { cavosService } from '../lib/cavos';
import { useToast } from '../contexts/ToastContext';

export function useWalletSession() {
  const { aegisAccount } = useAegis();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isRestoring, setIsRestoring] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordPromptResolver, setPasswordPromptResolver] = useState<((password: string | null) => void) | null>(null);

  const restoreSession = useCallback(async (): Promise<boolean> => {
    if (!aegisAccount) {
      console.error('❌ Aegis account not initialized');
      return false;
    }

    if (!user?.walletPublicKey || !user?.email) {
      console.error('❌ No wallet found for user:', { hasPublicKey: !!user?.walletPublicKey, hasEmail: !!user?.email });
      return false;
    }

    setIsRestoring(true);
    try {
      console.log('🔄 Attempting to restore wallet session for:', user.email);
      console.log('📊 Current aegisAccount state:', { hasAddress: !!aegisAccount.address, address: aegisAccount.address });

      if (aegisAccount.address) {
        console.log('✅ Session already active:', aegisAccount.address);
        return true;
      }

      console.log('🔄 Step 1: Trying Aegis recoverSession()...');
      try {
        await aegisAccount.recoverSession();

        if (aegisAccount.address) {
          console.log('✅ Session recovered successfully via recoverSession()');
          return true;
        }
        console.log('⚠️ recoverSession() completed but no address');
      } catch (recoverError: any) {
        console.log('⚠️ Session recovery failed:', recoverError?.message || recoverError);
        console.log('🔄 Step 2: Attempting re-authentication with stored credentials...');
      }

      let storedPassword = sessionStorage.getItem(`wallet_pwd_${user.email}`);
      console.log('🔍 Stored password check:', { hasPassword: !!storedPassword, email: user.email });

      if (!storedPassword) {
        console.error('❌ No stored password found for:', user.email);
        console.log('💡 Available sessionStorage keys:', Object.keys(sessionStorage));
        console.log('🔔 Prompting user for password...');

        const promptedPassword = await new Promise<string | null>((resolve) => {
          setPasswordPromptResolver(() => resolve);
          setShowPasswordPrompt(true);
        });

        setShowPasswordPrompt(false);
        setPasswordPromptResolver(null);

        if (!promptedPassword) {
          console.error('❌ User cancelled password prompt');
          return false;
        }

        storedPassword = promptedPassword;
        sessionStorage.setItem(`wallet_pwd_${user.email}`, storedPassword);
        console.log('✅ Password received and stored from prompt');
      }

      console.log('🔐 Re-authenticating with password...');
      try {
        const result = await cavosService.signInWithAegis(aegisAccount, user.email, storedPassword);
        console.log('🔓 Sign in result:', result);

        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('🔍 Checking aegisAccount state after sign in:');
        console.log('  - address:', aegisAccount.address);
        console.log('  - isWalletConnected:', aegisAccount.isWalletConnected?.());

        if (aegisAccount.address) {
          console.log('✅ Session restored via re-authentication:', aegisAccount.address);
          return true;
        } else {
          console.error('❌ Re-authentication completed but no address set');
          console.error('Full aegisAccount:', Object.keys(aegisAccount));
        }
      } catch (signInError: any) {
        console.error('❌ Re-authentication failed:', signInError?.message || signInError);
        console.error('Full error:', signInError);
      }

      console.error('❌ All session restoration attempts failed');
      return false;
    } catch (error: any) {
      console.error('❌ Error during session restoration:', error?.message || error);
      return false;
    } finally {
      setIsRestoring(false);
    }
  }, [aegisAccount, user]);

  const ensureSession = useCallback(async (): Promise<boolean> => {
    if (!aegisAccount || !user?.walletPublicKey) {
      console.error('❌ ensureSession: Missing requirements', { hasAccount: !!aegisAccount, hasWallet: !!user?.walletPublicKey });
      return false;
    }

    if (aegisAccount.address) {
      console.log('✅ ensureSession: Session already valid');
      return true;
    }

    console.log('⚠️ ensureSession: No active address, attempting restoration...');
    const restored = await restoreSession();

    if (!restored) {
      console.error('❌ ensureSession: Session restoration failed');
      showToast('Session expired. Please sign out and sign in again.', 'error');
    } else {
      console.log('✅ ensureSession: Session restored successfully');
    }

    return restored;
  }, [aegisAccount, user, restoreSession, showToast]);

  const withSessionRetry = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    try {
      return await operation();
    } catch (error: any) {
      const errorMessage = error?.message || String(error);

      if (errorMessage.includes('session') || errorMessage.includes('expired') || !aegisAccount?.address) {
        console.log('🔄 Session issue detected, attempting restoration...');

        const restored = await restoreSession();

        if (restored) {
          console.log('✅ Session restored, retrying operation...');
          return await operation();
        }

        throw new Error('Session expired. Please refresh the page and sign in again.');
      }

      throw error;
    }
  }, [aegisAccount, restoreSession]);

  const handlePasswordSubmit = useCallback((password: string) => {
    if (passwordPromptResolver) {
      passwordPromptResolver(password);
    }
  }, [passwordPromptResolver]);

  const handlePasswordCancel = useCallback(() => {
    if (passwordPromptResolver) {
      passwordPromptResolver(null);
    }
  }, [passwordPromptResolver]);

  return {
    restoreSession,
    ensureSession,
    withSessionRetry,
    isRestoring,
    showPasswordPrompt,
    handlePasswordSubmit,
    handlePasswordCancel,
  };
}
