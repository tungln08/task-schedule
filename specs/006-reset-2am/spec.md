# Feature Specification: Reset lúc 2h sáng, riêng việc chạy Etsy Auto Next reset lúc 0h

**Feature Branch**: `006-reset-2am`
**Created**: 2026-10-22
**Status**: Approved
**Input**: Anh Tung: "Bắt đầu từ lúc 2h sáng thì trạng thái công việc phải được reset về lại trạng thái ban đầu để phục vụ
cho ngày mới, riêng task Chạy Etsy auto sẽ được reset về ngay sau khi qua 12h giờ đêm."

## Clarifications

### Session 2026-10-22
- Q: Nhận biết "việc reset lúc 0h" thế nào? → A: việc có **Khung giờ bắt đầu từ `00:00`** (hiện chỉ việc 15
  `00:00-07:00`). Không cần thêm cột mới trong Sheet; sau này thêm việc chạy đêm khác cũng tự theo luật này.
- Q: Việc 15 bấm lúc 0h–2h thì sao? → A: nó thuộc ngày lịch mới, **không bị xoá** ở mốc reset 2h, nên vẫn hiện "Xong"
  trên bảng của ngày làm việc mới. Đến 0h đêm hôm sau mới xoá.

## Requirements
- **FR-001**: Ngày làm việc đổi mốc từ 7h sang **2h sáng** (giờ VN): qua 2h, mọi việc (trừ việc reset 0h) về trạng thái ban đầu.
- **FR-002**: Việc có khung giờ bắt đầu `00:00` reset lúc **0h** (ngày lịch), và không bị xoá ở mốc 2h.
- **FR-003**: Thanh trạng thái ghi "tự làm mới lúc 2h sáng"; README cập nhật mốc giờ.
- **FR-004**: Giờ Kẹt (chỉ lưu `HH:mm`) của việc reset 0h được hiểu theo ngày lịch của việc đó khi tính tổng thời gian.

## Ghi chú triển khai
- Đổi `Code.gs` → phải dán code mới vào Apps Script và **Deploy → New version** (cùng URL).
- Lần đầu chạy code mới, dữ liệu `HomNay` có thể bị xoá một lần do đổi cách tính ngày.
