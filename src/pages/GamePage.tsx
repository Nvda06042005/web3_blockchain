import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { 
  Gamepad2, 
  Wallet, 
  Loader2, 
  PiggyBank, 
  Sprout, 
  Trees, 
  Home, 
  DollarSign, 
  Hammer,
  Coins,
  ArrowRight,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { ConnectButton } from "@mysten/dapp-kit";
import { useGameCalls, type GameState, useDocumentTitle } from "../hooks";
import { GAME_PACKAGE_ID, MODULES, formatSUI } from "../constants";
import { useLanguage } from "../contexts";

export function GamePage() {
  const account = useCurrentAccount();
  useLanguage(); // Keep context connection
  const [gameStateId, setGameStateId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellWoodAmount, setSellWoodAmount] = useState("1");
  const [buyBricksAmount, setBuyBricksAmount] = useState("1");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");

  const {
    createGame,
    raisePig,
    plantTree,
    harvestWood,
    buildSimpleHouse,
    sellWood,
    buyBricks,
    buildModernHouse,
    transferCoins,
    fetchGameState,
    isPending,
  } = useGameCalls();

  // Helper function to check if contract is deployed
  const isContractDeployed = () => {
    const pkgId = GAME_PACKAGE_ID as string;
    return pkgId !== "0x0" && 
           pkgId !== "0x0000000000000000000000000000000000000000000000000000000000000000" &&
           pkgId.length > 3;
  };

  // Set page title
  useDocumentTitle("Pig Farming Game");

  // Fetch user's game state
  const { data: gameStateData, refetch: refetchGameState } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address!,
      filter: {
        StructType: `${GAME_PACKAGE_ID}::${MODULES.PIG_FARMING}::GameState`,
      },
      options: { showContent: true },
    },
    { enabled: !!account?.address && isContractDeployed() }
  );

  // Update game state ID and fetch details
  useEffect(() => {
    if (gameStateData?.data && gameStateData.data.length > 0) {
      const gameId = gameStateData.data[0].data?.objectId;
      if (gameId) {
        setGameStateId(gameId);
        loadGameState(gameId);
      }
    } else {
      setGameStateId(null);
      setGameState(null);
    }
  }, [gameStateData]);

  const loadGameState = async (id: string) => {
    try {
      setLoading(true);
      const state = await fetchGameState(id);
      setGameState(state);
    } catch (err: any) {
      setError(err.message || "Failed to load game state");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: () => Promise<any>, actionName: string) => {
    if (!account) {
      setError("Please connect your wallet");
      return;
    }

    if (!gameStateId) {
      setError("Please create a game first");
      return;
    }

    // Check if contract is deployed
    const pkgId = GAME_PACKAGE_ID as string;
    if (pkgId === "0x0" || pkgId === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      setError("Game contract chưa được deploy! Vui lòng deploy smart contract trước khi sử dụng.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await action();
      // Wait a bit then refetch
      setTimeout(() => {
        refetchGameState();
        if (gameStateId) {
          loadGameState(gameStateId);
        }
      }, 2000);
    } catch (err: any) {
      let errorMessage = err.message || `Failed to ${actionName}`;
      
      // Check for network mismatch error
      if (errorMessage.includes("network") || errorMessage.includes("Network")) {
        errorMessage = "Lỗi network mismatch! Đảm bảo wallet đang kết nối với Testnet (không phải Mainnet).";
      }
      
      // Check for package not found error
      if (errorMessage.includes("Package object does not exist") || errorMessage.includes("0x0000000000000000000000000000000000000000000000000000000000000000")) {
        errorMessage = "Game contract chưa được deploy! Vui lòng deploy smart contract và cập nhật GAME_PACKAGE_ID trong constants.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    if (!account) {
      setError("Please connect your wallet");
      return;
    }

    // Check if contract is deployed
    if (!isContractDeployed()) {
      setError("Game contract chưa được deploy! Vui lòng deploy smart contract trước khi sử dụng. Xem file DEPLOY_GAME_CONTRACT.md để biết cách deploy.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await createGame();
      // Wait a bit then refetch
      setTimeout(() => {
        refetchGameState();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  const formatCoins = (mist: number) => {
    return formatSUI(mist);
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <Gamepad2 className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Please connect your Sui wallet to start playing the Pig Farming Game!
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Gamepad2 className="w-10 h-10" />
            Pig Farming Game
          </h1>
          <p className="text-white/90 text-lg">
            Nuôi heo → Trồng cây → Thu hoạch gỗ → Xây nhà thô sơ → Bán gỗ → Mua gạch → Xây nhà hiện đại
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {/* Game State Display */}
        {gameState ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Game Stats */}
            <div className="lg:col-span-2 bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Game Stats</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-100 rounded-xl p-4 text-center">
                  <PiggyBank className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{gameState.pigs}</div>
                  <div className="text-sm text-gray-600">Pigs</div>
                </div>
                
                <div className="bg-green-100 rounded-xl p-4 text-center">
                  <Sprout className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{gameState.trees}</div>
                  <div className="text-sm text-gray-600">Trees</div>
                </div>
                
                <div className="bg-amber-100 rounded-xl p-4 text-center">
                  <Trees className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{gameState.wood}</div>
                  <div className="text-sm text-gray-600">Wood</div>
                </div>
                
                <div className="bg-blue-100 rounded-xl p-4 text-center">
                  <Coins className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{formatCoins(gameState.coins)}</div>
                  <div className="text-sm text-gray-600">Coins</div>
                </div>
                
                <div className="bg-gray-100 rounded-xl p-4 text-center">
                  <Hammer className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{gameState.bricks}</div>
                  <div className="text-sm text-gray-600">Bricks</div>
                </div>
                
                <div className="bg-orange-100 rounded-xl p-4 text-center">
                  <Home className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{gameState.simple_houses}</div>
                  <div className="text-sm text-gray-600">Simple Houses</div>
                </div>
                
                <div className="bg-indigo-100 rounded-xl p-4 text-center">
                  <Home className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{gameState.modern_houses}</div>
                  <div className="text-sm text-gray-600">Modern Houses</div>
                </div>
                
                <div className="bg-pink-100 rounded-xl p-4 text-center">
                  <Wallet className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                  <div className="text-xs font-mono text-gray-900 break-all">
                    {account.address.slice(0, 6)}...{account.address.slice(-4)}
                  </div>
                  <div className="text-sm text-gray-600">Wallet</div>
                </div>
              </div>

              <button
                onClick={() => gameStateId && loadGameState(gameStateId)}
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Game State
              </button>
            </div>

            {/* Actions Panel */}
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions</h2>
              
              <div className="space-y-3">
                {/* Step 1: Raise Pig */}
                <button
                  onClick={() => handleAction(() => raisePig(gameStateId!), "raise pig")}
                  disabled={loading || isPending || gameState.coins < 100_000_000}
                  className="w-full flex items-center justify-between px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-5 h-5" />
                    <span>Raise Pig (0.1 SUI)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Step 2: Plant Tree */}
                <button
                  onClick={() => handleAction(() => plantTree(gameStateId!), "plant tree")}
                  disabled={loading || isPending || gameState.coins < 50_000_000}
                  className="w-full flex items-center justify-between px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <Sprout className="w-5 h-5" />
                    <span>Plant Tree (0.05 SUI)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Step 3: Harvest Wood */}
                <button
                  onClick={() => handleAction(() => harvestWood(gameStateId!), "harvest wood")}
                  disabled={loading || isPending || gameState.trees === 0}
                  className="w-full flex items-center justify-between px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <Trees className="w-5 h-5" />
                    <span>Harvest Wood</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Step 4: Build Simple House */}
                <button
                  onClick={() => handleAction(() => buildSimpleHouse(gameStateId!), "build simple house")}
                  disabled={loading || isPending || gameState.wood < 20}
                  className="w-full flex items-center justify-between px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    <span>Build Simple House (20 wood)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Step 5: Sell Wood */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={sellWoodAmount}
                    onChange={(e) => setSellWoodAmount(e.target.value)}
                    min="1"
                    max={gameState.wood.toString()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Amount"
                  />
                  <button
                    onClick={() => handleAction(() => sellWood(gameStateId!, parseInt(sellWoodAmount)), "sell wood")}
                    disabled={loading || isPending || gameState.wood < parseInt(sellWoodAmount) || parseInt(sellWoodAmount) <= 0}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DollarSign className="w-5 h-5" />
                  </button>
                </div>

                {/* Step 6: Buy Bricks */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={buyBricksAmount}
                    onChange={(e) => setBuyBricksAmount(e.target.value)}
                    min="1"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Amount"
                  />
                  <button
                    onClick={() => handleAction(() => buyBricks(gameStateId!, parseInt(buyBricksAmount)), "buy bricks")}
                    disabled={loading || isPending || gameState.coins < (parseInt(buyBricksAmount) * 30_000_000) || parseInt(buyBricksAmount) <= 0}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Hammer className="w-5 h-5" />
                  </button>
                </div>

                {/* Step 7: Build Modern House */}
                <button
                  onClick={() => handleAction(() => buildModernHouse(gameStateId!), "build modern house")}
                  disabled={loading || isPending || gameState.wood < 30 || gameState.bricks < 10}
                  className="w-full flex items-center justify-between px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    <span>Build Modern House (30 wood + 10 bricks)</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-8 text-center">
            <Gamepad2 className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Game</h2>
            {!isContractDeployed() ? (
              <>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Contract chưa được deploy</h3>
                  </div>
                  <p className="text-yellow-700 text-sm mb-4">
                    Game smart contract chưa được deploy lên Sui blockchain. Để sử dụng game, bạn cần:
                  </p>
                  <ol className="list-decimal list-inside text-yellow-700 text-sm space-y-2 ml-2">
                    <li className="mb-2">
                      Deploy smart contract: 
                      <code className="bg-yellow-100 px-2 py-1 rounded ml-1 font-mono text-xs">
                        sui move build && sui client publish
                      </code>
                    </li>
                    <li className="mb-2">
                      Cập nhật GAME_PACKAGE_ID trong file 
                      <code className="bg-yellow-100 px-2 py-1 rounded ml-1 font-mono text-xs">
                        src/constants/index.ts
                      </code>
                    </li>
                    <li>
                      Đảm bảo wallet đang kết nối với <strong className="font-semibold">testnet</strong> (không phải mainnet)
                    </li>
                  </ol>
                </div>
                <button
                  disabled
                  className="px-8 py-4 bg-gray-400 text-white rounded-xl cursor-not-allowed font-semibold text-lg"
                >
                  Contract chưa sẵn sàng
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  Create a new game to start your farming journey!
                </p>
                <button
                  onClick={handleCreateGame}
                  disabled={loading || isPending}
                  className="px-8 py-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 font-semibold text-lg"
                >
                  {loading || isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 inline-block animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Game"
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Transfer Coins Section */}
        {gameState && (
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Transfer Coins</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                placeholder="Recipient address"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Amount (MIST)"
                className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => handleAction(
                  () => transferCoins(gameStateId!, transferRecipient, parseInt(transferAmount)),
                  "transfer coins"
                )}
                disabled={loading || isPending || !transferRecipient || !transferAmount || gameState.coins < parseInt(transferAmount) || parseInt(transferAmount) <= 0}
                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Transfer
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {(loading || isPending) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-gray-700">Processing transaction...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

