import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { FolderKanban, Loader2, Wallet, Share2, Users, Bell, Gift, ExternalLink } from "lucide-react";
import { CampaignCard } from "../components/campaign/CampaignCard";
import { ShareModal } from "../components/common";
import { PACKAGE_ID, SHARE_PACKAGE_ID, MODULES } from "../constants";
import { parseProjectData, parseCampaignData, useDocumentTitle } from "../hooks";
import { useLanguage } from "../contexts";
import type { Project, Campaign } from "../types";

export function MyProjectsPage() {
  const account = useCurrentAccount();
  const { t } = useLanguage();
  const [showShareModal, setShowShareModal] = useState(false);

  // Set page title
  useDocumentTitle(t("nav.myProjects"));

  // Fetch user's projects
  const { data: projectsData, isLoading: loadingProjects } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULES.PROJECT}::Project`,
      },
      options: { showContent: true },
    },
    { enabled: !!account?.address }
  );

  // Parse projects
  const projects: Project[] = projectsData?.data
    ?.map((obj: any) => parseProjectData(obj.data))
    .filter((p): p is Project => p !== null) || [];

  // Fetch campaigns created by this user
  const { data: eventsData, isLoading: loadingEvents } = useSuiClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::CampaignCreated`,
      },
      limit: 50,
    },
    { enabled: !!account?.address }
  );

  // Filter events by this user and get campaign IDs
  // Note: Event might use 'creator' or 'owner' field depending on contract
  const userCampaignIds = eventsData?.data
    ?.filter((event: any) => {
      const eventData = event.parsedJson;
      // Debug: Uncomment to see event structure
      // console.log('Campaign Event:', eventData);
      return eventData?.creator === account?.address || 
             eventData?.owner === account?.address;
    })
    .map((event: any) => event.parsedJson?.campaign_id)
    .filter(Boolean) || [];

  // Debug: Uncomment to see campaign IDs found
  // console.log('User campaign IDs:', userCampaignIds);

  // Fetch campaign objects
  const { data: campaignsData, isLoading: loadingCampaigns } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: userCampaignIds,
      options: { showContent: true },
    },
    { enabled: userCampaignIds.length > 0 }
  );

  const campaigns: Campaign[] = campaignsData
    ?.map((obj: any) => parseCampaignData(obj.data))
    .filter((c): c is Campaign => c !== null) || [];

  const isLoading = loadingProjects || loadingEvents || loadingCampaigns;

  // Fetch shared events from blockchain
  // Note: Events don't show in SuiScan Activity tab - they need to be queried separately
  // Auto-refresh every 5 seconds to get latest shared items
  const { data: sharedEventsData, isLoading: loadingSharedEvents, error: sharedEventsError } = useSuiClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${SHARE_PACKAGE_ID}::${MODULES.SHARE}::ItemShared`,
      },
      limit: 1000, // Tăng limit để lấy nhiều events hơn
    },
    { 
      enabled: !!account?.address,
      refetchInterval: 5000, // Tự động làm mới mỗi 5 giây
    }
  );

  // Debug: Log query status
  console.log('📡 Query Events Status:', {
    isLoading: loadingSharedEvents,
    error: sharedEventsError,
    hasData: !!sharedEventsData,
    dataLength: sharedEventsData?.data?.length || 0,
    packageId: SHARE_PACKAGE_ID,
    module: MODULES.SHARE,
    eventType: 'ItemShared',
    accountAddress: account?.address
  });

  // Filter events shared to current user and extract item info
  const sharedItems = useMemo(() => {
    if (!sharedEventsData?.data || !account?.address) return [];
    
    const currentUserAddress = account.address.toLowerCase().trim();
    
    // Debug: Log events to understand structure
    console.log('🔍 All shared events:', sharedEventsData.data);
    console.log('👤 Current user address:', currentUserAddress);
    
    const filtered = sharedEventsData.data
      .map((event: any) => {
        // Try multiple ways to access event data
        // Sui events can have data in parsedJson, bcs, or directly
        const eventData = event.parsedJson || event.bcs || event || {};
        
        // Normalize addresses for comparison - try multiple field names
        const sharedTo = eventData?.shared_to || eventData?.recipient || eventData?.to || eventData?.sharedTo;
        let sharedToNormalized = '';
        if (sharedTo) {
          // Handle both string and object addresses
          if (typeof sharedTo === 'string') {
            sharedToNormalized = sharedTo.toLowerCase().trim();
          } else if (sharedTo?.value) {
            sharedToNormalized = String(sharedTo.value).toLowerCase().trim();
          } else {
            sharedToNormalized = String(sharedTo).toLowerCase().trim();
          }
        }
        
        // Debug: Log to see what we're comparing
        if (sharedToNormalized) {
          const matches = sharedToNormalized === currentUserAddress;
          console.log('🔎 Comparing:', {
            sharedTo: sharedToNormalized,
            currentUser: currentUserAddress,
            match: matches,
            eventData: eventData
          });
        } else {
          console.log('⚠️ No shared_to found in event:', {
            event,
            eventData,
            availableKeys: Object.keys(eventData || {})
          });
        }
        
        // Extract item info with fallbacks
        // item_id might be an ID object, so try to get the string value
        let itemId = eventData?.item_id;
        if (itemId) {
          if (typeof itemId === 'object') {
            // ID object can have different structures
            itemId = itemId.id || itemId.value || itemId.address || String(itemId);
          }
          itemId = String(itemId);
        } else {
          itemId = eventData?.id ? String(eventData.id) : '';
        }
        
        const itemType = eventData?.item_type || eventData?.type || "campaign";
        const sharedBy = eventData?.shared_by || eventData?.from || eventData?.sender || eventData?.sharedBy;
        const sharedAt = eventData?.shared_at || eventData?.timestamp || event.timestampMs || event.timestamp_ms;
        
        return {
          id: itemId,
          type: (String(itemType).toLowerCase() === "project" ? "project" : "campaign") as "project" | "campaign",
          shared_by: sharedBy ? String(sharedBy) : '',
          shared_at: sharedAt ? String(sharedAt) : '',
          shared_to: sharedToNormalized,
          matches_user: sharedToNormalized === currentUserAddress,
        };
      })
      .filter((item: any) => {
        // Only keep items that match the current user AND have valid IDs
        const isValid = item.matches_user && item.id && item.id !== 'undefined' && item.id !== 'null' && item.id.length > 0;
        if (!isValid && item.matches_user) {
          console.log('❌ Filtered out invalid item:', item);
        }
        return isValid;
      })
      .map((item: any) => {
        // Remove the helper field before returning
        const { matches_user, shared_to, ...rest } = item;
        return rest;
      });
    
    // Debug: Log filtered results
    console.log('📦 Filtered shared items for user:', currentUserAddress, filtered);
    
    return filtered;
  }, [sharedEventsData, account?.address]);

  // Fetch shared projects and campaigns
  const sharedProjectIds = useMemo(() => {
    return sharedItems
      .filter(item => item.type === "project")
      .map(item => item.id)
      .filter(Boolean);
  }, [sharedItems]);

  const sharedCampaignIds = useMemo(() => {
    return sharedItems
      .filter(item => item.type === "campaign")
      .map(item => item.id)
      .filter(Boolean);
  }, [sharedItems]);

  // Fetch shared project objects
  const { data: sharedProjectsData } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: sharedProjectIds,
      options: { showContent: true },
    },
    { enabled: sharedProjectIds.length > 0 }
  );

  // Fetch shared campaign objects
  const { data: sharedCampaignsData } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: sharedCampaignIds,
      options: { showContent: true },
    },
    { enabled: sharedCampaignIds.length > 0 }
  );

  const sharedProjects: Project[] = useMemo(() => {
    if (!sharedProjectsData) return [];
    return sharedProjectsData
      .filter((obj: any) => obj.data && !obj.error) // Only process valid objects
      .map((obj: any) => parseProjectData(obj.data))
      .filter((p): p is Project => p !== null);
  }, [sharedProjectsData]);

  const sharedCampaigns: Campaign[] = useMemo(() => {
    if (!sharedCampaignsData) return [];
    return sharedCampaignsData
      .filter((obj: any) => obj.data && !obj.error) // Only process valid objects
      .map((obj: any) => parseCampaignData(obj.data))
      .filter((c): c is Campaign => c !== null);
  }, [sharedCampaignsData]);

  if (!account) {
    return (
      <div className="text-center py-20">
        <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("myProjects.connectWallet")}</h3>
        <p className="text-gray-500">
          {t("myProjects.connectWalletDesc")}
        </p>
      </div>
    );
  }

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleShareSuccess = () => {
    // Events will be automatically refetched by useSuiClientQuery
    // No manual refresh needed
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t("myProjects.title")}</h1>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {t("myProjects.share")}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Shared With Me Section - Highlighted Banner */}
          {(sharedProjects.length > 0 || sharedCampaigns.length > 0) && (
            <section className="mb-12">
              {/* Highlighted Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-5 h-5 text-emerald-600 animate-pulse" />
                      <h2 className="text-xl font-bold text-gray-900">
                        {t("myProjects.sharedItemsCount", { count: sharedProjects.length + sharedCampaigns.length })}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600">
                      {sharedProjects.length > 0 && sharedCampaigns.length > 0 
                        ? t("myProjects.sharedItemsDesc", { projects: sharedProjects.length, campaigns: sharedCampaigns.length })
                        : sharedProjects.length > 0 
                          ? t("myProjects.sharedItemsDescProjectsOnly", { count: sharedProjects.length })
                          : t("myProjects.sharedItemsDescCampaignsOnly", { count: sharedCampaigns.length })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Header */}
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {t("myProjects.sharedWithYou", { count: sharedProjects.length + sharedCampaigns.length })}
                </h2>
              </div>
              
              {sharedProjects.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">{t("myProjects.sharedProjects")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sharedProjects.map((project) => {
                      const sharedInfo = sharedItems.find(item => item.id === project.id && item.type === "project");
                      return (
                        <div
                          key={project.id}
                          className="bg-white border-2 border-emerald-200 rounded-xl p-5 hover:shadow-sm transition-shadow relative"
                        >
                          <div className="absolute top-2 right-2">
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                              {t("myProjects.sharedBadge")}
                            </span>
                          </div>
                          <div className="flex items-start space-x-4">
                            {project.image_url ? (
                              <img
                                src={project.image_url}
                                alt={project.name}
                                className="w-14 h-14 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                                <FolderKanban className="w-6 h-6 text-emerald-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {project.name}
                              </h3>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {project.description}
                              </p>
                              {sharedInfo && (
                                <div className="mt-2 flex items-center gap-2">
                                  <p className="text-xs text-emerald-600">
                                    {t("myProjects.sharedBy")} <span className="font-mono">{sharedInfo.shared_by.slice(0, 6)}...{sharedInfo.shared_by.slice(-4)}</span>
                                  </p>
                                  <a
                                    href={`https://suiscan.xyz/testnet/account/${sharedInfo.shared_by}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:text-emerald-700"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {sharedCampaigns.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-3">{t("myProjects.sharedCampaigns")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sharedCampaigns.map((campaign) => {
                      const sharedInfo = sharedItems.find(item => item.id === campaign.id && item.type === "campaign");
                      return (
                        <div key={campaign.id} className="relative group">
                          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
                              {t("myProjects.sharedBadge")}
                            </span>
                          </div>
                          <Link to={`/campaign/${campaign.id}`} className="block">
                            <CampaignCard campaign={campaign} />
                          </Link>
                          {sharedInfo && (
                            <div className="mt-2 flex items-center justify-center gap-2">
                              <p className="text-xs text-emerald-600">
                                {t("myProjects.sharedBy")} <span className="font-mono">{sharedInfo.shared_by.slice(0, 6)}...{sharedInfo.shared_by.slice(-4)}</span>
                              </p>
                              <a
                                href={`https://suiscan.xyz/testnet/account/${sharedInfo.shared_by}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Text below shared items */}
              <p className="text-xl font-semibold text-gray-700 mt-6 text-center">
                {t("myProjects.imageShared")}
              </p>
            </section>
          )}

          {/* Projects Section */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("myProjects.projectsCount")} ({projects.length})
            </h2>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <FolderKanban className="w-6 h-6 text-blue-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {project.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {project.campaign_ids?.length || 0} {t("myProjects.campaigns")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">
                  {t("myProjects.noProjectsYet")}
                </p>
              </div>
            )}
          </section>

          {/* Campaigns Section */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("myProjects.myCampaigns")} ({campaigns.length})
            </h2>
            {campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                <p className="text-gray-600">
                  {projects.length === 0
                    ? t("myProjects.createProjectFirst")
                    : t("myProjects.noCampaignsYet")}
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSuccess={handleShareSuccess}
        projects={projects}
        campaigns={campaigns}
      />
    </div>
  );
}
