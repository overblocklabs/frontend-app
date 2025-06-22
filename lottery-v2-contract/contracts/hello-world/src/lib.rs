#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Env, String, Vec, Address, Map, symbol_short, log};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Lottery {
    pub id: u32,
    pub name: String,
    pub entry_fee: i128,
    pub max_participants: u32,
    pub participants: Vec<Address>,
    pub winner: Option<Address>,
    pub winner_tx_hash: Option<String>,
    pub is_completed: bool,
    pub created_at: u64,
    pub creator: Address,
}

#[contract]
pub struct LotteryContract;

#[contractimpl]
impl LotteryContract {
    // Initialize the contract
    pub fn initialize(env: Env) {
        let empty_lotteries: Map<u32, Lottery> = Map::new(&env);
        env.storage().persistent().set(&symbol_short!("lotteries"), &empty_lotteries);
        env.storage().persistent().set(&symbol_short!("count"), &0u32);
        log!(&env, "Contract initialized");
    }

    // Create a new lottery
    pub fn create_lottery(
        env: Env,
        creator: Address,
        name: String,
        entry_fee: i128,
        _duration: u64,
        max_participants: u32,
    ) -> u32 {
        creator.require_auth();
        
        let mut lotteries: Map<u32, Lottery> = env
            .storage()
            .persistent()
            .get(&symbol_short!("lotteries"))
            .unwrap_or(Map::new(&env));
        
        let lottery_count: u32 = env
            .storage()
            .persistent()
            .get(&symbol_short!("count"))
            .unwrap_or(0);
        
        let new_id = lottery_count + 1;
        
        let lottery = Lottery {
            id: new_id,
            name: name.clone(),
            entry_fee,
            max_participants,
            participants: vec![&env],
            winner: None,
            winner_tx_hash: None,
            is_completed: false,
            created_at: env.ledger().timestamp(),
            creator: creator.clone(),
        };
        
        lotteries.set(new_id, lottery);
        env.storage().persistent().set(&symbol_short!("lotteries"), &lotteries);
        env.storage().persistent().set(&symbol_short!("count"), &new_id);
        
        log!(&env, "Lottery created: {} by {}", name, creator);
        new_id
    }
    
    // Enter a lottery
    pub fn enter_lottery(env: Env, participant: Address, lottery_id: u32) {
        participant.require_auth();
        
        let mut lotteries: Map<u32, Lottery> = env
            .storage()
            .persistent()
            .get(&symbol_short!("lotteries"))
            .unwrap_or(Map::new(&env));
        
        let mut lottery = lotteries.get(lottery_id).expect("Lottery not found");
        
        if lottery.is_completed {
            panic!("Lottery is already completed");
        }
        
        if lottery.participants.len() >= lottery.max_participants {
            panic!("Lottery is full");
        }

        // Check if participant already joined
        for existing_participant in lottery.participants.iter() {
            if existing_participant == participant {
                panic!("Participant already joined this lottery");
            }
        }
        
        lottery.participants.push_back(participant.clone());
        lotteries.set(lottery_id, lottery);
        env.storage().persistent().set(&symbol_short!("lotteries"), &lotteries);
        
        log!(&env, "Participant {} entered lottery {}", participant, lottery_id);
    }
    
    // Get all lotteries
    pub fn get_all_lotteries(env: Env) -> Vec<Lottery> {
        let lotteries: Map<u32, Lottery> = env
            .storage()
            .persistent()
            .get(&symbol_short!("lotteries"))
            .unwrap_or(Map::new(&env));
        
        let mut result = vec![&env];
        for (_, lottery) in lotteries.iter() {
            result.push_back(lottery);
        }
        log!(&env, "Retrieved {} lotteries", result.len());
        result
    }
    
    // Get completed lotteries
    pub fn get_completed_lotteries(env: Env) -> Vec<Lottery> {
        let lotteries: Map<u32, Lottery> = env
            .storage()
            .persistent()
            .get(&symbol_short!("lotteries"))
            .unwrap_or(Map::new(&env));
        
        let mut result = vec![&env];
        for (_, lottery) in lotteries.iter() {
            if lottery.is_completed {
                result.push_back(lottery);
            }
        }
        log!(&env, "Retrieved {} completed lotteries", result.len());
        result
    }

    // Complete a lottery (select winner)
    pub fn complete_lottery(env: Env, lottery_id: u32, winner_address: Address) {
        let mut lotteries: Map<u32, Lottery> = env
            .storage()
            .persistent()
            .get(&symbol_short!("lotteries"))
            .unwrap_or(Map::new(&env));
        
        let mut lottery = lotteries.get(lottery_id).expect("Lottery not found");
        
        if lottery.is_completed {
            panic!("Lottery is already completed");
        }

        lottery.is_completed = true;
        lottery.winner = Some(winner_address.clone());
        
        lotteries.set(lottery_id, lottery);
        env.storage().persistent().set(&symbol_short!("lotteries"), &lotteries);
        
        log!(&env, "Lottery {} completed, winner: {}", lottery_id, winner_address);
    }

    // Get lottery count
    pub fn get_lottery_count(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&symbol_short!("count"))
            .unwrap_or(0)
    }
}

mod test;
