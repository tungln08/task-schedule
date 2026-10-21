# Feature Specification: Bỏ việc 7 "Thống kê áo up hôm nay"

**Feature Branch**: `005-remove-task-7`
**Created**: 2026-10-21
**Status**: Approved
**Input**: Anh Tung: "Vậy thì xóa đầu mục số 7 đi" (sau khi thấy nội dung việc 7 không rõ nghĩa:
"áo up hôm nay" nhưng lại báo cáo số sale, rank).

## Clarifications

### Session 2026-10-21
- Q: Đánh số lại các việc sau? → A (Claude chốt): **không**. Giữ STT cũ (6 → 9…) để khớp cách gọi tên việc hiện tại
  và dữ liệu tab `HomNay` theo STT.

## Requirements
- **FR-001**: Xoá dòng STT 7 khỏi tab `DanhSachViec` trên Sheet → trang còn 13 việc.
- **FR-002**: Xoá việc 7 khỏi `DEFAULT_TASKS` trong `Code.gs`.
- **FR-003**: Cập nhật `CONTEXT.md` mục 3 (ghi rõ đã bỏ việc 7, ngày 21/10/2026).
