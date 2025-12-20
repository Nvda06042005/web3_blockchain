# 🚀 CrowdFund - Decentralized Crowdfunding Platform on Sui

<p align="center">
  <img src="https://img.shields.io/badge/Sui-Blockchain-4DA2FF?style=for-the-badge&logo=sui" alt="Sui" />
  <img src="https://img.shields.io/badge/Move-Language-orange?style=for-the-badge" alt="Move" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
</p>

A modern, transparent crowdfunding platform built on the **Sui blockchain**. Inspired by Kickstarter's design, CrowdFund enables creators to launch campaigns and receive support through cryptocurrency, with all transactions recorded on-chain for complete transparency.

## ✨ Features

### For Creators
- 📁 **Project Management** - Create and manage multiple projects
- 🎯 **Campaign Creation** - Launch campaigns with customizable goals, durations, and categories
- 🏷️ **Tier System** - Set up sponsorship tiers with different reward levels
- 📊 **Transaction History** - View detailed transaction logs (fees, donor addresses)
- 💰 **Withdraw Funds** - Securely withdraw collected funds after campaign ends
- 🔄 **Campaign Extension** - Extend campaigns up to 2 times if ≥50% funded

### For Supporters
- 🔍 **Explore Campaigns** - Browse campaigns by category
- 💳 **Easy Donations** - Donate using SUI cryptocurrency
- 🎁 **NFT Rewards** - Receive Supporter NFTs as proof of contribution
- 📜 **Transparent History** - View all public transaction records on-chain

### Platform Features
- 🔐 **Wallet Integration** - Connect with Sui-compatible wallets
- 📱 **Responsive Design** - Works on desktop and mobile
- ⛓️ **On-Chain Transparency** - All transactions recorded on Sui blockchain
- 💸 **Low Fees** - Only 1.5% total fee (0.75% deposit + 0.75% withdraw)

## 🏗️ Architecture

```
CrowdFund/
├── sources/                    # Move Smart Contracts
│   ├── crowdfund.move         # Platform module (admin, fees, treasury)
│   ├── project.move           # Project management
│   ├── campaign.move          # Campaign logic (donate, withdraw, extend)
│   └── supporter_nft.move     # NFT rewards for supporters
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # UI Components
│   │   ├── pages/             # Page views
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript types
│   │   └── constants/         # Contract addresses & config
│   └── ...
└── tests/                      # Move unit tests
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Sui Network (Testnet) |
| **Smart Contracts** | Move Language (2024.beta) |
| **Frontend** | React 19 + Vite 7 |
| **Styling** | Tailwind CSS v4 |
| **Wallet** | @mysten/dapp-kit |
| **State** | TanStack Query |

## 📦 Smart Contract Addresses (Testnet)

| Contract | Address |
|----------|---------|
| **Package ID** | `0x07897bdfa92bd6c147ed99b84069c088b04a74ffff960c199dec8705f23b9e51` |
| **Platform ID** | `0xb76f9697bd8896af62f1b2b06756e73c9fe6ea7aa80bd7fb65e2454d1494275c` |
| **Admin Cap** | `0xc2bd45db9558956c1f928668e58d2f78c7b48090b162fd411e521bc252e6a727` |

## 🚀 Getting Started

### Prerequisites

- [Sui CLI](https://docs.sui.io/build/install) installed
- [Node.js](https://nodejs.org/) v18+
- Sui wallet with testnet SUI tokens

### 1. Clone Repository

```bash
git clone https://github.com/your-username/crowdfund.git
cd crowdfund
```

### 2. Deploy Smart Contracts (Optional)

```bash
# Build contracts
sui move build

# Deploy to testnet
sui client publish --gas-budget 500000000

# Update PACKAGE_ID and PLATFORM_ID in frontend/src/constants/index.ts
```

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## 📖 Usage Guide

### Creating a Campaign

1. **Connect Wallet** - Click "Connect" button
2. **Create Project** - Go to "My Projects" → "Create Project"
3. **Create Campaign** - Select project → "New Campaign"
4. **Set Details**:
   - Choose Category (Art, Technology, Games, etc.)
   - Set funding goal (in SUI)
   - Set duration (1-365 days)
5. **Launch** - Click "Create Campaign"

### Donating to a Campaign

1. **Browse Campaigns** - Use "Explore" or filter by category
2. **Select Campaign** - Click on campaign card
3. **Donate** - Enter amount and optional message
4. **Confirm** - Approve transaction in wallet
5. **Receive NFT** - Get Supporter NFT as proof of donation

### Withdrawing Funds (Creators)

1. **Wait for Campaign End** - Campaign must reach end date
2. **Go to Campaign** - Open your campaign detail page
3. **Click Withdraw** - Click "Withdraw Funds" button
4. **Confirm** - Approve transaction in wallet
5. **Done** - Funds transferred to your wallet (minus 0.75% fee)

## 🏷️ Categories

| | | | |
|---|---|---|---|
| 🎨 Art | 📚 Comics | ✂️ Crafts | 💃 Dance |
| 🎨 Design | 👗 Fashion | 🎬 Film | 🍕 Food |
| 🎮 Games | 📰 Journalism | 🎵 Music | 📷 Photography |
| 📖 Publishing | 💻 Technology | 🎭 Theater | 📦 Other |

## 💰 Fee Structure

| Action | Fee | Description |
|--------|-----|-------------|
| **Deposit** | 0.75% | Charged when supporters donate |
| **Withdraw** | 0.75% | Charged when creators withdraw |
| **Total** | 1.5% | Total platform fee |

## 🔒 Security Features

- ✅ **Keep-it-all Model** - Creators keep all funds (no refunds)
- ✅ **Owner Verification** - Only project owners can create/manage campaigns
- ✅ **Status Tracking** - Campaigns have clear states (Active, Ended, Withdrawn)
- ✅ **Extension Limits** - Max 2 extensions, only if ≥50% funded
- ✅ **On-chain History** - All transactions permanently recorded

## 🛣️ Roadmap

- [x] Core smart contracts
- [x] Basic frontend with wallet integration
- [x] Kickstarter-style UI
- [x] Category filtering
- [x] Transaction history transparency
- [ ] Walrus Sites integration
- [ ] Social sharing features
- [ ] Campaign updates/milestones
- [ ] Multi-language support
- [ ] Mainnet deployment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Sui Foundation](https://sui.io/) for the blockchain infrastructure
- [Mysten Labs](https://mystenlabs.com/) for dApp toolkit
- [Kickstarter](https://kickstarter.com/) for UI/UX inspiration

---

<p align="center">
  Built with ❤️ on <strong>Sui Blockchain</strong>
</p>
