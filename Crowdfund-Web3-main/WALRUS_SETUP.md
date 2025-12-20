# 💾 Walrus Integration Guide

## Walrus Là Gì?

**Walrus** là decentralized storage protocol được xây dựng bởi Mysten Labs (team đằng sau Sui). Nó cho phép lưu trữ dữ liệu phi tập trung với chi phí thấp và độ tin cậy cao.

### So Sánh với IPFS/Arweave

| Feature | Walrus | IPFS | Arweave |
|---------|--------|------|---------|
| Tích hợp Sui | ✅ Native | ❌ | ❌ |
| Chi phí | Rất thấp | Miễn phí (nhưng cần pinning) | Một lần, cao |
| Tốc độ | Rất nhanh | Trung bình | Trung bình |
| Độ tin cậy | Cao (erasure coding) | Phụ thuộc pinning | Vĩnh viễn |

---

## 🚀 Setup Walrus cho PigLife

### Bước 1: Cài Đặt Dependencies

```bash
cd Crowdfund-Web3-main
npm install @mysten/walrus dotenv
```

### Bước 2: Tạo `.env` File

```env
# Sui Private Key (export từ wallet hoặc tạo mới)
SUI_PRIVATE_KEY=suiprivkey1q...

# Optional: Walrus storage node endpoint
WALRUS_STORAGE_NODE=https://storage.walrus-testnet.walrus.space
```

⚠️ **Lưu ý**: Không commit file `.env` lên GitHub!

Thêm vào `.gitignore`:
```
.env
.env.local
```

### Bước 3: Export Private Key từ Sui CLI

```bash
# Hiển thị private key
sui keytool export --key-identity <your-address>

# Output: suiprivkey1q...
```

Copy private key và paste vào `.env`.

---

## 📝 Code Examples

### 1. Backup Game State

```typescript
import { saveGameStateToWalrus } from "./utils/walrus";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";

// Trong component
const handleBackup = async () => {
  // Get signer from private key
  const secret = process.env.SUI_PRIVATE_KEY!;
  const { secretKey } = decodeSuiPrivateKey(secret);
  const signer = Ed25519Keypair.fromSecretKey(secretKey);
  
  // Convert game state to backup format
  const backup = toBackupFormat(gameState);
  
  // Save to Walrus
  const blobId = await saveGameStateToWalrus(backup, signer);
  
  console.log("✅ Backed up! Blob ID:", blobId);
  alert(`Backup successful! Blob ID: ${blobId}`);
};
```

### 2. Restore Game State

```typescript
import { loadGameStateFromWalrus } from "./utils/walrus";

const handleRestore = async () => {
  const blobId = prompt("Enter Blob ID:");
  
  if (!blobId) return;
  
  try {
    const gameState = await loadGameStateFromWalrus(blobId);
    console.log("✅ Restored game state:", gameState);
    
    // Apply restored state to game
    // Note: Cần logic để sync với on-chain state
    setGameState(gameState);
    
    alert("Game state restored!");
  } catch (error) {
    console.error("❌ Restore failed:", error);
    alert("Failed to restore. Invalid Blob ID?");
  }
};
```

### 3. Auto Backup

```typescript
import { autoBackup } from "./utils/walrus";

// Trong useEffect
useEffect(() => {
  if (!gameState) return;
  
  // Auto backup every hour
  const interval = setInterval(async () => {
    try {
      const blobId = await autoBackup(gameState, signer);
      
      if (blobId) {
        console.log("🔄 Auto-backed up to Walrus:", blobId);
        showNotification("Game auto-saved to Walrus!");
      }
    } catch (error) {
      console.error("Auto-backup failed:", error);
    }
  }, 60 * 60 * 1000); // 1 hour
  
  return () => clearInterval(interval);
}, [gameState]);
```

### 4. View Backup History

