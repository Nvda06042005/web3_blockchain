module crowdfund::share;

use sui::event;
use sui::clock::Clock;
use std::string::String;

/// Event emitted when an item is shared
public struct ItemShared has copy, drop {
    item_id: ID,
    item_type: String, // "project" or "campaign"
    shared_by: address,
    shared_to: address,
    shared_at: u64,
}

/// Share a project or campaign with another address
/// This function emits an event that can be queried by the frontend
/// to show shared items to the recipient
/// 
/// This is a standalone version that doesn't require Platform object
public entry fun share_item(
    item: sui::object::ID,
    item_type: vector<u8>,
    recipient: address,
    clock: &Clock,
    ctx: &mut sui::tx_context::TxContext,
) {
    // Get current timestamp
    let timestamp = sui::clock::timestamp_ms(clock);
    let sender = sui::tx_context::sender(ctx);
    
    // Convert item_type vector to string
    let item_type_string = std::string::utf8(item_type);
    
    // Emit event for frontend to query
    event::emit(ItemShared {
        item_id: item,
        item_type: item_type_string,
        shared_by: sender,
        shared_to: recipient,
        shared_at: timestamp,
    });
}

