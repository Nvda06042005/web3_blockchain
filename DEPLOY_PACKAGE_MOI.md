# 🚀 Hướng Dẫn Deploy Package Mới (Giải Pháp 2)

## ✅ Đã Cập Nhật

1. ✅ `share.move` - Đã loại bỏ dependency Platform
2. ✅ `useContractCalls.ts` - Đã cập nhật để không truyền PLATFORM_ID
3. ✅ `Move.toml` - Đã có sẵn

## 📋 Các Bước Deploy

### Bước 1: Kiểm tra Sui CLI

Đảm bảo bạn đã cài đặt Sui CLI:

```bash
sui --version
```

Nếu chưa có, cài đặt tại: https://docs.sui.io/build/install

### Bước 2: Kiểm tra ví và network

```bash
# Kiểm tra active address
sui client active-address

# Kiểm tra network (nên là testnet)
sui client active-env

# Nếu chưa set testnet
sui client switch --env testnet
```

### Bước 3: Build Contract

```bash
cd "d:\crowfunding\Crowdfund-Web3-thu\Crowdfund-Web3-main"
sui move build
```

**Kết quả mong đợi**: Build thành công, không có lỗi

### Bước 4: Deploy lên Testnet

```bash
sui client publish --gas-budget 500000000
```

**Lưu ý**: Bạn cần có SUI tokens trong ví để trả gas fee

### Bước 5: Lấy Package ID

Sau khi deploy thành công, bạn sẽ thấy output như:

```
Published Objects:
  ┌──
  │ PackageID: 0x1234567890abcdef...
  └──
```

**Copy Package ID này!**

### Bước 6: Cập Nhật Frontend

Mở file `src/constants/index.ts` và cập nhật:

```typescript
export const PACKAGE_ID = "0x..."; // Package ID mới từ bước 5
```

**⚠️ QUAN TRỌNG**: 
- Package mới này chỉ chứa module `share`
- Các module khác (platform, project, campaign) vẫn dùng PACKAGE_ID cũ
- Bạn sẽ có **2 PACKAGE_ID**:
  - PACKAGE_ID cũ: `0x07897bdfa92bd6c147ed99b84069c088b04a74ffff960c199dec8705f23b9e51` (cho platform, project, campaign)
  - PACKAGE_ID mới: `0x...` (cho share module)

### Bước 7: Cập Nhật useContractCalls (Nếu cần)

Nếu bạn muốn dùng 2 PACKAGE_ID khác nhau, cần tạo constant mới:

```typescript
// src/constants/index.ts
export const PACKAGE_ID = "0x07897bdfa92bd6c147ed99b84069c088b04a74ffff960c199dec8705f23b9e51"; // Package cũ
export const SHARE_PACKAGE_ID = "0x..."; // Package mới cho share
```

Và cập nhật `useContractCalls.ts`:

```typescript
import { PACKAGE_ID, SHARE_PACKAGE_ID, MODULES, ... } from "../constants";

// Trong function shareItem:
tx.moveCall({
  target: `${SHARE_PACKAGE_ID}::${MODULES.SHARE}::share_item`,
  // ...
});
```

## 🧪 Test Sau Khi Deploy

1. Mở frontend: `npm run dev`
2. Kết nối ví
3. Vào "My Projects"
4. Click nút "Chia sẻ"
5. Chọn project/campaign
6. Nhập địa chỉ ví người nhận
7. Click "Chia sẻ"
8. Xác nhận transaction trong ví
9. Kiểm tra xem có lỗi không

## ⚠️ Lưu Ý

- **Gas Fee**: Cần có SUI tokens trong ví để deploy
- **Network**: Đảm bảo đang dùng testnet
- **Package ID**: Nhớ lưu lại Package ID mới
- **2 Packages**: Bạn sẽ có 2 package riêng biệt

## 🐛 Troubleshooting

### Lỗi: "Insufficient gas"

**Giải pháp**: Thêm SUI vào ví testnet
```bash
sui client faucet
```

### Lỗi: "Cannot find module"

**Giải pháp**: Kiểm tra `Move.toml` và đảm bảo dependencies đúng

### Lỗi khi gọi function

**Giải pháp**: Kiểm tra PACKAGE_ID đã đúng chưa

## ✅ Hoàn Thành

Sau khi deploy thành công và cập nhật PACKAGE_ID, tính năng chia sẻ sẽ hoạt động!

