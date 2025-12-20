# 🎰 Tính năng Quiz Game khi Donate

## Mô tả

Khi người dùng bấm nút "Donate" trên một chiến dịch, họ sẽ phải trải qua một mini-game gồm 3 bước:

### 1. 🎡 Vòng Quay May Mắn
- Quay số ngẫu nhiên từ 1-10
- Số quay được = số câu hỏi trắc nghiệm sẽ nhận
- Animation vòng quay đẹp mắt với hiệu ứng xoay

### 2. 📝 Quiz về Sui Blockchain
- 28 câu hỏi về Sui blockchain (5 chủ đề)
  - Cơ bản về Sui (7 câu)
  - Object Model & Move (8 câu)
  - NFT & GameFi (5 câu)
  - DeFi trên Sui (4 câu)
  - Bảo mật & Consensus (4 câu)
- Người dùng nhận số câu hỏi ngẫu nhiên từ vòng quay
- Yêu cầu: Trả lời đúng ≥ 2/3 câu hỏi
- Hiển thị kết quả chi tiết sau khi nộp bài

### 3. 💰 Donate
- Nếu **PASS**: Được phép donate vào chiến dịch
- Nếu **FAIL**: Mất 1 gỗ (lượt chơi) và không được donate

## Hệ thống Lượt Chơi (Wood/Gỗ)

### Nguồn gốc lượt chơi
- Lượt chơi = Số gỗ trong game PigLife
- Thu hoạch gỗ từ trang trại để có lượt chơi
- Mỗi lần trả lời sai quiz = mất 1 gỗ

### Cơ chế
1. Người dùng cần có ít nhất 1 gỗ để tham gia quiz
2. Nếu không có gỗ → Hiển thị thông báo yêu cầu thu hoạch
3. Nếu trả lời đúng ≥ 2/3 → Không mất gỗ, được donate
4. Nếu trả lời sai → Mất 1 gỗ, không được donate

## Cấu trúc Code

### Components mới
```
src/
├── data/
│   └── quizQuestions.ts          # 28 câu hỏi về Sui
├── components/campaign/
│   ├── LuckyWheelModal.tsx       # Vòng quay may mắn
│   ├── QuizModal.tsx             # Quiz trắc nghiệm
│   └── DonateWithQuizModal.tsx   # Orchestrator kết nối 3 bước
```

### Integration
- `CampaignDetailPage.tsx`: Tích hợp với game state để lấy số gỗ
- `DonateWithQuizModal`: Thay thế `DonateModal` cũ
- Kết nối với `usePigLifeGame` hook để quản lý gỗ

## Flow hoàn chỉnh

```
User clicks "Donate"
    ↓
Check wood count
    ↓
If wood = 0 → Show warning modal
    ↓
If wood > 0 → Show Lucky Wheel
    ↓
User spins wheel → Get random number (1-10)
    ↓
Show Quiz with N questions
    ↓
User answers all questions
    ↓
Calculate score
    ↓
If score ≥ 2/3:
    ✅ Show success → Open Donate Modal
    ✅ User can donate
Else:
    ❌ Show failure → Deduct 1 wood
    ❌ Close modal
```

## UI/UX Features

### Vòng Quay May Mắn
- Animation xoay mượt mà (3 giây)
- 10 màu sắc khác nhau cho mỗi số
- Hiệu ứng gradient và shadow
- Pointer đỏ chỉ kết quả

### Quiz Modal
- Progress bar theo dõi tiến độ
- Navigation giữa các câu hỏi
- Highlight câu đã chọn
- Review đáp án chi tiết sau khi nộp
- Badge phân loại theo chủ đề

### Donate Modal
- Giữ nguyên UI cũ
- Chỉ hiển thị sau khi pass quiz

## Cấu hình

### Điều chỉnh độ khó
Trong `QuizModal.tsx`:
```typescript
const requiredCorrect = Math.ceil((totalQuestions * 2) / 3); // 2/3 requirement
```

### Thêm câu hỏi mới
Trong `quizQuestions.ts`:
```typescript
export const quizQuestions: QuizQuestion[] = [
  {
    id: 29,
    question: "Câu hỏi mới?",
    options: { A: "...", B: "...", C: "...", D: "..." },
    correctAnswer: 'A',
    category: "Chủ đề mới"
  }
];
```

### Điều chỉnh phạt gỗ
Trong `CampaignDetailPage.tsx`:
```typescript
await sellWood(userGameId, 1); // Thay đổi số lượng gỗ bị phạt
```

## Testing

### Test Cases
1. ✅ User có gỗ → Có thể chơi quiz
2. ✅ User không có gỗ → Hiển thị warning
3. ✅ Pass quiz (≥2/3) → Được donate
4. ✅ Fail quiz (<2/3) → Mất 1 gỗ
5. ✅ Vòng quay random đúng số câu hỏi
6. ✅ Quiz hiển thị đúng số câu hỏi từ vòng quay
7. ✅ Đáp án được kiểm tra chính xác

## Future Enhancements

- [ ] Leaderboard cho người trả lời nhanh nhất
- [ ] Thêm câu hỏi theo level (dễ/trung bình/khó)
- [ ] Reward thêm cho người trả lời 100% đúng
- [ ] Multiplayer quiz mode
- [ ] Daily quiz challenges
- [ ] NFT badge cho người pass quiz nhiều lần

## Notes

- Quiz questions được random mỗi lần chơi
- Không thể cheat vì kết quả được validate on-chain (wood deduction)
- UI responsive cho mobile và desktop
- Tất cả text có thể i18n (đa ngôn ngữ)

