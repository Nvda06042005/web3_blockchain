#!/bin/bash
# Bash script to deploy Pig Farming Game contract to Sui Testnet
# Usage: ./deploy-game.sh

echo "🎮 Deploying Pig Farming Game Contract to Sui Testnet..."
echo ""

# Check if sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo "❌ Error: Sui CLI not found. Please install it first:"
    echo "   https://docs.sui.io/build/install"
    exit 1
fi

echo "✅ Sui CLI found: $(sui --version)"

# Check current network
echo ""
echo "📡 Checking network configuration..."
ACTIVE_ENV=$(sui client active-env)
echo "Current environment: $ACTIVE_ENV"

if [ "$ACTIVE_ENV" != "testnet" ]; then
    echo ""
    echo "⚠️  Warning: Not on testnet. Switching to testnet..."
    sui client switch --env testnet
    echo "✅ Switched to testnet"
fi

# Build the contract
echo ""
echo "🔨 Building smart contract..."
sui move build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Deploy the contract
echo ""
echo "🚀 Deploying contract to testnet..."
echo "   (This may take a few moments...)"
echo ""

DEPLOY_OUTPUT=$(sui client publish --gas-budget 500000000 2>&1)

# Extract Package ID from output
PACKAGE_ID=$(echo "$DEPLOY_OUTPUT" | grep -oP 'PackageID:\s*\K0x[a-fA-F0-9]+' | head -1)

if [ -n "$PACKAGE_ID" ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📦 Package ID: $PACKAGE_ID"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Copy the Package ID above"
    echo "   2. Open: src/constants/index.ts"
    echo "   3. Update GAME_PACKAGE_ID with: $PACKAGE_ID"
    echo "   4. Save the file and refresh your browser!"
    echo ""
    echo "💡 Tip: Make sure your wallet is connected to Testnet!"
else
    echo ""
    echo "⚠️  Deployment output:"
    echo "$DEPLOY_OUTPUT"
    echo ""
    echo "Please check the output above for the Package ID."
    echo "Look for a line like: PackageID: 0x..."
fi

