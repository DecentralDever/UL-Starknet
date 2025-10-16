# UnityLedger - Community Savings Circles on Starknet

![UnityLedger](public/UL.png)

## Overview

UnityLedger is a decentralized ROSCA (Rotating Savings and Credit Association) platform built on Starknet. It enables communities to create transparent, trustless savings circles where members contribute regularly and receive payouts in turns, with optional yield generation on pooled funds.

## Features

- **Trustless Execution**: Smart contracts enforce contributions and payouts automatically
- **Community First**: Create private circles with trusted friends and family
- **Yield Generation**: Optional staking of pooled funds to earn passive income
- **Reputation System**: On-chain credit history for participants
- **Self-Custodial Wallets**: Secure, encrypted wallets with no seed phrases
- **Transparent**: All activities recorded on-chain with complete auditability

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Blockchain**: Starknet (Cairo smart contracts)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Wallet**: Starknet.js + encrypted key storage

## Smart Contracts

The platform uses two main Cairo contracts:

### Pool Contract
- Manages individual savings circles
- Enforces contribution schedules
- Handles payout distribution
- Tracks cycle progression

### PoolFactory Contract
- Deploys new pool instances
- Maintains registry of all pools
- Links users to their pools

Contract code is available in `/contracts` directory.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Starknet wallet (for testing)
- Sepolia testnet ETH (for gas)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Add your environment variables to .env
```

### Environment Variables

```env
# Supabase (Database)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Starknet
VITE_STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io
VITE_USDC_CONTRACT_ADDRESS=0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8
VITE_POOL_FACTORY_ADDRESS=your_deployed_factory_address
VITE_POOL_CLASS_HASH=your_pool_class_hash
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Setup

The project uses Supabase for off-chain data storage. The database schema includes:

- **users**: User profiles and wallet information
- **pools**: Pool configurations and state
- **pool_members**: Membership and participation tracking
- **contributions**: Individual contribution records
- **payouts**: Payout history
- **reputation_events**: Credit score tracking

Migrations are located in `/supabase/migrations` and are automatically applied.

## Smart Contract Deployment

### Compile Contracts

```bash
# Install Scarb (Cairo package manager)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# Compile contracts
cd contracts
scarb build
```

### Deploy to Sepolia Testnet

1. Deploy the Pool contract and note the class hash
2. Deploy PoolFactory with the Pool class hash
3. Update `VITE_POOL_FACTORY_ADDRESS` and `VITE_POOL_CLASS_HASH` in `.env`

## User Flow

### 1. Sign In
- Users sign in with email
- System creates or retrieves user profile
- Automatic wallet creation on first use

### 2. Create Wallet
- User sets a secure PIN
- Wallet keys are encrypted locally
- Public key stored in database

### 3. Create Circle
- Define circle parameters:
  - Name and size (2-20 members)
  - Contribution amount (USDC)
  - Payment frequency (weekly/monthly)
  - Payout order (fixed/random)
  - Optional yield staking
  - Optional default protection

### 4. Join Circle
- Members join using circle ID
- First contribution is locked
- Circle activates when full

### 5. Contribute
- Regular contributions per cycle
- On-chain enforcement
- Grace period for late payments

### 6. Receive Payout
- Automatic distribution when due
- Includes share of earned yield
- Recorded on-chain and off-chain

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Frontend (React)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Auth     │  │ Pools    │  │ Reputation   │ │
│  │ Context  │  │ UI       │  │ System       │ │
│  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────┬───────────────────────────────────┘
              │
              ├─────────────┬──────────────────────┐
              │             │                      │
    ┌─────────▼────┐ ┌─────▼──────┐      ┌───────▼─────┐
    │  Supabase    │ │  Starknet  │      │   Wallet    │
    │   (Data)     │ │ (Contracts)│      │  (Keys)     │
    └──────────────┘ └────────────┘      └─────────────┘
```

## Security Considerations

1. **Private Keys**: Encrypted with user PIN, never transmitted
2. **RLS Policies**: Database access controlled per user
3. **Smart Contracts**: Audited for reentrancy and overflow
4. **HTTPS Only**: All communications encrypted in transit
5. **Rate Limiting**: API endpoints protected against abuse

## Roadmap

### Phase 1 (Current)
- ✅ Core ROSCA functionality
- ✅ Basic reputation system
- ✅ Testnet deployment

### Phase 2 (Next)
- [ ] Starknet mainnet deployment
- [ ] Mobile app (React Native)
- [ ] Enhanced reputation gating
- [ ] Default insurance fund

### Phase 3 (Future)
- [ ] Multi-currency support
- [ ] Cross-border stablecoin routing
- [ ] DAO governance
- [ ] Lending/borrowing features

## Contributing

We welcome contributions! Please see our contributing guidelines.

## License

MIT License - see LICENSE file for details

## Support

- **Discord**: [discord.gg/unityledger](https://discord.com/invite/zext2bwkaE)
- **Twitter**: [@Unity_Ledger](https://x.com/Unity_Ledger)
- **Email**: unity.ledger1@gmail.com

## Acknowledgments

Built with:
- [Starknet](https://starknet.io) - Layer 2 scaling solution
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Lucide Icons](https://lucide.dev) - Beautiful icon library

---

**Note**: This is a testnet application. Do not use with real funds until mainnet deployment is complete and audited.
