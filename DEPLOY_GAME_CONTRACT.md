# 🎮 Hướng dẫn Deploy Game Contract - Pig Farming Game

## 📋 Yêu cầu trước khi deploy

1. ✅ Đã cài đặt [Sui CLI](https://docs.sui.io/build/install)
2. ✅ Đã có Sui wallet với testnet SUI tokens
3. ✅ Wallet đang kết nối với **Testnet** (không phải Mainnet)

## 🚀 Các bước deploy

### Bước 1: Build Smart Contract

Mở terminal trong thư mục dự án và chạy:

```bash
cd Crowdfund-Web3-main
sui move build
```

Nếu build thành công, bạn sẽ thấy:
```
BUILDING crowdfund
```

(Có thể có warnings, nhưng không sao, đó chỉ là cảnh báo về style)

### Bước 2: Deploy lên Sui Testnet

```bash
sui client publish --gas-budget 500000000
```

**Lưu ý quan trọng:**
- Đảm bảo wallet đang ở **testnet** (không phải mainnet)
- Kiểm tra network: `sui client active-env` (phải là `testnet`)
- Nếu không đúng, chuyển sang testnet: `sui client switch --env testnet`

Sau khi deploy thành công, bạn sẽ nhận được output như sau:

```
Successfully verified dependencies on-chain against source.
Transaction Digest: 0x...
Published Objects:
  ┌──
  │ PackageID: 0x...  <-- ⭐ ĐÂY LÀ GAME_PACKAGE_ID BẠN CẦN
  └──
```

**Copy Package ID này!** (Ví dụ: `0x1234567890abcdef...`)

### Bước 3: Cập nhật Package ID trong code

Mở file `src/constants/index.ts` và tìm dòng:

```typescript
export const GAME_PACKAGE_ID = "0x0"; // TODO: Update after deploying pig_farming contract
```

Thay `"0x0"` bằng Package ID bạn vừa copy:

```typescript
export const GAME_PACKAGE_ID = "0x1234567890abcdef..."; // Package ID từ bước deploy
```

**Lưu file và refresh trang web!**

### Bước 4: Kiểm tra Network trong Wallet

1. Mở wallet (Slush, Sui Wallet, Suiet, etc.)
2. Đảm bảo network đang là **Testnet**
3. Nếu là Mainnet, chuyển sang Testnet trong settings của wallet

### Bước 5: Test Game

1. Refresh trang `/game` trong browser
2. Click nút **"Create Game"**
3. Approve transaction trong wallet
4. Đợi transaction hoàn thành
5. Game state sẽ được tạo và hiển thị!

## 🔧 Troubleshooting

### Lỗi: "Package object does not exist"
- ✅ Kiểm tra GAME_PACKAGE_ID đã được cập nhật chưa
- ✅ Đảm bảo đã copy đúng Package ID (không có khoảng trắng)

### Lỗi: "Network mismatch"
- ✅ Wallet phải ở **Testnet** (không phải Mainnet)
- ✅ App đã được set testnet trong `src/main.tsx`

### Lỗi: "Insufficient gas"
- ✅ Cần có SUI trong wallet để trả gas fee
- ✅ Lấy testnet SUI từ faucet: https://docs.sui.io/guides/developer/getting-started/get-coins

### Build failed
- ✅ Kiểm tra Sui CLI version: `sui --version`
- ✅ Update Sui CLI nếu cần: `cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui`

## 📝 Lưu ý

- Mỗi lần deploy sẽ tạo Package ID mới
- Nếu deploy lại, phải cập nhật GAME_PACKAGE_ID mới
- Contract chỉ hoạt động trên network đã deploy (testnet/mainnet)
- Gas fee trên testnet rất thấp (gần như miễn phí)

## ✅ Checklist

- [ ] Build contract thành công
- [ ] Deploy lên testnet thành công
- [ ] Copy Package ID
- [ ] Cập nhật GAME_PACKAGE_ID trong `src/constants/index.ts`
- [ ] Wallet đang ở testnet
- [ ] Refresh trang `/game`
- [ ] Click "Create Game" và approve transaction
- [ ] Game state hiển thị thành công!

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước, game sẽ sẵn sàng sử dụng!
