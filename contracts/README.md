# UnityLedger Cairo Contracts

## Overview
These Cairo smart contracts implement the ROSCA (Rotating Savings and Credit Association) system for UnityLedger on Starknet.

## Contracts

### Pool.cairo
Individual pool contract that manages:
- Member registration
- Contribution tracking
- Payout enforcement
- Cycle progression
- Pool lifecycle (PENDING → ACTIVE → COMPLETED)

### PoolFactory.cairo
Factory contract for deploying new pools:
- Creates pool instances
- Tracks all pools
- Maps users to their pools

## Deployment Instructions

### Prerequisites
1. Install Scarb (Cairo package manager)
2. Install Starknet Foundry
3. Have a testnet wallet with ETH for gas

### Compile Contracts
```bash
scarb build
```

### Deploy to Starknet Testnet

1. First deploy the Pool contract and get its class hash
2. Deploy PoolFactory with the Pool class hash
3. Update the contract addresses in `.env`:
   - VITE_POOL_FACTORY_ADDRESS
   - VITE_POOL_CLASS_HASH

## Contract Addresses (Testnet)

Pool Class Hash: `[TO BE DEPLOYED]`
PoolFactory Address: `[TO BE DEPLOYED]`

## Usage

### Creating a Pool
Call `create_pool` on PoolFactory with:
- token: USDC contract address
- size: Number of members (2-20)
- contribution_amount: Amount in wei (6 decimals for USDC)
- cadence_seconds: Time between cycles
- payout_mode: 0 for fixed, 1 for random
- stake_enabled: true/false

### Joining a Pool
Call `join_pool` on the Pool contract

### Contributing
Call `contribute` on the Pool contract with the current cycle number

### Triggering Payout
Call `trigger_payout` when all members have contributed for the cycle

## Security Considerations

1. All state changes emit events for off-chain tracking
2. Contributions are tracked on-chain
3. Payouts require all members to contribute
4. Pool progression is automated and enforceable
5. No admin keys - fully decentralized after deployment
