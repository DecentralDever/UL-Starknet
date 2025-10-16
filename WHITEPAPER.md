# UnityLedger: Decentralized Rotating Savings and Credit Associations on Starknet

**Version 1.0**
**October 2025**

---

## Abstract

UnityLedger is a decentralized platform that brings Rotating Savings and Credit Associations (ROSCAs) onto the blockchain, leveraging Starknet's Layer 2 infrastructure to provide transparent, trustless, and accessible community savings circles. By combining smart contract automation with gasless wallet technology, UnityLedger eliminates the need for central authorities while maintaining the social and financial benefits of traditional ROSCAs.

---

## 1. Introduction

### 1.1 Background

Rotating Savings and Credit Associations (ROSCAs) have served communities worldwide for centuries as informal financial institutions. Known by various names—tontines in West Africa, tandas in Latin America, hui in Asia—these systems enable groups to pool resources and provide members with lump-sum payouts on a rotating basis.

Despite their effectiveness, traditional ROSCAs face several challenges:
- **Trust Dependencies**: Reliance on coordinators who may mismanage funds
- **Lack of Transparency**: Limited visibility into fund movements
- **Geographic Constraints**: Difficulty organizing across distances
- **Manual Administration**: Time-consuming coordination and tracking
- **Dispute Resolution**: No standardized mechanisms for handling conflicts

### 1.2 Vision

UnityLedger reimagines ROSCAs for the digital age by encoding trust into smart contracts, ensuring that all participants operate under transparent, immutable rules. Our platform enables anyone, anywhere, to participate in community savings circles with mathematical certainty of fair execution.

---

## 2. System Architecture

### 2.1 Technology Stack

**Blockchain Layer**
- Starknet Sepolia Testnet for low-cost, high-speed transactions
- Cairo smart contracts for pool logic and fund management
- USDC stablecoin for contributions and payouts

**Application Layer**
- React-based web application with TypeScript
- Supabase for off-chain data persistence and user management
- Cavos Aegis SDK for gasless, self-custodial wallets

**Smart Contract Architecture**
- `PoolFactory`: Deploys and manages pool instances
- `Pool`: Handles individual ROSCA lifecycle including contributions, payouts, and cycle progression

### 2.2 Core Components

#### 2.2.1 Wallet Infrastructure

UnityLedger uses Cavos Aegis to provide users with self-custodial wallets that require no seed phrases or private key management. Upon registration, each user receives:
- A unique Starknet wallet address
- Encrypted credential storage
- Gasless transaction capabilities through meta-transactions

This approach dramatically reduces the technical barrier to blockchain participation.

#### 2.2.2 Pool Factory

The PoolFactory contract serves as the deployment mechanism for new ROSCA pools. It:
- Deploys isolated pool instances with custom parameters
- Maintains a registry of all active pools
- Enforces standardized pool interfaces
- Emits events for off-chain indexing

#### 2.2.3 Pool Contract

Each ROSCA operates as an independent Pool contract with the following characteristics:

**State Variables**
- Pool creator and parameters (size, contribution amount, frequency)
- Member registry with join timestamps
- Contribution tracking per member per cycle
- Payout history and current cycle information
- Pool status (pending, active, completed)

**Core Functions**
- `join()`: Allows new members to join pending pools
- `contribute()`: Records member contributions for current cycle
- `requestPayout()`: Enables eligible members to request their turn
- `distributePayout()`: Transfers pooled funds to designated recipient
- `progressCycle()`: Advances pool to next rotation cycle

**Access Control**
- Only members can contribute
- Only unpaid members can request payouts
- Payout distribution follows fair rotation order
- Emergency pause mechanisms for dispute resolution

---

## 3. Protocol Mechanics

### 3.1 Pool Creation

Any user can create a ROSCA pool by specifying:
- **Pool Size**: Number of participants (2-50 members)
- **Contribution Amount**: Fixed USDC amount per member per cycle
- **Frequency**: Time between cycles (weekly, bi-weekly, monthly)
- **Pool Name**: Descriptive identifier

The creator becomes the first member, and the pool enters a "pending" state awaiting additional participants.

### 3.2 Member Onboarding

Users join pools through:
1. Invitation links shared by existing members
2. Email-based invitations with automatic notifications
3. Direct pool discovery through the platform

