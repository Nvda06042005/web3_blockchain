import { Link } from "react-router-dom";
import { Clock, Users, Star } from "lucide-react";
import { formatSUI } from "../../constants";
import { useLanguage } from "../../contexts";
import type { Campaign } from "../../types";

interface FeaturedCampaignProps {
  campaign: Campaign;
}

export function FeaturedCampaign({ campaign }: FeaturedCampaignProps) {
  const { t } = useLanguage();
  const progress = Math.min(
    (Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100,
    100
  );

  const endTime = new Date(Number(campaign.end_time));
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Image */}
        <div className="aspect-video lg:aspect-auto lg:h-full relative">
          {campaign.image_url ? (
            <img
              src={campaign.image_url}
              alt={campaign.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Star className="w-20 h-20 text-emerald-300" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              ⭐ {t("featured.badge")}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="text-sm text-emerald-600 font-medium mb-2">{t("featured.label")}</div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            {campaign.name}
          </h2>
          <p className="text-gray-600 mb-6 line-clamp-3">
            {campaign.description}
          </p>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-emerald-600">
                {formatSUI(campaign.current_amount)} SUI {t("featured.raised")}
              </span>
              <span className="text-gray-500">
                {Math.round(progress)}% {t("featured.of")} {formatSUI(campaign.goal_amount)} SUI
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span className="font-medium">{campaign.total_supporters} {t("featured.backers")}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">{daysLeft} {t("featured.daysLeft")}</span>
            </div>
          </div>

          <Link
            to={`/campaign/${campaign.id}`}
            className="inline-flex items-center justify-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            {t("featured.viewCampaign")}
          </Link>
        </div>
      </div>
    </div>
  );
}
