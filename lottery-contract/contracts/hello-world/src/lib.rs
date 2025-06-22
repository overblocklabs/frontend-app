#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Env, String, Vec, Address, Map, symbol_short};

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
    // Create a new lottery
    pub fn create_lottery(
        env: Env,
        creator: Address,
        name: String,
        entry_fee: i128,
        duration: u64,
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
            name,
            entry_fee,
            max_participants,
            participants: vec![&env],
            winner: None,
            winner_tx_hash: None,
            is_completed: false,
            created_at: env.ledger().timestamp(),
            creator,
        };
        
        lotteries.set(new_id, lottery);
        env.storage().persistent().set(&symbol_short!("lotteries"), &lotteries);
        env.storage().persistent().set(&symbol_short!("count"), &new_id);
        
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
        
        lottery.participants.push_back(participant);
        lotteries.set(lottery_id, lottery);
        env.storage().persistent().set(&symbol_short!("lotteries"), &lotteries);
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
        result
    }
}

mod test;
