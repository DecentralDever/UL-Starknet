import { useState } from 'react';
import { useAegis } from '@cavos/aegis';
import { useAuth } from '../contexts/AuthContext';
import { Wallet } from '../types';
import { cavosService } from '../lib/cavos';

export function useWallet() {
  const { aegisAccount } = useAegis();
  const { user, updateWallet: updateWalletInAuth } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createWallet = async (email: string, password: string, userOverride?: any): Promise<Wallet | null> => {
    const currentUser = userOverride || user;

    if (!currentUser) {
      console.error('Cannot create wallet: user is null');
      return null;
    }

    if (!aegisAccount) {
      console.error('Aegis account not initialized');
      return null;
    }

    setIsCreating(true);
    try {
      const cavosWallet = await cavosService.createWalletWithAegis(aegisAccount, email, password);

      const encryptedToken = btoa(JSON.stringify({
        address: cavosWallet.address,
      }));

      await updateWalletInAuth(cavosWallet.address, encryptedToken, currentUser);

      return {
        publicKey: cavosWallet.address,
        encryptedPrivateKey: encryptedToken,
      };
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const signInWallet = async (email: string, password: string): Promise<Wallet | null> => {
    if (!user) return null;

    if (!aegisAccount) {
      console.error('Aegis account not initialized');
      return null;
    }

    setIsCreating(true);
    try {
      const cavosWallet = await cavosService.signInWithAegis(aegisAccount, email, password);

      return {
        publicKey: cavosWallet.address,
        encryptedPrivateKey: user.walletEncrypted || '',
      };
    } catch (error) {
      console.error('Error signing in wallet:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const getWallet = (): Wallet | null => {
    if (!user?.walletPublicKey || !user?.walletEncrypted) {
      return null;
    }

    return {
      publicKey: user.walletPublicKey,
      encryptedPrivateKey: user.walletEncrypted,
    };
  };

  const hasWallet = (): boolean => {
    return !!(user?.walletPublicKey && user?.walletEncrypted);
  };

  const getCavosTokens = (): { accessToken: string; refreshToken?: string } | null => {
    if (!user?.walletEncrypted) return null;

    try {
      const decoded = JSON.parse(atob(user.walletEncrypted));
      return decoded;
    } catch (error) {
      console.error('Failed to decode Cavos tokens:', error);
      return null;
    }
  };

  return {
    wallet: getWallet(),
    hasWallet: hasWallet(),
    createWallet,
    signInWallet,
    isCreating,
    getCavosTokens,
  };
}
