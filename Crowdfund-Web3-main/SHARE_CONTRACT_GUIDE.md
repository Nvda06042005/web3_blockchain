# Hướng dẫn thêm module Share vào Smart Contract

Để tính năng chia sẻ hoạt động, bạn cần thêm module `share` vào smart contract của bạn. Dưới đây là code mẫu cho Move contract:

## File: `sources/share.move`

```move
module crowdfund::share;

use sui::event;
use sui::clock::{Self, Clock};
use sui::tx_context::{Self, TxContext};
use sui::object::ID;
use crowdfund::platform::Platform;

/// Event emitted when an item is shared
struct ItemShared has copy, drop {
    item_id: ID,
    item_type: String, // "project" or "campaign"
    shared_by: address,
    shared_to: address,
    shared_at: u64,
}

/// Share a project or campaign with another address
public entry fun share_item(
    platform: &Platform,
    item: ID,
    item_type: vector<u8>,
    recipient: address,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    // Verify the item exists and caller owns it
    // This is a simplified version - you may need to add more validation
    // For example, check if the caller owns the project/campaign
    
    let timestamp = clock::timestamp_ms(clock);
    let sender = tx_context::sender(ctx);
    
    // Emit event
    event::emit(ItemShared {
        item_id: item,
        item_type: std::string::utf8(item_type),
        shared_by: sender,
        shared_to: recipient,
        shared_at: timestamp,
    });
}
```

## Các bước triển khai:

1. **Tạo file `sources/share.move`** trong thư mục smart contract của bạn
2. **Thêm validation logic** để đảm bảo:
   - Người gọi sở hữu project/campaign
   - Item ID hợp lệ
   - Recipient address hợp lệ
3. **Build và deploy contract**:
   ```bash
   sui move build
   sui client publish --gas-budget 500000000
   ```
4. **Cập nhật PACKAGE_ID** trong `src/constants/index.ts` nếu cần

## Lưu ý:

- Function `share_item` sẽ emit event `ItemShared` với các thông tin cần thiết
- Frontend sẽ query event này để hiển thị các mục đã được chia sẻ
- Đảm bảo event có đầy đủ các field: `item_id`, `item_type`, `shared_by`, `shared_to`, `shared_at`

## Cấu trúc Event mong đợi:

```typescript
{
  item_id: string,        // ID của project hoặc campaign
  item_type: string,      // "project" hoặc "campaign"
  shared_by: string,      // Địa chỉ ví người chia sẻ
  shared_to: string,      // Địa chỉ ví người nhận
  shared_at: string,      // Timestamp (u64)
}
```

