# 🚀 Hướng dẫn Deploy Nhanh Module Share

## Tình trạng hiện tại:
✅ File `share.move` đã được tạo  
✅ File `Move.toml` đã được tạo  
⚠️ Cần có các module khác (platform, project, campaign) để build thành công

## Có 2 tình huống:

### Tình huống 1: Bạn có thư mục smart contract gốc

Nếu bạn có thư mục smart contract riêng với tất cả các module:

1. **Copy file `share.move`** từ `Crowdfund-Web3-main/sources/share.move` vào thư mục `sources/` của smart contract gốc

2. **Build và deploy**:
   ```bash
   cd <thư-mục-smart-contract>
   sui move build
   sui client publish --gas-budget 500000000
   ```

3. **Copy Package ID mới** và cập nhật vào `src/constants/index.ts`

### Tình huống 2: Chỉ có frontend, smart contract đã deploy

Nếu smart contract đã được deploy trước đó và bạn không có source code:

**Bạn cần:**
1. Liên hệ với người quản lý smart contract để thêm module `share`
2. Hoặc tạo một package mới chỉ chứa module `share` (phức tạp hơn)

## Kiểm tra nhanh:

Chạy lệnh này để xem có lỗi gì không:

```bash
cd Crowdfund-Web3-main
sui move build
```

**Nếu build thành công**: Bạn có thể deploy ngay!

**Nếu có lỗi "Cannot find module"**: Bạn cần thêm các module còn thiếu vào thư mục `sources/`

## Sau khi deploy thành công:

1. ✅ Copy Package ID mới
2. ✅ Cập nhật `src/constants/index.ts`:
   ```typescript
   export const PACKAGE_ID = "0x..."; // Package ID mới
   ```
3. ✅ Test tính năng chia sẻ trong frontend

## Cần hỗ trợ?

Nếu bạn gặp lỗi khi build, hãy cho tôi biết:
- Bạn có thư mục smart contract gốc không?
- Bạn có quyền truy cập vào source code smart contract không?
- Lỗi cụ thể là gì?

