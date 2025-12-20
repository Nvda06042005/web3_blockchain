# Hướng Dẫn Deploy Lên Netlify

## Cách 1: Deploy Qua Netlify CLI (Khuyến nghị)

### Bước 1: Cài đặt Netlify CLI
Mở PowerShell hoặc Terminal và chạy lệnh:
```bash
npm install -g netlify-cli
```

### Bước 2: Đăng nhập vào Netlify
```bash
netlify login
```
- Lệnh này sẽ mở trình duyệt để bạn đăng nhập với tài khoản **nguyenvuducanh11@gmail.com**
- Sau khi đăng nhập thành công, quay lại terminal

### Bước 3: Di chuyển vào thư mục dự án
```bash
cd Crowdfund-Web3-main
```

### Bước 4: Build dự án (kiểm tra trước)
```bash
npm install
npm run build
```

### Bước 5: Khởi tạo site trên Netlify
```bash
netlify init
```
- Chọn "Create & configure a new site"
- Nhập tên site (hoặc để trống để Netlify tự tạo)
- Chọn team (nếu có nhiều team)
- Chọn build command: `npm run build` (hoặc Enter để dùng mặc định)
- Chọn publish directory: `dist` (hoặc Enter để dùng mặc định)

### Bước 6: Deploy
```bash
netlify deploy --prod
```

## Cách 2: Deploy Qua Giao Diện Web Netlify

### Bước 1: Build dự án
```bash
cd Crowdfund-Web3-main
npm install
npm run build
```

### Bước 2: Tạo file ZIP
- Nén thư mục `dist` thành file ZIP

### Bước 3: Deploy trên Netlify
1. Truy cập https://app.netlify.com
2. Đăng nhập với tài khoản **nguyenvuducanh11@gmail.com**
3. Kéo thả thư mục `dist` hoặc file ZIP vào trang Netlify
4. Đợi deploy hoàn tất

## Cách 3: Deploy Tự Động Qua GitHub (Khuyến nghị cho dự án dài hạn)

### Bước 1: Push code lên GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <URL_REPO_GITHUB>
git push -u origin main
```

### Bước 2: Kết nối với Netlify
1. Truy cập https://app.netlify.com
2. Đăng nhập với **nguyenvuducanh11@gmail.com**
3. Click "Add new site" → "Import an existing project"
4. Chọn GitHub và chọn repository
5. Cấu hình:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

## Lưu Ý Quan Trọng

1. **File cấu hình**: Đã có file `netlify.toml` trong dự án, Netlify sẽ tự động đọc cấu hình từ file này.

2. **Environment Variables**: Nếu cần biến môi trường, thêm vào Netlify Dashboard:
   - Site settings → Environment variables

3. **Custom Domain**: Sau khi deploy, bạn có thể thêm domain tùy chỉnh trong:
   - Site settings → Domain management

4. **Kiểm tra build**: Luôn test build local trước khi deploy:
   ```bash
   npm run build
   npm run preview
   ```

## Troubleshooting

### Lỗi build
- Kiểm tra Node version (Netlify mặc định dùng Node 18)
- Thêm file `.nvmrc` với nội dung `18` hoặc `20` nếu cần

### Lỗi routing (404)
- File `netlify.toml` đã có cấu hình redirect, đảm bảo file này có trong repo

### Lỗi dependencies
- Đảm bảo `package.json` và `package-lock.json` đã được commit

