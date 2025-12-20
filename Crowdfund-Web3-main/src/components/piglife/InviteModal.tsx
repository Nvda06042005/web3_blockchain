/**
 * Invite Modal - Send game invitations to friends
 */

import { useState } from "react";
import { X, Users, Send, Copy } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendInvite: (recipientAddress: string) => Promise<void>;
  currentAddress?: string;
}

export function InviteModal({ isOpen, onClose, onSendInvite, currentAddress }: InviteModalProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!recipientAddress.trim()) {
      setError("Vui lòng nhập địa chỉ ví người nhận");
      return;
    }

    if (!recipientAddress.startsWith("0x") || recipientAddress.length !== 66) {
      setError("Địa chỉ ví không hợp lệ! Phải bắt đầu bằng 0x và có 66 ký tự");
      return;
    }

    if (recipientAddress.toLowerCase() === currentAddress?.toLowerCase()) {
      setError("Bạn không thể mời chính mình!");
      return;
    }

    try {
      setLoading(true);
      await onSendInvite(recipientAddress);
      setRecipientAddress("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi gửi lời mời");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRecipientAddress("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mời Bạn Chơi Game</h2>
            <p className="text-sm text-gray-500">Bạn nhận +100 SC khi họ chấp nhận lời mời</p>
          </div>
        </div>

        {/* Current Address Display */}
        {currentAddress && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Địa chỉ ví của bạn:</p>
                <p className="font-mono text-xs text-gray-900 break-all">
                  {currentAddress}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(currentAddress);
                  alert("✓ Đã copy địa chỉ!");
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy địa chỉ"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Địa chỉ ví bạn muốn mời
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x1234***5678abcdef"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-mono text-sm"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Ví dụ: 0x1234***5678abcdef (66 ký tự bắt đầu bằng 0x)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h4 className="font-semibold text-emerald-900 mb-2">📋 Cách hoạt động:</h4>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• Bạn gửi lời mời đến địa chỉ ví</li>
              <li>• Người nhận sẽ thấy lời mời trong game</li>
              <li>• Nếu họ chấp nhận: bạn nhận +100 SC</li>
              <li>• Nếu họ từ chối: không ai nhận điểm</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <p className="text-xs text-emerald-600 font-semibold">⏰ Giới hạn:</p>
              <p className="text-xs text-emerald-700">• Mỗi địa chỉ chỉ mời được 1 lần / 15 phút</p>
              <p className="text-xs text-emerald-700">• Sau 15 phút có thể mời lại địa chỉ cũ</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Gửi lời mời
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


