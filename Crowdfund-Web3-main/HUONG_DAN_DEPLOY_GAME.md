# 🎮 Hướng Dẫn Deploy Pig Farming Game Contract

## ✅ Đã Hoàn Thành

Smart contract đã được cải thiện và sẵn sàng deploy với:
- ✅ Error codes rõ ràng hơn
- ✅ Validation tốt hơn cho các tham số
- ✅ Contract đã build thành công
- ✅ Script deploy tự động (PowerShell và Bash)

## 🚀 Cách Deploy (3 Phương Pháp)

### Phương Pháp 1: Sử dụng Script Tự Động (Khuyên Dùng)

**Trên Windows (PowerShell):**
```powershell
cd Crowdfund-Web3-main
.\deploy-game.ps1
```

**Trên Linux/Mac (Bash):**
```bash
cd Crowdfund-Web3-main
chmod +x deploy-game.sh
./deploy-game.sh
```

Script sẽ tự động:
1. Kiểm tra Sui CLI
2. Chuyển sang testnet nếu cần
3. Build contract
4. Deploy lên testnet
5. Hiển thị Package ID

### Phương Pháp 2: Deploy Thủ Công

**Bước 1: Kiểm tra Network**
```bash
sui client active-env
```

Nếu không phải testnet, chuyển sang testnet:
```bash
sui client switch --env testnet
```

**Bước 2: Build Contract**
```bash
cd Crowdfund-Web3-main
sui move build
```

**Bước 3: Deploy Contract**
```bash
sui client publish --gas-budget 500000000
```

**Bước 4: Copy Package ID**
Sau khi deploy thành công, bạn sẽ thấy output như:
```
Published Objects:
  ┌──
  │ PackageID: 0x1234567890abcdef...  <-- Copy ID này
  └──
```

**Bước 5: Cập nhật Package ID**
Mở file `src/constants/index.ts` và tìm dòng:
```typescript
export const GAME_PACKAGE_ID = "0x0";
```

Thay `"0x0"` bằng Package ID bạn vừa copy:
```typescript
export const GAME_PACKAGE_ID = "0x1234567890abcdef...";
```

### Phương Pháp 3: Sử dụng Command Line Trực Tiếp

**Trên Windows PowerShell:**
```powershell
cd Crowdfund-Web3-main
sui move build
sui client publish --gas-budget 500000000
```

**Trên Linux/Mac:**
```bash
cd Crowdfund-Web3-main
sui move build && sui client publish --gas-budget 500000000
```

## 📋 Checklist Trước Khi Deploy

- [ ] Đã cài đặt Sui CLI (`sui --version`)
- [ ] Wallet đang kết nối với **Testnet** (không phải Mainnet)
- [ ] Có SUI trong wallet để trả gas fee (testnet SUI miễn phí)
- [ ] Đã chuyển sang thư mục `Crowdfund-Web3-main`

## 🔧 Sau Khi Deploy

1. **Copy Package ID** từ output của lệnh deploy
2. **Mở file** `src/constants/index.ts`
3. **Cập nhật** `GAME_PACKAGE_ID` với Package ID mới
4. **Lưu file**
5. **Refresh trang web** trong browser
6. **Kiểm tra wallet** đang ở Testnet
7. **Click "Create Game"** và bắt đầu chơi!

## ⚠️ Lưu Ý Quan Trọng

1. **Network phải là Testnet**: Đảm bảo wallet và Sui CLI đều ở testnet
2. **Package ID mới mỗi lần deploy**: Nếu deploy lại, phải cập nhật Package ID mới
3. **Gas fee**: Testnet gas fee rất thấp (gần như miễn phí)
4. **Refresh browser**: Sau khi cập nhật Package ID, phải refresh trang web

## 🐛 Troubleshooting

### Lỗi: "Package object does not exist"
- ✅ Kiểm tra GAME_PACKAGE_ID đã được cập nhật chưa
- ✅ Đảm bảo đã copy đúng Package ID (không có khoảng trắng)
- ✅ Refresh browser sau khi cập nhật

### Lỗi: "Network mismatch"
- ✅ Wallet phải ở **Testnet** (không phải Mainnet)
- ✅ Sui CLI phải ở testnet: `sui client switch --env testnet`

### Lỗi: "Insufficient gas"
- ✅ Cần có SUI trong wallet để trả gas fee
- ✅ Lấy testnet SUI từ faucet: https://docs.sui.io/guides/developer/getting-started/get-coins

### Build failed
- ✅ Kiểm tra Sui CLI version: `sui --version`
- ✅ Update Sui CLI nếu cần

## 🎉 Hoàn Thành!

Sau khi hoàn thành tất cả các bước, game sẽ sẵn sàng sử dụng! Bạn có thể:
- Tạo game mới
- Nuôi heo
- Trồng cây
- Thu hoạch gỗ
- Xây nhà
- Và nhiều hơn nữa!

Chúc bạn chơi game vui vẻ! 🐷🌳🏠

