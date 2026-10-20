# Feature Specification: Đồng hồ đếm giờ việc đang làm

**Feature Branch**: `003-running-timer`
**Created**: 2026-10-21
**Status**: Approved
**Input**: Anh Tung: "Khi bấm Start thì hiện dòng chú thích 'Bạn đang làm phần việc này', đồng thời có đồng hồ đếm giờ
đang chạy tính theo giờ, ví dụ: bạn đang làm phần việc này được 1h30 phút rồi."

## Clarifications

### Session 2026-10-21
- Q: Đồng hồ hiện đến đơn vị nào? → A (Claude chốt): giờ + phút + giây để nhìn thấy đồng hồ đang chạy
  (VD "được 1 giờ 30 phút 05 giây rồi"; dưới 1 giờ thì "được 12 phút 05 giây rồi").
- Q: Tính từ đâu? → A: từ giờ Start do máy chủ ghi, "bây giờ" lấy theo giờ máy chủ (đã bù lệch đồng hồ), không theo giờ máy nhân viên.
- Q: Đang Kẹt thì sao? → A: vẫn đếm (việc chưa Xong là vẫn đang tốn thời gian). Bấm Xong thì đồng hồ biến mất, chỉ còn "Mất: …".
- Không đổi backend.
- Phát sinh khi test: trình duyệt giữ `style.css` cũ (GitHub Pages cache ~10 phút) → `index.html` gắn `?v=<phiên bản>`
  vào `style.css`, `config.js`, `app.js`; **mỗi lần cập nhật phải tăng số `v`**.

## Requirements
- **FR-001**: Việc đã Start, chưa Xong hiện một dòng nổi bật màu xanh dương (gộp chú thích + đồng hồ, đúng câu ví dụ):
  "▶ Bạn đang làm phần việc này được **X giờ Y phút Z giây** rồi".
- **FR-002**: Đồng hồ tự cập nhật mỗi giây, không tải lại cả trang, không làm đóng hộp báo Kẹt đang mở.
- **FR-003**: Khi Xong, khung đồng hồ biến mất.