New members must:
- Have sufficient USDC balance for first contribution
- Approve the pool contract to spend USDC on their behalf
- Confirm participation commitment

Once the pool reaches full capacity, it automatically activates.

### 3.3 Contribution Cycle

Each cycle operates on a fixed timeline:

1. **Contribution Phase**: Members contribute their share
   - Smart contract verifies and records each contribution
   - Partial contributions are not accepted
   - Late contributions may trigger penalties or disputes

2. **Payout Phase**: Eligible member receives pooled funds
   - System randomly or sequentially selects unpaid member
   - Payout equals (pool_size × contribution_amount) minus any fees
   - Transaction recorded on-chain and in database

3. **Cycle Progression**: Pool advances to next rotation
   - Previous recipient marked as paid
   - New cycle begins with fresh contribution requirements
   - Process repeats until all members receive payouts

### 3.4 Payout Distribution

UnityLedger supports multiple payout ordering mechanisms:

**Sequential Order**: Members receive payouts based on join order
**Random Selection**: Fair randomness determines next recipient
**Auction System**: Members bid for earlier payout positions
**Need-Based Priority**: Community voting prioritizes urgent needs

The default implementation uses sequential ordering to ensure predictability.

---

## 4. Security Model

### 4.1 Smart Contract Security

**Immutable Logic**: Pool contracts cannot be upgraded once deployed, ensuring rule consistency

**Access Controls**: Strict function-level permissions prevent unauthorized actions

**Reentrancy Protection**: Guards against recursive call exploits

**Integer Overflow Prevention**: Cairo's type system provides native protection

**Emergency Mechanisms**: Pool pause functionality for critical situations

### 4.2 Data Security

**Encryption**: All sensitive user data encrypted at rest and in transit

**Row-Level Security**: Supabase policies ensure users access only authorized data

**Authentication**: Secure email-based authentication with session management

**Private Key Management**: User credentials never exposed; handled by Aegis SDK

### 4.3 Economic Security

**Collateral Requirements**: Initial contribution acts as commitment bond

**Reputation System**: On-chain reputation scores incentivize good behavior

**Dispute Resolution**: Transparent dispute mechanisms with community arbitration

**Slashing Conditions**: Penalties for non-contribution or malicious behavior

---

## 5. Governance and Disputes

### 5.1 Dispute Types

UnityLedger handles various dispute scenarios:
- Non-contribution by members
- Payout order disagreements
- Pool parameter misunderstandings
- Member removal requests
- Fund recovery for inactive pools

### 5.2 Resolution Process

1. **Dispute Submission**: Any member can flag issues through the platform
2. **Evidence Collection**: Automated gathering of on-chain and off-chain data
3. **Review Period**: Time-locked window for all parties to respond
4. **Community Vote**: Members vote on resolution (weighted by reputation)
5. **Execution**: Smart contract enforces the decision automatically

### 5.3 Reputation Scoring

Members build reputation through:
- Consistent on-time contributions (+10 points)
- Successful pool completions (+50 points)
- Active platform participation (+5 points)
- Dispute initiations that are upheld (+20 points)

Reputation decays with:
- Late contributions (-15 points)
- Missed contributions (-30 points)
- Disputes filed against them (-25 points)
- Pool abandonment (-100 points)

---

## 6. Economic Model

### 6.1 Fee Structure

UnityLedger maintains sustainability through minimal fees:

**Platform Fee**: 0.5% of each payout
- Covers infrastructure and development costs
- Distributed transparently on-chain
- Can be reduced through governance

**Gas Sponsorship**: Subsidized transactions for users
- Aegis handles gas costs for contributions and payouts
- Reduces friction for non-crypto-native users

### 6.2 Value Proposition

**For Members**:
- Access to interest-free lump sums for savings goals
- No credit checks or traditional banking requirements
- Transparent fund management with zero counterparty risk
- Build on-chain financial reputation

**For Organizers**:
- Automated administration eliminates manual tracking
- Reduced liability through smart contract enforcement
- Reach global communities beyond geographic limits
- Programmable rules for custom pool designs

---

## 7. Use Cases

### 7.1 Personal Finance

**Emergency Fund Building**: Groups pool weekly contributions for rapid emergency fund access

**Goal-Based Savings**: Friends save together for weddings, vacations, or major purchases

**Debt Consolidation**: Communities help members pay off high-interest debt

