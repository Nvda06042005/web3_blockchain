/**
 * PigLife Game - Beautiful UI Component
 * Web3 Social Farming Game on Sui
 */

import { useState, useEffect, useMemo } from "react";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { ConnectButton } from "@mysten/dapp-kit";
import {
  Loader2,
  PiggyBank,
  Sprout,
  Trees,
  Home,
  DollarSign,
  Calendar,
  Share2,
  UserPlus,
  Edit3,
  Heart,
  Trophy,
  Sparkles,
  AlertTriangle,
  History,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
// Temporarily using old pig_farming hooks until pig_life contract is deployed
import { useGameCalls } from "../../hooks/useGameCalls";
import { GAME_PACKAGE_ID, MODULES, formatSUI, PACKAGE_ID, SHARE_PACKAGE_ID } from "../../constants";
import { useLanguage } from "../../contexts";
import { ConnectWalletModal } from "../common";
import { parseCampaignData } from "../../hooks";
import { InviteModal } from "./InviteModal";
import { InvitationsPanel, type GameInvitation } from "./InvitationsPanel";
import { DonateWithQuizModal } from "../campaign/DonateWithQuizModal";

// Define game state type
interface PigLifeGameState {
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

// Leaderboard player type
interface LeaderboardPlayer {
  address: string;
  name: string;
  score: number;
  pigLevel: number;
  houseLevel: number;
  isCEO: boolean;
  lastUpdate: number;
}

// Season data type
interface SeasonData {
  seasonStartTime: number;
  seasonDuration: number; // 12 hours in milliseconds
  breakDuration: number; // 15 minutes break after season ends
  lastSeasonReset: number;
  isBreakTime: boolean; // true if in break period
  breakEndTime: number; // when break ends and new season starts
}

// Prize structure for top players
const SEASON_PRIZES: Record<number, number> = {
  1: 50,  // 50 SUI for 1st place
  2: 40,  // 40 SUI for 2nd place
  3: 30,  // 30 SUI for 3rd place
  4: 20,  // 20 SUI for 4th place
  5: 10,  // 10 SUI for 5th place
  // Top 6-10 get no prize (will show "-")
};

// History entry types
interface HistoryEntry {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  icon: string;
}

interface FeedHistory extends HistoryEntry {
  level: number;
  exp: number;
}

// Reward history type
interface RewardHistory {
  id: string;
  amount: number;
  rank: number;
  timestamp: number;
  date: string;
  walletAddress: string;
  seasonNumber: number;
}

// No sample posts - only real data from logged in users

export function PigLifeGame() {
  const account = useCurrentAccount();
  const { t } = useLanguage();
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<PigLifeGameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Leaderboard & Season state
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [seasonData, setSeasonData] = useState<SeasonData>({
    seasonStartTime: Date.now(),
    seasonDuration: 43200000, // 12 hours
    breakDuration: 900000, // 15 minutes (15 * 60 * 1000)
    lastSeasonReset: Date.now(),
    isBreakTime: false,
    breakEndTime: 0,
  });
  const [seasonTimer, setSeasonTimer] = useState("00:00:00");
  const [playerRank, setPlayerRank] = useState(0);
  
  // History states
  const [feedHistory, setFeedHistory] = useState<HistoryEntry[]>([]);
  const [socialHistory, setSocialHistory] = useState<HistoryEntry[]>([]);
  const [farmHistory, setFarmHistory] = useState<HistoryEntry[]>([]);
  const [buildHistory, setBuildHistory] = useState<HistoryEntry[]>([]);
  
  // Toggle history visibility
  const [showFeedHistory, setShowFeedHistory] = useState(false);
  const [showSocialHistory, setShowSocialHistory] = useState(false);
  const [showFarmHistory, setShowFarmHistory] = useState(false);
  const [showBuildHistory, setShowBuildHistory] = useState(false);
  
  // Reward history
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState(1);
  
  // Username management
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  
  // Invitation system
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitations, setInvitations] = useState<Array<{
    id: string;
    from: string;
    to: string;
    status: "pending" | "accepted" | "rejected";
    timestamp: number;
    reward: number;
  }>>([]);
  
  // Daily check-in cooldown (2 hours)
  const [lastCheckinTime, setLastCheckinTime] = useState<number>(0);
  const [checkinCooldown, setCheckinCooldown] = useState<string>("");
  
  // NEW: Quota-based system (replace cooldown timer to prevent spam/buff)
  // Track how many times user has USED their quotas in the game
  const [usedPostQuota, setUsedPostQuota] = useState<number>(0);
  const [usedShareQuota, setUsedShareQuota] = useState<number>(0);
  const [lastInviteTime, setLastInviteTime] = useState<number>(0);
  const [inviteCooldown, setInviteCooldown] = useState<string>("");
  
  // Recovery/Debug tool
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryWood, setRecoveryWood] = useState<string>("");
  const [recoveryTrees, setRecoveryTrees] = useState<string>("");
  
  // Quiz modal for donate
  const [showDonateQuizModal, setShowDonateQuizModal] = useState(false);
  
  // Use old game calls temporarily
  const {
    createGame,
    raisePig: raisePigContract,
    plantTree: plantTreeContract,
    harvestWood: harvestWoodContract,
    buildSimpleHouse,
    sellWood,
    buyBricks,
    buildModernHouse,
    transferCoins,
    fetchGameState,
    isPending,
  } = useGameCalls();

  // ==================== FETCH REAL STATS FROM BLOCKCHAIN ====================
  // Fetch campaigns created by user (for post quota)
  const { data: campaignEventsData } = useSuiClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::CampaignCreated`,
      },
      limit: 50,
    },
    { enabled: !!account?.address, refetchInterval: 10000 }
  );

  // Filter campaigns by current user
  const userCampaignIds = useMemo(() => {
    if (!campaignEventsData?.data || !account?.address) return [];
    return campaignEventsData.data
      .filter((event: any) => {
        const eventData = event.parsedJson;
        return eventData?.creator === account.address || eventData?.owner === account.address;
      })
      .map((event: any) => event.parsedJson?.campaign_id)
      .filter(Boolean);
  }, [campaignEventsData, account?.address]);

  // Fetch campaign objects to get actual campaigns
  const { data: userCampaignsData } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: userCampaignIds,
      options: { showContent: true },
    },
    { enabled: userCampaignIds.length > 0, refetchInterval: 10000 }
  );

  // Calculate available post quota (number of campaigns created)
  const availablePostQuota = useMemo(() => {
    if (!userCampaignsData) return 0;
    const campaigns = userCampaignsData
      .map((obj: any) => parseCampaignData(obj.data))
      .filter((c: any) => c !== null);
    return campaigns.length;
  }, [userCampaignsData]);

  // Fetch shared events (for share quota)
  const { data: sharedEventsData } = useSuiClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${SHARE_PACKAGE_ID}::${MODULES.SHARE}::ItemShared`,
      },
      limit: 1000,
    },
    { enabled: !!account?.address, refetchInterval: 10000 }
  );

  // Calculate available share quota (number of times user shared)
  const availableShareQuota = useMemo(() => {
    if (!sharedEventsData?.data || !account?.address) return 0;
    const currentUserAddress = account.address.toLowerCase().trim();
    
    return sharedEventsData.data.filter((event: any) => {
      const eventData = event.parsedJson || event.bcs || event || {};
      const sharedBy = eventData?.shared_by || eventData?.from || eventData?.sender || eventData?.sharedBy;
      
      let sharedByNormalized = '';
      if (sharedBy) {
        if (typeof sharedBy === 'string') {
          sharedByNormalized = sharedBy.toLowerCase().trim();
        } else if (sharedBy?.value) {
          sharedByNormalized = String(sharedBy.value).toLowerCase().trim();
        } else {
          sharedByNormalized = String(sharedBy).toLowerCase().trim();
        }
      }
      
      return sharedByNormalized === currentUserAddress;
    }).length;
  }, [sharedEventsData, account?.address]);
  
  // Calculate remaining quotas
  const remainingPostQuota = Math.max(0, availablePostQuota - usedPostQuota);
  const remainingShareQuota = Math.max(0, availableShareQuota - usedShareQuota);

  // Wrapper functions that update local state immediately
  const feedPig = async (gameId: string) => {
    // Update local state first for immediate feedback
    if (gameState && gameState.social_capital >= 10) {
      const newState = {
        ...gameState,
        social_capital: gameState.social_capital - 10,
        life_token: (gameState.life_token || 0) + 5,
        pig_level: (gameState.pig_level || 1),
        pig_exp: ((gameState.pig_exp || 0) + 10) % 100, // XP cycles 0-99
      };
      // Level up if XP reaches 100
      if ((gameState.pig_exp || 0) + 10 >= 100) {
        newState.pig_level = (gameState.pig_level || 1) + 1;
      }
      setGameState(newState);
      
      // Also try to call contract if available
      if (isContractDeployed() && gameId && !gameId.startsWith('local_')) {
        try {
          await raisePigContract(gameId);
        } catch (e) {
          console.log('Contract call failed, using local state only');
        }
      }
    } else {
      throw new Error("Không đủ Social Capital! Cần 10 SC.");
    }
  };
  
  const plantTree = async (gameId: string) => {
    // Update local state
    if (gameState && gameState.seeds > 0) {
      const newState = {
        ...gameState,
        seeds: gameState.seeds - 1,
        trees_count: (gameState.trees_count || 0) + 1,
      };
      setGameState(newState);
      
      // Save to localStorage to prevent data loss
      saveProgress(newState);
      
      // Try contract if available
      if (isContractDeployed() && gameId && !gameId.startsWith('local_')) {
        try {
          await plantTreeContract(gameId);
        } catch (e) {
          console.log('Contract call failed, using local state only');
        }
      }
    } else {
      throw new Error("Không có hạt giống!");
    }
  };
  
  const harvestWood = async (gameId: string) => {
    // Update local state
    if (gameState && gameState.trees_count > 0) {
      // FIX: Match smart contract - 5 wood per tree (WOOD_PER_TREE = 5 in pig_farming.move)
      const woodGained = gameState.trees_count * 5;
      const newState = {
        ...gameState,
        trees_count: 0,
        wood_count: (gameState.wood_count || 0) + woodGained,
      };
      setGameState(newState);
      
      // Save to localStorage to prevent data loss
      saveProgress(newState);
      
      // Try contract if available
      if (isContractDeployed() && gameId && !gameId.startsWith('local_')) {
        try {
          await harvestWoodContract(gameId);
        } catch (e) {
          console.log('Contract call failed, using local state only');
        }
      }
    } else {
      throw new Error("Không có cây để thu hoạch!");
    }
  };

  // Placeholder functions for features not in old contract
  const dailyCheckin = async (gameId: string) => {
    // Check cooldown (2 hours = 7200000 ms)
    const now = Date.now();
    const timeSinceLastCheckin = now - lastCheckinTime;
    const cooldownTime = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    if (lastCheckinTime > 0 && timeSinceLastCheckin < cooldownTime) {
      const remainingTime = cooldownTime - timeSinceLastCheckin;
      const hours = Math.floor(remainingTime / 3600000);
      const minutes = Math.floor((remainingTime % 3600000) / 60000);
      showNotif(`⏰ Vui lòng đợi ${hours}h ${minutes}m để điểm danh lại`);
      return;
    }
    
    // Update check-in time
    setLastCheckinTime(now);
    if (account?.address) {
      localStorage.setItem(`pigLifeLastCheckin_${account.address}_season${seasonNumber}`, now.toString());
    }
    
    // Update game state with rewards
    if (gameState) {
      const newState = {
        ...gameState,
        social_capital: (gameState.social_capital || 0) + 20,
        streak_days: (gameState.streak_days || 0) + 1,
        total_score: (gameState.total_score || 0) + 50,
      };
      setGameState(newState);
      saveProgress(newState); // Save to localStorage
    }
    
    showNotif("✅ Điểm danh thành công! +20 SC, Chuỗi ngày +" + ((gameState?.streak_days || 0) + 1));
  };
  
  const createPost = async (gameId: string) => {
    // VALIDATION: Must have connected wallet
    if (!account?.address) {
      throw new Error("❌ Vui lòng kết nối ví để tạo bài viết!");
    }
    
    // NEW: Check quota instead of cooldown (anti-spam based on real blockchain activity)
    if (remainingPostQuota <= 0) {
      throw new Error("❌ Bạn đã hết lượt tạo bài! Hãy tạo chiến dịch mới trên trang Khám phá để nhận thêm lượt.");
    }
    
    // Increment used quota
    const newUsedQuota = usedPostQuota + 1;
    setUsedPostQuota(newUsedQuota);
    
    // Save to localStorage with wallet-specific key
    if (account?.address) {
      localStorage.setItem(`pigLifeUsedPostQuota_${account.address}_season${seasonNumber}`, newUsedQuota.toString());
    }
    
    // Update game state locally
    if (gameState) {
      const newState = {
        ...gameState,
        social_capital: (gameState.social_capital || 0) + 50,
        total_posts: (gameState.total_posts || 0) + 1,
        total_score: (gameState.total_score || 0) + 100,
      };
      setGameState(newState);
      saveProgress(newState); // Save to localStorage
    }
  };
  
  const shareContent = async (gameId: string) => {
    // VALIDATION: Must have connected wallet
    if (!account?.address) {
      throw new Error("❌ Vui lòng kết nối ví để share!");
    }
    
    // NEW: Check quota instead of cooldown (anti-spam based on real blockchain activity)
    if (remainingShareQuota <= 0) {
      throw new Error("❌ Bạn đã hết lượt share! Hãy chia sẻ chiến dịch cho bạn bè trên trang Dự án để nhận thêm lượt.");
    }
    
    // Increment used quota
    const newUsedQuota = usedShareQuota + 1;
    setUsedShareQuota(newUsedQuota);
    
    // Save to localStorage with wallet-specific key
    if (account?.address) {
      localStorage.setItem(`pigLifeUsedShareQuota_${account.address}_season${seasonNumber}`, newUsedQuota.toString());
    }
    
    // Update game state locally
    if (gameState) {
      const newState = {
        ...gameState,
        social_capital: (gameState.social_capital || 0) + 30,
        total_score: (gameState.total_score || 0) + 60,
      };
      setGameState(newState);
      saveProgress(newState); // Save to localStorage
    }
  };
  
  const inviteFriend = async (gameId: string) => {
    // VALIDATION: Must have connected wallet
    if (!account?.address) {
      throw new Error("❌ Vui lòng kết nối ví để mời bạn bè!");
    }
    
    // VALIDATION: Check cooldown (15 minutes to prevent spam)
    const now = Date.now();
    const timeSinceLastInvite = now - lastInviteTime;
    const cooldownTime = 15 * 60 * 1000; // 15 minutes
    
    if (lastInviteTime > 0 && timeSinceLastInvite < cooldownTime) {
      const remainingTime = cooldownTime - timeSinceLastInvite;
      const minutes = Math.ceil(remainingTime / 60000);
      throw new Error(`⏰ Vui lòng đợi ${minutes} phút để mời tiếp`);
    }
    
    // Open invite modal instead of auto-rewarding
    setShowInviteModal(true);
  };

  // NEW: Send invitation to a specific address
  const sendInvitation = async (recipientAddress: string) => {
    if (!account?.address) {
      throw new Error("❌ Vui lòng kết nối ví!");
    }

    const now = Date.now();
    const recipientNormalized = recipientAddress.toLowerCase().trim();
    const cooldownTime = 15 * 60 * 1000; // 15 minutes

    // Load existing invitations from localStorage (global)
    const storedInvitations = localStorage.getItem("pigLifeInvitations");
    const existingInvitations: GameInvitation[] = storedInvitations 
      ? JSON.parse(storedInvitations) 
      : [];

    // CHECK 1: Kiểm tra xem địa chỉ này đã được mời trong 15 phút gần nhất chưa
    const recentInviteToThisAddress = existingInvitations.find(
      inv => inv.from.toLowerCase() === account.address.toLowerCase() 
        && inv.to.toLowerCase() === recipientNormalized
        && (now - inv.timestamp) < cooldownTime // Chỉ kiểm tra trong 15 phút gần nhất
    );

    if (recentInviteToThisAddress) {
      const remainingTime = cooldownTime - (now - recentInviteToThisAddress.timestamp);
      const minutes = Math.ceil(remainingTime / 60000);
      throw new Error(`❌ Bạn đã mời địa chỉ này rồi! Vui lòng đợi ${minutes} phút để mời lại.`);
    }

    // CHECK 2: Cooldown 15 phút giữa các lần mời BẤT KỲ
    if (lastInviteTime > 0) {
      const timeSinceLastInvite = now - lastInviteTime;
      
      if (timeSinceLastInvite < cooldownTime) {
        const remainingTime = cooldownTime - timeSinceLastInvite;
        const minutes = Math.ceil(remainingTime / 60000);
        throw new Error(`⏰ Vui lòng đợi ${minutes} phút để mời tiếp`);
      }
    }

    // Update invite time with wallet-specific key
    setLastInviteTime(now);
    if (account?.address) {
      localStorage.setItem(`pigLifeLastInvite_${account.address}_season${seasonNumber}`, now.toString());
    }

    // Create new invitation
    const newInvitation: GameInvitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: account.address,
      to: recipientAddress,
      status: "pending",
      timestamp: now,
      reward: 100, // +100 SC reward
    };

    // Add new invitation
    const updatedInvitations = [...existingInvitations, newInvitation];
    localStorage.setItem("pigLifeInvitations", JSON.stringify(updatedInvitations));
    
    // Update local state
    setInvitations(updatedInvitations);

    showNotif("✉️ Đã gửi lời mời! Đợi 15 phút để mời tiếp.");
  };

  // NEW: Accept invitation
  const acceptInvitation = async (invitationId: string) => {
    if (!account?.address) return;

    // Load invitations
    const storedInvitations = localStorage.getItem("pigLifeInvitations");
    if (!storedInvitations) return;

    const allInvitations: GameInvitation[] = JSON.parse(storedInvitations);
    const invitation = allInvitations.find(inv => inv.id === invitationId);

    if (!invitation || invitation.status !== "pending") return;

    // Update invitation status
    invitation.status = "accepted";
    localStorage.setItem("pigLifeInvitations", JSON.stringify(allInvitations));
    setInvitations(allInvitations);

    // Reward the inviter (load their game state and update)
    const inviterGameKey = `pigLifeGame_${invitation.from}_season${seasonNumber}`;
    const inviterGameData = localStorage.getItem(inviterGameKey);
    
    if (inviterGameData) {
      const inviterState = JSON.parse(inviterGameData);
      inviterState.social_capital = (inviterState.social_capital || 0) + invitation.reward;
      inviterState.total_score = (inviterState.total_score || 0) + invitation.reward * 2;
      localStorage.setItem(inviterGameKey, JSON.stringify(inviterState));
    }

    showNotif(`✅ Đã chấp nhận lời mời! Người mời nhận +${invitation.reward} SC`);
  };

  // NEW: Reject invitation
  const rejectInvitation = async (invitationId: string) => {
    if (!account?.address) return;

    // Load invitations
    const storedInvitations = localStorage.getItem("pigLifeInvitations");
    if (!storedInvitations) return;

    const allInvitations: GameInvitation[] = JSON.parse(storedInvitations);
    const invitation = allInvitations.find(inv => inv.id === invitationId);

    if (!invitation || invitation.status !== "pending") return;

    // Update invitation status
    invitation.status = "rejected";
    localStorage.setItem("pigLifeInvitations", JSON.stringify(allInvitations));
    setInvitations(allInvitations);

    showNotif("❌ Đã từ chối lời mời");
  };
  
  const buySeed = async (gameId: string) => {
    // Update game state locally
    if (gameState && gameState.life_token >= 10) {
      const newState = {
        ...gameState,
        life_token: gameState.life_token - 10,
        seeds: (gameState.seeds || 0) + 5,
      };
      setGameState(newState);
      saveProgress(newState); // Save to localStorage
    } else {
      throw new Error("Không đủ Life Token!");
    }
  };
  
  const donateForWood = async (gameId: string) => {
    // Update game state locally
    if (gameState && gameState.sui_balance >= 1_000_000_000) {
      const newState = {
        ...gameState,
        sui_balance: gameState.sui_balance - 1_000_000_000,
        wood_count: (gameState.wood_count || 0) + 5,
      };
      setGameState(newState);
    } else {
      throw new Error("Không đủ SUI!");
    }
  };
  const buildHouse = async (gameId: string, leaderboardId: string) => {
    return buildSimpleHouse(gameId);
  };

  const isContractDeployed = () => {
    return (
      (GAME_PACKAGE_ID as string) !== "0x0" &&
      (GAME_PACKAGE_ID as string) !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
      GAME_PACKAGE_ID.length > 3
    );
  };

  // ==================== Leaderboard & Season Functions ====================
  
  // Clear old sample data on first load (run once)
  useEffect(() => {
    const dataVersion = localStorage.getItem('pigLifeDataVersion');
    if (dataVersion !== '3.0') {
      // Clear all old sample data and invalid entries
      console.log('Clearing old data and resetting version to 3.0...');
      localStorage.removeItem('pigLifeLeaderboard');
      localStorage.setItem('pigLifeDataVersion', '3.0');
    }
  }, []);
  
  // Load leaderboard and history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pigLifeLeaderboard');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // Filter out sample/fake data - only keep real wallet addresses
        const realPlayers = parsedData.filter((player: LeaderboardPlayer) => {
          // Check if address looks like a real Sui address (starts with 0x and is long enough)
          return player.address && 
                 player.address.startsWith('0x') && 
                 player.address.length > 40 &&
                 // Exclude sample names
                 !['TokenTycoon', 'CryptoFarmer', 'MetaMogul', 'NFTCollector', 'DeFiKing', 
                   'ChainChampion', 'SuiBuilder', 'PigMaster', 'BlockchainBoss', 'Web3Wizard'].includes(player.name);
        });
        setLeaderboard(realPlayers);
        // Save cleaned data back
        if (realPlayers.length !== parsedData.length) {
          localStorage.setItem('pigLifeLeaderboard', JSON.stringify(realPlayers));
        }
      } catch (e) {
        console.error('Error loading leaderboard:', e);
        setLeaderboard([]);
      }
    }
    // No sample data - only real players
    
    // Load season data
    const savedSeason = localStorage.getItem('pigLifeSeasonData');
    if (savedSeason) {
      setSeasonData(JSON.parse(savedSeason));
    }
    
    // Load season number
    const savedSeasonNumber = localStorage.getItem('pigLifeSeasonNumber');
    if (savedSeasonNumber) {
      setSeasonNumber(parseInt(savedSeasonNumber));
    }
    
    // Load history data (account-specific)
    if (account?.address) {
      const savedFeedHistory = localStorage.getItem(`pigLifeFeedHistory_${account.address}`);
      if (savedFeedHistory) setFeedHistory(JSON.parse(savedFeedHistory));
      
      const savedSocialHistory = localStorage.getItem(`pigLifeSocialHistory_${account.address}`);
      if (savedSocialHistory) setSocialHistory(JSON.parse(savedSocialHistory));
      
      const savedFarmHistory = localStorage.getItem(`pigLifeFarmHistory_${account.address}`);
      if (savedFarmHistory) setFarmHistory(JSON.parse(savedFarmHistory));
      
      const savedBuildHistory = localStorage.getItem(`pigLifeBuildHistory_${account.address}`);
      if (savedBuildHistory) setBuildHistory(JSON.parse(savedBuildHistory));
      
      // Load reward history
      const savedRewardHistory = localStorage.getItem(`pigLifeRewardHistory_${account.address}`);
      if (savedRewardHistory) setRewardHistory(JSON.parse(savedRewardHistory));
      
      // Load username for current season
      const savedUsername = localStorage.getItem(`pigLifeUsername_${account.address}_season${seasonNumber}`);
      if (savedUsername) {
        setUsername(savedUsername);
      } else {
        setUsername(""); // Reset if new season
      }
      
      // Load last check-in time for current season
      const savedLastCheckin = localStorage.getItem(`pigLifeLastCheckin_${account.address}_season${seasonNumber}`);
      if (savedLastCheckin) {
        setLastCheckinTime(parseInt(savedLastCheckin));
      } else {
        setLastCheckinTime(0);
      }
    }
  }, [account?.address, seasonNumber]);
  
  // NEW: Load used quotas from localStorage (replaces cooldown system)
  useEffect(() => {
    if (account?.address) {
      // Load used post quota
      const savedUsedPostQuota = localStorage.getItem(`pigLifeUsedPostQuota_${account.address}_season${seasonNumber}`);
      if (savedUsedPostQuota) {
        setUsedPostQuota(parseInt(savedUsedPostQuota));
      } else {
        setUsedPostQuota(0);
      }
      
      // Load used share quota
      const savedUsedShareQuota = localStorage.getItem(`pigLifeUsedShareQuota_${account.address}_season${seasonNumber}`);
      if (savedUsedShareQuota) {
        setUsedShareQuota(parseInt(savedUsedShareQuota));
      } else {
        setUsedShareQuota(0);
      }
      
      // Load last invite time (still uses cooldown for invites)
      const savedLastInvite = localStorage.getItem(`pigLifeLastInvite_${account.address}_season${seasonNumber}`);
      if (savedLastInvite) {
        setLastInviteTime(parseInt(savedLastInvite));
      } else {
        setLastInviteTime(0);
      }

      // Load invitations (global, shared across all users)
      const storedInvitations = localStorage.getItem("pigLifeInvitations");
      if (storedInvitations) {
        setInvitations(JSON.parse(storedInvitations));
      }
    }
  }, [account?.address, seasonNumber]);
  
  // Update check-in cooldown timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastCheckinTime > 0) {
        const now = Date.now();
        const timeSinceLastCheckin = now - lastCheckinTime;
        const cooldownTime = 2 * 60 * 60 * 1000; // 2 hours
        const remainingTime = cooldownTime - timeSinceLastCheckin;
        
        if (remainingTime > 0) {
          const hours = Math.floor(remainingTime / 3600000);
          const minutes = Math.floor((remainingTime % 3600000) / 60000);
          const seconds = Math.floor((remainingTime % 60000) / 1000);
          setCheckinCooldown(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCheckinCooldown("Ready!");
        }
      } else {
        setCheckinCooldown("Ready!");
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastCheckinTime]);
  
  // Update invite cooldown timer every second (15 minutes cooldown)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Update invite cooldown (15 minutes)
      if (lastInviteTime > 0) {
        const timeSinceLastInvite = now - lastInviteTime;
        const cooldownTime = 15 * 60 * 1000; // 15 minutes
        const remainingTime = cooldownTime - timeSinceLastInvite;
        
        if (remainingTime > 0) {
          const minutes = Math.floor(remainingTime / 60000);
          const seconds = Math.floor((remainingTime % 60000) / 1000);
          setInviteCooldown(`${minutes}m ${seconds}s`);
        } else {
          setInviteCooldown("Ready!");
        }
      } else {
        setInviteCooldown("Ready!");
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastInviteTime]);

  // Removed sample leaderboard - Only real players now

  // Calculate player score
  const calculateScore = (state: PigLifeGameState) => {
    let score = 0;
    score += (state.pig_level || 1) * 100;
    score += (state.social_capital || 0) * 2;
    score += (state.life_token || 0) * 5;
    score += (state.wood_count || 0) * 50;
    score += (state.house_level || 0) * 500;
    score += (state.streak_days || 0) * 50;
    score += (state.total_posts || 0) * 100;
    if (state.is_ceo) score += 5000;
    return score;
  };

  // Save player progress to localStorage
  const saveProgress = (state: PigLifeGameState) => {
    if (!account?.address) return;
    
    const progressData = {
      social_capital: state.social_capital || 0,
      life_token: state.life_token || 0,
      pig_level: state.pig_level || 1,
      pig_exp: state.pig_exp || 0,
      seeds: state.seeds || 0,
      streak_days: state.streak_days || 0,
      total_posts: state.total_posts || 0,
      total_score: state.total_score || 0,
      last_feed_time: state.last_feed_time || 0,
      last_checkin_date: state.last_checkin_date || 0,
      created_at: state.created_at || 0,
      // FIX: Save trees_count and wood_count to prevent data loss
      trees_count: state.trees_count || 0,
      wood_count: state.wood_count || 0,
    };
    
    localStorage.setItem(
      `pigLifeProgress_${account.address}_season${seasonNumber}`,
      JSON.stringify(progressData)
    );
    console.log("💾 Saved progress:", progressData);
  };

  // Recovery tool to restore lost data
  const handleRecoveryRestore = () => {
    if (!account?.address || !gameState) {
      showNotif("❌ Vui lòng kết nối ví và tạo game trước!");
      return;
    }

    const woodToAdd = parseInt(recoveryWood) || 0;
    const treesToAdd = parseInt(recoveryTrees) || 0;

    if (woodToAdd <= 0 && treesToAdd <= 0) {
      showNotif("❌ Vui lòng nhập số cây hoặc gỗ cần khôi phục!");
      return;
    }

    const newState = {
      ...gameState,
      trees_count: (gameState.trees_count || 0) + treesToAdd,
      wood_count: (gameState.wood_count || 0) + woodToAdd,
    };

    setGameState(newState);
    saveProgress(newState);
    
    showNotif(`✅ Đã khôi phục: +${treesToAdd} cây, +${woodToAdd} gỗ`);
    setShowRecoveryModal(false);
    setRecoveryWood("");
    setRecoveryTrees("");
  };

  // Update player score in leaderboard
  const updatePlayerScore = () => {
    if (!account || !gameState) return;
    
    const score = calculateScore(gameState);
    const updatedLeaderboard = [...leaderboard];
    const playerIndex = updatedLeaderboard.findIndex(p => p.address === account.address);
    
    // Use username if available, otherwise use wallet address
    const displayName = username || `Player ${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
    
    const playerData: LeaderboardPlayer = {
      address: account.address,
      name: displayName,
      score: score,
      pigLevel: gameState.pig_level || 1,
      houseLevel: gameState.house_level || 0,
      isCEO: gameState.is_ceo || false,
      lastUpdate: Date.now(),
    };
    
    if (playerIndex >= 0) {
      updatedLeaderboard[playerIndex] = playerData;
    } else {
      updatedLeaderboard.push(playerData);
    }
    
    updatedLeaderboard.sort((a, b) => b.score - a.score);
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('pigLifeLeaderboard', JSON.stringify(updatedLeaderboard));
    
    // Update player rank
    const rank = updatedLeaderboard.findIndex(p => p.address === account.address) + 1;
    setPlayerRank(rank);
    
    console.log(`📊 Updated leaderboard - Rank: ${rank}, Score: ${score}`);
  };

  // Update season timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      
      // Check if in break period
      if (seasonData.isBreakTime) {
        const breakRemaining = seasonData.breakEndTime - now;
        if (breakRemaining <= 0) {
          // Break ended, start new season
          startNewSeason();
        } else {
          const minutes = Math.floor(breakRemaining / (60 * 1000));
          const seconds = Math.floor((breakRemaining % (60 * 1000)) / 1000);
          setSeasonTimer(`⏸️ Break: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      } else {
        // Normal season countdown
        const elapsed = now - seasonData.seasonStartTime;
        const remaining = seasonData.seasonDuration - elapsed;
        
        if (remaining <= 0) {
          setSeasonTimer('00:00:00');
          checkSeasonReset();
        } else {
          const hours = Math.floor(remaining / (60 * 60 * 1000));
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
          const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
          setSeasonTimer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [seasonData]);

  // Check and handle season reset
  const checkSeasonReset = () => {
    const now = Date.now();
    const elapsed = now - seasonData.seasonStartTime;
    
    if (elapsed >= seasonData.seasonDuration) {
      resetSeason();
    }
  };

  // Reset season - Distribute prizes and start break period
  const resetSeason = () => {
    // Sort leaderboard by score
    const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
    
    // Announce winners and prizes (Top 5 only)
    let prizeMessage = '🏆 Season Ended! Prize Distribution:\n';
    for (let i = 0; i < Math.min(5, sortedLeaderboard.length); i++) {
      const player = sortedLeaderboard[i];
      const rank = i + 1;
      const prize = SEASON_PRIZES[rank] || 0;
      if (prize > 0) {
        prizeMessage += `\n${rank}. ${player.name}: ${prize} SUI`;
        if (player.address === account?.address) {
          prizeMessage += ' (YOU!)';
        }
      }
    }
    prizeMessage += '\n\n⏸️ 15 minute break before next season...';
    showNotif(prizeMessage);
    
    // Save reward history for current player if they won
    if (account?.address) {
      const playerRankInSeason = sortedLeaderboard.findIndex(p => p.address === account.address) + 1;
      if (playerRankInSeason > 0 && playerRankInSeason <= 5) {
        const prize = SEASON_PRIZES[playerRankInSeason];
        if (prize > 0) {
          const now = Date.now();
          const rewardEntry: RewardHistory = {
            id: `reward_${now}_${Math.random()}`,
            amount: prize,
            rank: playerRankInSeason,
            timestamp: now,
            date: new Date(now).toLocaleString('vi-VN'),
            walletAddress: account.address,
            seasonNumber: seasonNumber,
          };
          
          const updatedRewards = [rewardEntry, ...rewardHistory].slice(0, 50); // Keep last 50 rewards
          setRewardHistory(updatedRewards);
          localStorage.setItem(`pigLifeRewardHistory_${account.address}`, JSON.stringify(updatedRewards));
        }
      }
    }
    
    // Enter break period (15 minutes)
    const now = Date.now();
    const newSeasonData: SeasonData = {
      seasonStartTime: seasonData.seasonStartTime,
      seasonDuration: seasonData.seasonDuration,
      breakDuration: 900000, // 15 minutes
      lastSeasonReset: now,
      isBreakTime: true,
      breakEndTime: now + 900000, // Current time + 15 minutes
    };
    setSeasonData(newSeasonData);
    localStorage.setItem('pigLifeSeasonData', JSON.stringify(newSeasonData));
  };
  
  // Start new season after break
  const startNewSeason = () => {
    const now = Date.now();
    const newSeasonData: SeasonData = {
      seasonStartTime: now,
      seasonDuration: 43200000, // 12 hours
      breakDuration: 900000,
      lastSeasonReset: now,
      isBreakTime: false,
      breakEndTime: 0,
    };
    setSeasonData(newSeasonData);
    localStorage.setItem('pigLifeSeasonData', JSON.stringify(newSeasonData));
    
    // Increment season number
    const newSeasonNumber = seasonNumber + 1;
    setSeasonNumber(newSeasonNumber);
    localStorage.setItem('pigLifeSeasonNumber', newSeasonNumber.toString());
    
    // Reset all players scores
    const resetLeaderboard = leaderboard.map(player => ({
      ...player,
      isCEO: false,
      score: 0,
    }));
    setLeaderboard(resetLeaderboard);
    localStorage.setItem('pigLifeLeaderboard', JSON.stringify(resetLeaderboard));
    
    showNotif('🎮 New season started! Good luck!');
  };

  // Update player score only when they perform actions
  // Removed auto-update on login - players only appear on leaderboard after first action
  // useEffect(() => {
  //   if (gameState && account) {
  //     updatePlayerScore();
  //   }
  // }, [gameState, account]);
  
  // Execute pending action after wallet connection
  useEffect(() => {
    if (account && pendingAction && showConnectWallet) {
      setShowConnectWallet(false);
      // Execute pending action after a short delay
      setTimeout(() => {
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      }, 500);
    }
  }, [account, pendingAction, showConnectWallet]);
  
  // ==================== History Functions ====================
  
  const addHistoryEntry = (
    type: 'feed' | 'social' | 'farm' | 'build',
    action: string,
    details: string,
    icon: string
  ) => {
    if (!account?.address) return; // Only add history for logged-in users
    
    const entry: HistoryEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: Date.now(),
      action,
      details,
      icon,
    };
    
    let updatedHistory: HistoryEntry[] = [];
    let storageKey = '';
    
    switch (type) {
      case 'feed':
        updatedHistory = [entry, ...feedHistory].slice(0, 20); // Keep last 20 entries
        setFeedHistory(updatedHistory);
        storageKey = `pigLifeFeedHistory_${account.address}`;
        break;
      case 'social':
        updatedHistory = [entry, ...socialHistory].slice(0, 20);
        setSocialHistory(updatedHistory);
        storageKey = `pigLifeSocialHistory_${account.address}`;
        break;
      case 'farm':
        updatedHistory = [entry, ...farmHistory].slice(0, 20);
        setFarmHistory(updatedHistory);
        storageKey = `pigLifeFarmHistory_${account.address}`;
        break;
      case 'build':
        updatedHistory = [entry, ...buildHistory].slice(0, 20);
        setBuildHistory(updatedHistory);
        storageKey = `pigLifeBuildHistory_${account.address}`;
        break;
    }
    
    localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
  };
  
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };
  
  // ==================== End Leaderboard & Season Functions ====================

  // Fetch user's game
  // Note: Using pig_farming module until pig_life is deployed
  // FIX: Allow query even if contract not deployed - will gracefully fail and use local mode
  const { data: gamesData, refetch: refetchGames, error: gamesQueryError } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: {
        // Change this to "pig_life::PigLifeGame" after deploying new contract
        StructType: `${GAME_PACKAGE_ID}::pig_farming::GameState`,
      },
      options: { showContent: true },
    },
    {
      enabled: !!account?.address && isContractDeployed(),
      retry: false,
      // Don't throw errors - gracefully fall back to local mode
      throwOnError: false,
    }
  );

  // Auto-create game state if not exists (for local mode)
  // This runs after checking blockchain and localStorage
  useEffect(() => {
    // Only auto-create if account is connected and no game state exists
    if (!account?.address) return;
    
    // Wait a bit for other useEffects to finish loading
    const timer = setTimeout(() => {
      // If gameState is still null after loading attempts, create new game
      if (!gameState) {
        const storageKey = `pigLifeProgress_${account.address}_season${seasonNumber}`;
        const savedData = localStorage.getItem(storageKey);
        
        if (!savedData) {
          // No saved data - auto-create initial game state
          console.log("🎮 Auto-creating game state for local mode...");
          const initialState: PigLifeGameState = {
            player: account.address,
            pigs_count: 0,
            seeds: 0,
            trees_count: 0,
            wood_count: 0,
            house_level: 0,
            bricks_count: 0,
            last_updated: Date.now(),
            social_capital: 100, // Start with 100 SC
            life_token: 50, // Start with 50 LT
            pig_level: 1,
            pig_exp: 0,
            sui_balance: 0,
            streak_days: 0,
            total_posts: 0,
            total_score: 0,
            is_ceo: false,
            last_feed_time: 0,
            last_checkin_date: 0,
            created_at: Date.now(),
          };
          
          setGameState(initialState);
          saveProgress(initialState);
          console.log("✅ Auto-created game state:", initialState);
          
          // Update leaderboard
          setTimeout(() => {
            if (account) {
              updatePlayerScore();
            }
          }, 100);
        }
      }
    }, 500); // Wait 500ms for other loading to complete
    
    return () => clearTimeout(timer);
  }, [account?.address, seasonNumber]); // Only depend on account and season, not gameState

  // Load game state
  useEffect(() => {
    // Handle query errors gracefully
    if (gamesQueryError) {
      console.warn("⚠️ Query error (using local mode):", gamesQueryError);
      // Don't set error state - just use local mode
      loadLocalGameState();
      return;
    }
    
    console.log("📦 Games data updated:", gamesData);
    
    if (gamesData?.data && gamesData.data.length > 0) {
      const id = gamesData.data[0].data?.objectId;
      console.log("🎮 Found game ID:", id);
      
      if (id) {
        setGameId(id);
        loadGameData(id);
      }
    } else {
      console.log("❌ No blockchain game found, checking localStorage...");
      setGameId(null);
      
      // FIX: Don't clear gameState! Try to load from localStorage
      loadLocalGameState();
    }
  }, [gamesData, gamesQueryError]);

  const loadGameData = async (id: string) => {
    try {
      setLoading(true);
      console.log("📥 Loading game state for ID:", id);
      
      const state = await fetchGameState(id);
      console.log("📊 Raw game state:", state);
      
      // Map old GameState to new PigLifeGameState format
      // Add default values for fields not in pig_farming contract
      if (state) {
        // Try to restore saved progress from localStorage (if exists)
        let savedProgress: any = {};
        if (account?.address) {
          const savedData = localStorage.getItem(`pigLifeProgress_${account.address}_season${seasonNumber}`);
          if (savedData) {
            try {
              savedProgress = JSON.parse(savedData);
              console.log("📦 Restored saved progress:", savedProgress);
            } catch (e) {
              console.warn("Failed to parse saved progress");
            }
          }
        }
        
        const mappedState = {
          player: state.player,
          pigs: state.pigs,
          trees: state.trees,
          wood: state.wood,
          simple_houses: state.simple_houses,
          modern_houses: state.modern_houses,
          coins: state.coins,
          bricks: state.bricks,
          last_updated: state.last_updated,
          // Restore from localStorage or use defaults
          social_capital: savedProgress.social_capital ?? 0,
          life_token: savedProgress.life_token ?? 0,
          pig_level: savedProgress.pig_level ?? 1,
          pig_exp: savedProgress.pig_exp ?? 0,
          seeds: savedProgress.seeds ?? 0,
          // FIX: Prioritize savedProgress to prevent data loss
          // If user has data in localStorage, use it instead of blockchain state
          trees_count: savedProgress.trees_count ?? state.trees,
          wood_count: savedProgress.wood_count ?? state.wood,
          house_level: state.simple_houses + state.modern_houses,
          bricks_count: state.bricks,
          streak_days: savedProgress.streak_days ?? 0,
          total_posts: savedProgress.total_posts ?? 0,
          total_score: savedProgress.total_score ?? 0,
          is_ceo: state.modern_houses > 0,
          last_feed_time: savedProgress.last_feed_time ?? 0,
          last_checkin_date: savedProgress.last_checkin_date ?? 0,
          created_at: savedProgress.created_at ?? 0,
          sui_balance: state.coins,
        } as any;
        
        console.log("✅ Mapped game state:", mappedState);
        setGameState(mappedState);
        
        // Update leaderboard after loading game data
        setTimeout(() => {
          if (account) {
            updatePlayerScore();
          }
        }, 100);
      } else {
        console.log("❌ No state returned from fetchGameState");
      }
    } catch (err: any) {
      console.error("❌ Load game error:", err);
      setError(err.message || "Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  // Load game state from localStorage only (when no blockchain game exists)
  const loadLocalGameState = () => {
    if (!account?.address) {
      console.log("❌ No account connected");
      return;
    }

    const savedData = localStorage.getItem(`pigLifeProgress_${account.address}_season${seasonNumber}`);
    if (!savedData) {
      console.log("❌ No local game state found");
      setGameState(null);
      return;
    }

    try {
      const savedProgress = JSON.parse(savedData);
      console.log("📦 Loading from localStorage:", savedProgress);

      // Create game state from localStorage data
      const mappedState = {
        player: account.address,
        pigs: 0,
        trees: 0,
        wood: 0,
        simple_houses: 0,
        modern_houses: 0,
        coins: 0,
        bricks: 0,
        last_updated: Date.now(),
        // Load from localStorage
        social_capital: savedProgress.social_capital ?? 0,
        life_token: savedProgress.life_token ?? 0,
        pig_level: savedProgress.pig_level ?? 1,
        pig_exp: savedProgress.pig_exp ?? 0,
        seeds: savedProgress.seeds ?? 0,
        trees_count: savedProgress.trees_count ?? 0,
        wood_count: savedProgress.wood_count ?? 0,
        house_level: 0,
        bricks_count: 0,
        streak_days: savedProgress.streak_days ?? 0,
        total_posts: savedProgress.total_posts ?? 0,
        total_score: savedProgress.total_score ?? 0,
        is_ceo: false,
        last_feed_time: savedProgress.last_feed_time ?? 0,
        last_checkin_date: savedProgress.last_checkin_date ?? 0,
        created_at: savedProgress.created_at ?? Date.now(),
        sui_balance: 0,
      } as any;

      console.log("✅ Loaded local game state:", mappedState);
      setGameState(mappedState);

      // Update leaderboard
      setTimeout(() => {
        updatePlayerScore();
      }, 100);
    } catch (e) {
      console.error("Failed to parse local game state:", e);
      setGameState(null);
    }
  };

  const handleAction = async (
    action: () => Promise<any>,
    actionName: string,
    successMessage: string,
    historyType?: 'feed' | 'social' | 'farm' | 'build',
    historyDetails?: string,
    historyIcon?: string
  ) => {
    if (!account) {
      // Save pending action and show connect wallet modal
      setPendingAction(() => async () => {
        await handleAction(action, actionName, successMessage, historyType, historyDetails, historyIcon);
      });
      setShowConnectWallet(true);
      return;
    }

    // Check if username is set for current season
    if (!username) {
      // Save the pending action to execute after username is set
      setPendingAction(() => async () => {
        await handleAction(action, actionName, successMessage, historyType, historyDetails, historyIcon);
      });
      setShowUsernameModal(true);
      return;
    }

    // If no gameId yet, check if we need to create game first
    if (!gameId && !gameState) {
      showNotif("🎮 Đang tạo game...");
      await handleCreateGame();
      
      // Wait for game to be created
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Even if no gameId from blockchain, we have local gameState, so continue
      if (!gameState) {
        showNotif("❌ Không thể tạo game. Vui lòng thử lại!");
        return;
      }
      
      // If we have gameState but no gameId, that's OK - use local state for now
      showNotif("✅ Game đã sẵn sàng!");
    }

    // For social actions (check-in, post, etc.), we can work with local state without blockchain gameId
    // If still no gameId but have gameState, create a temporary ID
    let effectiveGameId = gameId;
    if (!effectiveGameId && gameState) {
      effectiveGameId = `local_${account?.address}_${seasonNumber}`;
      showNotif("ℹ️ Đang sử dụng chế độ local (chưa sync blockchain)");
    }
    
    if (!effectiveGameId) {
      showNotif("❌ Không tìm thấy game. Vui lòng tạo game trước!");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await action();
      showNotif(successMessage);
      
      // Add history entry if type is provided
      if (historyType && historyDetails && historyIcon) {
        addHistoryEntry(historyType, actionName, historyDetails, historyIcon);
      }
      
      // Update leaderboard immediately with current state
      if (gameState && account) {
        updatePlayerScore();
      }
      
      // Refetch game data from blockchain (if available)
      setTimeout(async () => {
        await refetchGames();
        if (gameId) await loadGameData(gameId);
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.message || `Failed to ${actionName}`;
      console.error(`❌ ${actionName} error:`, err);
      setError(errorMsg);
      showNotif(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    if (!account) {
      showNotif("❌ Please connect wallet!");
      return;
    }

    if (!isContractDeployed()) {
      setError("Game contract chưa được deploy! Xem hướng dẫn deploy.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log("🎮 Creating game...");
      const result = await createGame();
      console.log("✅ Game created:", result);
      
      showNotif("✅ Game created! Starting...");
      
      // Create initial game state immediately (don't wait for blockchain query)
      // This allows user to start playing right away
      const initialState: PigLifeGameState = {
        player: account.address,
        pigs_count: 0,
        seeds: 0,
        trees_count: 0,
        wood_count: 0,
        house_level: 0,
        bricks_count: 0,
        last_updated: Date.now(),
        social_capital: 100,
        life_token: 50,
        pig_level: 1,
        pig_exp: 0,
        sui_balance: 100_000_000,
        streak_days: 0,
        total_posts: 0,
        total_score: 0,
        is_ceo: false,
        last_feed_time: 0,
        last_checkin_date: 0,
        created_at: Date.now(),
      };
      
      console.log("🎮 Setting initial game state:", initialState);
      setGameState(initialState);
      setLoading(false);
      
      // Try to get real game ID in background
      setTimeout(async () => {
        console.log("🔄 Fetching game ID from blockchain...");
        await refetchGames();
      }, 3000);
      
    } catch (err: any) {
      console.error("❌ Create game error:", err);
      setError(err.message || "Failed to create game");
      showNotif(`❌ Error: ${err.message || "Failed to create game"}`);
      setLoading(false);
    }
  };

  const showNotif = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Check if username already exists in current season
  const isUsernameExists = (username: string): boolean => {
    return leaderboard.some(player => 
      player.name.toLowerCase() === username.toLowerCase() && 
      player.address !== account?.address
    );
  };
  
  // Save username for current season
  const handleSaveUsername = () => {
    if (!tempUsername.trim()) {
      showNotif("❌ " + t("piglife.usernameRequired"));
      return;
    }
    
    if (tempUsername.trim().length < 3) {
      showNotif("❌ " + t("piglife.usernameMinLength"));
      return;
    }
    
    if (tempUsername.trim().length > 20) {
      showNotif("❌ " + t("piglife.usernameMaxLength"));
      return;
    }
    
    const trimmedUsername = tempUsername.trim();
    
    // Check if username already exists in current season
    if (isUsernameExists(trimmedUsername)) {
      showNotif("❌ Tên này đã tồn tại trong mùa giải. Vui lòng chọn tên khác!");
      return;
    }
    
    setUsername(trimmedUsername);
    
    // Save to localStorage with season number
    if (account?.address) {
      localStorage.setItem(`pigLifeUsername_${account.address}_season${seasonNumber}`, trimmedUsername);
    }
    
    // Don't update leaderboard here - only update when user performs actual action
    // updatePlayerScore() will be called in handleAction after successful action
    
    showNotif("✅ " + t("piglife.usernameSet"));
    setShowUsernameModal(false);
    setTempUsername("");
    
    // Execute pending action if any (which will call updatePlayerScore)
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Helper to get game state values with defaults
  const getStateValue = (key: keyof PigLifeGameState, defaultValue: any = 0) => {
    return gameState ? (gameState[key] ?? defaultValue) : defaultValue;
  };

  // Calculate cooldown (always Ready for now since old contract doesn't track this)
  const feedCooldown = "Ready!";


  // Not connected - show connect wallet
  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🐷</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">PigLife</h2>
          <p className="text-gray-600 mb-6">
            {t("piglife.subtitle")}
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // Contract not deployed - show warning but allow local play
  // REMOVED: Blocking check that prevented game from running
  // Game can now run in local mode even without contract

  // No game - show loading or auto-create
  // FIX: Don't show "Create Game" screen - auto-create game state instead
  if (!gameState && account?.address) {
    // Show loading while auto-creating game
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="text-8xl mb-6 animate-bounce">🐷</div>
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đang khởi tạo game...
          </h1>
          <p className="text-gray-600">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    );
  }
  
  // If still no game state and no account, show connect wallet (already handled above)
  // This should not be reached if account exists

  // Main game UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Background Animation */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-400 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-400 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3 cursor-pointer"
            onDoubleClick={() => setShowRecoveryModal(true)}
            title="Double-click để mở công cụ khôi phục dữ liệu"
          >
            <span className="animate-bounce">🐷</span>
            PigLife
          </h1>
          <p className="text-white/90 text-lg">Web3 Social Farming on SUI</p>
          
          {/* Wallet Address Display - Anti-buff security */}
          {account?.address && (
            <div className="mt-4 inline-block bg-white/10 backdrop-blur-sm border-2 border-emerald-400 rounded-xl px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="text-left">
                  <div className="text-white/70 text-xs font-medium uppercase tracking-wide">Connected Wallet</div>
                  <div className="text-white font-mono text-sm font-semibold">
                    {account.address.slice(0, 8)}...{account.address.slice(-6)}
                  </div>
                </div>
                <div className="text-emerald-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contract Warning Banner (non-blocking) */}
        {!isContractDeployed() && (
          <div className="bg-yellow-500/90 backdrop-blur-sm text-white p-4 rounded-xl mb-6 border-2 border-yellow-400 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold mb-1">⚠️ Chế độ Local Mode</p>
                <p className="text-sm opacity-90">
                  Game đang chạy ở chế độ local. Dữ liệu sẽ được lưu trên trình duyệt. 
                  Để kết nối blockchain, vui lòng deploy contract và cập nhật GAME_PACKAGE_ID.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error/Notification */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-xl mb-6 text-center shadow-lg">
            {error}
          </div>
        )}

        {notification && (
          <div className="fixed bottom-8 right-8 bg-white text-gray-900 px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-in-right border-l-4 border-green-500">
            {notification}
          </div>
        )}

        {/* Leaderboard & Season Info */}
        <div className="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-8 border-2 border-yellow-400">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
                <Trophy className="w-8 h-8" />
                🏆 {t("piglife.ceoRaceSeason")}
              </h2>
              <p className="text-white/80">
                {t("piglife.nextResetIn")}: <span className="text-green-400 font-bold text-xl">{seasonTimer}</span>
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="text-white/70 text-sm">{t("piglife.prizePool")}</div>
              <div className="text-4xl font-bold text-yellow-400">150 SUI</div>
              <div className="text-green-400 text-sm font-semibold">{t("piglife.topWinners")}</div>
              <div className="text-white/60 text-xs mt-1">50/40/30/20/10 SUI</div>
            </div>
          </div>

          {/* Top 10 Leaderboard */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📊</span> {t("piglife.topPlayers")}
            </h3>
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🎮</div>
                <p className="text-white/80 text-lg mb-2">{t("piglife.noPlayersYet")}</p>
                <p className="text-white/60 text-sm">{t("piglife.beFirstPlayer")}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {leaderboard.slice(0, 10).map((player, index) => {
                const rank = index + 1;
                const isPlayer = account?.address === player.address;
                let rankEmoji = '';
                if (rank === 1) rankEmoji = '🥇';
                else if (rank === 2) rankEmoji = '🥈';
                else if (rank === 3) rankEmoji = '🥉';
                
                return (
                  <div
                    key={player.address}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      rank <= 3 
                        ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30' 
                        : 'bg-white/5'
                    } ${isPlayer ? 'border-2 border-green-400' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      rank === 1 ? 'bg-yellow-400 text-black' :
                      rank === 2 ? 'bg-gray-300 text-black' :
                      rank === 3 ? 'bg-orange-400 text-white' :
                      'bg-white/20 text-white'
                    }`}>
                      {rankEmoji || `#${rank}`}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold ${isPlayer ? 'text-green-400' : 'text-white'}`}>
                        {player.name} {isPlayer ? t("piglife.you") : ''} {player.isCEO ? '🎖️' : ''}
                      </div>
                      <div className="text-white/60 text-sm">
                        🐷 Lv.{player.pigLevel} | 🏠 Lv.{player.houseLevel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg">
                        {player.score.toLocaleString()}
                      </div>
                      <div className={`text-sm font-semibold ${rank <= 5 ? 'text-yellow-400' : 'text-white/40'}`}>
                        {SEASON_PRIZES[rank] ? `${SEASON_PRIZES[rank]} SUI` : '-'}
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>

          {/* Your Rank */}
          <div className="mt-4 p-4 bg-green-500/20 border-2 border-green-400 rounded-xl text-center">
            <span className="text-white/80">{t("piglife.yourRank")}: </span>
            <span className="text-green-400 text-2xl font-bold">#{playerRank || '--'}</span>
            <span className="text-white/80 ml-4">{t("piglife.score")}: </span>
            <span className="text-green-400 text-2xl font-bold">
              {gameState ? calculateScore(gameState).toLocaleString() : '0'}
            </span>
          </div>
          
          {/* Rewards Button */}
          <div className="mt-4">
            <button
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              onClick={() => setShowRewardModal(true)}
            >
              <Trophy className="w-5 h-5" />
              {t("piglife.rewards")} {playerRank > 0 && playerRank <= 5 && SEASON_PRIZES[playerRank] 
                ? `(${SEASON_PRIZES[playerRank]} SUI)` 
                : playerRank > 0 && playerRank <= 10 ? '(-)' : ''}
            </button>
          </div>
        </div>
        
        {/* Reward History Modal */}
        {showRewardModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-8 h-8" />
                    {t("piglife.rewardHistory")}
                  </h2>
                  <button
                    onClick={() => setShowRewardModal(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {rewardHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {t("piglife.noRewardData")}
                    </h3>
                    <p className="text-gray-600">
                      {t("piglife.noRewardDataDesc")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rewardHistory.map((reward) => (
                      <div
                        key={reward.id}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">
                                {reward.rank === 1 ? '🥇' : reward.rank === 2 ? '🥈' : reward.rank === 3 ? '🥉' : `#${reward.rank}`}
                              </span>
                              <span className="text-lg font-bold text-gray-900">
                                {t("piglife.season")} {reward.seasonNumber} - {t("piglife.rank")} {reward.rank}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-700">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{t("piglife.amount")}:</span>
                                <span className="text-green-600 font-bold text-lg">{reward.amount} SUI</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{t("piglife.date")}:</span>
                                <span>{reward.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{t("piglife.wallet")}:</span>
                                <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                                  {reward.walletAddress.slice(0, 6)}...{reward.walletAddress.slice(-4)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">
                              +{reward.amount}
                            </div>
                            <div className="text-xs text-gray-500">SUI</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Invitations Panel */}
        {account?.address && invitations.length > 0 && (
          <div className="mb-8">
            <InvitationsPanel
              invitations={invitations}
              currentAddress={account.address}
              onAccept={acceptInvitation}
              onReject={rejectInvitation}
            />
          </div>
        )}

        {/* Invite Modal */}
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSendInvite={sendInvitation}
          currentAddress={account?.address}
        />

        {/* Username Modal */}
        {showUsernameModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <h2 className="text-2xl font-bold text-white text-center">
                  {t("piglife.enterUsername")}
                </h2>
                <p className="text-white/80 text-sm text-center mt-2">
                  {t("piglife.usernameForSeason")} {seasonNumber}
                </p>
              </div>
              
              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    {t("piglife.username")}
                  </label>
                  <input
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveUsername();
                      }
                    }}
                    placeholder={t("piglife.usernamePlaceholder")}
                    maxLength={20}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    {t("piglife.usernameHint")}
                  </p>
                  <p className="text-orange-600 text-xs mt-1 font-semibold">
                    ⚠️ Tên không được trùng với người chơi khác trong mùa giải này!
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowUsernameModal(false);
                      setTempUsername("");
                      setPendingAction(null);
                    }}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
                  >
                    {t("piglife.cancel")}
                  </button>
                  <button
                    onClick={handleSaveUsername}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    {t("piglife.save")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recovery Modal - Double-click "PigLife" title to open */}
        {showRecoveryModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                <h2 className="text-2xl font-bold text-white text-center">
                  🔧 Công Cụ Khôi Phục Dữ Liệu
                </h2>
                <p className="text-white/80 text-sm text-center mt-2">
                  Khôi phục cây và gỗ bị mất do bug
                </p>
              </div>
              
              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ <strong>Lưu ý:</strong> Chỉ sử dụng để khôi phục dữ liệu bị mất do bug. 
                    Công thức: <strong>65 cây = 325 gỗ</strong> (5 gỗ/cây)
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    🪵 Số gỗ cần khôi phục
                  </label>
                  <input
                    type="number"
                    value={recoveryWood}
                    onChange={(e) => setRecoveryWood(e.target.value)}
                    placeholder="Ví dụ: 325"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Gỗ hiện tại: {gameState?.wood_count || 0}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    🌳 Số cây cần khôi phục
                  </label>
                  <input
                    type="number"
                    value={recoveryTrees}
                    onChange={(e) => setRecoveryTrees(e.target.value)}
                    placeholder="Ví dụ: 65"
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Cây hiện tại: {gameState?.trees_count || 0}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRecoveryModal(false);
                      setRecoveryWood("");
                      setRecoveryTrees("");
                    }}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleRecoveryRestore}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    ✅ Khôi Phục
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Connect Wallet Modal */}
        <ConnectWalletModal
          isOpen={showConnectWallet}
          onClose={() => {
            setShowConnectWallet(false);
            setPendingAction(null);
          }}
        />

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<Sparkles className="w-6 h-6" />}
            label={t("piglife.socialCapital")}
            value={gameState.social_capital}
            color="purple"
          />
          <StatCard
            icon={<PiggyBank className="w-6 h-6" />}
            label={t("piglife.lifeToken")}
            value={`${gameState.life_token} LT`}
            color="pink"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            label={t("piglife.suiBalance")}
            value={`${formatSUI(gameState.sui_balance)} SUI`}
            color="blue"
          />
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            label={`${t("piglife.streak")} ${t("piglife.days")}`}
            value={`${gameState.streak_days} 🔥`}
            color="orange"
          />
          <StatCard
            icon={<Sparkles className="w-6 h-6" />}
            label={t("piglife.totalScore")}
            value={`${gameState.total_score} 🎯`}
            color="green"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           {/* Pig Section */}
           <GameCard title={`🐷 ${t("piglife.yourPig")}`} color="pink">
             <div className="text-center py-8">
               <div className="text-8xl mb-4 animate-float">🐖</div>
               <div className="text-2xl font-bold mb-2 text-gray-900">
                 {t("piglife.level")} {gameState.pig_level}
               </div>
               <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                 <div
                   className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all"
                   style={{ width: `${(gameState.pig_exp / 100) * 100}%` }}
                 />
               </div>
               <button
                 onClick={() =>
                   handleAction(
                     () => feedPig(gameId!),
                     "Feed Pig",
                     "🐷 Pig fed! +5 LT",
                     "feed",
                     `Fed pig at level ${gameState.pig_level}. Gained 5 LT`,
                     "🐷"
                   )
                 }
                 disabled={
                   loading ||
                   isPending ||
                   gameState.social_capital < 10 ||
                   feedCooldown !== "Ready!"
                 }
                 className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 🌾 {t("piglife.raisePig")} (Cost: 10 SC)
               </button>
              <p className="text-gray-600 mt-3">
                {t("piglife.nextFeed")}: <span className="font-bold text-gray-900">{feedCooldown === "Ready!" ? t("piglife.feedReady") : feedCooldown}</span>
              </p>
             </div>
             
             {/* Feed History */}
             <div className="mt-4 border-t-2 border-pink-200 pt-4">
               <button
                 onClick={() => setShowFeedHistory(!showFeedHistory)}
                 className="w-full flex items-center justify-between px-4 py-2 bg-pink-50 hover:bg-pink-100 rounded-lg transition-all"
               >
                 <span className="flex items-center gap-2 text-pink-700 font-semibold">
                   <History className="w-4 h-4" />
                   {t("piglife.feedHistory")} ({feedHistory.length})
                 </span>
                 {showFeedHistory ? <ChevronUp className="w-4 h-4 text-pink-700" /> : <ChevronDown className="w-4 h-4 text-pink-700" />}
               </button>
               
               {showFeedHistory && (
                 <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                   {feedHistory.length === 0 ? (
                     <p className="text-gray-500 text-sm text-center py-4">{t("piglife.noHistory")}</p>
                   ) : (
                     feedHistory.map((entry) => (
                       <div key={entry.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                         <div className="flex items-start gap-2">
                           <span className="text-xl">{entry.icon}</span>
                           <div className="flex-1">
                             <div className="text-sm font-semibold text-gray-900">{entry.action}</div>
                             <div className="text-xs text-gray-600">{entry.details}</div>
                             <div className="text-xs text-gray-400 mt-1">{formatTimeAgo(entry.timestamp)}</div>
                           </div>
                         </div>
                       </div>
                     ))
                   )}
                 </div>
               )}
             </div>
           </GameCard>

          {/* Social Actions */}
          <GameCard title={`🌐 ${t("piglife.socialActions")}`} color="blue">
            {/* Quota System Info - Only show if has remaining quota */}
            {(remainingPostQuota > 0 || remainingShareQuota > 0) && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>🎮 Hệ thống chống spam:</strong> Số lượt được tính dựa trên hoạt động thực của bạn trên blockchain.
                  <br />• <strong>Tạo Bài:</strong> {remainingPostQuota}/{availablePostQuota} lượt (tạo chiến dịch mới để nhận thêm)
                  <br />• <strong>Share:</strong> {remainingShareQuota}/{availableShareQuota} lượt (chia sẻ cho bạn bè để nhận thêm)
                </p>
              </div>
            )}
            
            {/* Warning when no quota */}
            {remainingPostQuota === 0 && remainingShareQuota === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ Đã hết lượt!</strong> Bạn đã sử dụng hết lượt chơi.
                  <br />🎯 <strong>Cách nhận thêm lượt:</strong>
                  <br />• Tạo chiến dịch mới trên trang <strong>Khám phá</strong>
                  <br />• Chia sẻ chiến dịch cho bạn bè trên trang <strong>Dự án của tôi</strong>
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <SocialButton
                icon={<Edit3 />}
                label={remainingPostQuota > 0 ? `${t("piglife.createPost")} (${remainingPostQuota}/${availablePostQuota})` : t("piglife.createPost")}
                reward="+50 SC"
                onClick={() =>
                  handleAction(
                    () => createPost(gameId!),
                    "Create Post",
                    "✍️ Post created! +50 SC",
                    "social",
                    "Created a new post and earned 50 SC",
                    "✍️"
                  )
                }
                disabled={loading || isPending || !account || remainingPostQuota <= 0}
              />
              <SocialButton
                icon={<Calendar />}
                label={checkinCooldown === "Ready!" ? t("piglife.dailyCheckin") : `${t("piglife.cooldown")}: ${checkinCooldown}`}
                reward="+20 SC"
                onClick={() =>
                  handleAction(
                    () => dailyCheckin(gameId!),
                    "Daily Check-in",
                    "📅 Checked in! +20 SC",
                    "social",
                    "Completed daily check-in and earned 20 SC",
                    "📅"
                  )
                }
                disabled={loading || isPending || checkinCooldown !== "Ready!"}
              />
              <SocialButton
                icon={<Share2 />}
                label={remainingShareQuota > 0 ? `${t("piglife.share")} (${remainingShareQuota}/${availableShareQuota})` : t("piglife.share")}
                reward="+30 SC"
                onClick={() =>
                  handleAction(
                    () => shareContent(gameId!),
                    "Share Content",
                    "🔄 Shared! +30 SC",
                    "social",
                    "Shared content and earned 30 SC",
                    "🔄"
                  )
                }
                disabled={loading || isPending || !account || remainingShareQuota <= 0}
              />
              <SocialButton
                icon={<UserPlus />}
                label={inviteCooldown === "Ready!" ? t("piglife.invite") : `${t("piglife.cooldown")}: ${inviteCooldown}`}
                reward="+100 SC"
                onClick={() => {
                  if (!account) {
                    setShowConnectWallet(true);
                    return;
                  }
                  // Open invite modal directly (bypass username check)
                  inviteFriend(gameId!).catch((err) => {
                    showNotif(err.message || "Có lỗi xảy ra");
                  });
                }}
                disabled={loading || isPending || !account || inviteCooldown !== "Ready!"}
              />
            </div>

             {/* Social History */}
             <div className="mt-4 border-t-2 border-blue-200 pt-4">
               <button
                 onClick={() => setShowSocialHistory(!showSocialHistory)}
                 className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
               >
                 <span className="flex items-center gap-2 text-blue-700 font-semibold">
                   <History className="w-4 h-4" />
                   {t("piglife.socialHistory")} ({socialHistory.length})
                 </span>
                 {showSocialHistory ? <ChevronUp className="w-4 h-4 text-blue-700" /> : <ChevronDown className="w-4 h-4 text-blue-700" />}
               </button>
               
               {showSocialHistory && (
                 <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                   {socialHistory.length === 0 ? (
                     <p className="text-gray-500 text-sm text-center py-4">{t("piglife.noHistory")}</p>
                   ) : (
                     socialHistory.map((entry) => (
                       <div key={entry.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                         <div className="flex items-start gap-2">
                           <span className="text-xl">{entry.icon}</span>
                           <div className="flex-1">
                             <div className="text-sm font-semibold text-gray-900">{entry.action}</div>
                             <div className="text-xs text-gray-600">{entry.details}</div>
                             <div className="text-xs text-gray-400 mt-1">{formatTimeAgo(entry.timestamp)}</div>
                           </div>
                         </div>
                       </div>
                     ))
                   )}
                 </div>
               )}
             </div>
          </GameCard>

          {/* Farming Section */}
          <GameCard title={`🌾 ${t("piglife.farmManagement")}`} color="green">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    handleAction(
                      () => buySeed(gameId!),
                      "Buy Seed",
                      "🌱 Seed bought!",
                      "farm",
                      "Purchased seeds for 10 LT",
                      "🌱"
                    )
                  }
                  disabled={loading || isPending || gameState.life_token < 10}
                  className="py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50"
                >
                  🌱 {t("piglife.seeds")} (10 LT)
                </button>
                <button
                  onClick={() => {
                    // Calculate trees AFTER planting for correct history display
                    const totalTreesAfter = (gameState.trees_count || 0) + 1;
                    handleAction(
                      () => plantTree(gameId!),
                      "Plant Tree",
                      "🪴 Tree planted!",
                      "farm",
                      `Planted a tree. Total trees: ${totalTreesAfter}`,
                      "🪴"
                    );
                  }}
                  disabled={loading || isPending || gameState.seeds === 0}
                  className="py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  🪴 {t("piglife.plantTree")}
                </button>
              </div>

               <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                 <div className="flex justify-between text-gray-900 mb-2 font-semibold">
                   <span>🌱 {t("piglife.seeds")}: {gameState.seeds}</span>
                   <span>🌳 {t("piglife.trees")}: {gameState.trees_count}</span>
                 </div>
                 <div className="flex justify-between text-gray-900 font-semibold">
                   <span>🪵 {t("piglife.wood")}: {gameState.wood_count}</span>
                 </div>
               </div>

              <button
                onClick={() => {
                  // FIX: Calculate wood AFTER harvest for correct history display
                  const woodGained = gameState.trees_count * 5; // 5 wood per tree
                  const totalWoodAfter = (gameState.wood_count || 0) + woodGained;
                  handleAction(
                    () => harvestWood(gameId!),
                    "Harvest Wood",
                    `🪵 +${woodGained} wood harvested!`,
                    "farm",
                    `Harvested wood from ${gameState.trees_count} trees. Total wood: ${totalWoodAfter}`,
                    "🪵"
                  );
                }}
                disabled={loading || isPending || gameState.trees_count === 0}
                className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-all disabled:opacity-50"
              >
                🪵 {t("piglife.harvestWood")}
              </button>
              
              {/* Recovery Tool Button */}
              <button
                onClick={() => setShowRecoveryModal(true)}
                className="w-full py-2 bg-orange-100 text-orange-700 font-semibold rounded-lg hover:bg-orange-200 transition-all border-2 border-orange-300 text-sm"
              >
                🔧 Khôi Phục Dữ Liệu (Nếu Bị Mất)
              </button>
            </div>
            
            {/* Farm History */}
            <div className="mt-4 border-t-2 border-green-200 pt-4">
              <button
                onClick={() => setShowFarmHistory(!showFarmHistory)}
                className="w-full flex items-center justify-between px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-all"
              >
                <span className="flex items-center gap-2 text-green-700 font-semibold">
                  <History className="w-4 h-4" />
                  {t("piglife.farmHistory")} ({farmHistory.length})
                </span>
                {showFarmHistory ? <ChevronUp className="w-4 h-4 text-green-700" /> : <ChevronDown className="w-4 h-4 text-green-700" />}
              </button>
              
              {showFarmHistory && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {farmHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">{t("piglife.noHistory")}</p>
                  ) : (
                    farmHistory.map((entry) => (
                      <div key={entry.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-2">
                          <span className="text-xl">{entry.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{entry.action}</div>
                            <div className="text-xs text-gray-600">{entry.details}</div>
                            <div className="text-xs text-gray-400 mt-1">{formatTimeAgo(entry.timestamp)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </GameCard>

          {/* Building Section */}
          <GameCard title={`🏗️ ${t("piglife.materialsBuilding")}`} color="orange">
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-300">
                   <div className="text-4xl mb-2">🪵</div>
                   <div className="text-gray-900 font-bold text-xl">
                     {gameState.wood_count}
                   </div>
                   <div className="text-gray-600 text-sm">{t("piglife.wood")} {t("piglife.pcs")}</div>
                  <button
                    onClick={() => {
                      setShowDonateQuizModal(true);
                    }}
                    disabled={loading || isPending || !gameState}
                    className="mt-2 w-full py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("piglife.donate", { amount: "1" })}
                  </button>
                 </div>

                 <div className="bg-gray-100 p-4 rounded-lg text-center border border-gray-300">
                   <div className="text-4xl mb-2">🏠</div>
                   <div className="text-gray-900 font-bold text-xl">
                     {t("piglife.level")} {gameState.house_level}
                   </div>
                   <div className="text-gray-600 text-sm">{t("piglife.houseLevel")}</div>
                   {gameState.is_ceo && (
                     <div className="mt-2 text-yellow-500 font-bold animate-pulse">
                       🎖️ CEO
                     </div>
                   )}
                 </div>
               </div>

              <button
                onClick={() =>
                  handleAction(
                    () => buildHouse(gameId!, "LEADERBOARD_ID_HERE"),
                    "Build House",
                    "🏠 House built!",
                    "build",
                    `Built a house! House level now: ${gameState.house_level + 1}`,
                    "🏠"
                  )
                }
                disabled={loading || isPending || gameState.wood_count < 10}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                🏗️ {t("piglife.buildHouseCost", { cost: "10" })}
              </button>

              {gameState.wood_count > 0 && (
                <button
                  onClick={() => {
                    const amount = prompt(`Sell how much wood? (Max: ${gameState.wood_count})`);
                    if (amount && parseInt(amount) > 0) {
                      handleAction(
                        () => sellWood(gameId!, parseInt(amount)),
                        "Sell Wood",
                        `💰 Sold ${amount} wood!`,
                        "build",
                        `Sold ${amount} wood for ${parseInt(amount) * 0.5} SUI`,
                        "💰"
                      );
                    }
                  }}
                  disabled={loading || isPending}
                  className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
                >
                  💰 Sell Wood (0.5 SUI each)
                </button>
              )}
            </div>
            
            {/* Build History */}
            <div className="mt-4 border-t-2 border-orange-200 pt-4">
              <button
                onClick={() => setShowBuildHistory(!showBuildHistory)}
                className="w-full flex items-center justify-between px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all"
              >
                <span className="flex items-center gap-2 text-orange-700 font-semibold">
                  <History className="w-4 h-4" />
                  {t("piglife.buildHistory")} ({buildHistory.length})
                </span>
                {showBuildHistory ? <ChevronUp className="w-4 h-4 text-orange-700" /> : <ChevronDown className="w-4 h-4 text-orange-700" />}
              </button>
              
              {showBuildHistory && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {buildHistory.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">{t("piglife.noHistory")}</p>
                  ) : (
                    buildHistory.map((entry) => (
                      <div key={entry.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start gap-2">
                          <span className="text-xl">{entry.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{entry.action}</div>
                            <div className="text-xs text-gray-600">{entry.details}</div>
                            <div className="text-xs text-gray-400 mt-1">{formatTimeAgo(entry.timestamp)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </GameCard>
        </div>


        {/* Game Guide */}
        <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block px-6 py-2 bg-green-100 border-2 border-green-500 rounded-full text-green-700 font-bold mb-4">
              🎮 DÀNH CHO NGƯỜI CHƠI GAME
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Hướng dẫn chơi game
            </h2>
            <p className="text-xl text-gray-600">
              Xây dựng ước mơ từ nuôi heo đến xây nhà hiện đại
            </p>
          </div>
          
          {/* Game Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-pink-100 to-pink-50 border-2 border-pink-400 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">1</div>
                <div className="text-5xl">🐷</div>
              </div>
              <h3 className="text-xl font-bold text-pink-600 mb-2">Nuôi heo</h3>
              <p className="text-gray-700">
                Bắt đầu hành trình bằng việc nuôi heo. Kiếm tiền để mở rộng trang trại
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-400 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">2</div>
                <div className="text-5xl">🌱</div>
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-2">Trồng cây</h3>
              <p className="text-gray-700">
                Mua hạt giống và trồng cây. Chờ cây lớn lên để thu hoạch
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-400 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">3</div>
                <div className="text-5xl">🪵</div>
              </div>
              <h3 className="text-xl font-bold text-blue-600 mb-2">Thu hoạch gỗ</h3>
              <p className="text-gray-700">
                Thu hoạch cây để lấy gỗ phục vụ cho việc xây dựng nhà cửa
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">4</div>
                <div className="text-5xl">🏚️</div>
              </div>
              <h3 className="text-xl font-bold text-yellow-600 mb-2">Xây nhà thô sơ</h3>
              <p className="text-gray-700">
                Sử dụng gỗ để xây ngôi nhà thô sơ đầu tiên của bạn
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-purple-50 border-2 border-purple-400 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">5</div>
                <div className="text-5xl">💰</div>
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-2">Bán gỗ</h3>
              <p className="text-gray-700">
                Bán gỗ dư thừa để kiếm tiền mua gạch và vật liệu tốt hơn
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-400 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">6</div>
                <div className="text-5xl">🏗️</div>
              </div>
              <h3 className="text-xl font-bold text-orange-600 mb-2">Xây nhà hiện đại</h3>
              <p className="text-gray-700">
                Mua gạch và nâng cấp thành nhà hiện đại. Hoàn thành ước mơ!
              </p>
            </div>
          </div>

          {/* Progress Flow */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 rounded-xl p-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🎯 Lộ trình phát triển
            </h3>
            <div className="flex items-center justify-center gap-3 flex-wrap text-5xl mb-4">
              <span>🐷</span>
              <span className="text-green-500 text-3xl">→</span>
              <span>🌱</span>
              <span className="text-green-500 text-3xl">→</span>
              <span>🪵</span>
              <span className="text-green-500 text-3xl">→</span>
              <span>🏚️</span>
              <span className="text-green-500 text-3xl">→</span>
              <span>💰</span>
              <span className="text-green-500 text-3xl">→</span>
              <span>🏗️</span>
            </div>
            <p className="text-xl text-gray-700 font-medium">
              Từ nuôi heo đến xây nhà mơ ước
            </p>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl text-center">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-800 font-medium text-lg">
              {t("piglife.gameGoal")}
            </p>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {(loading || isPending) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            <p className="text-gray-700 font-semibold">Processing transaction...</p>
          </div>
        </div>
      )}

      {/* Quiz Modal for Donate */}
      <DonateWithQuizModal
        isOpen={showDonateQuizModal}
        onClose={() => setShowDonateQuizModal(false)}
        onSuccess={() => {
          // After passing quiz, donate for wood
          // Check SUI balance before donating
          if (gameState && gameState.sui_balance >= 1_000_000_000) {
            handleAction(
              () => donateForWood(gameId!),
              "Donate for Wood",
              "🎁 Thank you! +5 Wood",
              "build",
              "Donated 1 SUI and received 5 Wood",
              "🎁"
            );
          } else {
            alert("⚠️ Bạn không đủ SUI để donate! Cần ít nhất 1 SUI.");
          }
          setShowDonateQuizModal(false);
        }}
        campaignId={gameId || ""}
        campaignName="Mua gỗ"
        userWoodCount={gameState?.wood_count || 0}
        onAttemptUsed={() => {
          // User failed quiz, deduct 1 wood
          if (gameState && gameState.wood_count > 0) {
            setGameState({
              ...gameState,
              wood_count: gameState.wood_count - 1
            });
          }
        }}
      />
    </div>
  );
}

// Helper Components

function StatCard({ icon, label, value, color }: any) {
  const colors = {
    purple: "from-purple-500 to-purple-600",
    pink: "from-pink-500 to-pink-600",
    blue: "from-blue-500 to-blue-600",
    orange: "from-orange-500 to-orange-600",
    green: "from-green-500 to-green-600",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl shadow-lg p-4 text-white`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-xs opacity-90">{label}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function GameCard({ title, color, children }: any) {
  const colors = {
    pink: "border-pink-400",
    blue: "border-blue-400",
    green: "border-green-400",
    orange: "border-orange-400",
  };

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-2 ${colors[color]}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function SocialButton({ icon, label, reward, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 p-4 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="text-gray-900 text-2xl">{icon}</div>
      <div className="text-gray-900 font-semibold text-sm">{label}</div>
      <div className="text-green-600 font-bold text-xs">{reward}</div>
    </button>
  );
}

function GameStep({ number, icon, title, description, color }: any) {
  const colors = {
    pink: "bg-pink-500",
    green: "bg-green-500",
    orange: "bg-orange-500",
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className={`w-10 h-10 ${colors[color]} rounded-full flex items-center justify-center text-white font-bold`}>
          {number}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// CSS for animations
const styles = `
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes slide-in-right {
  from { transform: translateX(400px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}


