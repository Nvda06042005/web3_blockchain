# ===================================
# DEPLOY PIG FARMING GAME CONTRACT
# ===================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DEPLOY PIG FARMING GAME CONTRACT   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Sui CLI
Write-Host "[1/6] Checking Sui CLI..." -ForegroundColor Yellow
$suiVersion = & sui --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Sui CLI not found! Please install from: https://docs.sui.io/build/install" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Sui CLI found: $suiVersion" -ForegroundColor Green

# Step 2: Check network
Write-Host "`n[2/6] Checking network..." -ForegroundColor Yellow
$activeEnv = & sui client active-env 2>&1
Write-Host "Current network: $activeEnv" -ForegroundColor White

if ($activeEnv -notmatch "testnet") {
    Write-Host "Switching to testnet..." -ForegroundColor Yellow
    & sui client switch --env testnet
    Write-Host "✓ Switched to testnet" -ForegroundColor Green
}
else {
    Write-Host "✓ Already on testnet" -ForegroundColor Green
}

# Step 3: Check wallet
Write-Host "`n[3/6] Checking wallet..." -ForegroundColor Yellow
$activeAddress = & sui client active-address 2>&1
Write-Host "Active address: $activeAddress" -ForegroundColor White
Write-Host "✓ Wallet found" -ForegroundColor Green

Write-Host "`n⚠️  Make sure your wallet has enough SUI for gas fees!" -ForegroundColor Yellow
Write-Host "Press ENTER to continue or Ctrl+C to cancel..." -ForegroundColor White
$null = Read-Host

# Step 4: Build contract
Write-Host "`n[4/6] Building contract..." -ForegroundColor Yellow
& sui move build
if ($LASTEXITCODE -ne 0) {
    Write-Host "X Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green

# Step 5: Deploy contract
Write-Host "`n[5/6] Deploying contract..." -ForegroundColor Yellow
Write-Host "⚠️  Please APPROVE the transaction in your wallet!" -ForegroundColor Yellow
Write-Host ""

$deployOutput = & sui client publish --gas-budget 500000000 2>&1 | Out-String
Write-Host $deployOutput

# Extract Package ID using simpler regex
$packageId = ""
if ($deployOutput -match "PackageID:\s*(0x[a-fA-F0-9]+)") {
    $packageId = $matches[1]
}

if ($packageId) {
    Write-Host "`n✓ Deploy successful!" -ForegroundColor Green
    Write-Host "Package ID: $packageId" -ForegroundColor Cyan
    
    # Step 6: Update constants file
    Write-Host "`n[6/6] Updating constants..." -ForegroundColor Yellow
    $constantsFile = "src/constants/index.ts"
    
    if (Test-Path $constantsFile) {
        $content = Get-Content $constantsFile -Raw
        $searchPattern = 'export const GAME_PACKAGE_ID = "0x0";'
        $replaceWith = 'export const GAME_PACKAGE_ID = "' + $packageId + '";'
        $newContent = $content -replace [regex]::Escape($searchPattern), $replaceWith
        
        Set-Content -Path $constantsFile -Value $newContent -NoNewline
        Write-Host "✓ Updated GAME_PACKAGE_ID in $constantsFile" -ForegroundColor Green
        
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "   DEPLOYMENT COMPLETE!   " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Refresh your browser (F5)" -ForegroundColor White
        Write-Host "2. Make sure your wallet is on TESTNET" -ForegroundColor White
        Write-Host "3. Go to the game page and click 'Create Game'" -ForegroundColor White
        Write-Host ""
        Write-Host "Package ID: $packageId" -ForegroundColor Cyan
    }
    else {
        Write-Host "X Constants file not found!" -ForegroundColor Red
        Write-Host "Please manually update GAME_PACKAGE_ID to: $packageId" -ForegroundColor Yellow
    }
}
else {
    Write-Host "X Could not extract Package ID from output" -ForegroundColor Red
    Write-Host "Please check the output above and manually update GAME_PACKAGE_ID" -ForegroundColor Yellow
    exit 1
}
