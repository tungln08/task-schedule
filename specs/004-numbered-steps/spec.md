# Feature Specification: Nội dung việc chia dòng, đánh số 1.1, 1.2…

**Feature Branch**: `004-numbered-steps`
**Created**: 2026-10-21
**Status**: Approved
**Input**: Anh Tung: "Nội dung cụ thể của các đầu mục công việc cần là từng dòng với ghi số cụ thể ví dụ 1.1, 1.2
thay vì để hết vào 1 dòng như hiện tại."

## Clarifications

### Session 2026-10-21
- Q: Lưu thế nào trong Sheet? → A: Cột "Ghi chú" của tab `DanhSachViec`, **mỗi dòng nội dung là một dòng trong ô**
  (trong Google Sheet xuống dòng bằng Ctrl+Enter / Alt+Enter). Không cần tự gõ số: trang tự đánh số `STT.1`, `STT.2`…
- Q: Nếu anh Tung lỡ gõ số sẵn (VD "1.2 …")? → A: trang bỏ số dạng `a.b` ở đầu dòng rồi đánh số lại, tránh trùng.
- Q: Nội dung? → A: tách từ `CONTEXT.md` mục 3 (mỗi ý một dòng), ghi đè cột Ghi chú hiện có bằng hàm
  `resetDanhSachViec()` chạy 1 lần trong Apps Script editor. Không đổi doGet/doPost → **không cần triển khai lại** Web app.

## Requirements
- **FR-001**: Dưới tên việc, mỗi dòng ghi chú hiện thành một dòng riêng, có số `STT.k` (k bắt đầu từ 1) in đậm phía trước.
- **FR-002**: Dòng trống trong ô bị bỏ qua.
- **FR-003**: `Code.gs` có `resetDanhSachViec()` ghi lại toàn bộ tab `DanhSachViec` về danh sách mặc định
  (ghi đè mọi sửa đổi của anh Tung trong tab đó).
