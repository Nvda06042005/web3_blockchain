// Contract addresses deployed on Sui Testnet
export const PACKAGE_ID = "0x07897bdfa92bd6c147ed99b84069c088b04a74ffff960c199dec8705f23b9e51"; // Package cũ (platform, project, campaign, supporter_nft)
export const SHARE_PACKAGE_ID = "0xc25a12fb4af7c8741a677d5925852ec175b3191a2dca0d54f3dd194b40c0db5f"; // Package mới (share) - ĐÃ DEPLOY
export const GAME_PACKAGE_ID = "0x400c3784eecab267f0ba2a92c27c8d36d55e839426f490717800aa2d7011fa3a"; // Package pig_farming - ĐÃ DEPLOY
export const PLATFORM_ID = "0xb76f9697bd8896af62f1b2b06756e73c9fe6ea7aa80bd7fb65e2454d1494275c";
export const ADMIN_CAP_ID = "0xc2bd45db9558956c1f928668e58d2f78c7b48090b162fd411e521bc252e6a727";

// System objects
export const CLOCK_ID = "0x6"; // Sui Clock object

// Module names
export const MODULES = {
  PLATFORM: "platform",
  PROJECT: "project", 
  CAMPAIGN: "campaign",
  SUPPORTER_NFT: "supporter_nft",
  SHARE: "share",
  PIG_FARMING: "pig_farming",
} as const;

// Network configuration
export const NETWORK = "testnet";

// Fee configuration (in basis points, 1 BPS = 0.01%)
export const FEES = {
  DEPOSIT_BPS: 75,  // 0.75%
  WITHDRAW_BPS: 75, // 0.75%
  TOTAL_PERCENT: 1.5, // 1.5% total
};

// Time constants
export const TIME = {
  MIN_CAMPAIGN_DURATION_MS: 86400000, // 1 day
  MAX_EXTENSIONS: 2,
  EXTENSION_THRESHOLD_PERCENT: 50, // 50%
};

// MIST to SUI conversion
export const MIST_PER_SUI = 1_000_000_000;

export const formatSUI = (mist: bigint | number | string): string => {
  const value = typeof mist === "string" ? BigInt(mist) : BigInt(mist);
  const sui = Number(value) / MIST_PER_SUI;
  return sui.toLocaleString(undefined, { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 4 
  });
};

export const parseSUItoMIST = (sui: number | string): bigint => {
  const value = typeof sui === "string" ? parseFloat(sui) : sui;
  return BigInt(Math.floor(value * MIST_PER_SUI));
};
