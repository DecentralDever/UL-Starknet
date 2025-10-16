import { Account, CallData, Contract, RpcProvider, cairo, uint256, ec, hash } from 'starknet';

const FACTORY_ADDRESS = import.meta.env.VITE_POOL_FACTORY_ADDRESS;
const RPC_URL = import.meta.env.VITE_STARKNET_RPC_URL;
const USDC_ADDRESS = import.meta.env.VITE_USDC_CONTRACT_ADDRESS;
const ARGENTX_ACCOUNT_CLASS_HASH = '0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f';

const provider = new RpcProvider({ nodeUrl: RPC_URL });

// @ts-expect-error - keeping for reference
const POOL_FACTORY_ABI = [
  {
    name: 'create_pool',
    type: 'function',
    inputs: [
      { name: 'token', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'size', type: 'core::integer::u32' },
      { name: 'contribution_amount', type: 'core::integer::u256' },
      { name: 'cadence_seconds', type: 'core::integer::u64' },
      { name: 'payout_mode', type: 'core::felt252' },
      { name: 'stake_enabled', type: 'core::bool' },
    ],
    outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
    state_mutability: 'external',
  },
  {
    name: 'get_pool',
    type: 'function',
    inputs: [{ name: 'pool_id', type: 'core::integer::u32' }],
    outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
    state_mutability: 'view',
  },
  {
    name: 'get_pool_count',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'core::integer::u32' }],
    state_mutability: 'view',
  },
];

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'core::starknet::contract_address::ContractAddress' }],
    outputs: [{ type: 'core::integer::u256' }],
    state_mutability: 'view',
  },
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'amount', type: 'core::integer::u256' },
    ],
    outputs: [{ type: 'core::bool' }],
    state_mutability: 'external',
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'spender', type: 'core::starknet::contract_address::ContractAddress' },
    ],
    outputs: [{ type: 'core::integer::u256' }],
    state_mutability: 'view',
  },
];

const POOL_ABI = [
  {
    name: 'join_pool',
    type: 'function',
    inputs: [],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'contribute',
    type: 'function',
    inputs: [{ name: 'cycle', type: 'core::integer::u32' }],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'trigger_payout',
    type: 'function',
    inputs: [],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'get_pool_info',
    type: 'function',
    inputs: [],
    outputs: [
      { type: 'core::integer::u32' },
      { type: 'core::integer::u256' },
      { type: 'core::integer::u64' },
      { type: 'core::integer::u32' },
      { type: 'core::felt252' },
    ],
    state_mutability: 'view',
  },
  {
    name: 'get_member',
    type: 'function',
    inputs: [{ name: 'position', type: 'core::integer::u32' }],
    outputs: [{ type: 'core::starknet::contract_address::ContractAddress' }],
    state_mutability: 'view',
  },
  {
    name: 'has_contributed',
    type: 'function',
    inputs: [
      { name: 'member', type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'cycle', type: 'core::integer::u32' },
    ],
    outputs: [{ type: 'core::bool' }],
    state_mutability: 'view',
  },
];

export interface CreatePoolOnChainParams {
  size: number;
  contributionAmount: string;
  cadenceSeconds: number;
  payoutMode: 'fixed' | 'random';
  stakeEnabled: boolean;
}

export async function createAccountFromKeys(
  privateKey: string,
  accountAddress: string
): Promise<Account> {
  return new Account(provider, accountAddress, privateKey);
}

export async function isAccountDeployed(address: string): Promise<boolean> {
  try {
    const code = await provider.getClassHashAt(address);
    return code !== '0x0';
  } catch (error) {
    return false;
  }
}

export async function deployAccount(
  privateKey: string
): Promise<{ accountAddress: string; txHash: string }> {
  const publicKey = ec.starkCurve.getStarkKey(privateKey);

  const constructorCalldata = CallData.compile({
    owner: publicKey,
    guardian: '0x0',
  });

  const accountAddress = hash.calculateContractAddressFromHash(
    publicKey,
    ARGENTX_ACCOUNT_CLASS_HASH,
    constructorCalldata,
    0
  );

  const account = new Account(provider, accountAddress, privateKey);

  const { transaction_hash } = await account.deployAccount({
    classHash: ARGENTX_ACCOUNT_CLASS_HASH,
    constructorCalldata,
    addressSalt: publicKey,
  });

  await provider.waitForTransaction(transaction_hash);

  return {
    accountAddress,
    txHash: transaction_hash,
  };
}

export async function decryptWalletPrivateKey(encryptedData: string, pin: string): Promise<string> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin.padEnd(32, '0')),
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    encrypted
  );

  return decoder.decode(decrypted);
}

