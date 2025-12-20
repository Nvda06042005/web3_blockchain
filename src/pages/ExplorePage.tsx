import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { Search, Loader2, Rocket, ArrowRight, Sparkles, X, Radio } from "lucide-react";
import { CampaignCard, FeaturedProjectCard } from "../components/campaign";
import { HeroSection, CategoryFilter, FeaturedCampaign } from "../components/home";
import { CreateCampaignModal } from "../components/campaign/CreateCampaignModal";
import { ConnectWalletModal } from "../components/common";
import { PACKAGE_ID, MODULES } from "../constants";
import { parseCampaignData, parseProjectData, useDocumentTitle } from "../hooks";
import { useLanguage } from "../contexts";
import type { Campaign, Project } from "../types";

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Fetch user's projects for campaign creation
  const { data: projectsData, refetch: refetchProjects } = useSuiClientQuery(
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

  // Set page title
  useDocumentTitle(t("nav.explore"));

  // Read category from URL params
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams]);

  // Clear category filter
  const clearCategoryFilter = () => {
    setSelectedCategory(null);
    setSearchParams({});
  };

  // Fetch campaign created events to get campaign IDs
  // Auto-refresh every 5 seconds to get latest campaigns
  const { data: eventsData, isLoading: loadingEvents } = useSuiClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::CampaignCreated`,
      },
      limit: 50,
    },
    {
      refetchInterval: 5000, // Tự động làm mới mỗi 5 giây
    }
  );

  // Extract campaign IDs from events
  const campaignIds = useMemo(() => {
    if (!eventsData?.data) return [];
    return eventsData.data.map((event: any) => event.parsedJson?.campaign_id).filter(Boolean);
  }, [eventsData]);

  // Fetch all campaign objects
  // Auto-refresh to get latest campaign data (donations, supporters, etc.)
  const { data: objectsData, isLoading: loadingObjects } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: campaignIds,
      options: { showContent: true },
    },
    {
      enabled: campaignIds.length > 0,
      refetchInterval: 5000, // Tự động làm mới mỗi 5 giây
    }
  );

  // Parse campaigns
  const campaigns: Campaign[] = useMemo(() => {
    if (!objectsData) return [];
    return objectsData
      .map((obj: any) => parseCampaignData(obj.data))
      .filter((c): c is Campaign => c !== null);
  }, [objectsData]);

  // Filter campaigns based on category
  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    const now = Date.now();

    // Filter by actual campaign category (from URL param)
    if (selectedCategory) {
      result = result.filter((c) => c.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort/filter by special categories
    switch (category) {
      case "trending":
        // Xu hướng: sắp xếp theo số tiền quyên góp cao nhất
        result = result.sort((a, b) => Number(b.current_amount) - Number(a.current_amount));
        break;
      case "ending-soon":
        // Kết thúc: chỉ hiển thị campaigns đã kết thúc
        result = result
          .filter((c) => !c.is_active || Number(c.end_time) <= now)
          .sort((a, b) => Number(b.end_time) - Number(a.end_time)); // Kết thúc gần đây nhất lên đầu
        break;
      case "just-launched":
        // Lọc campaigns còn active và sắp xếp theo thời gian tạo mới nhất
        result = result
          .filter((c) => c.is_active && Number(c.end_time) > now)
          .sort((a, b) => Number(b.start_time) - Number(a.start_time)); // Mới nhất lên đầu
        break;
      case "near-goal":
        // Gần đạt mục tiêu: lọc campaigns đang active, có donation (> 0%) và chưa đạt 100%
        result = result
          .filter((c) => {
            const progress = (Number(c.current_amount) / Number(c.goal_amount)) * 100;
            const isActive = c.is_active && Number(c.end_time) > now;
            return progress > 0 && progress < 100 && isActive;
          })
          .sort((a, b) => {
            const progressA = Number(a.current_amount) / Number(a.goal_amount);
            const progressB = Number(b.current_amount) / Number(b.goal_amount);
            return progressB - progressA; // % cao nhất lên đầu
          });
        break;
      default:
        // all - show active first, then by amount
        result = result.sort((a, b) => {
          if (a.is_active !== b.is_active) return a.is_active ? -1 : 1;
          return Number(b.current_amount) - Number(a.current_amount);
        });
    }

    return result;
  }, [campaigns, search, category, selectedCategory]);

  // Get featured campaign (highest funded active campaign)
  const featuredCampaign = useMemo(() => {
    const activeCampaigns = campaigns.filter(c => c.is_active && Number(c.end_time) > Date.now());
    if (activeCampaigns.length === 0) return null;
    return activeCampaigns.sort((a, b) => Number(b.current_amount) - Number(a.current_amount))[0];
  }, [campaigns]);

  // Get top 3 featured projects from filtered campaigns (to exclude from main grid)
  // This ensures featured projects respect the active filter (trending, ended, etc.)
  const featuredProjects = useMemo(() => {
    return filteredCampaigns.slice(0, 3);
  }, [filteredCampaigns]);

  // Get featured project IDs to exclude from main grid
  const featuredProjectIds = useMemo(() => {
    return new Set(featuredProjects.map(c => c.id));
  }, [featuredProjects]);

  // Filter out featured projects from the main campaign grid
  const mainGridCampaigns = useMemo(() => {
    return filteredCampaigns.filter(c => !featuredProjectIds.has(c.id));
  }, [filteredCampaigns, featuredProjectIds]);

  const isLoading = loadingEvents || loadingObjects;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection onStartCampaign={() => {
        if (!account) {
          setShowConnectWallet(true);
          return;
        }
        setShowCreateCampaign(true);
      }} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="explore">
        
        {/* Featured Campaign */}
        {featuredCampaign && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                {t("featured.label")}
              </h2>
              <p className="text-base md:text-lg text-gray-900">
                {t("featured.subtitle")}
              </p>
            </div>
            <FeaturedCampaign campaign={featuredCampaign} />
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-500" />
                {t("explore.title")}
              </h2>
              {/* Live Update Indicator */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full animate-pulse">
                <Radio className="w-3 h-3" />
                LIVE
              </span>
            </div>
            <p className="text-gray-500 mt-1">
              {t("explore.subtitle")}
            </p>
          </div>
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t("explore.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
        <CategoryFilter activeCategory={category} onCategoryChange={setCategory} />

        {/* Active Category Badge */}
        {selectedCategory && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full">
              <span className="text-sm font-medium">
                {t("explore.filteringBy")}: {t(`cat.${selectedCategory}`)}
              </span>
              <button
                onClick={clearCategoryFilter}
                className="p-0.5 hover:bg-emerald-200 rounded-full transition-colors"
                title={t("explore.clearFilter")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Featured Projects Grid */}
        {featuredProjects.length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((campaign) => (
                <FeaturedProjectCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        )}

        {/* Campaign Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
            <p className="text-gray-500">{t("explore.loading")}</p>
          </div>
        ) : mainGridCampaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainGridCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {mainGridCampaigns.length >= 6 && (
              <div className="text-center mt-12">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  {t("explore.loadMore")}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-12 h-12 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("explore.noCampaigns")}</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {t("explore.noCampaignsDesc")}
            </p>
            <button
              onClick={() => {
                if (!account) {
                  setShowConnectWallet(true);
                  return;
                }
                setShowCreateCampaign(true);
              }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <Rocket className="w-5 h-5" />
              {t("explore.startCampaign")}
            </button>
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("explore.noResults")}</h3>
            <p className="text-gray-500">
              {t("explore.noResultsDesc")}
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("explore.cta.title")}
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {t("explore.cta.desc")}
          </p>
          <button
            onClick={() => {
              if (!account) {
                setShowConnectWallet(true);
                return;
              }
              setShowCreateCampaign(true);
            }}
            className="inline-flex items-center gap-2 px-10 py-5 bg-emerald-500 text-white font-bold text-lg rounded-full hover:bg-emerald-400 transition-colors"
          >
            {t("explore.cta.button")}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        key={`campaign-modal-${language}`}
        isOpen={showCreateCampaign}
        onClose={() => setShowCreateCampaign(false)}
        onSuccess={() => {
          refetchProjects();
          // Redirect to My Projects page after creating campaign
          navigate('/my-projects');
        }}
        projects={projects}
      />

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={showConnectWallet}
        onClose={() => setShowConnectWallet(false)}
      />
    </div>
  );
}
