import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { formatSUI } from "../../constants";
import { useLanguage } from "../../contexts";
import type { Campaign } from "../../types";

interface FeaturedProjectCardProps {
  campaign: Campaign;
}

export function FeaturedProjectCard({ campaign }: FeaturedProjectCardProps) {
  const { t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Cập nhật thời gian mỗi giây để tính toán động
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const progress = Math.min(
    (Number(campaign.current_amount) / Number(campaign.goal_amount)) * 100,
    100
  );
  
  const endTime = new Date(Number(campaign.end_time));
  const daysLeft = Math.max(0, Math.ceil((endTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24)));
  const isEnded = currentTime > endTime || !campaign.is_active;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <Link to={`/campaign/${campaign.id}`} className="block relative aspect-[16/10] overflow-hidden">
        {campaign.image_url ? (
          <img
            src={campaign.image_url}
            alt={campaign.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-100 to-red-100" />
        )}
        
        {/* Featured Badge - Top Left */}
        <div className="absolute top-4 left-4">
          <span className="inline-block bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-md">
            Trò chơi Nổi bật
          </span>
        </div>

        {/* Favorite Button - Top Right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-50 transition-all shadow-sm"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite ? "fill-pink-600 text-pink-600" : "text-gray-600"
            }`}
          />
        </button>
      </Link>

      {/* Content */}
      <div className="p-6">
        <Link to={`/campaign/${campaign.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-pink-600 transition-colors">
            {campaign.name}
          </h3>
        </Link>

        {/* Funding Amount - Format như hình 1 */}
        <p className="text-base text-gray-900 mb-2">
          <span className="font-semibold">{formatSUI(campaign.current_amount)} SUI</span>
          <span className="text-gray-600"> đã ủng hộ trên </span>
          <span className="font-semibold">{formatSUI(campaign.goal_amount)} SUI</span>
        </p>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Stats - 3 cột như hình 1 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            {isEnded ? (
              <>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-pink-600 font-medium mt-1">Ngày còn lại</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">{daysLeft}</p>
                <p className="text-sm text-pink-600 font-medium mt-1">Ngày còn lại</p>
              </>
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{campaign.total_supporters}</p>
            <p className="text-sm text-pink-600 font-medium mt-1">Người ủng hộ</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</p>
            <p className="text-sm text-pink-600 font-medium mt-1">Thành công</p>
          </div>
        </div>
      </div>
    </div>
  );
}