```typescript
import { getBackupHistory } from "./utils/walrus";

const BackupHistory = ({ playerAddress }: { playerAddress: string }) => {
  const history = getBackupHistory(playerAddress);
  
  return (
    <div>
      <h3>Backup History</h3>
      {history.map((backup) => (
        <div key={backup.blobId}>
          <p>Time: {new Date(backup.timestamp).toLocaleString()}</p>
          <p>House Level: {backup.house_level}</p>
          <p>Pig Level: {backup.pig_level}</p>
          <button onClick={() => restoreBackup(backup.blobId)}>
            Restore
          </button>
          <a 
            href={`https://aggregator.walrus-testnet.walrus.space/v1/${backup.blobId}`}
            target="_blank"
          >
            View on Walrus
          </a>
        </div>
      ))}
    </div>
  );
};
```

---

## 💰 Chi Phí Storage

### Testnet (Miễn Phí)

Testnet SUI miễn phí, nên storage cũng miễn phí.

### Mainnet (Production)

Chi phí phụ thuộc vào:
1. **Storage size**: Kích thước dữ liệu (bytes)
2. **Epochs**: Số epochs lưu trữ (1 epoch ≈ 24 hours)

Ví dụ:
```typescript
// 1KB data, 10 epochs (~10 days)
const cost = calculateStorageCost(1024, 10);
// ≈ 0.001 SUI (~$0.001 USD)
```

Backup game state PigLife (~2KB) cho 30 days:
```
Cost ≈ 0.003 SUI (~$0.003 USD)
```

Rất rẻ! 🎉

---

## 🔐 Security Best Practices

### 1. Private Key Management

**❌ KHÔNG BAO GIỜ**:
- Commit private key lên GitHub
- Hardcode private key trong code
- Share private key với ai

**✅ NÊN**:
- Dùng `.env` file (local development)
- Dùng environment variables (production)
- Dùng Sui Wallet signature (frontend)

### 2. Frontend Implementation

Thay vì dùng private key trực tiếp, sử dụng Sui Wallet:

```typescript
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

const handleBackupWithWallet = async () => {
  // Create transaction to store blob ID on-chain
  const tx = new Transaction();
  
  // ... add move calls to store blobId metadata
  
  // User signs in wallet UI
  const result = await signAndExecute({ transaction: tx });
  
  console.log("Backup tx:", result.digest);
};
```

### 3. Verify Blob Existence

Trước khi restore, verify blob tồn tại:

```typescript
import { verifyBlobExists } from "./utils/walrus";

const isValid = await verifyBlobExists(blobId);

if (!isValid) {
  alert("Blob không tồn tại hoặc đã bị xóa!");
  return;
}
```

---

## 🧪 Testing

### Unit Test

```typescript
// walrus.test.ts
import { describe, it, expect } from "vitest";
import { saveGameStateToWalrus, loadGameStateFromWalrus } from "./utils/walrus";

describe("Walrus Integration", () => {
  it("should save and load game state", async () => {
    const mockState = {
      player: "0x123...",
      social_capital: 100,
      // ... other fields
    };
    
    // Save
    const blobId = await saveGameStateToWalrus(mockState, mockSigner);
    expect(blobId).toBeTruthy();
    
    // Load
    const loaded = await loadGameStateFromWalrus(blobId);
    expect(loaded.player).toBe(mockState.player);
    expect(loaded.social_capital).toBe(mockState.social_capital);
  });
});
```

### Integration Test

```bash
# Test script
npx tsx test-walrus.ts
```

```typescript
// test-walrus.ts
import { saveGameStateToWalrus, loadGameStateFromWalrus } from "./src/utils/walrus";
import { signer } from "./walrus-config";

async function test() {
  console.log("🧪 Testing Walrus integration...");
  
  const testState = {
    player: "0xtest",
    social_capital: 999,
    life_token: 888,
    // ... full state
    backup_timestamp: Date.now(),
  };
  
  // Test write
  console.log("📝 Writing to Walrus...");
  const blobId = await saveGameStateToWalrus(testState, signer);
  console.log("✅ Blob ID:", blobId);
  
  // Test read
  console.log("📖 Reading from Walrus...");
  const loaded = await loadGameStateFromWalrus(blobId);
  console.log("✅ Loaded:", loaded);
  
  // Verify
  if (loaded.player === testState.player) {
    console.log("✅ TEST PASSED!");
  } else {
    console.log("❌ TEST FAILED!");
  }
}

