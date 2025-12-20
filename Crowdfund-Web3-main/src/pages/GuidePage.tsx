import { useState } from "react";
import { BookOpen, Wallet, FolderPlus, Rocket, Gift, ArrowRight, CheckCircle, Gamepad2, Sprout, Trees, Home, DollarSign, Hammer } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { CreateCampaignModal } from "../components/campaign/CreateCampaignModal";
import { ConnectWalletModal } from "../components/common";
import { PACKAGE_ID, MODULES } from "../constants";
import { parseProjectData } from "../hooks";
import { useLanguage } from "../contexts";
import { useDocumentTitle } from "../hooks";
import type { Project } from "../types";

export function GuidePage() {
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Set page title
  useDocumentTitle(t("nav.guide"));

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

  const forSupporters = [
    {
      step: 1,
      title: t("guide.supporter.step1.title"),
      description: t("guide.supporter.step1.desc"),
      icon: Wallet,
    },
    {
      step: 2,
      title: t("guide.supporter.step2.title"),
      description: t("guide.supporter.step2.desc"),
      icon: BookOpen,
    },
    {
      step: 3,
      title: t("guide.supporter.step3.title"),
      description: t("guide.supporter.step3.desc"),
      icon: Gift,
    },
    {
      step: 4,
      title: t("guide.supporter.step4.title"),
      description: t("guide.supporter.step4.desc"),
      icon: CheckCircle,
    },
  ];

  const forCreators = [
    {
      step: 1,
      title: t("guide.creator.step1.title"),
      description: t("guide.creator.step1.desc"),
      icon: Wallet,
    },
    {
      step: 2,
      title: t("guide.creator.step2.title"),
      description: t("guide.creator.step2.desc"),
      icon: FolderPlus,
    },
    {
      step: 3,
      title: t("guide.creator.step3.title"),
      description: t("guide.creator.step3.desc"),
      icon: Rocket,
    },
    {
      step: 4,
      title: t("guide.creator.step4.title"),
      description: t("guide.creator.step4.desc"),
      icon: Gift,
    },
  ];

  const forGamers = [
    {
      step: 1,
      title: t("guide.gamer.step1.title"),
      description: t("guide.gamer.step1.desc"),
      icon: Gamepad2,
      emoji: "🐷",
    },
    {
      step: 2,
      title: t("guide.gamer.step2.title"),
      description: t("guide.gamer.step2.desc"),
      icon: Sprout,
      emoji: "🌱",
    },
    {
      step: 3,
      title: t("guide.gamer.step3.title"),
      description: t("guide.gamer.step3.desc"),
      icon: Trees,
      emoji: "🪵",
    },
    {
      step: 4,
      title: t("guide.gamer.step4.title"),
      description: t("guide.gamer.step4.desc"),
      icon: Home,
      emoji: "🏚️",
    },
    {
      step: 5,
      title: t("guide.gamer.step5.title"),
      description: t("guide.gamer.step5.desc"),
      icon: DollarSign,
      emoji: "💰",
    },
    {
      step: 6,
      title: t("guide.gamer.step6.title"),
      description: t("guide.gamer.step6.desc"),
      icon: Hammer,
      emoji: "🏗️",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">{t("guide.title")}</h1>
          <p className="text-xl text-emerald-100">
            {t("guide.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* For Supporters */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              {t("guide.forSupporters")}
            </span>
            <h2 className="text-3xl font-bold text-gray-900">{t("guide.howToSupport")}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {forSupporters.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm text-blue-600 font-medium mb-2">{t("guide.step")} {item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* For Creators */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              {t("guide.forCreators")}
            </span>
            <h2 className="text-3xl font-bold text-gray-900">{t("guide.howToCreate")}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {forCreators.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="text-sm text-emerald-600 font-medium mb-2">{t("guide.step")} {item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* For Gamers */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              {t("guide.forGamers")}
            </span>
            <h2 className="text-3xl font-bold text-gray-900">{t("guide.howToPlay")}</h2>
            <p className="text-gray-600 mt-2">{t("guide.gameDesc")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forGamers.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100 hover:shadow-md transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-3xl group-hover:scale-110 transition-transform">{item.emoji}</div>
                </div>
                <div className="text-sm text-purple-600 font-medium mb-2">{t("guide.step")} {item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Game Flow Visualization */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-6">{t("guide.gameFlow")}</h3>
            <div className="flex flex-wrap items-center justify-center gap-3 text-2xl">
              <span>🐷</span>
              <ArrowRight className="w-5 h-5 text-purple-400" />
              <span>🌱</span>
              <ArrowRight className="w-5 h-5 text-purple-400" />
              <span>🪵</span>
              <ArrowRight className="w-5 h-5 text-purple-400" />
              <span>🏚️</span>
              <ArrowRight className="w-5 h-5 text-purple-400" />
              <span>💰</span>
              <ArrowRight className="w-5 h-5 text-purple-400" />
              <span>🏗️</span>
            </div>
            <p className="text-center text-gray-600 mt-4 text-sm">{t("guide.gameFlowDesc")}</p>
          </div>
        </section>

        {/* Fee Info */}
        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t("guide.fees")}</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-amber-600 mb-2">0.75%</div>
              <div className="text-gray-600">{t("guide.depositFee")}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-amber-600 mb-2">0.75%</div>
              <div className="text-gray-600">{t("guide.withdrawFee")}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-emerald-600 mb-2">1.5%</div>
              <div className="text-gray-600">{t("guide.totalFee")}</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("guide.ready")}</h2>
          <p className="text-gray-600 mb-8">{t("guide.readyDesc")}</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              {t("guide.exploreProjects")}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                if (!account) {
                  setShowConnectWallet(true);
                  return;
                }
                setShowCreateCampaign(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t("guide.createCampaign")}
              <Rocket className="w-4 h-4" />
            </button>
          </div>
        </section>
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
