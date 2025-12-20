import { useState } from "react";
import { Trophy, Users, Target, Calendar, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { CreateCampaignModal } from "../components/campaign/CreateCampaignModal";
import { ConnectWalletModal } from "../components/common";
import { PACKAGE_ID, MODULES, formatSUI } from "../constants";
import { parseCampaignData, parseProjectData, useDocumentTitle } from "../hooks";
import { useLanguage } from "../contexts";
import type { Campaign, Project } from "../types";

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    games: "bg-purple-100 text-purple-700",
    technology: "bg-blue-100 text-blue-700",
    art: "bg-pink-100 text-pink-700",
    education: "bg-amber-100 text-amber-700",
    film: "bg-red-100 text-red-700",
    music: "bg-indigo-100 text-indigo-700",
    design: "bg-cyan-100 text-cyan-700",
    food: "bg-orange-100 text-orange-700",
    fashion: "bg-rose-100 text-rose-700",
    photography: "bg-violet-100 text-violet-700",
    comics: "bg-yellow-100 text-yellow-700",
    crafts: "bg-lime-100 text-lime-700",
    dance: "bg-fuchsia-100 text-fuchsia-700",
    journalism: "bg-slate-100 text-slate-700",
    publishing: "bg-emerald-100 text-emerald-700",
    theater: "bg-teal-100 text-teal-700",
  };
  return colors[category] || "bg-gray-100 text-gray-700";
};

const getPercentage = (current: string, goal: string) => {
  const c = Number(current);
  const g = Number(goal);
  if (g === 0) return 0;
  return Math.round((c / g) * 100);
};

export function SuccessStoriesPage() {
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Set page title
  useDocumentTitle(t("nav.success"));

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

  // Fetch all campaign created events
  const { data: eventsData, isLoading } = useSuiClientQuery("queryEvents", {
    query: {
      MoveEventType: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::CampaignCreated`,
    },
    limit: 50,
  });

  // Get campaign IDs from events
  const campaignIds = eventsData?.data?.map((e: any) => e.parsedJson?.campaign_id) || [];

  // Fetch all campaigns
  const { data: campaignsData } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: campaignIds,
      options: { showContent: true },
    },
    { enabled: campaignIds.length > 0 }
  );

  // Parse campaigns and filter only successful ones (current_amount >= goal_amount)
  const successfulCampaigns: Campaign[] = (campaignsData || [])
    .map((obj: any) => parseCampaignData(obj.data))
    .filter((c: Campaign | null): c is Campaign => {
      if (!c) return false;
      const current = BigInt(c.current_amount);
      const goal = BigInt(c.goal_amount);
      return current >= goal; // Only show campaigns that reached their goal
    })
    .sort((a: Campaign, b: Campaign) => {
      // Sort by percentage funded (highest first)
      const percentA = (Number(a.current_amount) / Number(a.goal_amount)) * 100;
      const percentB = (Number(b.current_amount) / Number(b.goal_amount)) * 100;
      return percentB - percentA;
    });

  const totalRaised = successfulCampaigns.reduce((sum, c) => sum + Number(c.current_amount), 0);
  const totalBackers = successfulCampaigns.reduce((sum, c) => sum + Number(c.total_supporters), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">{t("success.title")}</h1>
          <p className="text-xl text-amber-100 mb-8">
            {t("success.subtitle")}
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="text-3xl font-bold">{successfulCampaigns.length}</div>
              <div className="text-sm text-amber-100">{t("success.projects")}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="text-3xl font-bold">{formatSUI(totalRaised)} SUI</div>
              <div className="text-sm text-amber-100">{t("success.totalRaised")}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-4">
              <div className="text-3xl font-bold">{totalBackers.toLocaleString()}</div>
              <div className="text-sm text-amber-100">{t("success.totalBackers")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-3 text-gray-600">{t("success.loading")}</span>
          </div>
        ) : successfulCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">{t("success.noProjects")}</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {successfulCampaigns.map((campaign) => {
            const percentage = getPercentage(campaign.current_amount, campaign.goal_amount);
            const endDate = new Date(Number(campaign.end_time));
            
            return (
            <Link
              key={campaign.id}
              to={`/campaign/${campaign.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100">
                {campaign.image_url ? (
                <img
                  src={campaign.image_url}
                  alt={campaign.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-emerald-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(campaign.category || "other")}`}>
                    {t(`cat.${campaign.category || "other"}`)}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {percentage}% {t("success.achievement")}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{campaign.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-bold text-emerald-600">{formatSUI(campaign.current_amount)} SUI</span>
                      <span className="text-gray-400 ml-1">/ {formatSUI(campaign.goal_amount)} SUI</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {campaign.total_supporters} {t("success.backers")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {endDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Creator */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm">
                    <span className="text-gray-400">{t("success.by")} </span>
                    <span className="font-medium text-gray-700">
                      {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                    </span>
                  </div>
                  <span className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    {t("success.details")} →
                  </span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("success.cta.title")}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("success.cta.desc")}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                if (!account) {
                  setShowConnectWallet(true);
                  return;
                }
                setShowCreateCampaign(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              {t("success.cta.start")}
              <Target className="w-4 h-4" />
            </button>
            <Link
              to="/guide"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
            >
              {t("success.cta.guide")}
            </Link>
          </div>
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
