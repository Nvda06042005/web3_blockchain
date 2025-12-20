# 🐷 PigLife - Hướng Dẫn Deploy & Sử Dụng

## Giới Thiệu

**PigLife** là game Web3 Social Farming hoàn chỉnh được xây dựng trên Sui blockchain và sử dụng Walrus để lưu trữ phi tập trung.

### Tính Năng Chính

- 🐷 **Pig Farming**: Nuôi heo, level up, kiếm Life Tokens
- 🌱 **Farming System**: Trồng cây, thu hoạch gỗ
- 🏠 **Building System**: Xây nhà từ thô sơ đến hiện đại
- 👥 **Social Actions**: Post, check-in, share, invite để kiếm Social Capital
- 🏆 **CEO Race**: Người đầu tiên đạt House Level 4 nhận 50 SUI!
- 💾 **Walrus Integration**: Backup game state lên decentralized storage

---

## 📋 Yêu Cầu

### 1. Cài Đặt Sui CLI

```bash
# macOS/Linux
brew install sui

# Hoặc tải từ
# https://github.com/MystenLabs/sui/releases
```

Kiểm tra:
```bash
sui --version
# Cần: sui 1.40.0 hoặc cao hơn
```

### 2. Cấu Hình Sui Wallet

```bash
# Tạo wallet mới (nếu chưa có)
sui client new-address ed25519

# Chuyển sang testnet
sui client switch --env testnet

# Kiểm tra address
sui client active-address

# Lấy testnet SUI
# Vào: https://discord.gg/sui
# Channel: #testnet-faucet
# Request: !faucet <YOUR_ADDRESS>
```

### 3. Cài Đặt Node.js Dependencies

```bash
cd Crowdfund-Web3-main
npm install

# Cài thêm Walrus SDK
npm install @mysten/walrus
```

---

## 🚀 Bước 1: Deploy Smart Contract

### 1.1. Build Contract

```bash
cd Crowdfund-Web3-main
sui move build
```

Nếu thành công, bạn sẽ thấy:
```
INCLUDING DEPENDENCY Sui
INCLUDING DEPENDENCY MoveStdlib
BUILDING crowdfund
```

### 1.2. Deploy Contract

```bash
sui client publish --gas-budget 500000000
```

**Quan Trọng**: Lưu lại các thông tin sau từ kết quả deploy:

```
╭─────────────────────────────────────────────────────────────────────────────────╮
│ Published Objects                                                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│ PackageID: 0x8d9da4491686312e8c95ac7765ad869f599aec21e56c4982e9ad45b6a3f232ab  │  ← LƯU CÁI NÀY
│ Version: 1                                                                       │
│ ...                                                                              │
╰─────────────────────────────────────────────────────────────────────────────────╯
```

### 1.3. Cập Nhật Package ID

Mở file `src/constants/index.ts`:

```typescript
export const GAME_PACKAGE_ID = "0x8d9da..."; // ← THAY BẰNG PACKAGE ID CỦA BẠN
```

---

## 🎮 Bước 2: Chạy Frontend

### 2.1. Start Development Server

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:5173`

### 2.2. Truy Cập Game

1. Mở trình duyệt: `http://localhost:5173/piglife`
2. Install Sui Wallet extension nếu chưa có:
   - Chrome: https://chrome.google.com/webstore/detail/sui-wallet/
3. Connect wallet (chọn **Testnet**)
4. Click **"Start Playing"**

---

## 💾 Bước 3: Cấu Hình Walrus (Tùy Chọn)

Walrus được sử dụng để backup game state lên decentralized storage.

### 3.1. Setup Walrus Client

Tạo file `.env` trong `Crowdfund-Web3-main`:

```env
SUI_PRIVATE_KEY=suiprivkey...  # Your private key
```

### 3.2. Test Walrus

Tạo file `walrus-test.ts`:

```typescript
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { WalrusClient } from "@mysten/walrus";

const secret = process.env.SUI_PRIVATE_KEY! as string;
const { secretKey } = decodeSuiPrivateKey(secret);
const signer = Ed25519Keypair.fromSecretKey(secretKey);

const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

const walrusClient = new WalrusClient({
  suiClient: suiClient as any,
  network: "testnet",
  storageNodeClientOptions: {
    timeout: 60_000,
  },
});

async function main() {
  // Test write
  const data = new TextEncoder().encode("Hello PigLife on Walrus!");
  
  const { blobId } = await walrusClient.writeBlob({
    blob: data,
    deletable: false,
    epochs: 3,
    signer,
  });

  console.log("✅ Blob ID:", blobId);

  // Test read
  const blob = await walrusClient.readBlob({ blobId });
  const decoded = new TextDecoder().decode(blob);
  console.log("✅ Read back:", decoded);
}

main().catch(console.error);
```

Chạy:
```bash
npx tsx walrus-test.ts
```

---

## 🎯 Cách Chơi

### 1. Nuôi Heo (Pig Farming)

