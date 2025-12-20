/**
 * PigLife Game Hooks
 * Interact with pig_life.move smart contract
 */

import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { GAME_PACKAGE_ID, CLOCK_ID } from "../constants";
import type { GameStateBackup } from "../utils/walrus";

export interface PigLifeGameState {
  player: string;
  social_capital: number;
  life_token: number;
  sui_balance: number;
  pig_level: number;
  pig_exp: number;
  pigs_count: number;
  seeds: number;
  trees_count: number;
  wood_count: number;
  house_level: number;
  bricks_count: number;
  streak_days: number;
  total_posts: number;
  total_score: number;
  is_ceo: boolean;
  last_feed_time: number;
  last_checkin_date: number;
  created_at: number;
  last_updated: number;
}

export function usePigLifeGame() {
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();

  // Helper to check if contract is deployed
  const isContractDeployed = () => {
    return (
      (GAME_PACKAGE_ID as string) !== "0x0" &&
      (GAME_PACKAGE_ID as string) !==
        "0x0000000000000000000000000000000000000000000000000000000000000000" &&
      GAME_PACKAGE_ID.length > 3
    );
  };

  // ============ GAME CREATION ============

  const createGame = async () => {
    if (!isContractDeployed()) {
      throw new Error("Game contract chưa được deploy!");
    }

    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::create_game`,
      arguments: [tx.object(CLOCK_ID)],
    });

    return signAndExecute({ transaction: tx });
  };

  // ============ PIG FARMING ============

  const feedPig = async (gameId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::feed_pig`,
      arguments: [tx.object(gameId), tx.object(CLOCK_ID)],
    });

    return signAndExecute({ transaction: tx });
  };

  // ============ SOCIAL ACTIONS ============

  const dailyCheckin = async (gameId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::daily_checkin`,
      arguments: [tx.object(gameId), tx.object(CLOCK_ID)],
    });

    return signAndExecute({ transaction: tx });
  };

  const createPost = async (gameId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::create_post`,
      arguments: [tx.object(gameId), tx.object(CLOCK_ID)],
    });

    return signAndExecute({ transaction: tx });
  };

  const shareContent = async (gameId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::share_content`,
      arguments: [tx.object(gameId), tx.object(CLOCK_ID)],
    });

    return signAndExecute({ transaction: tx });
  };

  const inviteFriend = async (gameId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::invite_friend`,
      arguments: [tx.object(gameId), tx.object(CLOCK_ID)],
    });

    return signAndExecute({ transaction: tx });
  };

  // ============ FARMING ============

  const buySeed = async (gameId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::buy_seed`,
      arguments: [tx.object(gameId), tx.object(CLOCK_ID)],
    });

    return signAndExecute({ transaction: tx });
  };

  const plantTree = async (gameId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::plant_tree`,
      arguments: [tx.object(gameId), tx.object(CLOCK_ID)],
    });

    return signAndExecute({ transaction: tx });
  };

  const harvestWood = async (gameId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::harvest_wood`,
      arguments: [tx.object(gameId), tx.object(CLOCK_ID)],
    });

    return signAndExecute({ transaction: tx });
  };

  const sellWood = async (gameId: string, amount: number) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::sell_wood`,
      arguments: [
        tx.object(gameId),
        tx.pure.u64(BigInt(amount)),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // ============ BUILDING ============

  const donateForWood = async (gameId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::donate_for_wood`,
      arguments: [tx.object(gameId), tx.object(CLOCK_ID)],
    });

    return signAndExecute({ transaction: tx });
  };

  const buildHouse = async (gameId: string, leaderboardId: string) => {
    const tx = new Transaction();

    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_life::build_house`,
      arguments: [
        tx.object(gameId),
        tx.object(leaderboardId),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // ============ FETCH GAME STATE ============

  const fetchGameState = async (
    gameId: string
  ): Promise<PigLifeGameState | null> => {
    try {
      const object = await suiClient.getObject({
        id: gameId,
        options: { showContent: true },
      });

      if (!object.data?.content || "fields" in object.data.content === false) {
        return null;
      }

      const fields = object.data.content.fields as any;

      return {
        player: fields.player,
        social_capital: Number(fields.social_capital),
        life_token: Number(fields.life_token),
        sui_balance: Number(fields.sui_balance),
        pig_level: Number(fields.pig_level),
        pig_exp: Number(fields.pig_exp),
        pigs_count: Number(fields.pigs_count),
        seeds: Number(fields.seeds),
        trees_count: Number(fields.trees_count),
        wood_count: Number(fields.wood_count),
        house_level: Number(fields.house_level),
        bricks_count: Number(fields.bricks_count),
        streak_days: Number(fields.streak_days),
        total_posts: Number(fields.total_posts),
        total_score: Number(fields.total_score || 0),
        is_ceo: Boolean(fields.is_ceo),
        last_feed_time: Number(fields.last_feed_time),
        last_checkin_date: Number(fields.last_checkin_date),
        created_at: Number(fields.created_at),
        last_updated: Number(fields.last_updated),
      };
    } catch (error) {
      console.error("Error fetching game state:", error);
      return null;
    }
  };

  // Convert to Walrus backup format
  const toBackupFormat = (state: PigLifeGameState): GameStateBackup => {
    return {
      ...state,
      backup_timestamp: Date.now(),
    };
  };

  return {
    // Game management
    createGame,
    isContractDeployed,
    
    // Pig farming
    feedPig,
    
    // Social actions
    dailyCheckin,
    createPost,
    shareContent,
    inviteFriend,
    
    // Farming
    buySeed,
    plantTree,
    harvestWood,
    sellWood,
    
    // Building
    donateForWood,
    buildHouse,
    
    // Data fetching
    fetchGameState,
    toBackupFormat,
    
    // Loading state
    isPending,
  };
}