test().catch(console.error);
```

---

## 🌐 Production Deployment

### Environment Variables

**Vercel**:
```bash
vercel env add SUI_PRIVATE_KEY
# Paste private key when prompted
```

**Netlify**:
Site settings → Environment variables → Add variable
- Key: `SUI_PRIVATE_KEY`
- Value: `suiprivkey1q...`

### API Route (để ẩn private key)

Tạo API endpoint để backup từ server:

```typescript
// api/backup.ts (Vercel serverless function)
import { saveGameStateToWalrus } from "../utils/walrus";
import { signer } from "../walrus-config";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    const { gameState } = req.body;
    
    // Verify signature (optional)
    // ...
    
    // Save to Walrus
    const blobId = await saveGameStateToWalrus(gameState, signer);
    
    res.status(200).json({ blobId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

Frontend gọi API:

```typescript
const handleBackup = async () => {
  const response = await fetch("/api/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameState }),
  });
  
  const { blobId } = await response.json();
  console.log("Backed up:", blobId);
};
```

---

## 📊 Monitoring & Analytics

### Track Backup Usage

```typescript
// utils/analytics.ts
export function trackBackup(blobId: string, size: number) {
  console.log("📊 Backup created:", {
    blobId,
    size,
    timestamp: Date.now(),
  });
  
  // Send to analytics service (optional)
  // fetch('/api/analytics', { ... });
}
```

### Storage Stats

```typescript
export function getStorageStats(playerAddress: string) {
  const history = getBackupHistory(playerAddress);
  
  return {
    totalBackups: history.length,
    oldestBackup: history[history.length - 1]?.timestamp,
    newestBackup: history[0]?.timestamp,
    // Estimate total size (each backup ~2KB)
    estimatedTotalSize: history.length * 2048,
  };
}
```

---

## 🎯 Advanced Features

### 1. Incremental Backups

Chỉ backup những thay đổi:

```typescript
export async function incrementalBackup(
  currentState: GameStateBackup,
  previousBlobId: string
) {
  // Load previous state
  const previousState = await loadGameStateFromWalrus(previousBlobId);
  
  // Calculate diff
  const diff = calculateDiff(previousState, currentState);
  
  // Only save diff if changes are significant
  if (diff.changeCount < 3) {
    console.log("⏭️ No significant changes, skipping backup");
    return null;
  }
  
  // Save full state
  return await saveGameStateToWalrus(currentState, signer);
}
```

### 2. Compression

Giảm storage cost:

```typescript
import pako from "pako";

export async function saveCompressed(gameState: GameStateBackup, signer: any) {
  const json = JSON.stringify(gameState);
  const compressed = pako.gzip(json);
  
  const { blobId } = await walrusClient.writeBlob({
    blob: compressed,
    deletable: false,
    epochs: 10,
    signer,
  });
  
  return blobId;
}

export async function loadCompressed(blobId: string): Promise<GameStateBackup> {
  const blob = await walrusClient.readBlob({ blobId });
  const decompressed = pako.ungzip(blob, { to: "string" });
  return JSON.parse(decompressed);
}
```

### 3. Encrypted Backups

Bảo mật dữ liệu người chơi:

```typescript
import CryptoJS from "crypto-js";

export async function saveEncrypted(
  gameState: GameStateBackup,
  password: string,
  signer: any
) {
  const json = JSON.stringify(gameState);
  const encrypted = CryptoJS.AES.encrypt(json, password).toString();
  const data = new TextEncoder().encode(encrypted);
  
  const { blobId } = await walrusClient.writeBlob({
    blob: data,
    deletable: false,
    epochs: 10,
    signer,
  });
  
  return blobId;
}

export async function loadEncrypted(
  blobId: string,
  password: string
): Promise<GameStateBackup> {
  const blob = await walrusClient.readBlob({ blobId });
  const encrypted = new TextDecoder().decode(blob);
  const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
}
```

---

## 🆘 Troubleshooting

### Lỗi: "Failed to write blob"

**Nguyên nhân**: Không đủ SUI để trả phí storage

**Giải pháp**:
```bash
# Check balance
sui client gas

# Get testnet SUI
!faucet <address>  # trên Discord Sui
```

### Lỗi: "Blob not found"

**Nguyên nhân**: Blob đã hết hạn hoặc bị xóa

**Giải pháp**:
- Tăng số epochs khi backup
- Sử dụng `deletable: false`

### Lỗi: "Timeout"

**Nguyên nhân**: Network chậm

**Giải pháp**:
```typescript
const walrusClient = new WalrusClient({
  suiClient,
  network: "testnet",
  storageNodeClientOptions: {
    timeout: 120_000, // ← Tăng timeout lên 2 phút
  },
});
```

---

## 🎓 Tài Liệu Tham Khảo

- **Walrus Docs**: https://docs.walrus.site/
- **Walrus Blog**: https://blog.sui.io/walrus-decentralized-storage/
- **TypeScript SDK**: https://www.npmjs.com/package/@mysten/walrus
- **Sui Discord**: https://discord.gg/sui (kênh #walrus)

---

**Happy Building! 🚀**

