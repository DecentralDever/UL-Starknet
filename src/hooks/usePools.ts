import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Pool, CreatePoolParams } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useAegis } from '@cavos/aegis';
import { CallData, cairo, uint256, RpcProvider } from 'starknet';
import { useToast } from '../contexts/ToastContext';
import { useWalletSession } from './useWalletSession';

const FACTORY_ADDRESS = import.meta.env.VITE_POOL_FACTORY_ADDRESS;
const USDC_ADDRESS = import.meta.env.VITE_USDC_CONTRACT_ADDRESS;
const RPC_URL = import.meta.env.VITE_STARKNET_RPC_URL;

const provider = new RpcProvider({ nodeUrl: RPC_URL });

export function usePools() {
  const { user } = useAuth();
  const { aegisAccount } = useAegis();
  const { showToast } = useToast();
  const { ensureSession } = useWalletSession();
  const [pools, setPools] = useState<Pool[]>([]);
  const [availablePools, setAvailablePools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPools();
      loadAvailablePools();
    }
  }, [user]);

  const loadPools = async () => {
    if (!user) return;

    try {
      const { data: myPools, error: poolsError } = await supabase
        .from('pools')
        .select('*')
        .eq('creator_id', user.id);

      if (poolsError) throw poolsError;

      const { data: memberPools, error: memberError } = await supabase
        .from('pool_members')
        .select('pool_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const memberPoolIds = memberPools?.map(m => m.pool_id) || [];

      if (memberPoolIds.length > 0) {
        const { data: joinedPools, error: joinedError } = await supabase
          .from('pools')
          .select('*')
          .in('id', memberPoolIds);

        if (joinedError) throw joinedError;

        const allPools = [...(myPools || []), ...(joinedPools || [])];
        const uniquePools = Array.from(
          new Map(allPools.map(pool => [pool.id, pool])).values()
        );

        setPools(uniquePools.map(mapPool));
      } else {
        setPools((myPools || []).map(mapPool));
      }
    } catch (error) {
      console.error('Error loading pools:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPool = async (params: CreatePoolParams): Promise<Pool | null> => {
    if (!user || !user.walletPublicKey || !user.walletEncrypted) {
      throw new Error('Wallet required to create pool');
    }

    if (!aegisAccount) {
      throw new Error('Wallet not initialized');
    }

    const sessionValid = await ensureSession();
    if (!sessionValid) {
      throw new Error('Unable to restore wallet session. Please refresh the page and try again.');
    }

    console.log('✅ Wallet session verified, proceeding with pool creation...');

    try {
      if (!USDC_ADDRESS) {
        throw new Error('USDC contract address not configured');
      }

      console.log('🔧 Pool creation params:', {
        token: USDC_ADDRESS,
        factory: FACTORY_ADDRESS,
        size: params.size,
        contributionAmount: params.contributionAmount,
        cadenceSeconds: params.cadenceSeconds,
        payoutMode: params.payoutMode,
        stakeEnabled: params.stakeEnabled,
      });

      const payoutModeFelt = params.payoutMode === 'fixed' ? cairo.felt('0') : cairo.felt('1');
      const contributionU256 = uint256.bnToUint256(params.contributionAmount);

      const calldata = [
        USDC_ADDRESS,
        params.size.toString(),
        contributionU256.low.toString(),
        contributionU256.high.toString(),
        params.cadenceSeconds.toString(),
        payoutModeFelt,
        params.stakeEnabled ? '1' : '0',
      ];

      console.log('📦 Compiled calldata:', calldata);

      const result = await aegisAccount.execute(
        FACTORY_ADDRESS,
        'create_pool',
        calldata
      );

      const txHash = result.transactionHash;
      console.log('📝 Transaction submitted:', txHash);

      console.log('⏳ Waiting for transaction to be accepted...');
      await provider.waitForTransaction(txHash);
      console.log('✅ Transaction accepted, fetching receipt...');

      const receipt = await provider.getTransactionReceipt(txHash);
      console.log('📦 Full receipt:', JSON.stringify(receipt, null, 2));

      // The create_pool function returns the pool address
      // We need to call the factory to get the latest pool address
      const poolCount = await provider.callContract({
        contractAddress: FACTORY_ADDRESS,
        entrypoint: 'get_pool_count',
        calldata: [],
      });

      const poolCountNum = parseInt(poolCount.result[0], 16);
      console.log('📊 Total pools:', poolCountNum);

      // Get the address of the most recently created pool
      const poolAddressResult = await provider.callContract({
        contractAddress: FACTORY_ADDRESS,
        entrypoint: 'get_pool',
        calldata: [(poolCountNum - 1).toString()],
      });

      const poolAddress = poolAddressResult.result[0];
      console.log('✅ Pool address from factory:', poolAddress);

      const { data, error } = await supabase
        .from('pools')
        .insert({
          creator_id: user.id,
          name: params.name,
          token_address: import.meta.env.VITE_USDC_CONTRACT_ADDRESS,
          contract_address: poolAddress,
          size: params.size,
          contribution_amount: params.contributionAmount,
          cadence_seconds: params.cadenceSeconds,
          payout_mode: params.payoutMode,
          start_date: params.startDate,
          stake_enabled: params.stakeEnabled,
          default_fund_enabled: params.defaultFundEnabled,
        })
        .select()
        .single();

      if (error) throw error;

      const newPool = mapPool(data);
      setPools([...pools, newPool]);

      await supabase.from('pool_members').insert({
        pool_id: data.id,
        user_id: user.id,
        payout_position: 0,
        reputation_snapshot: user.reputationScore,
      });

      console.log(`Pool deployed at ${poolAddress} with tx ${txHash}`);

      showToast(`Pool "${params.name}" created successfully!`, 'success');

      return newPool;
    } catch (error) {
      console.error('Error creating pool:', error);
      showToast('Failed to create pool. Please try again.', 'error');
      throw error;
    }
  };

  const loadAvailablePools = async () => {
    if (!user) return;

    try {
      const { data: allPendingPools, error } = await supabase
        .from('pools')
        .select('*')
        .eq('status', 'PENDING')
        .neq('creator_id', user.id);

      if (error) throw error;

      const { data: myMemberships, error: memberError } = await supabase
        .from('pool_members')
        .select('pool_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const myPoolIds = new Set(myMemberships?.map(m => m.pool_id) || []);

      const available = (allPendingPools || [])
        .filter(pool => !myPoolIds.has(pool.id))
        .map(mapPool);

      setAvailablePools(available);
    } catch (error) {
      console.error('Error loading available pools:', error);
    }
  };

  const joinPool = async (poolId: string): Promise<boolean> => {
    if (!user || !aegisAccount) {
      showToast('Wallet not initialized', 'error');
      return false;
    }

    console.log('🔍 Join Pool - Checking session before execute...');
    console.log('aegisAccount.address:', aegisAccount.address);
    console.log('user.email:', user.email);

    const sessionValid = await ensureSession();
    if (!sessionValid) {
      showToast('Unable to restore wallet session. Please refresh and try again.', 'error');
      return false;
    }

    console.log('✅ Session validated, address:', aegisAccount.address);

    try {
      const pool = pools.find(p => p.id === poolId) || availablePools.find(p => p.id === poolId);
      if (!pool) throw new Error('Pool not found');

      if (!pool.contractAddress) {
        throw new Error('Pool has no contract address');
      }

      const { data: memberCount } = await supabase
        .from('pool_members')
        .select('id', { count: 'exact', head: true })
        .eq('pool_id', poolId);

      const position = (memberCount?.length || 0);

      console.log('📞 Calling join_pool on contract:', pool.contractAddress);

      const result = await aegisAccount.execute(
        pool.contractAddress,
        'join_pool',
        []
      );

      const txHash = result.transactionHash;
      console.log('✅ Join pool tx submitted:', txHash);

      await provider.waitForTransaction(txHash);
      console.log('✅ Join pool tx confirmed');

      await supabase.from('pool_members').insert({
        pool_id: poolId,
        user_id: user.id,
        payout_position: position,
        reputation_snapshot: user.reputationScore,
      });

      await checkAndActivatePool(poolId);

      showToast('Successfully joined pool!', 'success');
      loadPools();
      loadAvailablePools();

      return true;
    } catch (error: any) {
      console.error('Error joining pool:', error);
      const errorMsg = error.message || 'Failed to join pool';
      showToast(errorMsg, 'error');
      return false;
    }
  };

  const checkAndActivatePool = async (poolId: string) => {
    try {
      const { data: pool } = await supabase
        .from('pools')
        .select('size, status')
        .eq('id', poolId)
        .single();

      if (!pool || pool.status !== 'PENDING') return;

      const { count } = await supabase
        .from('pool_members')
        .select('*', { count: 'exact', head: true })
        .eq('pool_id', poolId);

      if (count === pool.size) {
        const { error } = await supabase
          .from('pools')
          .update({
            status: 'ACTIVE',
            next_cycle_time: new Date(Date.now() + 604800000).toISOString(),
          })
          .eq('id', poolId);

        if (!error) {
          showToast('Pool activated! Contributions are now open.', 'success');
          loadPools();
        }
      }
    } catch (error) {
      console.error('Error checking pool activation:', error);
    }
  };

  const triggerPayout = async (poolId: string): Promise<boolean> => {
    if (!user || !aegisAccount) {
      showToast('Wallet not initialized', 'error');
      return false;
    }

    const sessionValid = await ensureSession();
    if (!sessionValid) {
      showToast('Unable to restore wallet session.', 'error');
      return false;
    }

    try {
      const pool = pools.find(p => p.id === poolId);
      if (!pool) throw new Error('Pool not found');

      const result = await aegisAccount.execute(
        pool.contractAddress!,
        'trigger_payout',
        []
      );

      const txHash = result.transactionHash;
      await provider.waitForTransaction(txHash);

      const { data: members } = await supabase
        .from('pool_members')
        .select('user_id')
        .eq('pool_id', poolId)
        .eq('payout_position', pool.currentCycle);

      if (members && members.length > 0) {
        const recipientId = members[0].user_id;

        await supabase.from('payouts').insert({
          pool_id: poolId,
          recipient_id: recipientId,
          cycle: pool.currentCycle,
          amount: (BigInt(pool.contributionAmount) * BigInt(pool.size)).toString(),
          tx_hash: txHash,
        });

        await supabase
          .from('pools')
          .update({
            current_cycle: pool.currentCycle + 1,
            next_cycle_time: new Date(Date.now() + pool.cadenceSeconds * 1000).toISOString(),
          })
          .eq('id', poolId);
      }

      showToast('Payout distributed successfully!', 'success');
      loadPools();

      return true;
    } catch (error: any) {
      console.error('Error triggering payout:', error);
      showToast(error.message || 'Failed to trigger payout', 'error');
      return false;
    }
  };

  return {
    pools,
    availablePools,
    loading,
    createPool,
    joinPool,
    triggerPayout,
    refreshPools: () => {
      loadPools();
      loadAvailablePools();
    },
  };
}

function mapPool(data: any): Pool {
  return {
    id: data.id,
    creatorId: data.creator_id,
    name: data.name,
    tokenAddress: data.token_address,
    contractAddress: data.contract_address,
    size: data.size,
    contributionAmount: data.contribution_amount,
    cadenceSeconds: data.cadence_seconds,
    payoutMode: data.payout_mode,
    stakeEnabled: data.stake_enabled,
    platformFeeBps: data.platform_fee_bps,
    defaultFundEnabled: data.default_fund_enabled,
    status: data.status,
    currentCycle: data.current_cycle,
    nextCycleTime: data.next_cycle_time,
    startDate: data.start_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}
