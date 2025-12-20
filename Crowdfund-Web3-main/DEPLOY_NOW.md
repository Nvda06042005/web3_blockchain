# 🚀 DEPLOY NGAY - Hướng Dẫn Deploy Game Contract

## ⚠️ Vấn Đề Hiện Tại

`GAME_PACKAGE_ID` trong `src/constants/index.ts` đang là `"0x0"` - contract chưa được deploy!

## 📝 Các Bước Deploy (Làm Theo Thứ Tự)

### Bước 1: Mở Terminal/PowerShell

Mở terminal trong thư mục **`Crowdfund-Web3-main`**

### Bước 2: Kiểm tra Sui CLI

```powershell
sui --version
```

Nếu không có, cài đặt từ: https://docs.sui.io/build/install

### Bước 3: Kiểm tra Network

```powershell
sui client active-env
```

**Phải hiển thị:** `testnet`

Nếu không, chuyển sang testnet:
```powershell
sui client switch --env testnet
```

### Bước 4: Kiểm tra Wallet

```powershell
sui client active-address
```

Đảm bảo wallet có SUI để trả gas fee.

### Bước 5: Build Contract

```powershell
sui move build
```

Chờ build hoàn thành (có thể có warnings, không sao).

### Bước 6: Deploy Contract

```powershell
sui client publish --gas-budget 500000000
```

**QUAN TRỌNG:** 
- Approve transaction trong wallet
- Sau khi deploy thành công, tìm dòng: `PackageID: 0x...`
- **COPY TOÀN BỘ Package ID** (bắt đầu bằng `0x`)

### Bước 7: Cập Nhật Package ID

1. Mở file: `src/constants/index.ts`
2. Tìm dòng 4:
   ```typescript
   export const GAME_PACKAGE_ID = "0x0";
   ```
3. Thay `"0x0"` bằng Package ID bạn vừa copy:
   ```typescript
   export const GAME_PACKAGE_ID = "0x1234567890abcdef..."; // Thay bằng Package ID thực tế
   ```
4. **Lưu file** (Ctrl+S)

### Bước 8: Refresh Browser

1. Refresh trang web (F5 hoặc Ctrl+R)
2. Kiểm tra wallet đang ở **Testnet**
3. Vào trang game và click "Create Game"

## ✅ Checklist

- [ ] Sui CLI đã cài đặt
- [ ] Network là testnet
- [ ] Wallet có SUI
- [ ] Build thành công
- [ ] Deploy thành công
- [ ] Đã copy Package ID
- [ ] Đã cập nhật GAME_PACKAGE_ID
- [ ] Đã lưu file
- [ ] Đã refresh browser
- [ ] Wallet ở testnet

## 🐛 Nếu Gặp Lỗi

### Lỗi: "Access is denied"
- Đóng tất cả terminal/IDE
- Mở lại terminal mới
- Chạy lại lệnh deploy

### Lỗi: "Insufficient gas"
- Cần có SUI trong wallet
- Lấy testnet SUI từ faucet

### Lỗi: "Network mismatch"
- Wallet phải ở **Testnet**
- Sui CLI phải ở testnet

## 🎉 Hoàn Thành!

Sau khi hoàn thành, game sẽ sẵn sàng sử dụng!

