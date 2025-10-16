import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<User>;
  signOut: () => void;
  updateWallet: (publicKey: string, encrypted: string, userOverride?: User) => Promise<void>;
  getStoredPassword: () => string | null;
  setStoredPassword: (password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const externalUserId = localStorage.getItem('externalUserId');
    if (externalUserId) {
      loadUser(externalUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (externalUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('external_user_id', externalUserId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          externalUserId: data.external_user_id,
          email: data.email,
          walletPublicKey: data.wallet_public_key,
          walletEncrypted: data.wallet_encrypted,
          reputationScore: data.reputation_score,
          completedPools: data.completed_pools,
          lateCount: data.late_count,
          defaultCount: data.default_count,
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string): Promise<User> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      let userData = data;

      if (!userData) {
        const externalUserId = `user_${Date.now()}`;
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            external_user_id: externalUserId,
            email: email,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        userData = newUser;
      }

      if (!userData) {
        throw new Error('Failed to create or fetch user');
      }

      const userObj: User = {
        id: userData.id,
        externalUserId: userData.external_user_id,
        email: userData.email,
        walletPublicKey: userData.wallet_public_key,
        walletEncrypted: userData.wallet_encrypted,
        reputationScore: userData.reputation_score,
        completedPools: userData.completed_pools,
        lateCount: userData.late_count,
        defaultCount: userData.default_count,
      };

      setUser(userObj);
      localStorage.setItem('externalUserId', userData.external_user_id);

      return userObj;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('externalUserId');
    if (user?.email) {
      sessionStorage.removeItem(`wallet_pwd_${user.email}`);
    }
  };

  const getStoredPassword = (email?: string): string | null => {
    const userEmail = email || user?.email;
    if (!userEmail) return null;
    const stored = sessionStorage.getItem(`wallet_pwd_${userEmail}`);
    console.log(`🔍 Getting stored password for ${userEmail}:`, stored ? 'Found' : 'Not found');
    return stored;
  };

  const setStoredPassword = (password: string, email?: string) => {
    const userEmail = email || user?.email;
    if (!userEmail) {
      console.error('❌ Cannot store password: no email provided');
      return;
    }
    console.log(`💾 Storing password for ${userEmail}`);
    sessionStorage.setItem(`wallet_pwd_${userEmail}`, password);
  };

  const updateWallet = async (publicKey: string, encrypted: string, userOverride?: User) => {
    const targetUser = userOverride || user;

    if (!targetUser) {
      console.error('updateWallet: No user provided');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({
          wallet_public_key: publicKey,
          wallet_encrypted: encrypted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUser.id)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      setUser({
        ...targetUser,
        walletPublicKey: publicKey,
        walletEncrypted: encrypted,
      });
    } catch (error) {
      console.error('Error updating wallet:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateWallet, getStoredPassword, setStoredPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
