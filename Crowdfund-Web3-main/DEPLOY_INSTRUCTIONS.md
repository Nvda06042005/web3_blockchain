# Hướng dẫn Deploy Module Share

## ⚠️ Lưu ý quan trọng

Module `share` phụ thuộc vào module `platform` từ package đã deploy. Có 2 cách để thêm module này:

### Cách 1: Thêm vào package hiện tại (Khuyến nghị)

Nếu bạn có quyền truy cập vào smart contract gốc:

1. **Copy file `share.move`** vào thư mục `sources/` của smart contract gốc
2. **Build và publish lại toàn bộ package**:
   ```bash
   sui move build
   sui client publish --gas-budget 500000000
   ```
3. **Cập nhật PACKAGE_ID mới** trong `src/constants/index.ts`

### Cách 2: Tạo package riêng (Nếu không có quyền truy cập)

Nếu bạn không có quyền truy cập vào smart contract gốc, bạn cần:

1. **Tạo module platform wrapper** hoặc **import từ package đã deploy**
2. **Cập nhật `share.move`** để sử dụng dependency đúng cách

## Các bước deploy:

### 1. Kiểm tra dependencies

Đảm bảo bạn có tất cả các module cần thiết:
- `platform.move` (hoặc import từ package đã deploy)
- `share.move` (đã có)

### 2. Build contract

```bash
# Di chuyển vào thư mục chứa Move.toml
cd Crowdfund-Web3-main

# Build
sui move build
```

### 3. Deploy lên testnet

```bash
sui client publish --gas-budget 500000000
```

Sau khi deploy thành công, bạn sẽ nhận được:
- **Updated Objects**: Danh sách object IDs
- **Created Objects**: Object IDs mới được tạo
- **Package ID**: ID của package mới (quan trọng!)

### 4. Cập nhật Frontend

Cập nhật `PACKAGE_ID` trong `src/constants/index.ts`:

```typescript
export const PACKAGE_ID = "0x..."; // Package ID mới từ bước deploy
```

### 5. Kiểm tra

1. Mở ứng dụng frontend
2. Kết nối ví
3. Vào "My Projects"
4. Click nút "Chia sẻ"
5. Thử chia sẻ một project/campaign
6. Kiểm tra xem event có được emit không

## Troubleshooting

### Lỗi: "Cannot find module 'crowdfund::platform'"

**Giải pháp**: Bạn cần có module `platform` trong cùng package hoặc import từ package đã deploy.

### Lỗi: "Module not found"

**Giải pháp**: Đảm bảo tất cả các file `.move` cần thiết đều có trong thư mục `sources/`

### Event không hiển thị

**Giải pháp**: 
1. Kiểm tra PACKAGE_ID đã đúng chưa
2. Kiểm tra event type trong frontend: `${PACKAGE_ID}::${MODULES.SHARE}::ItemShared`
3. Đợi vài giây để blockchain index event

## Cấu trúc thư mục mong đợi:

```
Crowdfund-Web3-main/
├── Move.toml
├── sources/
│   ├── platform.move      # Module platform (cần có)
│   ├── project.move       # Module project (nếu cần)
│   ├── campaign.move      # Module campaign (nếu cần)
│   └── share.move         # Module share (đã có)
└── ...
```

