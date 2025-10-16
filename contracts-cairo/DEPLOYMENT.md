# UnityLedger Smart Contract Deployment Guide

## Prerequisites

1. **Scarb** (Cairo compiler) - Already installed ✅
2. **Starknet Wallet** with Sepolia testnet ETH
3. **Starknet CLI** or use Voyager/StarkScan for deployment

## Compiled Contracts

The contracts have been successfully compiled. The artifacts are in `/target/dev/`:

- `unityledger_Pool.contract_class.json` - Pool contract class
- `unityledger_PoolFactory.contract_class.json` - PoolFactory contract class
- `unityledger_Pool.compiled_contract_class.json` - Pool compiled contract
- `unityledger_PoolFactory.compiled_contract_class.json` - PoolFactory compiled contract

## Deployment Steps

### Option 1: Using Starknet Foundry (Recommended)

```bash
# Install Starknet Foundry
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh

# Declare the Pool contract (get class hash)
sncast declare \
  --contract-name Pool \
  --url https://starknet-sepolia.public.blastapi.io \
  --account 0x026d1ebc0cb44200165055ed223adbf491a980a55aa3a202e65fb01e1130b715

# Copy the class hash from output

# Deploy PoolFactory with Pool class hash
sncast deploy \
  --class-hash <pool_factory_class_hash> \
  --constructor-calldata <pool_class_hash> \
  --url https://starknet-sepolia.public.blastapi.io \
  --account <your_account>
```

### Option 2: Using Voyager (Manual Deployment)

1. **Declare Pool Contract**
   - Go to [Voyager Sepolia](https://sepolia.voyager.online/)
   - Navigate to "Declare Contract"
   - Upload `target/dev/unityledger_Pool.contract_class.json`
   - Submit transaction and wait for confirmation
   - Copy the resulting class hash

2. **Declare PoolFactory Contract**
   - Same process as above
   - Upload `target/dev/unityledger_PoolFactory.contract_class.json`
   - Copy the resulting class hash

3. **Deploy PoolFactory**
   - Go to "Deploy Contract"
   - Use PoolFactory class hash
   - Constructor calldata: `<pool_class_hash>`
   - Submit and wait for confirmation
   - Copy the deployed contract address

### Option 3: Using Starkli

```bash
# Install starkli
curl https://get.starkli.sh | sh
starkliup

# Set up your account
starkli signer keystore new ~/.starkli-wallets/keystore.json
starkli account fetch <account_address> --output ~/.starkli-wallets/account.json

# Declare Pool contract
starkli declare target/dev/unityledger_Pool.contract_class.json \
  --network sepolia \
  --account ~/.starkli-wallets/account.json \
  --keystore ~/.starkli-wallets/keystore.json

# Note the class hash

# Declare PoolFactory
starkli declare target/dev/unityledger_PoolFactory.contract_class.json \
  --network sepolia \
  --account ~/.starkli-wallets/account.json \
  --keystore ~/.starkli-wallets/keystore.json

# Deploy PoolFactory
starkli deploy <pool_factory_class_hash> <pool_class_hash> \
  --network sepolia \
  --account ~/.starkli-wallets/account.json \
  --keystore ~/.starkli-wallets/keystore.json
```

## Update Environment Variables

After deployment, update your `.env` file:

```env
VITE_POOL_FACTORY_ADDRESS=0x<deployed_factory_address>
VITE_POOL_CLASS_HASH=0x<pool_class_hash>
```

## Verify Deployment

### Check on Voyager
Visit: `https://sepolia.voyager.online/contract/<factory_address>`

### Test Contract Calls

```bash
# Get pool count (should be 0 initially)
starkli call <factory_address> get_pool_count --network sepolia

# Create a test pool from the frontend
# Then verify:
starkli call <factory_address> get_pool_count --network sepolia
# Should return 1
```

## Contract Interfaces

### PoolFactory

```cairo
fn create_pool(
    token: ContractAddress,              // USDC contract address
    size: u32,                           // Number of members (2-20)
    contribution_amount: u256,           // Amount in wei (USDC has 6 decimals)
    cadence_seconds: u64,                // Time between cycles
    payout_mode: felt252,                // 0 = fixed, 1 = random
    stake_enabled: bool                  // Enable yield staking
) -> ContractAddress                     // Returns new pool address
```

### Pool

```cairo
fn join_pool()                          // Join as a member
fn contribute(cycle: u32)                // Contribute for current cycle
fn trigger_payout()                     // Trigger payout when ready
fn get_pool_info() -> (u32, u256, u64, u32, felt252)  // Get pool data
```

## Gas Estimates (Sepolia)

- Declare Pool: ~0.001 ETH
- Declare PoolFactory: ~0.001 ETH
- Deploy PoolFactory: ~0.002 ETH
- Create Pool: ~0.003 ETH
- Join Pool: ~0.001 ETH
- Contribute: ~0.001 ETH

**Total for setup: ~0.004 ETH**

## Troubleshooting

### "Class already declared"
- This is fine! Use the existing class hash from the error message

### "Insufficient balance"
- Get Sepolia ETH from [Starknet Faucet](https://faucet.goerli.starknet.io/)

### "Invalid constructor calldata"
- Ensure you're passing the Pool class hash correctly
- Format: Single felt252 value (no array brackets)

## Security Notes

1. **Mainnet Deployment**: Require full audit before mainnet
2. **Access Control**: Current version has no admin keys (fully decentralized)
3. **Upgradeability**: Contracts are NOT upgradeable by design
4. **Testing**: Thoroughly test on Sepolia before considering mainnet

## Support

For deployment issues:
- Check [Starknet Docs](https://docs.starknet.io/)
- Visit [Starknet Discord](https://discord.gg/starknet)
- Review transaction on [Voyager](https://sepolia.voyager.online/)

---

**Status**: ✅ Contracts compiled and ready for deployment
**Network**: Starknet Sepolia Testnet
**Version**: v0.1.0
