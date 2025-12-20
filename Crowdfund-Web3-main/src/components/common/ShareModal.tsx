import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { X, Loader2, Share2 } from "lucide-react";
import { useContractCalls } from "../../hooks";
import type { Project, Campaign } from "../../types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  projects: Project[];
  campaigns: Campaign[];
  initialItemId?: string;
  initialItemType?: "project" | "campaign";
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projects, 
  campaigns,
  initialItemId,
  initialItemType = "campaign"
}: ShareModalProps) {
  const account = useCurrentAccount();
  const { shareItem, isPending } = useContractCalls();
  const [shareType, setShareType] = useState<"project" | "campaign">(initialItemType || "project");
  const [selectedId, setSelectedId] = useState(initialItemId || "");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Update selectedId when initialItemId changes
  useEffect(() => {
    if (initialItemId && isOpen) {
      setSelectedId(initialItemId);
      if (initialItemType) {
        setShareType(initialItemType);
      }
    }
  }, [initialItemId, initialItemType, isOpen]);

  const validateSuiAddress = (address: string): boolean => {
    // Sui addresses start with 0x and are 66 characters long
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDATION: Must have connected wallet - prevent auto-buff
    if (!account?.address) {
      setError("❌ Vui lòng kết nối ví của bạn để chia sẻ");
      return;
    }

    if (!selectedId) {
      setError("Vui lòng chọn một dự án hoặc chiến dịch để chia sẻ");
      return;
    }

    if (!recipientAddress.trim()) {
      setError("Vui lòng nhập địa chỉ ví người nhận");
      return;
    }

    if (!validateSuiAddress(recipientAddress.trim())) {
      setError("Địa chỉ ví không hợp lệ. Địa chỉ Sui phải bắt đầu bằng 0x và có 66 ký tự");
      return;
    }

    if (recipientAddress.trim().toLowerCase() === account.address?.toLowerCase()) {
      setError("Bạn không thể chia sẻ với chính mình");
      return;
    }
    
    // VALIDATION: Verify that the wallet address is the real connected account
    if (!account.address.startsWith('0x') || account.address.length !== 66) {
      setError("❌ Địa chỉ ví không hợp lệ. Vui lòng kết nối lại ví");
      return;
    }

    try {
      setError(null);

      // Find the selected item
      const selectedItem = shareType === "project" 
        ? projects.find(p => p.id === selectedId)
        : campaigns.find(c => c.id === selectedId);

      if (!selectedItem) {
        setError("Không tìm thấy mục đã chọn");
        return;
      }

      // Call smart contract to share item
      await shareItem(selectedId, shareType, recipientAddress.trim());

      // Reset form
      setSelectedId("");
      setRecipientAddress("");
      setShareType("project");
      
      // Wait a bit for blockchain to index the event
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err: any) {
      let errorMessage = "Không thể chia sẻ. Vui lòng thử lại";
      
      // Check for specific error messages
      if (err.message?.includes("No module found") || err.message?.includes("module name share")) {
        errorMessage = "Module share chưa được deploy. Vui lòng deploy module share lên blockchain trước khi sử dụng tính năng này. Xem DEPLOY_INSTRUCTIONS.md để biết cách deploy.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  if (!isOpen) return null;

  const itemsToShow = shareType === "project" ? projects : campaigns;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-semibold text-gray-900">Chia sẻ</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Connected Wallet Display - Anti-buff security */}
          {account?.address && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="text-xs text-emerald-600 font-medium">Ví đang kết nối</div>
                  <div className="text-sm font-mono text-emerald-900 font-semibold">
                    {account.address.slice(0, 10)}...{account.address.slice(-8)}
                  </div>
                </div>
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Share Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn loại để chia sẻ
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShareType("project");
                    setSelectedId("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    shareType === "project"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Dự án
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShareType("campaign");
                    setSelectedId("");
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    shareType === "campaign"
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Chiến dịch
                </button>
              </div>
            </div>

            {/* Item Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn {shareType === "project" ? "dự án" : "chiến dịch"} *
              </label>
              <select
                required
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">-- Chọn {shareType === "project" ? "dự án" : "chiến dịch"} --</option>
                {itemsToShow.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {itemsToShow.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Bạn chưa có {shareType === "project" ? "dự án" : "chiến dịch"} nào
                </p>
              )}
            </div>

            {/* Recipient Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ ví người nhận (Sui) *
              </label>
              <input
                type="text"
                required
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập địa chỉ ví Sui của người bạn muốn chia sẻ
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isPending || itemsToShow.length === 0}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang chia sẻ...
                  </>
                ) : (
                  "Chia sẻ"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