- **Cost**: 10 Social Capital
- **Reward**: 5 Life Token + EXP
- **Cooldown**: 4 giờ
- **Level Up**: Mỗi 100 EXP = 1 level

### 2. Social Actions (Kiếm Social Capital)

| Action | Reward | Note |
|--------|--------|------|
| 📅 Daily Check-in | +20 SC | Mỗi ngày 1 lần |
| ✍️ Create Post | +50 SC | Không giới hạn |
| 🔄 Share Content | +30 SC | Không giới hạn |
| 👥 Invite Friend | +100 SC | Không giới hạn |

### 3. Farming (Trồng Trọt)

1. **Buy Seeds**: 10 Life Token → 1 Seed
2. **Plant Tree**: 1 Seed → 1 Tree (cần thời gian để lớn)
3. **Harvest Wood**: 1 Tree trưởng thành → 3 Wood

### 4. Building (Xây Dựng)

- **Build House**: 10 Wood → +1 House Level
- **Donate for Wood**: 1 SUI → 5 Premium Wood
- **Sell Wood**: 1 Wood → 0.5 SUI

### 5. CEO Race (Giải Thưởng)

- Đạt **House Level 4** → Trở thành CEO
- **Người đầu tiên** đạt CEO → Nhận **50 SUI**!
- Sau mỗi **1 giờ** (season), game reset và bắt đầu race mới

---

## 🔧 Troubleshooting

### Lỗi: "Contract chưa được deploy"

**Nguyên nhân**: `GAME_PACKAGE_ID` chưa được cập nhật

**Giải pháp**:
1. Deploy contract (xem Bước 1.2)
2. Cập nhật `GAME_PACKAGE_ID` trong `src/constants/index.ts`

### Lỗi: "Network mismatch"

**Nguyên nhân**: Wallet đang connect với Mainnet thay vì Testnet

**Giải pháp**:
1. Mở Sui Wallet extension
2. Settings → Network → Chọn **Testnet**

### Lỗi: "Insufficient funds"

**Nguyên nhân**: Không đủ SUI trong wallet

**Giải pháp**:
1. Vào Discord Sui: https://discord.gg/sui
2. Channel: `#testnet-faucet`
3. Request: `!faucet <YOUR_ADDRESS>`

### Lỗi: "Transaction failed"

**Nguyên nhân**: Không đủ resource trong game

**Giải pháp**:
- Check **Social Capital** để feed pig
- Check **Life Token** để buy seeds
- Check **Wood** để build house

---

## 📱 Walrus Backup Features

### Auto Backup

Game tự động backup mỗi 1 giờ lên Walrus.

### Manual Backup

1. Click **"Backup to Walrus"**
2. Sign transaction
3. Lưu Blob ID để restore sau

### Export/Import JSON

1. **Export**: Click **"Export JSON"** → Download file
2. **Import**: Upload file JSON để restore

### View Backup History

```typescript
import { getBackupHistory } from "./utils/walrus";

const history = getBackupHistory(playerAddress);
console.log(history);
// [
//   { blobId: "...", timestamp: 123456, house_level: 3, pig_level: 5 },
//   ...
// ]
```

---

## 🎨 Customization

### Thay Đổi Màu Sắc

Edit `src/components/piglife/PigLifeGame.tsx`:

```typescript
const colors = {
  purple: "from-purple-500 to-purple-600",  // ← Đổi màu tím
  pink: "from-pink-500 to-pink-600",        // ← Đổi màu hồng
  // ...
};
```

### Thay Đổi Giá Trị Game

Edit `sources/pig_life.move`:

```rust
const FEED_COST_SC: u64 = 10;         // ← Chi phí feed pig
const FEED_REWARD_LT: u64 = 5;        // ← Phần thưởng LT
const CEO_REWARD: u64 = 50_000_000_000; // ← Giải CEO (50 SUI)
```

Sau đó re-deploy contract.

---

## 🚢 Deploy Production

### 1. Build Frontend

```bash
npm run build
```

### 2. Deploy lên Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Cấu Hình Custom Domain (Tùy Chọn)

Vercel Dashboard → Settings → Domains → Add domain

---

## 📚 Tài Liệu Tham Khảo

- **Sui Docs**: https://docs.sui.io/
- **Walrus Docs**: https://docs.walrus.site/
- **Move Language**: https://move-language.github.io/move/
- **Sui TypeScript SDK**: https://sdk.mystenlabs.com/typescript

---

## 🐛 Báo Lỗi & Hỗ Trợ

Nếu gặp vấn đề:

1. Check console log: `Ctrl+Shift+J` (Chrome)
2. Check Sui Explorer: https://suiscan.xyz/testnet
3. Open issue trên GitHub

---

## 🎉 Chúc Bạn Chơi Game Vui Vẻ!

Hãy trở thành CEO đầu tiên và nhận 50 SUI! 🏆

---

**Created by**: Your Team  
**Version**: 1.0.0  
**License**: MIT

