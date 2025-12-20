module crowdfund::pig_farming;

use sui::event;
use sui::clock::{Self, Clock};
use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use std::string::{Self, String};

// ============ STRUCTS ============

/// Game state for a player
public struct GameState has key {
    id: UID,
    player: address,
    pigs: u64,           // Number of pigs owned
    trees: u64,          // Number of trees planted
    wood: u64,           // Amount of wood harvested
    simple_houses: u64,  // Number of simple houses built
    modern_houses: u64,  // Number of modern houses built
    coins: u64,          // In-game coins (MIST)
    bricks: u64,         // Number of bricks owned
    created_at: u64,
    last_updated: u64,
}

/// Event emitted when game state changes
public struct GameStateUpdated has copy, drop {
    player: address,
    action: String,
    timestamp: u64,
}

/// Event emitted when coins are transferred
public struct CoinsTransferred has copy, drop {
    from: address,
    to: address,
    amount: u64,
    timestamp: u64,
}

// ============ CONSTANTS ============

const PIG_COST: u64 = 100_000_000;        // 0.1 SUI to buy a pig
const TREE_COST: u64 = 50_000_000;        // 0.05 SUI to plant a tree
const PIG_REWARD: u64 = 20_000_000;       // 0.02 SUI earned per pig action
const WOOD_PER_TREE: u64 = 5;             // 5 wood per tree harvested
const SIMPLE_HOUSE_COST_WOOD: u64 = 20;   // 20 wood to build simple house
const WOOD_SELL_PRICE: u64 = 10_000_000;  // 0.01 SUI per wood
const BRICK_COST: u64 = 30_000_000;       // 0.03 SUI per brick
const BRICKS_FOR_MODERN: u64 = 10;        // 10 bricks needed for modern house
const MODERN_HOUSE_COST_WOOD: u64 = 30;   // 30 wood needed for modern house
const INITIAL_COINS: u64 = 100_000_000;   // 0.1 SUI worth of coins to start

// ============ ERROR CODES ============

const E_NOT_PLAYER: u64 = 0;              // Not the game owner
const E_INSUFFICIENT_COINS: u64 = 1;      // Not enough coins
const E_NO_TREES: u64 = 2;                // No trees to harvest
const E_INSUFFICIENT_WOOD: u64 = 3;       // Not enough wood
const E_INSUFFICIENT_BRICKS: u64 = 4;     // Not enough bricks
const E_INVALID_AMOUNT: u64 = 5;          // Invalid amount
const E_INSUFFICIENT_FUNDS: u64 = 6;      // Insufficient funds for transfer

// ============ FUNCTIONS ============

/// Initialize a new game for a player
public entry fun create_game(
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let player = tx_context::sender(ctx);
    let timestamp = clock::timestamp_ms(clock);
    
    let game_state = GameState {
        id: object::new(ctx),
        player,
        pigs: 0,
        trees: 0,
        wood: 0,
        simple_houses: 0,
        modern_houses: 0,
        coins: INITIAL_COINS, // Start with 0.1 SUI worth of coins
        bricks: 0,
        created_at: timestamp,
        last_updated: timestamp,
    };
    
    transfer::share_object(game_state);
    
    event::emit(GameStateUpdated {
        player,
        action: string::utf8(b"game_created"),
        timestamp,
    });
}

/// Raise pigs - costs coins, earns coins over time
public entry fun raise_pig(
    game_state: &mut GameState,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let player = tx_context::sender(ctx);
    assert!(game_state.player == player, E_NOT_PLAYER);
    
    // Check if player has enough coins
    assert!(game_state.coins >= PIG_COST, E_INSUFFICIENT_COINS);
    
    // Deduct cost
    game_state.coins = game_state.coins - PIG_COST;
    
    // Add pig
    game_state.pigs = game_state.pigs + 1;
    
    // Earn reward
    game_state.coins = game_state.coins + PIG_REWARD;
    
    let timestamp = clock::timestamp_ms(clock);
    game_state.last_updated = timestamp;
    
    event::emit(GameStateUpdated {
        player,
        action: string::utf8(b"pig_raised"),
        timestamp,
    });
}

/// Plant trees - costs coins
public entry fun plant_tree(
    game_state: &mut GameState,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let player = tx_context::sender(ctx);
    assert!(game_state.player == player, E_NOT_PLAYER);
    
    // Check if player has enough coins
    assert!(game_state.coins >= TREE_COST, E_INSUFFICIENT_COINS);
    
    // Deduct cost
    game_state.coins = game_state.coins - TREE_COST;
    
    // Add tree
    game_state.trees = game_state.trees + 1;
    
    let timestamp = clock::timestamp_ms(clock);
    game_state.last_updated = timestamp;
    
    event::emit(GameStateUpdated {
        player,
        action: string::utf8(b"tree_planted"),
        timestamp,
    });
}

/// Harvest wood from trees
public entry fun harvest_wood(
    game_state: &mut GameState,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let player = tx_context::sender(ctx);
    assert!(game_state.player == player, E_NOT_PLAYER);
    
    // Check if player has trees
    assert!(game_state.trees > 0, E_NO_TREES);
    
    // Calculate wood harvested (all trees)
    let wood_harvested = game_state.trees * WOOD_PER_TREE;
    
    // Add wood
    game_state.wood = game_state.wood + wood_harvested;
    
    // Trees are consumed when harvested
    game_state.trees = 0;
    
    let timestamp = clock::timestamp_ms(clock);
    game_state.last_updated = timestamp;
    
    event::emit(GameStateUpdated {
        player,
        action: string::utf8(b"wood_harvested"),
        timestamp,
    });
}

