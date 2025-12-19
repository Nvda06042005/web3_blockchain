import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Target, 
  Share2, 
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wallet,
  Lock
} from "lucide-react";
import { formatSUI, PACKAGE_ID, MODULES } from "../constants";
import { parseCampaignData, parseProjectData, useContractCalls, useDocumentTitle } from "../hooks";
import { useLanguage } from "../contexts";
import { DonateModal } from "../components/campaign/DonateModal";
import { ShareModal } from "../components/common";
import type { Campaign, Project } from "../types";

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const { endCampaign, withdrawFunds, isPending } = useContractCalls();
  const { t } = useLanguage();
  
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Fetch campaign data
  const { data: campaignData, isLoading, refetch } = useSuiClientQuery(
    "getObject",
    {
      id: id!,
      options: { showContent: true },
    },
    { enabled: !!id }
  );

  const campaign = campaignData?.data ? parseCampaignData(campaignData.data) : null;

  // Fetch user's projects for sharing
  const { data: projectsData } = useSuiClientQuery(
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
  const projects: Project[] = useMemo(() => {
    if (!projectsData?.data) return [];
    return projectsData.data
      .map((obj: any) => parseProjectData(obj.data))
      .filter((p): p is Project => p !== null);
  }, [projectsData]);

  // Fetch campaigns for sharing (get recent campaigns)
  const { data: campaignsEventsData } = useSuiClientQuery(
    "queryEvents",
    {
      query: {
        MoveEventType: `${PACKAGE_ID}::${MODULES.CAMPAIGN}::CampaignCreated`,
      },
      limit: 20,
    },
    { enabled: !!account?.address }
  );

  // Extract campaign IDs and fetch objects
  const campaignIds = useMemo(() => {
    if (!campaignsEventsData?.data) return [];
    return campaignsEventsData.data
      .map((event: any) => event.parsedJson?.campaign_id)
      .filter(Boolean);
  }, [campaignsEventsData]);

  const { data: campaignsObjectsData } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: campaignIds,
      options: { showContent: true },
    },
    { enabled: campaignIds.length > 0 && !!account?.address }
  );

  // Parse campaigns
  const campaigns: Campaign[] = useMemo(() => {
    if (!campaignsObjectsData) return [];
    return campaignsObjectsData
      .map((obj: any) => parseCampaignData(obj.data))
      .filter((c): c is Campaign => c !== null);
  }, [campaignsObjectsData]);

  // Set page title with campaign name
  useDocumentTitle(campaign?.name || t("detail.notFound"), [campaign?.name]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("detail.notFound")}</h3>
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:underline"
        >
          {t("detail.back")}
        </button>
      </div>
    );
  }

  // Calculate actual progress (can exceed 100%)
  const progress = (Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100;
  const progressDisplay = Math.round(progress);
  const endTime = new Date(Number(campaign.end_time));
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isEnded = now > endTime || !campaign.is_active;
  const isCreator = account?.address === campaign.creator;

  const handleEndCampaign = async () => {
    try {
      await endCampaign(campaign.id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdraw = async () => {
    try {
      await withdrawFunds(campaign.id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {t("detail.back")}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden">
            {campaign.image_url ? (
              <img
                src={campaign.image_url}
                alt={campaign.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                <Target className="w-20 h-20 text-blue-300" />
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <button 
                onClick={() => setShowShareModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={t("detail.share")}
              >
                <Share2 className="w-5 h-5 text-gray-500 hover:text-emerald-500" />
              </button>
            </div>
            <p className="text-gray-600 whitespace-pre-wrap">{campaign.description}</p>
          </div>

          {/* Tiers */}
          {campaign.tiers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("detail.tiers")}</h2>
              <div className="space-y-4">
                {campaign.tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                      <span className="text-blue-600 font-medium">
                        {formatSUI(tier.min_amount)} SUI+
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{tier.description}</p>
                    {tier.benefits.length > 0 && (
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {tier.current_supporters} / {tier.max_supporters === "0" ? "∞" : tier.max_supporters} backers
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallet Connection Required Notice */}
          {!account && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("detail.connectRequired")}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {t("detail.connectRequiredDesc")}
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700 mb-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {t("detail.connectBenefit1")}
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {t("detail.connectBenefit2")}
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      // Trigger wallet connect modal (already handled by header button)
                      document.querySelector<HTMLButtonElement>('[data-wallet-connect]')?.click();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Wallet className="w-4 h-4" />
                    {t("detail.connectWallet")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transaction History - Only visible when wallet connected */}
          {account && campaign.transaction_history.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t("detail.transactions")}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({campaign.transaction_history.length} {t("detail.txCount")})
                </span>
              </h2>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold">{t("detail.txType")}</th>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold">{t("detail.txAmount")}</th>
                      {isCreator && (
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">{t("detail.txFee")}</th>
                      )}
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold">{t("detail.txTime")}</th>
                      {isCreator && (
                        <th className="px-4 py-3 text-left text-gray-600 font-semibold">{t("detail.txFrom")}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {campaign.transaction_history.slice(-10).reverse().map((tx, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            tx.tx_type === "deposit" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {tx.tx_type === "deposit" ? t("detail.donation") : t("detail.withdrawal")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{formatSUI(tx.amount)} SUI</td>
                        {isCreator && (
                          <td className="px-4 py-3 text-gray-500">{formatSUI(tx.fee)} SUI</td>
                        )}
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(Number(tx.timestamp)).toLocaleDateString()}
                        </td>
                        {isCreator && (
                          <td className="px-4 py-3">
                            {tx.actor ? (
                              <div className="flex items-center gap-2">
                                <span 
                                  className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded"
                                  title={tx.actor}
                                >
                                  {tx.actor.slice(0, 6)}...{tx.actor.slice(-4)}
                                </span>
                                <a
                                  href={`https://suiscan.xyz/testnet/account/${tx.actor}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Xem trên Sui Explorer"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!isCreator && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-700 text-center">
                    🔒 {t("detail.privacyNote")}
                  </p>
                </div>
              )}
              {isCreator && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  🔗 {t("detail.onchain")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            {/* Campaign Title */}
            <h2 className="text-2xl font-bold text-pink-500 mb-4">{campaign.name}</h2>
            
            {/* Funding Status */}
            <p className="text-gray-600 mb-4">
              {formatSUI(campaign.current_amount)} SUI đã ủng hộ trên {formatSUI(campaign.goal_amount)} SUI
            </p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div
                className="h-4 rounded-full transition-all bg-pink-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            {/* Metrics - Three columns horizontally */}
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-100">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {isEnded ? "0" : daysLeft}
                </p>
                <p className="text-sm text-pink-500">
                  {isEnded ? t("detail.ended") : daysLeft === 1 ? "Ngày còn lại" : "Ngày còn lại"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{campaign.total_supporters}</p>
                <p className="text-sm text-pink-500">Người ủng hộ</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{progressDisplay}%</p>
                <p className="text-sm text-pink-500">Thành công</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 py-4">
              {isCreator && campaign.is_withdrawn && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {t("detail.fundsWithdrawn")}
                </span>
              )}
              {campaign.is_funded && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {t("detail.funded")}
                </span>
              )}
              {campaign.extensions_used > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                  {t("detail.extended")} {campaign.extensions_used}x
                </span>
              )}
              {!campaign.is_active && !campaign.is_withdrawn && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {t("detail.closed")}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isEnded && campaign.is_active && (
                <button
                  onClick={() => setShowDonateModal(true)}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  {t("detail.donateNow")}
                </button>
              )}

              {isCreator && campaign.is_active && (
                <button
                  onClick={handleEndCampaign}
                  disabled={isPending}
                  className="w-full py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? t("detail.processing") : t("detail.endCampaign")}
                </button>
              )}

              {isCreator && !campaign.is_active && !campaign.is_withdrawn && Number(campaign.current_amount) > 0 && (
                <button
                  onClick={handleWithdraw}
                  disabled={isPending}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? t("detail.withdrawing") : t("detail.withdraw")}
                </button>
              )}

              {isCreator && campaign.is_withdrawn && (
                <div className="w-full py-4 px-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-medium">{t("detail.withdrawSuccess")}</p>
                  <p className="text-green-600 text-sm mt-1">
                    {formatSUI(campaign.current_amount)} SUI {t("detail.transferredToCreator")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Creator Info - Only visible when wallet connected */}
          {account && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">{t("detail.creator")}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-mono">
                  {campaign.creator.slice(0, 8)}...{campaign.creator.slice(-6)}
                </span>
                <a
                  href={`https://suiscan.xyz/testnet/account/${campaign.creator}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Donate Modal */}
      <DonateModal
        isOpen={showDonateModal}
        onClose={() => setShowDonateModal(false)}
        onSuccess={() => refetch()}
        campaignId={campaign.id}
        campaignName={campaign.name}
      />

      {/* Share Modal */}
      {campaign && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onSuccess={() => {
            // Optionally show success message or refresh data
          }}
          projects={projects}
          campaigns={campaigns}
          initialItemId={campaign.id}
          initialItemType="campaign"
        />
      )}
    </div>
  );
}
