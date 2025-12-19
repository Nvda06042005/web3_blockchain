import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { X, Loader2 } from "lucide-react";
import { useContractCalls } from "../../hooks";

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  campaignId: string;
  campaignName: string;
}

export function DonateModal({ isOpen, onClose, onSuccess, campaignId, campaignName }: DonateModalProps) {
  const account = useCurrentAccount();
  const { donate, isPending } = useContractCalls();
  
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const presetAmounts = [1, 5, 10, 25, 50, 100];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setError("Please connect your wallet");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    try {
      setError(null);
      await donate(campaignId, amount, message);
      setAmount("");
      setMessage("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to donate");
    }
  };

  if (!isOpen) return null;

  const fee = parseFloat(amount || "0") * 0.0075; // 0.75% deposit fee
  const netAmount = parseFloat(amount || "0") - fee;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Donate</h2>
              <p className="text-sm text-gray-500 mt-1">{campaignName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preset Amounts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Amount
              </label>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset.toString())}
                    className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      amount === preset.toString()
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {preset} SUI
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or enter custom amount (SUI)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (optional)
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Leave a message for the creator..."
              />
            </div>

            {/* Fee breakdown */}
            {parseFloat(amount) > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Donation amount</span>
                  <span>{parseFloat(amount).toFixed(2)} SUI</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform fee (0.75%)</span>
                  <span>-{fee.toFixed(4)} SUI</span>
                </div>
                <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-200">
                  <span>Campaign receives</span>
                  <span>{netAmount.toFixed(4)} SUI</span>
                </div>
              </div>
            )}

            {/* NFT Notice */}
            <p className="text-xs text-gray-500 bg-blue-50 px-4 py-2 rounded-lg">
              🎨 You will receive a Supporter NFT as a thank you for your donation!
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !account || !amount}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Donating...
                  </>
                ) : (
                  `Donate ${amount || "0"} SUI`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
