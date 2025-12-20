import { Link } from "react-router-dom";
import { Clock, Users, Target, CheckCircle, TrendingUp } from "lucide-react";
import { formatSUI } from "../../constants";
import { useLanguage } from "../../contexts";
import type { Campaign } from "../../types";

interface CampaignCardProps {
  campaign: Campaign;
  featured?: boolean;
}

export function CampaignCard({ campaign, featured = false }: CampaignCardProps) {
  const { t } = useLanguage();
  const progress = Math.min(
    (Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100,
    100
  );
  
  const endTime = new Date(Number(campaign.end_time));
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const hoursLeft = Math.max(0, Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60 * 60)));
  const isEnded = now > endTime || !campaign.is_active;
  const isAlmostFunded = progress >= 80 && progress < 100;

  const getTimeDisplay = () => {
    if (isEnded) return t("card.ended");
    if (daysLeft === 0) return `${hoursLeft}h ${t("card.left")}`;
    if (daysLeft === 1) return `1 ${t("card.dayLeft")}`;
    return `${daysLeft} ${t("card.daysLeft")}`;
  };

  return (
    <Link
      to={`/campaign/${campaign.id}`}
      className={`group block bg-white rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        featured 
          ? "shadow-xl border-2 border-emerald-200" 
          : "shadow-md hover:shadow-xl border border-gray-100"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {campaign.image_url ? (
          <img
            src={campaign.image_url}
            alt={campaign.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
            <Target className="w-16 h-16 text-emerald-200" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {campaign.is_funded && (
            <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" />
              {t("card.funded")}
            </span>
          )}
          {isAlmostFunded && !campaign.is_funded && (
            <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {t("card.almostThere")}
            </span>
          )}
        </div>

        {/* Time Badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${
            isEnded 
              ? "bg-gray-900/80 text-white" 
              : daysLeft <= 3 
                ? "bg-red-500/90 text-white"
                : "bg-white/90 text-gray-700"
          }`}>
            {getTimeDisplay()}
          </span>
        </div>

        {/* Progress Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
          <div
            className={`h-full transition-all ${
              progress >= 100 
                ? "bg-green-400" 
                : progress >= 50 
                  ? "bg-emerald-400" 
                  : "bg-emerald-300"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
          {campaign.name}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {campaign.description}
        </p>

        {/* Funding Info */}
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900">
                {formatSUI(campaign.current_amount)} <span className="text-sm font-normal text-gray-500">SUI</span>
              </p>
              <p className="text-sm text-gray-400">
                {t("card.pledged")} {formatSUI(campaign.goal_amount)} SUI
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${progress >= 100 ? "text-green-600" : "text-emerald-600"}`}>
                {Math.round(progress)}%
              </p>
              <p className="text-sm text-gray-400">{t("card.fundedPercent")}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span className="font-medium">{campaign.total_supporters}</span>
              <span>{t("card.backers")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className={daysLeft <= 3 && !isEnded ? "text-red-500 font-medium" : ""}>
                {getTimeDisplay()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
