import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID, SHARE_PACKAGE_ID, PLATFORM_ID, MODULES, parseSUItoMIST, CLOCK_ID } from "../constants";
import type { CreateProjectForm, CreateCampaignForm, AddTierForm } from "../types";

export function useContractCalls() {
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();

  // ============ PROJECT FUNCTIONS ============
  
  const createProject = async (form: CreateProjectForm) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULES.PROJECT}::create_and_transfer_project`,
      arguments: [
        tx.object(PLATFORM_ID),
        tx.pure.string(form.name),
        tx.pure.string(form.description),
        tx.pure.string(form.image_url),
        tx.pure.string(form.website),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  const updateProject = async (
    projectId: string,
    name: string,
    description: string,
    imageUrl: string,
    website: string
  ) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULES.PROJECT}::update_project`,
      arguments: [
        tx.object(projectId),
        tx.pure.string(name),
        tx.pure.string(description),
        tx.pure.string(imageUrl),
        tx.pure.string(website),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // ============ CAMPAIGN FUNCTIONS ============

  const createCampaign = async (form: CreateCampaignForm) => {
    const tx = new Transaction();
    const goalMist = parseSUItoMIST(form.goal_amount);
    const durationMs = form.duration_days * 24 * 60 * 60 * 1000;
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::create_campaign`,
      arguments: [
        tx.object(PLATFORM_ID),
        tx.object(form.project_id),
        tx.pure.string(form.name),
        tx.pure.string(form.description),
        tx.pure.string(form.image_url),
        tx.pure.string(form.category),
        tx.pure.u64(goalMist),
        tx.pure.u64(durationMs),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  const addTier = async (campaignId: string, form: AddTierForm) => {
    const tx = new Transaction();
    const minAmountMist = parseSUItoMIST(form.min_amount);
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::add_tier`,
      arguments: [
        tx.object(campaignId),
        tx.pure.string(form.name),
        tx.pure.string(form.description),
        tx.pure.u64(minAmountMist),
        tx.pure.u64(BigInt(form.max_supporters)),
        tx.pure.vector("string", form.benefits),
        tx.pure.string(form.image_url),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  const donate = async (
    campaignId: string,
    amount: string,
    message: string
  ) => {
    const tx = new Transaction();
    const amountMist = parseSUItoMIST(amount);
    
    // Split coin for payment
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountMist)]);
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::donate`,
      arguments: [
        tx.object(PLATFORM_ID),
        tx.object(campaignId),
        coin,
        tx.pure.string(message),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  const donateWithTier = async (
    campaignId: string,
    tierId: string,
    amount: string,
    message: string
  ) => {
    const tx = new Transaction();
    const amountMist = parseSUItoMIST(amount);
    
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountMist)]);
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::donate_with_tier`,
      arguments: [
        tx.object(PLATFORM_ID),
        tx.object(campaignId),
        coin,
        tx.pure.u8(Number(tierId)),
        tx.pure.string(message),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  const extendCampaign = async (campaignId: string, additionalDays: number) => {
    const tx = new Transaction();
    const additionalMs = additionalDays * 24 * 60 * 60 * 1000;
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::extend_campaign`,
      arguments: [
        tx.object(campaignId),
        tx.pure.u64(additionalMs),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  const endCampaign = async (campaignId: string) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::end_campaign`,
      arguments: [
        tx.object(campaignId),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  const withdrawFunds = async (campaignId: string) => {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::withdraw_funds`,
      arguments: [
        tx.object(PLATFORM_ID),
        tx.object(campaignId),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  // ============ SHARE FUNCTIONS ============

  const shareItem = async (
    itemId: string,
    itemType: "project" | "campaign",
    recipientAddress: string
  ) => {
    const tx = new Transaction();
    
    // Share module is in a separate package
    tx.moveCall({
      target: `${SHARE_PACKAGE_ID}::${MODULES.SHARE}::share_item`,
      arguments: [
        tx.object(itemId),
        tx.pure.string(itemType),
        tx.pure.address(recipientAddress),
        tx.object(CLOCK_ID),
      ],
    });

    return signAndExecute({ transaction: tx });
  };

  return {
    // Project
    createProject,
    updateProject,
    // Campaign
    createCampaign,
    addTier,
    donate,
    donateWithTier,
    extendCampaign,
    endCampaign,
    withdrawFunds,
    // Share
    shareItem,
    // State
    isPending,
    suiClient,
  };
}
