#[starknet::interface]
trait IPool<TContractState> {
    fn join_pool(ref self: TContractState);
    fn contribute(ref self: TContractState, cycle: u32);
    fn trigger_payout(ref self: TContractState);
    fn get_pool_info(self: @TContractState) -> (u32, u256, u64, u32, felt252);
    fn get_member(self: @TContractState, position: u32) -> starknet::ContractAddress;
    fn has_contributed(self: @TContractState, member: starknet::ContractAddress, cycle: u32) -> bool;
}

#[starknet::contract]
mod Pool {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{Map, StoragePointerReadAccess, StoragePointerWriteAccess, StorageMapReadAccess, StorageMapWriteAccess};

    #[storage]
    struct Storage {
        creator: ContractAddress,
        token: ContractAddress,
        size: u32,
        contribution_amount: u256,
        cadence_seconds: u64,
        payout_mode: felt252,
        stake_enabled: bool,
        status: felt252,
        current_cycle: u32,
        next_cycle_time: u64,
        members: Map<u32, ContractAddress>,
        member_count: u32,
        contributions: Map<(ContractAddress, u32), bool>,
        payouts: Map<u32, bool>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PoolCreated: PoolCreated,
        MemberJoined: MemberJoined,
        Contribution: Contribution,
        Payout: Payout,
        StatusChanged: StatusChanged,
    }

    #[derive(Drop, starknet::Event)]
    struct PoolCreated {
        #[key]
        creator: ContractAddress,
        size: u32,
        contribution_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct MemberJoined {
        #[key]
        member: ContractAddress,
        position: u32,
    }

    #[derive(Drop, starknet::Event)]
    struct Contribution {
        #[key]
        member: ContractAddress,
        cycle: u32,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Payout {
        #[key]
        recipient: ContractAddress,
        cycle: u32,
        amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct StatusChanged {
        old_status: felt252,
        new_status: felt252,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        creator: ContractAddress,
        token: ContractAddress,
        size: u32,
        contribution_amount: u256,
        cadence_seconds: u64,
        payout_mode: felt252,
        stake_enabled: bool,
    ) {
        self.creator.write(creator);
        self.token.write(token);
        self.size.write(size);
        self.contribution_amount.write(contribution_amount);
        self.cadence_seconds.write(cadence_seconds);
        self.payout_mode.write(payout_mode);
        self.stake_enabled.write(stake_enabled);
        self.status.write('PENDING');
        self.current_cycle.write(0);
        self.member_count.write(0);

        self.emit(PoolCreated { creator, size, contribution_amount });
    }

    #[abi(embed_v0)]
    impl PoolImpl of super::IPool<ContractState> {
        fn join_pool(ref self: ContractState) {
            let caller = get_caller_address();
            let member_count = self.member_count.read();
            let size = self.size.read();

            assert(member_count < size, 'Pool is full');
            assert(self.status.read() == 'PENDING', 'Pool not accepting members');

            self.members.write(member_count, caller);
            self.member_count.write(member_count + 1);

            self.emit(MemberJoined { member: caller, position: member_count });

            if member_count + 1 == size {
                self.status.write('ACTIVE');
                self.next_cycle_time.write(get_block_timestamp() + self.cadence_seconds.read());
                self.emit(StatusChanged { old_status: 'PENDING', new_status: 'ACTIVE' });
            }
        }

        fn contribute(ref self: ContractState, cycle: u32) {
            let caller = get_caller_address();
            assert(self.status.read() == 'ACTIVE', 'Pool not active');
            assert(cycle == self.current_cycle.read(), 'Invalid cycle');
            assert(!self.contributions.read((caller, cycle)), 'Already contributed');

            self.contributions.write((caller, cycle), true);

            let amount = self.contribution_amount.read();
            self.emit(Contribution { member: caller, cycle, amount });
        }

        fn trigger_payout(ref self: ContractState) {
            let current_cycle = self.current_cycle.read();
            assert(self.status.read() == 'ACTIVE', 'Pool not active');
            assert(!self.payouts.read(current_cycle), 'Payout already made');
            assert(get_block_timestamp() >= self.next_cycle_time.read(), 'Cycle not due');

            let mut all_contributed = true;
            let member_count = self.member_count.read();
            let mut i: u32 = 0;
            loop {
                if i >= member_count {
                    break;
                }
                let member = self.members.read(i);
                if !self.contributions.read((member, current_cycle)) {
                    all_contributed = false;
                    break;
                }
                i += 1;
            };

            assert(all_contributed, 'Not all members contributed');

            let recipient = self.members.read(current_cycle);
            let amount = self.contribution_amount.read() * member_count.into();

            self.payouts.write(current_cycle, true);
            self.emit(Payout { recipient, cycle: current_cycle, amount });

            let new_cycle = current_cycle + 1;
            self.current_cycle.write(new_cycle);

            if new_cycle >= self.size.read() {
                self.status.write('COMPLETED');
                self.emit(StatusChanged { old_status: 'ACTIVE', new_status: 'COMPLETED' });
            } else {
                self.next_cycle_time.write(get_block_timestamp() + self.cadence_seconds.read());
            }
        }

        fn get_pool_info(self: @ContractState) -> (u32, u256, u64, u32, felt252) {
            (
                self.size.read(),
                self.contribution_amount.read(),
                self.cadence_seconds.read(),
                self.current_cycle.read(),
                self.status.read(),
            )
        }

        fn get_member(self: @ContractState, position: u32) -> ContractAddress {
            self.members.read(position)
        }

        fn has_contributed(self: @ContractState, member: ContractAddress, cycle: u32) -> bool {
            self.contributions.read((member, cycle))
        }
    }
}
