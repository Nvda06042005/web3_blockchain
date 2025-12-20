import { Flame, Clock, TrendingUp, Sparkles, MapPin } from "lucide-react";
import { useLanguage } from "../../contexts";

const categoryKeys = [
  { id: "all", key: "filter.all", icon: Sparkles },
  { id: "trending", key: "filter.trending", icon: TrendingUp },
  { id: "ending-soon", key: "filter.endingSoon", icon: Clock },
  { id: "just-launched", key: "filter.justLaunched", icon: Flame },
  { id: "near-goal", key: "filter.almostFunded", icon: MapPin },
];

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2 justify-center py-6">
      {categoryKeys.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeCategory === category.id
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <category.icon className="w-4 h-4" />
          {t(category.key)}
        </button>
      ))}
    </div>
  );
}
