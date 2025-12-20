# 🔧 Troubleshooting: Màn hình trắng

## Các bước kiểm tra nhanh:

### 1. Kiểm tra Console Errors
1. Nhấn **F12** trong browser
2. Chuyển sang tab **Console**
3. Xem có lỗi màu đỏ nào không
4. Chụp ảnh và gửi cho tôi

### 2. Thử navigate về trang khác
Trong address bar, thay đổi URL:
- `localhost:5173/` - Trang chủ
- `localhost:5173/explore` - Explore page
- Xem trang nào hoạt động, trang nào không

### 3. Clear cache và reload
- Nhấn **Ctrl + Shift + R** (Windows)
- Hoặc **Cmd + Shift + R** (Mac)

### 4. Restart dev server
Trong terminal:
```bash
# Stop server (Ctrl + C)
# Then restart
npm run dev
```

## Các lỗi thường gặp:

### Lỗi 1: Import không tìm thấy
```
Cannot find module './DonateWithQuizModal'
```
**Fix**: Kiểm tra file có tồn tại không

### Lỗi 2: Hook error
```
Invalid hook call
```
**Fix**: Kiểm tra React version và hook usage

### Lỗi 3: Undefined variable
```
Cannot read property 'xxx' of undefined
```
**Fix**: Kiểm tra biến có được khởi tạo đúng không

## Nếu vẫn lỗi:

Hãy chụp màn hình:
1. Console tab (F12 → Console)
2. Network tab (F12 → Network) 
3. Gửi cho tôi để debug tiếp

