import { useEffect } from "react";
import { X } from "lucide-react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useLanguage } from "../../contexts";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { t } = useLanguage();
  const account = useCurrentAccount();

  // Auto close modal when wallet is connected
  useEffect(() => {
    if (isOpen && account) {
      onClose();
    }
  }, [account, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Panel - Connect a Wallet */}
            <div className="flex-1 p-8 border-r border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {t("myProjects.connectWallet")}
              </h2>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>

            {/* Right Panel - What is a Wallet */}
            <div className="flex-1 p-8 bg-gray-50 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                What is a Wallet?
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Easy Login
                  </h3>
                  <p className="text-gray-600">
                    No need to create new accounts and passwords for every website. Just connect your wallet and get going.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Store your Digital Assets
                  </h3>
                  <p className="text-gray-600">
                    Send, receive, store, and display your digital assets like NFTs & coins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

