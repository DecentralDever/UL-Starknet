# Quick Deployment Guide with sncast

## Prerequisites

✅ Starknet Foundry installed
✅ Contracts compiled in `target/dev/`

## Setup Your Account

You need to create an account configuration for sncast. You have two options:

### Option 1: Using Account Address & Private Key (Recommended for Testing)

If you have an existing Starknet wallet (like ArgentX or Braavos), export your private key:

1. **Create account config file:**

```bash
mkdir -p ~/.starknet_accounts
```

2. **Create account JSON file** at `~/.starknet_accounts/sepolia_account.json`:

```json
{
  "version": 1,
  "variant": {
    "type": "open_zeppelin",
    "version": 1,
    "public_key": "0x<your_public_key>",
    "legacy": false
  },
  "deployment": {
    "status": "deployed",
    "class_hash": "0x<your_account_class_hash>",
    "address": "0x026d1ebc0cb44200165055ed223adbf491a980a55aa3a202e65fb01e1130b715"
  }
}
```

3. **Store your private key** in environment variable:

```bash
export STARKNET_ACCOUNT=sepolia_account
export STARKNET_PRIVATE_KEY=0x<your_private_key>
export STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
```

### Option 2: Create New Account with sncast

```bash
# Create a new account
sncast account create \
  --name sepolia_account \
  --url https://starknet-sepolia.public.blastapi.io

# This will output:
# - Account address
# - Private key (SAVE THIS SECURELY!)
# - Max fee for deployment

# Deploy the account (needs ETH for gas)
sncast account deploy \
  --name sepolia_account \
  --url https://starknet-sepolia.public.blastapi.io \
  --max-fee <max_fee_from_output>
```

## Deploy Contracts

Once your account is configured:

### Step 1: Declare Pool Contract

```bash
sncast declare \
  --contract-name Pool \
  --url https://starknet-sepolia.public.blastapi.io \
  --account sepolia_account
```

**Expected Output:**
```
class_hash: 0x1234...abcd
transaction_hash: 0x5678...efgh
```

**Save the Pool class hash!**

### Step 2: Declare PoolFactory Contract

```bash
sncast declare \
  --contract-name PoolFactory \
  --url https://starknet-sepolia.public.blastapi.io \
  --account sepolia_account
```

**Save the PoolFactory class hash!**

### Step 3: Deploy PoolFactory

```bash
sncast deploy \
  --class-hash <PoolFactory_class_hash_from_step2> \
  --constructor-calldata <Pool_class_hash_from_step1> \
  --url https://starknet-sepolia.public.blastapi.io \
  --account sepolia_account
```

**Expected Output:**
```
contract_address: 0xabcd...1234
transaction_hash: 0xefgh...5678
```

## Update Environment Variables

After successful deployment, update `.env`:

```env
VITE_POOL_FACTORY_ADDRESS=<contract_address_from_step3>
VITE_POOL_CLASS_HASH=<Pool_class_hash_from_step1>
```

## Verify Deployment

```bash
# Check pool count (should be 0)
sncast call \
  --contract-address <factory_address> \
  --function get_pool_count \
  --url https://starknet-sepolia.public.blastapi.io
```

## Alternative: Using Environment Variables

Create a `.env.sncast` file in project root:

```bash
STARKNET_ACCOUNT=sepolia_account
STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
```

Then you can run commands without the extra flags:

```bash
sncast declare --contract-name Pool
sncast declare --contract-name PoolFactory
sncast deploy --class-hash <factory_hash> --constructor-calldata <pool_hash>
```

## Troubleshooting

### "Account not found"
- Make sure account JSON exists in `~/.starknet_accounts/`
- Set `STARKNET_ACCOUNT` environment variable
- Or use `--account` flag

### "Insufficient balance"
- Get Sepolia ETH from [Starknet Faucet](https://faucet.goerli.starknet.io/)
- Or from [Starknet Discord](https://discord.gg/starknet)

### "Class already declared"
- The error message will include the existing class hash
- Use that hash for deployment (skip the declare step)

### "Invalid private key"
- Ensure private key is in hex format with `0x` prefix
- Private key should be 66 characters total (including 0x)

## Quick Commands Reference

```bash
# List accounts
sncast account list

# Check account balance
sncast account balance --account sepolia_account

# View transaction status
sncast tx-status --transaction-hash 0x...

# Call contract (read)
sncast call --contract-address 0x... --function function_name

# Invoke contract (write)
sncast invoke --contract-address 0x... --function function_name --calldata arg1 arg2
```

## Production Checklist

Before mainnet deployment:

- [ ] Full security audit completed
- [ ] Contracts tested extensively on testnet
- [ ] Gas optimization review
- [ ] Emergency pause mechanism (if needed)
- [ ] Documentation updated
- [ ] Frontend connected and tested
- [ ] User acceptance testing completed

---

**Need Help?**
- [Starknet Foundry Book](https://foundry-rs.github.io/starknet-foundry/)
- [Starknet Discord](https://discord.gg/starknet)
- [Starknet Documentation](https://docs.starknet.io/)
