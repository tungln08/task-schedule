# Feature Specification: Chú thích nút, tổng thời gian, màu thẻ việc

**Feature Branch**: `002-ui-hints-elapsed-colors`
**Created**: 2026-10-21
**Status**: Approved
**Input**: Anh Tung: "Có dòng chú thích nhỏ cho mỗi button Start / Kẹt / Xong. Khi bấm Xong hoặc Kẹt thì tính tổng
thời gian đã làm từ lúc bấm Start đầu tiên trong ngày, hiển thị ngay dưới thanh trạng thái, nhìn thấy khi scroll.
Việc đã xong: nền xanh đậm hơn một chút, số thứ tự kèm dấu tích xanh lá thay vì vòng tròn. Việc chưa làm: nền vàng nhạt."

## Clarifications

### Session 2026-10-21
- Q: "Tổng thời gian" tính thế nào? → A (Claude chốt): từ giờ Start **sớm nhất** trong ngày làm việc đến lần bấm
  **Xong hoặc Kẹt gần nhất** (của bất kỳ việc nào). Chỉ cập nhật khi có Xong/Kẹt; chưa có thì hiện dòng hướng dẫn.
- Q: Giờ Kẹt chỉ lưu dạng `HH:mm` → quy ra ngày: giờ < 7 thuộc ngày hôm sau của ngày làm việc (vì reset lúc 7h).
- Q: "Việc chưa làm" = chưa bấm Start. Việc đang làm (đã Start, chưa Xong) giữ nền trắng viền xanh dương.
- Không đổi backend (`Code.gs`), không cần triển khai lại Apps Script.

## Requirements

- **FR-001**: Dưới mỗi nút có chú thích chữ nhỏ:
  - Start: "Bấm khi bắt đầu làm việc này"
  - Kẹt: "Bấm khi gặp lỗi, không làm tiếp được"
  - Xong: "Bấm khi đã làm xong việc này"
- **FR-002**: Ngay dưới thanh trạng thái, trong cùng khối dính trên đầu (luôn thấy khi cuộn), có dòng
  "Tổng thời gian đã làm: X giờ Y phút (từ HH:mm đến HH:mm)". Chưa có Xong/Kẹt nào thì hiện
  "Tổng thời gian đã làm: chưa có — sẽ tính khi bấm Xong hoặc Kẹt".
- **FR-003**: Thẻ việc đã Xong: nền xanh lá đậm hơn bản 1.0 (từ `#f6fef9` lên `#d3f8df`); ô số thứ tự thay vòng tròn
  bằng dấu tích xanh lá kèm số (VD "✔ 3").
- **FR-004**: Thẻ việc chưa Start: nền vàng nhạt (`#fffbe6`).

## Success Criteria
- Nhân viên nhìn là biết bấm nút nào khi nào; anh Tung nhìn đầu trang là thấy tổng thời gian, nhìn màu là biết việc nào xong/chưa.
