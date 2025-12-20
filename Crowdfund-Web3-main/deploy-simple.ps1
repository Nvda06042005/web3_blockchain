# Simple deployment script - Chạy trong thư mục Crowdfund-Web3-main
Write-Host "🎮 Deploying Pig Farming Game..." -ForegroundColor Cyan

# Check network
Write-Host "`n📡 Checking network..." -ForegroundColor Yellow
$env = sui client active-env
if ($env -ne "testnet") {
    Write-Host "⚠️  Switching to testnet..." -ForegroundColor Yellow
    sui client switch --env testnet
}

# Build
Write-Host "`n🔨 Building contract..." -ForegroundColor Yellow
sui move build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy
Write-Host "`n🚀 Deploying to testnet..." -ForegroundColor Yellow
Write-Host "   (Please approve the transaction in your wallet)" -ForegroundColor Gray
Write-Host ""

sui client publish --gas-budget 500000000

Write-Host "`n✅ Done! Please copy the PackageID from above and update src/constants/index.ts" -ForegroundColor Green

