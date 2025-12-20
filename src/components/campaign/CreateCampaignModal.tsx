import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { X, Loader2 } from "lucide-react";
import { useContractCalls } from "../../hooks";
import { useLanguage } from "../../contexts";
import type { CreateCampaignForm } from "../../types";
import type { Project } from "../../types";

const CATEGORIES = [
  "Art", "Comics", "Crafts", "Dance", "Design", "Fashion",
  "Film", "Food", "Games", "Journalism", "Music", "Photography",
  "Publishing", "Technology", "Theater", "Other"
];

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projects: Project[];
}

export function CreateCampaignModal({ isOpen, onClose, onSuccess, projects }: CreateCampaignModalProps) {
  const account = useCurrentAccount();
  const { createCampaign, isPending } = useContractCalls();
  const { t, language } = useLanguage();
  
  const [form, setForm] = useState<CreateCampaignForm>({
    project_id: "",
    name: "",
    description: "",
    image_url: "",
    goal_amount: "",
    duration_days: 30,
    category: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError(t("donate.connectWallet"));
      return;
    }

    if (!form.project_id) {
      setError(t("createCampaign.errorProject"));
      return;
    }

    if (!form.category) {
      setError(t("createCampaign.errorCategory"));
      return;
    }

    if (parseFloat(form.goal_amount) <= 0) {
      setError(t("createCampaign.errorGoal"));
      return;
    }

    try {
      setError(null);
      await createCampaign(form);
      setForm({
        project_id: "",
        name: "",
        description: "",
        image_url: "",
        goal_amount: "",
        duration_days: 30,
        category: "",
      });
      
      // Wait a bit for blockchain to index the new campaign
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
      
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t("createCampaign.title")}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("createCampaign.project")} *
              </label>
              <select
                required
                value={form.project_id}
                onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("createCampaign.selectProject")}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("createCampaign.category")} *
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("createCampaign.selectCategory")}</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {t(`cat.${category.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("createCampaign.name")} *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("createCampaign.namePlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("createCampaign.description")} *
              </label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={t("createCampaign.descPlaceholder")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("createCampaign.imageUrl")}
              </label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("createCampaign.goal")} *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={form.goal_amount}
                  onChange={(e) => setForm({ ...form, goal_amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("createCampaign.duration")} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="365"
                  value={form.duration_days}
                  onChange={(e) => setForm({ ...form, duration_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              {t("createCampaign.fee")}
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t("createCampaign.cancel")}
              </button>
              <button
                type="submit"
                disabled={isPending || !account || projects.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("createCampaign.creating")}
                  </>
                ) : (
                  t("createCampaign.create")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
