import { ConnectButton, useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, FolderKanban, Menu, X, Rocket, ChevronDown, BookOpen, Trophy, Plus, Gamepad2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../contexts";
import { LanguageToggle } from "../common";
import { CreateProjectModal } from "../project/CreateProjectModal";
import { CreateCampaignModal } from "../campaign/CreateCampaignModal";
import { PACKAGE_ID, MODULES } from "../../constants";
import { parseProjectData } from "../../hooks";
import type { Project } from "../../types";

const categoryKeys = [
  "art", "comics", "crafts", "dance", "design", "fashion",
  "film", "food", "games", "journalism", "music", "photography",
  "publishing", "technology", "theater", "other"
];

export function Navbar() {
  const account = useCurrentAccount();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [creatorDropdownOpen, setCreatorDropdownOpen] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const creatorDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (creatorDropdownRef.current && !creatorDropdownRef.current.contains(event.target as Node)) {
        setCreatorDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">CrowdFund</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-0.5">
            {/* Explore Link */}
            <Link
              to="/"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                isActive("/")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t("nav.explore")}</span>
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  categoryDropdownOpen
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="hidden lg:inline">{t("nav.categories")}</span>
                <span className="lg:hidden">≡</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {categoryKeys.map((catKey) => (
                      <Link
                        key={catKey}
                        to={`/?category=${catKey}`}
                        onClick={() => setCategoryDropdownOpen(false)}
                        className="px-3 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                      >
                        {t(`cat.${catKey}`)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* My Projects - Only for connected users (creators) */}
            {account && (
              <Link
                to="/my-projects"
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive("/my-projects")
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{t("nav.myProjects")}</span>
              </Link>
            )}

            {/* Guide Link */}
            <Link
              to="/guide"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                isActive("/guide")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t("nav.guide")}</span>
            </Link>

            {/* Success Stories Link */}
            <Link
              to="/success-stories"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                isActive("/success-stories")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{t("nav.successStories")}</span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1.5">
            {/* Pig Game Button - Only for connected users */}
            {account && (
              <Link
                to="/game"
                className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all shadow-sm whitespace-nowrap ${
                  isActive("/game")
                    ? "bg-pink-600 text-white"
                    : "bg-pink-500 text-white hover:bg-pink-600"
                }`}
              >
                <Gamepad2 className="w-3 h-3" />
                {t("nav.pigGame")}
              </Link>
            )}

            {/* Creator Dropdown (only for connected users) */}
            {account && (
              <div className="hidden lg:flex items-center gap-1">
                <div className="relative" ref={creatorDropdownRef}>
                  <button
                    onClick={() => setCreatorDropdownOpen(!creatorDropdownOpen)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all bg-blue-600 text-white hover:bg-blue-700 shadow-sm whitespace-nowrap"
                  >
                    <Plus className="w-3 h-3" />
                    {t("nav.creator")}
                    <ChevronDown className={`w-3 h-3 transition-transform ${creatorDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {creatorDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <button
                        onClick={() => {
                          setShowCreateProject(true);
                          setCreatorDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                      >
                        <FolderKanban className="w-4 h-4" />
                        <span>{t("myProjects.createProject")}</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateCampaign(true);
                          setCreatorDropdownOpen(false);
                        }}
                        disabled={projects.length === 0}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        title={projects.length === 0 ? t("myProjects.createProjectFirst") : ""}
                      >
                        <Rocket className="w-4 h-4" />
                        <span>{t("myProjects.createCampaign")}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Language Toggle */}
            <LanguageToggle />

            {/* Connect Button */}
            <div className="scale-90 origin-right">
              <ConnectButton />
            </div>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white">
            {/* Explore */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3.5 text-sm font-medium ${
                isActive("/")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Compass className="w-5 h-5" />
              <span>{t("nav.explore")}</span>
            </Link>

            {/* Categories in Mobile */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("nav.categories")}</p>
              <div className="grid grid-cols-2 gap-1">
                {categoryKeys.map((catKey) => (
                  <Link
                    key={catKey}
                    to={`/?category=${catKey}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg"
                  >
                    {t(`cat.${catKey}`)}
                  </Link>
                ))}
              </div>
            </div>

            {/* My Projects - Only for connected users */}
            {account && (
              <Link
                to="/my-projects"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3.5 text-sm font-medium border-t border-gray-100 ${
                  isActive("/my-projects")
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FolderKanban className="w-5 h-5" />
                <span>{t("nav.myProjects")}</span>
              </Link>
            )}

            {/* Guide Link - Mobile */}
            <Link
              to="/guide"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3.5 text-sm font-medium border-t border-gray-100 ${
                isActive("/guide")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>{t("nav.guide")}</span>
            </Link>

            {/* Success Stories - Mobile */}
            <Link
              to="/success-stories"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3.5 text-sm font-medium border-t border-gray-100 ${
                isActive("/success-stories")
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span>{t("nav.successStories")}</span>
            </Link>

            {/* Creator Buttons - Mobile (only for connected users) */}
            {account && (
              <div className="px-4 py-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t("nav.creator")}</p>
                <div className="space-y-2">
                  {/* Pig Game Button - Mobile */}
                  <button
                    onClick={() => {
                      navigate('/game');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-pink-500 text-white font-medium rounded-xl hover:bg-pink-600 transition-colors"
                  >
                    <Gamepad2 className="w-5 h-5" />
                    <span>{t("nav.pigGame")}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateProject(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <FolderKanban className="w-5 h-5" />
                    <span>{t("myProjects.createProject")}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateCampaign(true);
                      setMobileMenuOpen(false);
                    }}
                    disabled={projects.length === 0}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Rocket className="w-5 h-5" />
                    <span>{t("myProjects.createCampaign")}</span>
                  </button>
                </div>
              </div>
            )}

            {account && (
              <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                {t("nav.connected")}: {account.address.slice(0, 8)}...{account.address.slice(-6)}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>

    {/* Modals - Render outside nav for proper z-index */}
    <CreateProjectModal
      key={`project-modal-${language}`}
      isOpen={showCreateProject}
      onClose={() => setShowCreateProject(false)}
      onSuccess={() => {
        refetchProjects();
        // Redirect to My Projects page after creating project
        // Modal already has 2s delay before calling onSuccess
        navigate('/my-projects');
      }}
    />
    <CreateCampaignModal
      key={`campaign-modal-${language}`}
      isOpen={showCreateCampaign}
      onClose={() => setShowCreateCampaign(false)}
      onSuccess={() => {
        refetchProjects();
        // Redirect to My Projects page after creating campaign
        // Modal already has 2s delay before calling onSuccess
        navigate('/my-projects');
      }}
      projects={projects}
    />
    </>
  );
}
