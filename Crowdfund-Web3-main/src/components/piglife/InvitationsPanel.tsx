/**
 * Invitations Panel - Display and manage game invitations
 */

import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react";

export interface GameInvitation {
  id: string;
  from: string;
  to: string;
  status: "pending" | "accepted" | "rejected";
  timestamp: number;
  reward: number;
}

interface InvitationsPanelProps {
  invitations: GameInvitation[];
  currentAddress?: string;
  onAccept: (invitationId: string) => Promise<void>;
  onReject: (invitationId: string) => Promise<void>;
}

export function InvitationsPanel({ 
  invitations, 
  currentAddress, 
  onAccept, 
  onReject 
}: InvitationsPanelProps) {
  // Filter invitations for current user (received)
  const receivedInvitations = invitations.filter(
    inv => inv.to.toLowerCase() === currentAddress?.toLowerCase() && inv.status === "pending"
  );

  // Filter sent invitations (for tracking)
  const sentInvitations = invitations.filter(
    inv => inv.from.toLowerCase() === currentAddress?.toLowerCase()
  );

  if (receivedInvitations.length === 0 && sentInvitations.length === 0) {
    return null;
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s trước`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h trước`;
    return `${Math.floor(seconds / 86400)}d trước`;
  };

  return (
    <div className="space-y-4">
      {/* Received Invitations (Pending) */}
      {receivedInvitations.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Lời mời đang chờ ({receivedInvitations.length})
          </h3>
          <div className="space-y-3">
            {receivedInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-emerald-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🐷</span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Lời mời chơi PigLife
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(invitation.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">Từ:</span>
                      <span className="font-mono text-emerald-700 font-semibold">
                        {formatAddress(invitation.from)}
                      </span>
                      <a
                        href={`https://suiscan.xyz/testnet/account/${invitation.from}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-sm text-emerald-600 font-semibold mt-2">
                      🎁 Họ sẽ nhận +{invitation.reward} SC nếu bạn chấp nhận
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onAccept(invitation.id)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 transition-all flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => onReject(invitation.id)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Invitations (Tracking) */}
      {sentInvitations.length > 0 && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl border-2 border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Lời mời đã gửi ({sentInvitations.length})
          </h3>
          <div className="space-y-2">
            {sentInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    invitation.status === "accepted" ? "bg-green-500" :
                    invitation.status === "rejected" ? "bg-red-500" :
                    "bg-yellow-500 animate-pulse"
                  }`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatAddress(invitation.to)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(invitation.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {invitation.status === "accepted" && (
                    <span className="text-sm font-semibold text-green-600">
                      ✓ Đã chấp nhận
                    </span>
                  )}
                  {invitation.status === "rejected" && (
                    <span className="text-sm font-semibold text-red-600">
                      ✗ Đã từ chối
                    </span>
                  )}
                  {invitation.status === "pending" && (
                    <span className="text-sm font-semibold text-yellow-600">
                      ⏳ Đang chờ
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

