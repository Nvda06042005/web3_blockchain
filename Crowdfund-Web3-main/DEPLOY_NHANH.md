# 🚀 Deploy Nhanh Pig Farming Game Contract

## ⚠️ Lỗi "Contract chưa được deploy"

Nếu bạn vẫn thấy lỗi này, có nghĩa là:
1. Contract chưa được deploy, HOẶC
2. Package ID chưa được cập nhật trong `src/constants/index.ts`

## 📝 Các Bước Deploy

### Bước 1: Mở Terminal/PowerShell

Mở terminal trong thư mục `Crowdfund-Web3-main`

### Bước 2: Kiểm tra Network

```powershell
sui client active-env
```

Phải hiển thị: `testnet`

Nếu không, chuyển sang testnet:
```powershell
sui client switch --env testnet
```

### Bước 3: Build Contract

```powershell
sui move build
```

### Bước 4: Deploy Contract

```powershell
sui client publish --gas-budget 500000000
```

**QUAN TRỌNG:** Sau khi deploy thành công, bạn sẽ thấy output như sau:

```
Published Objects:
  ┌──
  │ PackageID: 0x1234567890abcdef...  <-- ⭐ COPY ID NÀY
  └──
```

### Bước 5: Copy Package ID

Copy toàn bộ Package ID (bắt đầu bằng `0x`)

### Bước 6: Cập nhật Package ID

1. Mở file: `src/constants/index.ts`
2. Tìm dòng:
   ```typescript
   export const GAME_PACKAGE_ID = "0x0";
   ```
3. Thay `"0x0"` bằng Package ID bạn vừa copy:
   ```typescript
   export const GAME_PACKAGE_ID = "0x1234567890abcdef...";
   ```
4. **Lưu file**

### Bước 7: Refresh Browser

1. Refresh trang web (F5 hoặc Ctrl+R)
2. Kiểm tra wallet đang ở **Testnet**
3. Click "Create Game" và bắt đầu chơi!

## 🔧 Nếu Gặp Lỗi "Access is denied"

Có thể file `Move.lock` đang bị lock. Thử:

1. **Đóng tất cả terminal/IDE** đang mở
2. **Mở lại terminal mới** với quyền Administrator (nếu cần)
3. **Chạy lại các lệnh deploy**

Hoặc xóa file lock tạm thời:
```powershell
Remove-Item "Move.lock" -ErrorAction SilentlyContinue
sui move build
sui client publish --gas-budget 500000000
```

## ✅ Checklist

- [ ] Network là testnet
- [ ] Build thành công
- [ ] Deploy thành công
- [ ] Đã copy Package ID
- [ ] Đã cập nhật GAME_PACKAGE_ID trong `src/constants/index.ts`
- [ ] Đã lưu file
- [ ] Đã refresh browser
- [ ] Wallet đang ở testnet

## 🎉 Hoàn Thành!

Sau khi hoàn thành, game sẽ sẵn sàng sử dụng!

