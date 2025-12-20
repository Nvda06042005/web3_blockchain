import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../contexts";
import { ChevronDown } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: "en" | "vi") => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
      >
        {language === "vi" ? (
          <>
            <img 
              src="https://flagcdn.com/w20/vn.png" 
              srcSet="https://flagcdn.com/w40/vn.png 2x"
              alt="Vietnam flag" 
              className="w-5 h-4 object-cover rounded-sm"
            />
            <span>Tiếng Việt</span>
          </>
        ) : (
          <>
            <img 
              src="https://flagcdn.com/w20/gb.png" 
              srcSet="https://flagcdn.com/w40/gb.png 2x"
              alt="UK flag" 
              className="w-5 h-4 object-cover rounded-sm"
            />
            <span>English</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <button
            onClick={() => handleLanguageChange("vi")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
              language === "vi" ? "bg-gray-50" : ""
            }`}
          >
            <img 
              src="https://flagcdn.com/w20/vn.png" 
              srcSet="https://flagcdn.com/w40/vn.png 2x"
              alt="Vietnam flag" 
              className="w-5 h-4 object-cover rounded-sm"
            />
            <span className="flex-1 text-left font-medium">Tiếng Việt</span>
            {language === "vi" && (
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => handleLanguageChange("en")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
              language === "en" ? "bg-gray-50" : ""
            }`}
          >
            <img 
              src="https://flagcdn.com/w20/gb.png" 
              srcSet="https://flagcdn.com/w40/gb.png 2x"
              alt="UK flag" 
              className="w-5 h-4 object-cover rounded-sm"
            />
            <span className="flex-1 text-left font-medium">English</span>
            {language === "en" && (
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
