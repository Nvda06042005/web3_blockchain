import { useSuiClientQuery } from "@mysten/dapp-kit";
import { PACKAGE_ID, PLATFORM_ID, MODULES } from "../constants";
import type { Campaign, Project } from "../types";

// Fetch Platform data
export function usePlatform() {
  return useSuiClientQuery("getObject", {
    id: PLATFORM_ID,
    options: {
      showContent: true,
    },
  });
}

// Fetch all campaigns (by querying owned objects or events)
export function useCampaigns() {
  return useSuiClientQuery("queryEvents", {
    query: {
      MoveEventType: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::CampaignCreated`,
    },
    limit: 50,
  });
}

// Fetch single campaign
export function useCampaign(campaignId: string | undefined) {
  return useSuiClientQuery(
    "getObject",
    {
      id: campaignId!,
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!campaignId,
    }
  );
}

// Fetch user's projects
export function useUserProjects(address: string | undefined) {
  return useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: address!,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULES.PROJECT}::Project`,
      },
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!address,
    }
  );
}

// Fetch user's NFTs
export function useUserNFTs(address: string | undefined) {
  return useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: address!,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULES.SUPPORTER_NFT}::SupporterNFT`,
      },
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!address,
    }
  );
}

// Parse campaign data from Sui object
export function parseCampaignData(data: any): Campaign | null {
  if (!data?.content?.fields) return null;
  
  const fields = data.content.fields;
  
  // Map smart contract field names to our type
  // Contract uses: target_amount, backer_count, owner, status
  const status = Number(fields.status || 0);
  const targetAmount = fields.target_amount || "0";
  const currentAmount = fields.current_amount || "0";
  const isFunded = BigInt(currentAmount) >= BigInt(targetAmount);
  
  return {
    id: data.objectId,
    project_id: fields.project_id,
    creator: fields.owner, // Contract uses 'owner'
    name: fields.name,
    description: fields.description,
    image_url: fields.image_url,
    category: fields.category || "other", // Category field, defaults to 'other'
    goal_amount: targetAmount, // Contract uses 'target_amount'
    current_amount: currentAmount,
    start_time: fields.start_time,
    end_time: fields.end_time,
    is_active: status === 0, // 0 = ACTIVE, 1 = ENDED, 2 = WITHDRAWN
    is_funded: isFunded,
    is_withdrawn: status === 2, // 2 = WITHDRAWN
    status: status,
    extensions_used: Number(fields.extensions_used || 0),
    total_supporters: fields.backer_count || "0", // Contract uses 'backer_count'
    balance: fields.balance || "0", // Current balance in campaign
    tiers: fields.tiers?.map((t: any) => {
      const tierFields = t.fields || t;
      return {
        id: String(tierFields.id),
        name: tierFields.name || "",
        description: tierFields.description || "",
        min_amount: tierFields.min_amount || "0",
        max_supporters: tierFields.max_backers || "0", // Contract uses 'max_backers'
        current_supporters: tierFields.current_backers || "0", // Contract uses 'current_backers'
        benefits: [],
        image_url: tierFields.nft_image_url || "", // Contract uses 'nft_image_url'
      };
    }) || [],
    transaction_history: fields.transactions?.map((tx: any) => {
      const txFields = tx.fields || tx;
      return {
        tx_type: txFields.tx_type === 0 ? "deposit" : "withdraw",
        amount: txFields.amount || "0",
        fee: txFields.fee || "0",
        timestamp: txFields.timestamp || "0",
        actor: txFields.from || "",
      };
    }) || [],
  };
}

// Parse project data from Sui object
export function parseProjectData(data: any): Project | null {
  if (!data?.content?.fields) return null;
  
  const fields = data.content.fields;
  
  return {
    id: data.objectId,
    owner: fields.owner,
    name: fields.name,
    description: fields.description,
    image_url: fields.image_url,
    website: fields.website,
    social_links: fields.social_links?.fields?.contents || {},
    campaign_ids: fields.campaign_ids || [],
    created_at: fields.created_at,
  };
}
