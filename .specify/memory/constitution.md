# Task Schedule Constitution

Bảng việc hằng ngày cho nhân viên vận hành của anh Tung (bối cảnh: `CONTEXT.md`).

## Core Principles

### I. Hệ thống thay cho lời nói
Mọi tính năng phải giúp anh Tung **thấy** nhân viên làm gì, lúc nào, mất bao lâu, kẹt ở đâu — mà không cần hỏi.
Không thêm tính năng mang tính "nhắc nhở / khuyên bảo".

### II. Không tin máy nhân viên
Mọi mốc giờ do **máy chủ** (Google Apps Script) ghi, không lấy giờ từ trình duyệt. Mọi quy tắc
(thứ tự Start → Xong, khung giờ, bắt buộc mô tả khi Kẹt) phải được kiểm tra ở phía máy chủ, giao diện chỉ là lớp phụ.
Nhân viên không có quyền sửa Google Sheet.

### III. Dễ dùng cho người không rành công nghệ
Nút to, chữ tiếng Việt bình dân, ít thao tác. Dùng tốt trên điện thoại. Không có màn hình cấu hình cho nhân viên.

### IV. Miễn phí, đơn giản
Trang tĩnh trên GitHub Pages + Google Sheet/Apps Script. Không framework, không bước build, không host trả phí.
Danh sách việc sửa trong Google Sheet, không phải sửa code.

### V. Đúng phạm vi
Chỉ làm đúng phần được yêu cầu trong spec. Mọi thay đổi (kể cả nhỏ) cập nhật spec trước rồi mới sửa code.

## Quy trình

- Theo Spec Kit: spec → plan → tasks → implement. Mỗi việc mới là một spec `specs/NNN-...`.
- Mỗi tính năng/cải thiện hoàn thành: commit kèm message mô tả rõ phiên bản có gì mới.
- Hành động ra bên ngoài (tạo repo, push, bật GitHub Pages) phải hỏi anh Tung trước.

**Version**: 1.0.0 | **Ratified**: 2026-10-20 | **Last Amended**: 2026-10-20
