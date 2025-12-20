# PowerShell script to deploy Pig Farming Game contract to Sui Testnet
# Usage: .\deploy-game.ps1

Write-Host "🎮 Deploying Pig Farming Game Contract to Sui Testnet..." -ForegroundColor Cyan
Write-Host ""

# Check if sui CLI is installed
$suiVersion = sui --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Sui CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   https://docs.sui.io/build/install" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Sui CLI found: $suiVersion" -ForegroundColor Green

# Check current network
Write-Host ""
Write-Host "📡 Checking network configuration..." -ForegroundColor Cyan
$activeEnv = sui client active-env
Write-Host "Current environment: $activeEnv" -ForegroundColor Yellow

if ($activeEnv -ne "testnet") {
    Write-Host ""
    Write-Host "⚠️  Warning: Not on testnet. Switching to testnet..." -ForegroundColor Yellow
    sui client switch --env testnet
    Write-Host "✅ Switched to testnet" -ForegroundColor Green
}

# Build the contract
Write-Host ""
Write-Host "🔨 Building smart contract..." -ForegroundColor Cyan
sui move build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Deploy the contract
Write-Host ""
Write-Host "🚀 Deploying contract to testnet..." -ForegroundColor Cyan
Write-Host "   (This may take a few moments...)" -ForegroundColor Yellow
Write-Host ""

$deployOutput = sui client publish --gas-budget 500000000 2>&1 | Out-String

# Extract Package ID from output
$packageIdMatch = [regex]::Match($deployOutput, 'PackageID:\s*(0x[a-fA-F0-9]+)')
if ($packageIdMatch.Success) {
    $packageId = $packageIdMatch.Groups[1].Value
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Package ID: $packageId" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Copy the Package ID above" -ForegroundColor White
    Write-Host "   2. Open: src/constants/index.ts" -ForegroundColor White
    Write-Host "   3. Update GAME_PACKAGE_ID with: $packageId" -ForegroundColor White
    Write-Host "   4. Save the file and refresh your browser!" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Tip: Make sure your wallet is connected to Testnet!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "⚠️  Deployment output:" -ForegroundColor Yellow
    Write-Host $deployOutput
    Write-Host ""
    Write-Host "Please check the output above for the Package ID." -ForegroundColor Yellow
    Write-Host "Look for a line like: PackageID: 0x..." -ForegroundColor Yellow
}