export async function deployPool(
  account: Account,
  params: CreatePoolOnChainParams
): Promise<{ poolAddress: string; txHash: string }> {
  try {
    const payoutModeFelt = params.payoutMode === 'fixed' ? cairo.felt('0') : cairo.felt('1');
    const contributionU256 = uint256.bnToUint256(params.contributionAmount);

    const call = {
      contractAddress: FACTORY_ADDRESS,
      entrypoint: 'create_pool',
      calldata: CallData.compile({
        token: USDC_ADDRESS,
        size: params.size,
        contribution_amount: contributionU256,
        cadence_seconds: params.cadenceSeconds,
        payout_mode: payoutModeFelt,
        stake_enabled: params.stakeEnabled,
      }),
    };

    const { transaction_hash } = await account.execute(call);

    await provider.waitForTransaction(transaction_hash);

    return {
      poolAddress: '',
      txHash: transaction_hash,
    };
  } catch (error) {
    console.error('Error deploying pool:', error);
    throw error;
  }
}

export async function joinPoolOnChain(
  account: Account,
  poolAddress: string
): Promise<string> {
  try {
    const call = {
      contractAddress: poolAddress,
      entrypoint: 'join_pool',
      calldata: [],
    };

    const { transaction_hash } = await account.execute(call);

    await provider.waitForTransaction(transaction_hash);

    return transaction_hash;
  } catch (error) {
    console.error('Error joining pool:', error);
    throw error;
  }
}

export async function contributeToPool(
  account: Account,
  poolAddress: string,
  cycle: number
): Promise<string> {
  try {
    const call = {
      contractAddress: poolAddress,
      entrypoint: 'contribute',
      calldata: CallData.compile({ cycle }),
    };

    const { transaction_hash } = await account.execute(call);

    await provider.waitForTransaction(transaction_hash);

    return transaction_hash;
  } catch (error) {
    console.error('Error contributing to pool:', error);
    throw error;
  }
}

export async function triggerPayout(
  account: Account,
  poolAddress: string
): Promise<string> {
  try {
    const call = {
      contractAddress: poolAddress,
      entrypoint: 'trigger_payout',
      calldata: [],
    };

    const { transaction_hash } = await account.execute(call);

    await provider.waitForTransaction(transaction_hash);

    return transaction_hash;
  } catch (error) {
    console.error('Error triggering payout:', error);
    throw error;
  }
}

export async function getPoolInfo(poolAddress: string): Promise<{
  size: number;
  contributionAmount: string;
  cadenceSeconds: number;
  currentCycle: number;
  status: string;
}> {
  try {
    const pool = new Contract(POOL_ABI, poolAddress, provider);

    const result = await pool.get_pool_info();

    return {
      size: Number(result[0]),
      contributionAmount: uint256.uint256ToBN({ low: result[1].low, high: result[1].high }).toString(),
      cadenceSeconds: Number(result[2]),
      currentCycle: Number(result[3]),
      status: result[4].toString(),
    };
  } catch (error) {
    console.error('Error getting pool info:', error);
    throw error;
  }
}

export async function hasContributed(
  poolAddress: string,
  memberAddress: string,
  cycle: number
): Promise<boolean> {
  try {
    const pool = new Contract(POOL_ABI, poolAddress, provider);

    const result = await pool.has_contributed(memberAddress, cycle);

    return Boolean(result);
  } catch (error) {
    console.error('Error checking contribution:', error);
    throw error;
  }
}

export async function getUSDCBalance(address: string): Promise<string> {
  try {
    const usdc = new Contract(ERC20_ABI, USDC_ADDRESS, provider);
    const result = await usdc.balanceOf(address);
    return uint256.uint256ToBN({ low: result.low, high: result.high }).toString();
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return '0';
  }
}

export async function approveUSDC(
  account: Account,
  spender: string,
  amount: string
): Promise<string> {
  try {
    const amountU256 = uint256.bnToUint256(amount);

    const call = {
      contractAddress: USDC_ADDRESS,
      entrypoint: 'approve',
      calldata: CallData.compile({
        spender,
        amount: amountU256,
      }),
    };

    const { transaction_hash } = await account.execute(call);
    await provider.waitForTransaction(transaction_hash);

    return transaction_hash;
  } catch (error) {
    console.error('Error approving USDC:', error);
    throw error;
  }
}

export async function checkUSDCAllowance(
  ownerAddress: string,
  spenderAddress: string
): Promise<string> {
  try {
    const usdc = new Contract(ERC20_ABI, USDC_ADDRESS, provider);
    const result = await usdc.allowance(ownerAddress, spenderAddress);
    return uint256.uint256ToBN({ low: result.low, high: result.high }).toString();
  } catch (error) {
    console.error('Error checking USDC allowance:', error);
    return '0';
  }
}
