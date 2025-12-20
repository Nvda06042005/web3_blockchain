import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { Wallet, Loader2, Gift, ExternalLink } from "lucide-react";
import { PACKAGE_ID, MODULES, formatSUI } from "../constants";
import { useDocumentTitle } from "../hooks";
import { useLanguage } from "../contexts";
import type { SupporterNFT } from "../types";

export function MyNFTsPage() {
  const account = useCurrentAccount();
  const { t } = useLanguage();

  // Set page title
  useDocumentTitle(t("nav.myNFTs"));

  // Fetch user's NFTs
  const { data: nftsData, isLoading } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULES.SUPPORTER_NFT}::SupporterNFT`,
      },
      options: { showContent: true },
    },
    { enabled: !!account?.address }
  );

  // Parse NFTs
  const nfts: SupporterNFT[] = nftsData?.data
    ?.map((obj: any) => {
      const fields = obj.data?.content?.fields;
      if (!fields) return null;
      return {
        id: obj.data.objectId,
        campaign_id: fields.campaign_id,
        campaign_name: fields.campaign_name,
        donor: fields.donor,
        amount: fields.amount,
        tier_name: fields.tier_name,
        image_url: fields.image_url,
        donated_at: fields.donated_at,
        message: fields.message,
        donation_number: fields.donation_number,
      };
    })
    .filter((n): n is SupporterNFT => n !== null) || [];

  if (!account) {
    return (
      <div className="text-center py-20">
        <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-500">
          Please connect your wallet to view your Supporter NFTs.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Supporter NFTs</h1>
        <span className="text-gray-500">{nfts.length} NFTs</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : nfts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 relative">
                {nft.image_url ? (
                  <img
                    src={nft.image_url}
                    alt={nft.campaign_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Gift className="w-16 h-16 text-purple-300 mx-auto mb-2" />
                      <p className="text-purple-400 font-medium">Supporter #{nft.donation_number}</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-900">
                  #{nft.donation_number}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {nft.campaign_name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {nft.tier_name || "Custom Donation"}
                </p>

                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                  <div>
                    <p className="text-lg font-bold text-blue-600">
                      {formatSUI(nft.amount)} SUI
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(Number(nft.donated_at)).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`https://suiscan.xyz/testnet/object/${nft.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-500" />
                  </a>
                </div>

                {nft.message && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 italic">"{nft.message}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No NFTs Yet</h3>
          <p className="text-gray-500 mb-6">
            Support a campaign to earn your first Supporter NFT!
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explore Campaigns
          </a>
        </div>
      )}
    </div>
  );
}
