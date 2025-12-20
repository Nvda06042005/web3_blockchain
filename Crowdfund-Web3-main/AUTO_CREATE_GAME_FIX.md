# Sửa lỗi: Tự động tạo game thay vì hiển thị màn hình "Create Game"

## Vấn đề
Khi truy cập https://celebrated-puffpuff-16b0a3.netlify.app/game, game hiển thị màn hình "Create Game" (hình ảnh 1) thay vì tự động tạo game và hiển thị đầy đủ chức năng như các hình ảnh 2, 3, 4.

## Nguyên nhân
- Game yêu cầu người dùng phải click nút "Create Game" để tạo game state
- Không tự động tạo game state trong localStorage khi chưa có
- Không tự động load game từ localStorage khi đã có

## Giải pháp đã áp dụng

### 1. Thêm logic tự động tạo game state
- **Vị trí**: Thêm useEffect mới trong `PigLifeGame.tsx`
- **Chức năng**: Tự động tạo game state trong localStorage khi:
  - Account đã kết nối
  - Không có gameState
  - Không có dữ liệu trong localStorage
- **Giá trị khởi tạo**:
  - Social Capital: 100 SC
  - Life Token: 50 LT
  - Pig Level: 1
  - Các giá trị khác: 0

### 2. Thay đổi màn hình "Create Game"
- **Trước**: Hiển thị màn hình "Create Game" với nút "Create Game"
- **Sau**: Hiển thị màn hình loading "Đang khởi tạo game..." trong khi tự động tạo game
- **Kết quả**: Game tự động bắt đầu, không cần click nút

### 3. Tự động load từ localStorage
- Game tự động load game state từ localStorage nếu đã có
- Không cần phải tạo lại game mỗi lần vào trang

## Các thay đổi code

### File: `src/components/piglife/PigLifeGame.tsx`

1. **Thêm useEffect tự động tạo game**:
```typescript
// Auto-create game state if not exists (for local mode)
useEffect(() => {
  if (!account?.address) return;
  
  const timer = setTimeout(() => {
    if (!gameState) {
      const storageKey = `pigLifeProgress_${account.address}_season${seasonNumber}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (!savedData) {
        // Auto-create initial game state
        const initialState: PigLifeGameState = {
          // ... initial values
        };
        setGameState(initialState);
        saveProgress(initialState);
      }
    }
  }, 500);
  
  return () => clearTimeout(timer);
}, [account?.address, seasonNumber]);
```

2. **Thay đổi màn hình "Create Game"**:
```typescript
// No game - show loading or auto-create
if (!gameState && account?.address) {
  return (
    <div className="...">
      <Loader2 className="..." />
      <h1>Đang khởi tạo game...</h1>
    </div>
  );
}
```

## Kết quả

Sau khi sửa:
- ✅ Game tự động tạo game state khi vào trang
- ✅ Không cần click nút "Create Game"
- ✅ Hiển thị đầy đủ chức năng ngay từ đầu (như hình 2, 3, 4)
- ✅ Tự động load game từ localStorage nếu đã có
- ✅ Tất cả tính năng hoạt động: nuôi heo, trồng cây, xây nhà, leaderboard, v.v.

## Cách test

1. **Xóa localStorage** (để test tạo game mới):
   - Mở DevTools (F12)
   - Application > Local Storage
   - Xóa tất cả keys bắt đầu với `pigLife`

2. **Truy cập trang game**:
   - Vào https://celebrated-puffpuff-16b0a3.netlify.app/game
   - Kết nối ví (hoặc đã kết nối)
   - Game sẽ tự động tạo và hiển thị đầy đủ chức năng

3. **Refresh trang**:
   - Game sẽ tự động load từ localStorage
   - Không cần tạo lại game

## Lưu ý

- Game state được lưu trong localStorage với key: `pigLifeProgress_{address}_season{number}`
- Mỗi mùa giải (season) có game state riêng
- Game có thể chạy hoàn toàn ở chế độ local (không cần blockchain)
- Dữ liệu được tự động lưu sau mỗi hành động

