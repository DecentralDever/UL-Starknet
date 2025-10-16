#[starknet::interface]
trait IPoolFactory<TContractState> {
    fn create_pool(
        ref self: TContractState,
        token: starknet::ContractAddress,
        size: u32,
        contribution_amount: u256,
        cadence_seconds: u64,
        payout_mode: felt252,
        stake_enabled: bool,
    ) -> starknet::ContractAddress;
    fn get_pool(self: @TContractState, pool_id: u32) -> starknet::ContractAddress;
    fn get_pool_count(self: @TContractState) -> u32;
    fn get_user_pool_count(self: @TContractState, user: starknet::ContractAddress) -> u32;
    fn get_user_pool(self: @TContractState, user: starknet::ContractAddress, index: u32) -> starknet::ContractAddress;
}

#[starknet::contract]
mod PoolFactory {
    use starknet::{ContractAddress, get_caller_address, ClassHash, syscalls::deploy_syscall};
    use starknet::storage::{Map, StoragePointerReadAccess, StoragePointerWriteAccess, StorageMapReadAccess, StorageMapWriteAccess};

    #[storage]
    struct Storage {
        pool_class_hash: ClassHash,
        pools: Map<u32, ContractAddress>,
        pool_count: u32,
        user_pools: Map<(ContractAddress, u32), ContractAddress>,
        user_pool_count: Map<ContractAddress, u32>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        PoolCreated: PoolCreated,
    }

    #[derive(Drop, starknet::Event)]
    struct PoolCreated {
        pool_address: ContractAddress,
        #[key]
        creator: ContractAddress,
        pool_id: u32,
    }

    #[constructor]
    fn constructor(ref self: ContractState, pool_class_hash: ClassHash) {
        self.pool_class_hash.write(pool_class_hash);
        self.pool_count.write(0);
    }

    #[abi(embed_v0)]
    impl PoolFactoryImpl of super::IPoolFactory<ContractState> {
        fn create_pool(
            ref self: ContractState,
            token: ContractAddress,
            size: u32,
            contribution_amount: u256,
            cadence_seconds: u64,
            payout_mode: felt252,
            stake_enabled: bool,
        ) -> ContractAddress {
            let caller = get_caller_address();
            let pool_count = self.pool_count.read();

            let mut constructor_calldata = ArrayTrait::new();
            constructor_calldata.append(caller.into());
            constructor_calldata.append(token.into());
            constructor_calldata.append(size.into());
            constructor_calldata.append(contribution_amount.low.into());
            constructor_calldata.append(contribution_amount.high.into());
            constructor_calldata.append(cadence_seconds.into());
            constructor_calldata.append(payout_mode);
            constructor_calldata.append(if stake_enabled { 1 } else { 0 });

            let (pool_address, _) = deploy_syscall(
                self.pool_class_hash.read(),
                pool_count.into(),
                constructor_calldata.span(),
                false
            ).unwrap();

            self.pools.write(pool_count, pool_address);
            self.pool_count.write(pool_count + 1);

            let user_pool_count = self.user_pool_count.read(caller);
            self.user_pools.write((caller, user_pool_count), pool_address);
            self.user_pool_count.write(caller, user_pool_count + 1);

            self.emit(PoolCreated { pool_address, creator: caller, pool_id: pool_count });

            pool_address
        }

        fn get_pool(self: @ContractState, pool_id: u32) -> ContractAddress {
            self.pools.read(pool_id)
        }

        fn get_pool_count(self: @ContractState) -> u32 {
            self.pool_count.read()
        }

        fn get_user_pool_count(self: @ContractState, user: ContractAddress) -> u32 {
            self.user_pool_count.read(user)
        }

        fn get_user_pool(self: @ContractState, user: ContractAddress, index: u32) -> ContractAddress {
            self.user_pools.read((user, index))
        }
    }
}
