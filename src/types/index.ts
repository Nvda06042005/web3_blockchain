// Project types
export interface Project {
  id: string;
  owner: string;
  name: string;
  description: string;
  image_url: string;
  website: string;
  social_links: Map<string, string> | Record<string, string>;
  campaign_ids: string[];
  created_at: string;
}

// Campaign types
export interface Tier {
  id: string;
  name: string;
  description: string;
  min_amount: string;
  max_supporters: string;
  current_supporters: string;
  benefits: string[];
  image_url: string;
}

export interface TransactionRecord {
  tx_type: "deposit" | "withdraw";
  amount: string;
  fee: string;
  timestamp: string;
  actor: string;
}

export interface Campaign {
  id: string;
  project_id: string;
  creator: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  goal_amount: string;
  current_amount: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  is_funded: boolean;
  is_withdrawn: boolean;
  status: number; // 0=ACTIVE, 1=ENDED, 2=WITHDRAWN
  extensions_used: number;
  total_supporters: string;
  balance: string;
  tiers: Tier[];
  transaction_history: TransactionRecord[];
}

// Supporter NFT types
export interface SupporterNFT {
  id: string;
  campaign_id: string;
  campaign_name: string;
  donor: string;
  amount: string;
  tier_name: string;
  image_url: string;
  donated_at: string;
  message: string;
  donation_number: string;
}

// Platform types
export interface Platform {
  id: string;
  deposit_fee_bps: number;
  withdraw_fee_bps: number;
  treasury_balance: string;
  total_campaigns: string;
  total_funded: string;
}

// UI State types
export interface CreateProjectForm {
  name: string;
  description: string;
  image_url: string;
  website: string;
}

export interface CreateCampaignForm {
  project_id: string;
  name: string;
  description: string;
  image_url: string;
  goal_amount: string;
  duration_days: number;
  category: string;
}

export interface DonateForm {
  amount: string;
  message: string;
  tier_id?: string;
}

export interface AddTierForm {
  name: string;
  description: string;
  min_amount: string;
  max_supporters: string;
  benefits: string[];
  image_url: string;
}
