export interface Wallet {
  publicKey: string;
  encryptedPrivateKey: string;
}

export interface User {
  id: string;
  externalUserId: string;
  email: string;
  walletPublicKey: string | null;
  walletEncrypted: string | null;
  reputationScore: number;
  completedPools: number;
  lateCount: number;
  defaultCount: number;
}

export interface Pool {
  id: string;
  creatorId: string;
  name: string;
  tokenAddress: string;
  contractAddress: string | null;
  size: number;
  contributionAmount: string;
  cadenceSeconds: number;
  payoutMode: 'fixed' | 'random';
  stakeEnabled: boolean;
  platformFeeBps: number;
  defaultFundEnabled: boolean;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  currentCycle: number;
  nextCycleTime: string | null;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PoolMember {
  id: string;
  poolId: string;
  userId: string;
  payoutPosition: number;
  hasReceivedPayout: boolean;
  reputationSnapshot: number;
  status: 'ACTIVE' | 'REPLACED' | 'DEFAULTED';
  joinedAt: string;
}

export interface Contribution {
  id: string;
  poolId: string;
  userId: string;
  cycle: number;
  amount: string;
  txHash: string | null;
  contributedAt: string;
  isLate: boolean;
}

export interface Payout {
  id: string;
  poolId: string;
  userId: string;
  cycle: number;
  baseAmount: string;
  yieldAmount: string;
  totalAmount: string;
  txHash: string | null;
  paidAt: string;
}

export interface ReputationEvent {
  id: string;
  userId: string;
  poolId: string | null;
  eventType: 'POOL_COMPLETED' | 'LATE_CONTRIBUTION' | 'DEFAULT' | 'MANUAL_ADJUSTMENT';
  scoreChange: number;
  notes: string | null;
  createdAt: string;
}

export interface CreatePoolParams {
  name: string;
  size: number;
  contributionAmount: string;
  cadenceSeconds: number;
  payoutMode: 'fixed' | 'random';
  startDate: string;
  stakeEnabled: boolean;
  defaultFundEnabled: boolean;
}