### 7.2 Small Business

**Inventory Financing**: Merchants rotate capital for bulk purchasing

**Equipment Acquisition**: Service providers pool funds for expensive tools

**Working Capital**: Seasonal businesses smooth cash flow with rotating credit

### 7.3 Community Development

**Microenterprise Support**: Villages fund local entrepreneurs

**Education Financing**: Families rotate funds for tuition payments

**Healthcare Access**: Communities pool resources for medical expenses

---

## 8. Roadmap

### Phase 1: Foundation (Q4 2025)
- Core smart contract deployment on Starknet mainnet
- Basic pool creation and contribution functionality
- Email-based wallet generation
- Essential UI for pool management

### Phase 2: Enhancement (Q1 2026)
- Advanced payout ordering mechanisms
- Reputation system implementation
- Mobile-responsive interface improvements
- Integration with additional stablecoins

### Phase 3: Expansion (Q2 2026)
- Multi-chain support (Ethereum L1, other L2s)
- DAO governance for platform parameters
- Advanced analytics and reporting
- Community dispute resolution tooling

### Phase 4: Ecosystem (Q3 2026)
- Developer APIs for third-party integrations
- White-label solutions for organizations
- Cross-pool lending mechanisms
- Insurance products for contribution defaults

---

## 9. Risks and Mitigations

### 9.1 Technical Risks

**Smart Contract Bugs**: Comprehensive audits and formal verification before mainnet
**Wallet Compromise**: Multi-factor authentication and session management
**Network Congestion**: L2 infrastructure provides consistent throughput

### 9.2 Economic Risks

**Stablecoin Depegging**: Support multiple stablecoins to diversify risk
**Mass Defaults**: Reputation requirements and collateral mechanisms
**Low Adoption**: User education and seamless onboarding experiences

### 9.3 Regulatory Risks

**Financial Services Classification**: Monitor regulations and adapt compliance
**Cross-Border Restrictions**: Geographic filtering if required
**Data Privacy**: GDPR-compliant data handling from inception

---

## 10. Conclusion

UnityLedger transforms traditional community savings circles into transparent, globally accessible financial infrastructure. By combining the social capital of ROSCAs with the trustless execution of smart contracts, we enable financial inclusion for underbanked populations while providing unprecedented transparency and security.

The platform removes traditional barriers—geographic distance, trust dependencies, administrative burden—that have limited ROSCA effectiveness. Through blockchain technology, we preserve the communal spirit of traditional systems while introducing automation, transparency, and global reach.

As decentralized finance continues to mature, UnityLedger represents a practical application that delivers real value to everyday users, demonstrating that blockchain technology can meaningfully improve financial access and community resilience.

---

## References

1. Besley, T., Coate, S., & Loury, G. (1993). "The Economics of Rotating Savings and Credit Associations"
2. Starknet Documentation: https://docs.starknet.io
3. Cairo Programming Language: https://book.cairo-lang.org
4. Cavos Aegis SDK: https://docs.cavos.xyz
5. Supabase Platform: https://supabase.com/docs

---

## Appendix A: Smart Contract Interfaces

```cairo
// Pool Factory Interface
#[starknet::interface]
trait IPoolFactory<TContractState> {
    fn create_pool(
        ref self: TContractState,
        pool_size: u32,
        contribution_amount: u256,
        frequency: u64
    ) -> ContractAddress;

    fn get_pool_count(self: @TContractState) -> u32;
}

// Pool Interface
#[starknet::interface]
trait IPool<TContractState> {
    fn join(ref self: TContractState);
    fn contribute(ref self: TContractState, amount: u256);
    fn request_payout(ref self: TContractState);
    fn distribute_payout(ref self: TContractState, recipient: ContractAddress);
    fn progress_cycle(ref self: TContractState);
    fn get_pool_info(self: @TContractState) -> PoolInfo;
}
```

---

## Appendix B: Database Schema

**Tables**:
- `users`: User profiles and wallet addresses
- `pools`: Pool metadata and parameters
- `pool_members`: Membership relationships
- `contributions`: Contribution records per cycle
- `payouts`: Payout distribution history
- `disputes`: Dispute cases and resolutions
- `activity_feed`: User activity notifications
- `reputation_scores`: Member reputation tracking

---

**For more information, visit: https://unityledger.com**
**Contact: team@unityledger.com**
