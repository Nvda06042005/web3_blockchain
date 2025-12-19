import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { GAME_PACKAGE_ID, CLOCK_ID } from "../constants";

export interface GameState {
  player: string;
  pigs: number;
  trees: number;
  wood: number;
  simple_houses: number;
  modern_houses: number;
  coins: number;
  bricks: number;
  last_updated: number;
}

export function useGameCalls() {
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();

  // Create a new game
  const createGame = async () => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_farming::create_game`,
      arguments: [
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // Raise a pig
  const raisePig = async (gameStateId: string) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_farming::raise_pig`,
      arguments: [
        tx.object(gameStateId),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // Plant a tree
  const plantTree = async (gameStateId: string) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_farming::plant_tree`,
      arguments: [
        tx.object(gameStateId),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // Harvest wood
  const harvestWood = async (gameStateId: string) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_farming::harvest_wood`,
      arguments: [
        tx.object(gameStateId),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // Build simple house
  const buildSimpleHouse = async (gameStateId: string) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_farming::build_simple_house`,
      arguments: [
        tx.object(gameStateId),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // Sell wood
  const sellWood = async (gameStateId: string, amount: number) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_farming::sell_wood`,
      arguments: [
        tx.object(gameStateId),
        tx.pure.u64(BigInt(amount)),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // Buy bricks
  const buyBricks = async (gameStateId: string, amount: number) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_farming::buy_bricks`,
      arguments: [
        tx.object(gameStateId),
        tx.pure.u64(BigInt(amount)),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // Build modern house
  const buildModernHouse = async (gameStateId: string) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_farming::build_modern_house`,
      arguments: [
        tx.object(gameStateId),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // Transfer coins
  const transferCoins = async (gameStateId: string, recipient: string, amount: number) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${GAME_PACKAGE_ID}::pig_farming::transfer_coins`,
      arguments: [
        tx.object(gameStateId),
        tx.pure.address(recipient),
        tx.pure.u64(BigInt(amount)),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // Fetch game state
  const fetchGameState = async (gameStateId: string): Promise<GameState | null> => {
    try {
      const object = await suiClient.getObject({
        id: gameStateId,
        options: { showContent: true },
      });

      if (!object.data?.content || "fields" in object.data.content === false) {
        return null;
      }

      const fields = object.data.content.fields as any;
      
      return {
        player: fields.player,
        pigs: Number(fields.pigs),
        trees: Number(fields.trees),
        wood: Number(fields.wood),
        simple_houses: Number(fields.simple_houses),
        modern_houses: Number(fields.modern_houses),
        coins: Number(fields.coins),
        bricks: Number(fields.bricks),
        last_updated: Number(fields.last_updated),
      };
    } catch (error) {
      console.error("Error fetching game state:", error);
      return null;
    }
  };

  return {
    createGame,
    raisePig,
    plantTree,
    harvestWood,
    buildSimpleHouse,
    sellWood,
    buyBricks,
    buildModernHouse,
    transferCoins,
    fetchGameState,
    isPending,
  };
}

