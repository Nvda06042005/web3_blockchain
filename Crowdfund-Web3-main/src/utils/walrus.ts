/**
 * Walrus Storage Integration
 * Decentralized storage for game state backups
 */

import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient } from "@mysten/walrus";

// Initialize Walrus client
const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

const walrusClient = new WalrusClient({
  suiClient: suiClient as any,
  network: "testnet",
  storageNodeClientOptions: {
    timeout: 60_000,
  },
});

export interface GameStateBackup {
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
  backup_timestamp: number;
}

/**
 * Save game state to Walrus
 * @param gameState - Game state object to backup
 * @param signer - Sui keypair for signing transaction
 * @returns Blob ID of stored data
 */
export async function saveGameStateToWalrus(
  gameState: GameStateBackup,
  signer: any
): Promise<string> {
  try {
    // Add backup timestamp
    const stateWithTimestamp = {
      ...gameState,
      backup_timestamp: Date.now(),
    };

    // Convert to JSON string
    const jsonData = JSON.stringify(stateWithTimestamp, null, 2);
    
    // Encode to Uint8Array
    const data = new TextEncoder().encode(jsonData);

    // Write to Walrus
    const { blobId } = await walrusClient.writeBlob({
      blob: data,
      deletable: false,
      epochs: 10, // Store for 10 epochs (~10 days on testnet)
      signer,
    });

    console.log("✅ Game state saved to Walrus:", blobId);
    
    // Save blobId to localStorage for easy retrieval
    if (typeof window !== 'undefined') {
      const backups = getBackupHistory(gameState.player);
      backups.unshift({
        blobId,
        timestamp: stateWithTimestamp.backup_timestamp,
        house_level: gameState.house_level,
        pig_level: gameState.pig_level,
      });
      
      // Keep only last 10 backups
      const recentBackups = backups.slice(0, 10);
      localStorage.setItem(
        `walrus_backups_${gameState.player}`,
        JSON.stringify(recentBackups)
      );
    }

    return blobId;
  } catch (error) {
    console.error("❌ Error saving to Walrus:", error);
    throw error;
  }
}

/**
 * Load game state from Walrus
 * @param blobId - Blob ID to retrieve
 * @returns Game state object
 */
export async function loadGameStateFromWalrus(
  blobId: string
): Promise<GameStateBackup> {
  try {
    // Read from Walrus
    const blob = await walrusClient.readBlob({ blobId });
    
    // Decode from Uint8Array
    const jsonData = new TextDecoder().decode(blob);
    
    // Parse JSON
    const gameState: GameStateBackup = JSON.parse(jsonData);

    console.log("✅ Game state loaded from Walrus:", blobId);
    
    return gameState;
  } catch (error) {
    console.error("❌ Error loading from Walrus:", error);
    throw error;
  }
}

/**
 * Get backup history from localStorage
 */
export function getBackupHistory(player: string): Array<{
  blobId: string;
  timestamp: number;
  house_level: number;
  pig_level: number;
}> {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(`walrus_backups_${player}`);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Auto-backup game state (call this periodically)
 */
export async function autoBackup(
  gameState: GameStateBackup,
  signer: any
): Promise<string | null> {
  try {
    // Check if last backup was more than 1 hour ago
    const lastBackups = getBackupHistory(gameState.player);
    if (lastBackups.length > 0) {
      const lastBackupTime = lastBackups[0].timestamp;
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (lastBackupTime > oneHourAgo) {
        console.log("⏭️ Skipping backup - last backup was less than 1 hour ago");
        return null;
      }
    }

    // Perform backup
    return await saveGameStateToWalrus(gameState, signer);
  } catch (error) {
    console.error("❌ Auto-backup failed:", error);
    return null;
  }
}

/**
 * Verify blob exists on Walrus
 */
export async function verifyBlobExists(blobId: string): Promise<boolean> {
  try {
    await walrusClient.readBlob({ blobId });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Walrus aggregator URL for a blob
 */
export function getWalrusUrl(blobId: string): string {
  // Testnet aggregator
  return `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
}

/**
 * Export game state as JSON file (for manual backup)
 */
export function exportGameStateAsFile(gameState: GameStateBackup): void {
  const jsonData = JSON.stringify(gameState, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `piglife_backup_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import game state from JSON file
 */
export async function importGameStateFromFile(): Promise<GameStateBackup> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      try {
        const text = await file.text();
        const gameState: GameStateBackup = JSON.parse(text);
        resolve(gameState);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    input.click();
  });
}