/// Build a simple house using wood
public entry fun build_simple_house(
    game_state: &mut GameState,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let player = tx_context::sender(ctx);
    assert!(game_state.player == player, E_NOT_PLAYER);
    
    // Check if player has enough wood
    assert!(game_state.wood >= SIMPLE_HOUSE_COST_WOOD, E_INSUFFICIENT_WOOD);
    
    // Deduct wood
    game_state.wood = game_state.wood - SIMPLE_HOUSE_COST_WOOD;
    
    // Add simple house
    game_state.simple_houses = game_state.simple_houses + 1;
    
    let timestamp = clock::timestamp_ms(clock);
    game_state.last_updated = timestamp;
    
    event::emit(GameStateUpdated {
        player,
        action: string::utf8(b"simple_house_built"),
        timestamp,
    });
}

/// Sell wood to earn coins
public entry fun sell_wood(
    game_state: &mut GameState,
    amount: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let player = tx_context::sender(ctx);
    assert!(game_state.player == player, E_NOT_PLAYER);
    
    // Check if amount is valid
    assert!(amount > 0, E_INVALID_AMOUNT);
    
    // Check if player has enough wood
    assert!(game_state.wood >= amount, E_INSUFFICIENT_WOOD);
    
    // Deduct wood
    game_state.wood = game_state.wood - amount;
    
    // Calculate earnings
    let earnings = amount * WOOD_SELL_PRICE;
    
    // Add coins
    game_state.coins = game_state.coins + earnings;
    
    let timestamp = clock::timestamp_ms(clock);
    game_state.last_updated = timestamp;
    
    event::emit(GameStateUpdated {
        player,
        action: string::utf8(b"wood_sold"),
        timestamp,
    });
}

/// Buy bricks using coins
public entry fun buy_bricks(
    game_state: &mut GameState,
    amount: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let player = tx_context::sender(ctx);
    assert!(game_state.player == player, E_NOT_PLAYER);
    
    // Check if amount is valid
    assert!(amount > 0, E_INVALID_AMOUNT);
    
    // Calculate total cost
    let total_cost = amount * BRICK_COST;
    
    // Check if player has enough coins
    assert!(game_state.coins >= total_cost, E_INSUFFICIENT_COINS);
    
    // Deduct coins
    game_state.coins = game_state.coins - total_cost;
    
    // Add bricks
    game_state.bricks = game_state.bricks + amount;
    
    let timestamp = clock::timestamp_ms(clock);
    game_state.last_updated = timestamp;
    
    event::emit(GameStateUpdated {
        player,
        action: string::utf8(b"bricks_bought"),
        timestamp,
    });
}

/// Build a modern house using wood and bricks
public entry fun build_modern_house(
    game_state: &mut GameState,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let player = tx_context::sender(ctx);
    assert!(game_state.player == player, E_NOT_PLAYER);
    
    // Check if player has enough resources
    assert!(game_state.wood >= MODERN_HOUSE_COST_WOOD, E_INSUFFICIENT_WOOD);
    assert!(game_state.bricks >= BRICKS_FOR_MODERN, E_INSUFFICIENT_BRICKS);
    
    // Deduct resources
    game_state.wood = game_state.wood - MODERN_HOUSE_COST_WOOD;
    game_state.bricks = game_state.bricks - BRICKS_FOR_MODERN;
    
    // Add modern house
    game_state.modern_houses = game_state.modern_houses + 1;
    
    let timestamp = clock::timestamp_ms(clock);
    game_state.last_updated = timestamp;
    
    event::emit(GameStateUpdated {
        player,
        action: string::utf8(b"modern_house_built"),
        timestamp,
    });
}

/// Transfer coins to another player (for trading)
public entry fun transfer_coins(
    game_state: &mut GameState,
    recipient: address,
    amount: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let player = tx_context::sender(ctx);
    assert!(game_state.player == player, E_NOT_PLAYER);
    assert!(amount > 0, E_INVALID_AMOUNT);
    assert!(game_state.coins >= amount, E_INSUFFICIENT_FUNDS);
    
    // Note: This is a simplified version. In a real implementation,
    // you would need to get the recipient's GameState and update it.
    // For now, we just emit an event.
    
    game_state.coins = game_state.coins - amount;
    
    let timestamp = clock::timestamp_ms(clock);
    game_state.last_updated = timestamp;
    
    event::emit(CoinsTransferred {
        from: player,
        to: recipient,
        amount,
        timestamp,
    });
    
    event::emit(GameStateUpdated {
        player,
        action: string::utf8(b"coins_transferred"),
        timestamp,
    });
}

// ============ VIEW FUNCTIONS ============

/// Get game state (read-only)
public fun get_game_state(game_state: &GameState): (address, u64, u64, u64, u64, u64, u64, u64, u64) {
    (
        game_state.player,
        game_state.pigs,
        game_state.trees,
        game_state.wood,
        game_state.simple_houses,
        game_state.modern_houses,
        game_state.coins,
        game_state.bricks,
        game_state.last_updated,
    )
}

