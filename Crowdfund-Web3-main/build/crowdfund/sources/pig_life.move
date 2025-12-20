// PigLife Game Smart Contract
// Enhanced version with NFTs, Treasury, and Season System

module crowdfund::pig_life {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};

    // ==================== Constants ====================
    const FEED_COOLDOWN: u64 = 14400000; // 4 hours in milliseconds
    const FEED_COST_SC: u64 = 10;
    const FEED_REWARD_LT: u64 = 5;
    const POST_REWARD_SC: u64 = 50;
    const CHECKIN_REWARD_SC: u64 = 20;
    const LIKE_REWARD_SC: u64 = 5;
    const SHARE_REWARD_SC: u64 = 30;
    const SUPPORT_REWARD_SC: u64 = 15;
    const EXP_PER_LEVEL: u64 = 100;
    
    // Wood NFT cost in SUI (in MIST - 1 SUI = 1,000,000,000 MIST)
    const WOOD_COST_SUI: u64 = 1000000000; // 1 SUI
    const WOOD_PER_HOUSE: u64 = 10;

    // ==================== Error Codes ====================
    const E_COOLDOWN_NOT_READY: u64 = 1;
    const E_NOT_ENOUGH_SC: u64 = 2;
    const E_NOT_ENOUGH_LT: u64 = 3;
    const E_ALREADY_CHECKED_IN: u64 = 4;
    const E_NOT_OWNER: u64 = 5;
    const E_NOT_ENOUGH_WOOD: u64 = 6;
    const E_NOT_ENOUGH_SUI: u64 = 7;

    // ==================== Structs ====================
    
    /// Main game object - one per player
    public struct Pig has key, store {
        id: UID,
        owner: address,
        level: u64,
        exp: u64,
        last_feed_time: u64,
        social_capital: u64,
        life_token: u64,
        streak_days: u64,
        last_checkin_day: u64,
        total_posts: u64,
        total_likes: u64,
        total_shares: u64,
    }

    /// Material NFT - Wood for building
    public struct Wood has key, store {
        id: UID,
        owner: address,
        origin: String, // Traceable origin (donation source)
        quality: u64, // 1-5 stars
    }

    /// Tree NFT - Growing asset
    public struct Tree has key, store {
        id: UID,
        owner: address,
        planted_at: u64,
        growth_stage: u64, // 0: seed, 1: sprout, 2: young, 3: mature
        can_harvest: bool,
    }

    /// Seed item for planting
    public struct Seed has key, store {
        id: UID,
        owner: address,
        seed_type: String,
    }

    /// House NFT - Evolving asset
    public struct House has key, store {
        id: UID,
        owner: address,
        level: u64, // 1: Thatch, 2: Brick, 3: Steel, 4: Modern
        built_at: u64,
    }

    /// Post object - Social content
    public struct Post has key, store {
        id: UID,
        author: address,
        title: String,
        content: String,
        likes: u64,
        shares: u64,
        created_at: u64,
    }

    /// CEO Badge - Soulbound NFT
    public struct CEOBadge has key {
        id: UID,
        owner: address,
        granted_at: u64,
        season: u64,
    }

    /// Season data - shared object
    public struct Season has key {
        id: UID,
        season_number: u64,
        start_time: u64,
        duration: u64, // 12 hours in milliseconds
        first_ceo: Option<address>,
        prize_pool: Balance<SUI>,
        total_players: u64,
    }

    /// Leaderboard entry
    public struct LeaderboardEntry has store, copy, drop {
        player: address,
        score: u64,
        pig_level: u64,
        house_level: u64,
        is_ceo: bool,
    }

    /// Game treasury for donations
    public struct GameTreasury has key {
        id: UID,
        balance: Balance<SUI>,
    }

    // ==================== Events ====================
    
    public struct PigCreated has copy, drop {
        pig_id: ID,
        owner: address,
    }

    public struct PigFed has copy, drop {
        pig_id: ID,
        owner: address,
        new_level: u64,
        lt_earned: u64,
    }

    public struct PostCreated has copy, drop {
        post_id: ID,
        author: address,
        sc_earned: u64,
    }

    public struct PostLiked has copy, drop {
        post_id: ID,
        liker: address,
        sc_earned: u64,
    }

    public struct WoodPurchased has copy, drop {
        wood_id: ID,
        buyer: address,
        amount_paid: u64,
    }

    public struct HouseBuilt has copy, drop {
        house_id: ID,
        owner: address,
        level: u64,
    }

    public struct DailyCheckin has copy, drop {
        pig_id: ID,
        owner: address,
        streak: u64,
        sc_earned: u64,
    }

    public struct TreePlanted has copy, drop {
        tree_id: ID,
        owner: address,
        planted_at: u64,
    }

    public struct TreeHarvested has copy, drop {
        tree_id: ID,
        owner: address,
        wood_received: u64,
    }

    public struct WoodSold has copy, drop {
        wood_id: ID,
        seller: address,
        amount_received: u64,
    }

    public struct CEOAchieved has copy, drop {
        ceo_address: address,
        season: u64,
        achieved_at: u64,
        is_first: bool,
    }

    public struct SeasonEnded has copy, drop {
        season_number: u64,
        winner: Option<address>,
        prize_amount: u64,
    }

    public struct SeasonStarted has copy, drop {
        season_number: u64,
        start_time: u64,
        duration: u64,
    }

    // ==================== Initialization ====================
    
    fun init(ctx: &mut TxContext) {
        let treasury = GameTreasury {
            id: object::new(ctx),
            balance: balance::zero(),
        };
        transfer::share_object(treasury);

        // Initialize first season
        let season = Season {
            id: object::new(ctx),
            season_number: 1,
            start_time: 0, // Will be set when first player joins
            duration: 43200000, // 12 hours
            first_ceo: option::none(),
            prize_pool: balance::zero(),
            total_players: 0,
        };
        transfer::share_object(season);
    }

    // ==================== Core Functions ====================
    
    /// Create a new Pig NFT (one per wallet)
    public entry fun create_pig(ctx: &mut TxContext) {
        let pig = Pig {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            level: 1,
            exp: 0,
            last_feed_time: 0,
            social_capital: 0,
            life_token: 0,
            streak_days: 0,
            last_checkin_day: 0,
            total_posts: 0,
            total_likes: 0,
            total_shares: 0,
        };

        event::emit(PigCreated {
            pig_id: object::uid_to_inner(&pig.id),
            owner: tx_context::sender(ctx),
        });

        transfer::transfer(pig, tx_context::sender(ctx));
    }

    /// Feed the pig - consumes SC, earns LT, gains exp
    public entry fun feed_pig(
        pig: &mut Pig,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(pig.social_capital >= FEED_COST_SC, E_NOT_ENOUGH_SC);

        let current_time = clock::timestamp_ms(clock);
        let time_since_last_feed = current_time - pig.last_feed_time;
        
        assert!(time_since_last_feed >= FEED_COOLDOWN, E_COOLDOWN_NOT_READY);

        // Deduct SC and add rewards
        pig.social_capital = pig.social_capital - FEED_COST_SC;
        pig.life_token = pig.life_token + FEED_REWARD_LT;
        pig.exp = pig.exp + 20;
        pig.last_feed_time = current_time;

        // Check for level up
        while (pig.exp >= EXP_PER_LEVEL) {
            pig.exp = pig.exp - EXP_PER_LEVEL;
            pig.level = pig.level + 1;
        };

        event::emit(PigFed {
            pig_id: object::uid_to_inner(&pig.id),
            owner: pig.owner,
            new_level: pig.level,
            lt_earned: FEED_REWARD_LT,
        });
    }

    /// Daily check-in - earns SC
    public entry fun daily_checkin(
        pig: &mut Pig,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        let current_time = clock::timestamp_ms(clock);
        let current_day = current_time / 86400000; // Convert to days
        
        assert!(pig.last_checkin_day != current_day, E_ALREADY_CHECKED_IN);

        pig.social_capital = pig.social_capital + CHECKIN_REWARD_SC;
        pig.streak_days = pig.streak_days + 1;
        pig.last_checkin_day = current_day;

        event::emit(DailyCheckin {
            pig_id: object::uid_to_inner(&pig.id),
            owner: pig.owner,
            streak: pig.streak_days,
            sc_earned: CHECKIN_REWARD_SC,
        });
    }

    /// Create a post - earns SC
    public entry fun create_post(
        pig: &mut Pig,
        title: vector<u8>,
        content: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);

        let post = Post {
            id: object::new(ctx),
            author: tx_context::sender(ctx),
            title: string::utf8(title),
            content: string::utf8(content),
            likes: 0,
            shares: 0,
            created_at: clock::timestamp_ms(clock),
        };

        pig.social_capital = pig.social_capital + POST_REWARD_SC;
        pig.total_posts = pig.total_posts + 1;

        event::emit(PostCreated {
            post_id: object::uid_to_inner(&post.id),
            author: tx_context::sender(ctx),
            sc_earned: POST_REWARD_SC,
        });

        transfer::share_object(post);
    }

    /// Like a post - earns SC for liker
    public entry fun like_post(
        pig: &mut Pig,
        post: &mut Post,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);

        post.likes = post.likes + 1;
        pig.social_capital = pig.social_capital + LIKE_REWARD_SC;
        pig.total_likes = pig.total_likes + 1;

        event::emit(PostLiked {
            post_id: object::uid_to_inner(&post.id),
            liker: tx_context::sender(ctx),
            sc_earned: LIKE_REWARD_SC,
        });
    }

    /// Share a post - earns SC
    public entry fun share_post(
        pig: &mut Pig,
        post: &mut Post,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);

        post.shares = post.shares + 1;
        pig.social_capital = pig.social_capital + SHARE_REWARD_SC;
        pig.total_shares = pig.total_shares + 1;
    }

    /// Support a post with Life Tokens
    public entry fun support_post(
        pig: &mut Pig,
        _post: &mut Post,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(pig.life_token >= amount, E_NOT_ENOUGH_LT);

        pig.life_token = pig.life_token - amount;
        pig.social_capital = pig.social_capital + SUPPORT_REWARD_SC;
    }

    /// Donate SUI to receive Wood NFT
    public entry fun donate_for_wood(
        payment: Coin<SUI>,
        treasury: &mut GameTreasury,
        origin_text: vector<u8>,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        assert!(amount >= WOOD_COST_SUI, E_NOT_ENOUGH_SUI);

        // Add to treasury
        let balance = coin::into_balance(payment);
        balance::join(&mut treasury.balance, balance);

        // Create Wood NFT
        let wood = Wood {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            origin: string::utf8(origin_text),
            quality: 5, // Max quality for donations
        };

        event::emit(WoodPurchased {
            wood_id: object::uid_to_inner(&wood.id),
            buyer: tx_context::sender(ctx),
            amount_paid: amount,
        });

        transfer::transfer(wood, tx_context::sender(ctx));
    }

    /// Build house by burning Wood NFTs
    public entry fun build_house(
        pig: &mut Pig,
        mut wood_nfts: vector<Wood>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(vector::length(&wood_nfts) >= WOOD_PER_HOUSE, E_NOT_ENOUGH_WOOD);

        // Burn wood NFTs
        while (!vector::is_empty(&wood_nfts)) {
            let Wood { id, owner: _, origin: _, quality: _ } = vector::pop_back(&mut wood_nfts);
            object::delete(id);
        };
        vector::destroy_empty(wood_nfts);

        // Create House NFT
        let house = House {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            level: 1,
            built_at: clock::timestamp_ms(clock),
        };

        event::emit(HouseBuilt {
            house_id: object::uid_to_inner(&house.id),
            owner: tx_context::sender(ctx),
            level: 1,
        });

        transfer::transfer(house, tx_context::sender(ctx));
    }

    /// Grant CEO Badge (admin function)
    public entry fun grant_ceo_badge(
        pig: &mut Pig,
        season: &mut Season,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);
        
        let current_time = clock::timestamp_ms(clock);
        let is_first_ceo = option::is_none(&season.first_ceo);
        
        if (is_first_ceo) {
            season.first_ceo = option::some(tx_context::sender(ctx));
        };
        
        let badge = CEOBadge {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            granted_at: current_time,
            season: season.season_number,
        };

        event::emit(CEOAchieved {
            ceo_address: tx_context::sender(ctx),
            season: season.season_number,
            achieved_at: current_time,
            is_first: is_first_ceo,
        });

        transfer::transfer(badge, tx_context::sender(ctx));
    }

    /// Check if season should end and handle rewards
    public entry fun check_and_end_season(
        season: &mut Season,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        let elapsed = current_time - season.start_time;
        
        if (elapsed >= season.duration && season.start_time > 0) {
            // Season ended
            let winner = season.first_ceo;
            let prize_amount = balance::value(&season.prize_pool);
            
            if (option::is_some(&winner)) {
                // Transfer prize to winner
                let winner_addr = *option::borrow(&winner);
                let prize_balance = balance::withdraw_all(&mut season.prize_pool);
                let prize_coin = coin::from_balance(prize_balance, ctx);
                transfer::public_transfer(prize_coin, winner_addr);
                
                event::emit(SeasonEnded {
                    season_number: season.season_number,
                    winner: winner,
                    prize_amount: prize_amount,
                });
            } else {
                event::emit(SeasonEnded {
                    season_number: season.season_number,
                    winner: option::none(),
                    prize_amount: 0,
                });
            };
            
            // Reset season
            season.season_number = season.season_number + 1;
            season.start_time = current_time;
            season.first_ceo = option::none();
            season.total_players = 0;
            
            event::emit(SeasonStarted {
                season_number: season.season_number,
                start_time: current_time,
                duration: season.duration,
            });
        };
    }

    /// Add to prize pool (donations)
    public entry fun add_to_prize_pool(
        payment: Coin<SUI>,
        season: &mut Season,
    ) {
        let balance = coin::into_balance(payment);
        balance::join(&mut season.prize_pool, balance);
    }

    /// Calculate player score
    public fun calculate_score(pig: &Pig): u64 {
        let mut score = 0u64;
        score = score + (pig.level * 100);
        score = score + (pig.social_capital * 2);
        score = score + (pig.life_token * 5);
        score = score + (pig.streak_days * 50);
        score = score + (pig.total_posts * 100);
        score
    }

    /// Buy seed with Life Token
    public entry fun buy_seed(
        pig: &mut Pig,
        seed_type: vector<u8>,
        cost: u64,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(pig.life_token >= cost, E_NOT_ENOUGH_LT);

        pig.life_token = pig.life_token - cost;

        let seed = Seed {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            seed_type: string::utf8(seed_type),
        };

        transfer::transfer(seed, tx_context::sender(ctx));
    }

    /// Plant tree from seed
    public entry fun plant_tree(
        pig: &mut Pig,
        seed: Seed,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);

        // Burn the seed
        let Seed { id, owner: _, seed_type: _ } = seed;
        object::delete(id);

        let current_time = clock::timestamp_ms(clock);
        
        let tree = Tree {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            planted_at: current_time,
            growth_stage: 0,
            can_harvest: false,
        };

        event::emit(TreePlanted {
            tree_id: object::uid_to_inner(&tree.id),
            owner: tx_context::sender(ctx),
            planted_at: current_time,
        });

        transfer::transfer(tree, tx_context::sender(ctx));
    }

    /// Update tree growth (called periodically)
    public entry fun update_tree_growth(
        tree: &mut Tree,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(tree.owner == tx_context::sender(ctx), E_NOT_OWNER);

        let current_time = clock::timestamp_ms(clock);
        let time_elapsed = current_time - tree.planted_at;
        
        // Growth stages based on time (example: 1 day per stage)
        let days_passed = time_elapsed / 86400000; // milliseconds in a day
        
        if (days_passed >= 3) {
            tree.growth_stage = 3;
            tree.can_harvest = true;
        } else if (days_passed >= 2) {
            tree.growth_stage = 2;
        } else if (days_passed >= 1) {
            tree.growth_stage = 1;
        };
    }

    /// Harvest wood from mature tree
    public entry fun harvest_tree(
        pig: &mut Pig,
        tree: Tree,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);
        assert!(tree.can_harvest, E_COOLDOWN_NOT_READY);

        let tree_id = object::uid_to_inner(&tree.id);
        let growth_stage = tree.growth_stage;

        // Burn the tree
        let Tree { id, owner: _, planted_at: _, growth_stage: _, can_harvest: _ } = tree;
        object::delete(id);

        // Create 1-3 Wood NFTs based on growth stage
        let wood_count = if (growth_stage >= 3) { 3 } else { 1 };
        let mut i = 0;

        while (i < wood_count) {
            let wood = Wood {
                id: object::new(ctx),
                owner: tx_context::sender(ctx),
                origin: string::utf8(b"Farm Harvest"),
                quality: growth_stage,
            };
            transfer::transfer(wood, tx_context::sender(ctx));
            i = i + 1;
        };

        event::emit(TreeHarvested {
            tree_id: tree_id,
            owner: tx_context::sender(ctx),
            wood_received: wood_count,
        });
    }

    /// Sell wood for SUI
    public entry fun sell_wood(
        pig: &mut Pig,
        wood: Wood,
        treasury: &mut GameTreasury,
        ctx: &mut TxContext
    ) {
        assert!(pig.owner == tx_context::sender(ctx), E_NOT_OWNER);

        let wood_id = object::uid_to_inner(&wood.id);
        let quality = wood.quality;
        
        // Burn the wood
        let Wood { id, owner: _, origin: _, quality: _ } = wood;
        object::delete(id);

        // Calculate payment based on quality
        let payment_amount = quality * 500000000; // 0.5 SUI per quality point
        
        // Extract SUI from treasury
        let payment_balance = balance::split(&mut treasury.balance, payment_amount);
        let payment_coin = coin::from_balance(payment_balance, ctx);
        
        transfer::public_transfer(payment_coin, tx_context::sender(ctx));

        event::emit(WoodSold {
            wood_id: wood_id,
            seller: tx_context::sender(ctx),
            amount_received: payment_amount,
        });
    }

    // ==================== View Functions ====================
    
    public fun get_pig_level(pig: &Pig): u64 {
        pig.level
    }

    public fun get_social_capital(pig: &Pig): u64 {
        pig.social_capital
    }

    public fun get_life_token(pig: &Pig): u64 {
        pig.life_token
    }

    public fun get_streak_days(pig: &Pig): u64 {
        pig.streak_days
    }

    public fun get_tree_growth_stage(tree: &Tree): u64 {
        tree.growth_stage
    }

    public fun can_harvest_tree(tree: &Tree): bool {
        tree.can_harvest
    }

    public fun get_wood_quality(wood: &Wood): u64 {
        wood.quality
    }
}
