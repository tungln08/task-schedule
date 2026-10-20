# Feature Specification: Bảng việc hằng ngày (Start / Kẹt / Xong)

**Feature Branch**: `001-daily-task-board`
**Created**: 2026-10-20
**Status**: Approved
**Input**: Anh Tung: "Nhân viên tích Start khi bắt đầu task, tích Xong khi hoàn thành. Hệ thống tự ghi giờ để đo
thời gian làm. Thanh trạng thái luôn nhìn thấy trên đầu: chỉ khi tất cả task có đủ Start + Xong mới hiện
'Đã hoàn thành công việc', còn không hiện 'Chưa hoàn thành xong công việc ngày hôm nay'. Chạy trên web page
up lên GitHub, dùng Google Sheet."

## Clarifications

### Session 2026-10-20
- Q: Kiến trúc? → A: Phương án A — trang web trên GitHub Pages, dữ liệu ghi vào Google Sheet qua Apps Script.
- Q: Mã PIN? → A: Không cần.
- Q: Nút Kẹt? → A: Có, kèm mô tả tình trạng kẹt (bắt buộc nhập).
- Q: Sang ngày mới? → A: Reset mọi thứ về ban đầu (chưa tích gì, trạng thái "chưa hoàn thành"). **Không lưu lịch sử** ngày trước.
- Q: Việc bổ sung? → A: Việc 15 "Chạy Etsy Auto Next trước khi ngủ", chỉ làm trong khoảng 0h–7h sáng, lúc nào trong khoảng đó cũng được.
- Q: Mốc reset ngày? → A (Claude đề xuất, vì việc 15 nằm sau 0h): ngày làm việc bắt đầu và reset lúc **7h sáng** giờ Việt Nam.
- Q: Việc 8 "Tăng giá áo" đang tạm dừng? → A: Có trong danh sách nhưng đặt "Hoạt động = FALSE" → không hiện, không tính.

## User Scenarios & Testing

### User Story 1 - Bấm Start / Xong, tự ghi giờ (Priority: P1)
Nhân viên mở trang, thấy danh sách việc hôm nay. Bắt đầu việc nào thì bấm **Start**, làm xong bấm **Xong**.
Giờ do máy chủ ghi; khi Xong thì hiện số phút đã làm.

**Acceptance Scenarios**:
1. **Given** việc chưa Start, **When** bấm Start, **Then** ghi giờ Start (giờ máy chủ), nút Start khoá, nút Xong mở.
2. **Given** việc chưa Start, **When** cố gọi Xong, **Then** máy chủ từ chối.
3. **Given** việc đã Start, **When** bấm Xong, **Then** ghi giờ Xong + số phút, cả hai nút khoá, không bỏ tích được.

### User Story 2 - Thanh trạng thái luôn hiện (Priority: P1)
**Acceptance Scenarios**:
1. **Given** còn ít nhất 1 việc thiếu Start hoặc Xong, **Then** thanh trên đầu (dính cố định khi cuộn) màu đỏ, chữ "Chưa hoàn thành xong công việc ngày hôm nay".
2. **Given** mọi việc đang hoạt động đều có Start và Xong, **Then** thanh màu xanh, chữ "Đã hoàn thành công việc".

### User Story 3 - Báo Kẹt kèm mô tả (Priority: P1)
**Acceptance Scenarios**:
1. **Given** việc đã Start, chưa Xong, **When** bấm Kẹt, **Then** hiện ô nhập mô tả; không nhập thì không gửi được.
2. **When** gửi, **Then** máy chủ ghi giờ + mô tả; việc hiện nhãn "Đã báo kẹt" và danh sách các lần kẹt. Báo kẹt nhiều lần được.
3. Báo kẹt không chặn việc bấm Xong sau đó.

### User Story 4 - Reset sang ngày mới (Priority: P1)
**Acceptance Scenarios**:
1. **Given** đã qua 7h sáng ngày mới, **When** mở trang hoặc trang tự làm mới, **Then** mọi việc về chưa tích, dữ liệu hôm trước bị xoá.

### User Story 5 - Việc có khung giờ (Priority: P2)
**Acceptance Scenarios**:
1. **Given** việc 15 có khung giờ 00:00–07:00, **When** ngoài khung giờ, **Then** nút bị khoá kèm dòng "Chỉ bấm được từ 0h đến 7h sáng"; máy chủ cũng từ chối.

### Edge Cases
- Bấm 2 lần liên tiếp / mạng chậm: máy chủ dùng khoá (lock) và kiểm tra trạng thái, lần thứ hai bị từ chối, không ghi đè giờ.
- Mất mạng: hiện thông báo lỗi rõ ràng, không đổi trạng thái trên giao diện.
- Trang mở qua đêm: trang tự tải lại trạng thái định kỳ, qua 7h tự hiện bảng mới.
- Anh Tung sửa danh sách việc giữa ngày: việc mới hiện ra chưa tích; việc bị tắt không còn tính.

## Requirements

### Functional Requirements
- **FR-001**: Danh sách việc đọc từ tab `DanhSachViec` của Google Sheet (cột: STT, Tên việc, Ghi chú, Hoạt động, Khung giờ). Chỉ anh Tung sửa.
- **FR-002**: Mỗi việc có 3 nút: Start, Kẹt, Xong. Thứ tự bắt buộc: Start → (Kẹt 0..n lần) → Xong. Máy chủ kiểm tra.
- **FR-003**: Mọi mốc giờ lấy theo đồng hồ máy chủ, múi giờ Asia/Ho_Chi_Minh.
- **FR-004**: Đã Start/Xong thì không bỏ được.
- **FR-005**: Kẹt bắt buộc có mô tả (không rỗng, tối đa 500 ký tự).
- **FR-006**: Khi Xong, tính và hiện số phút từ Start đến Xong.
- **FR-007**: Thanh trạng thái `position: sticky` trên cùng, đúng 2 câu chữ ở User Story 2, kèm đếm "x/y việc".
- **FR-008**: Ngày làm việc = khoảng 7h sáng hôm nay → 7h sáng hôm sau. Sang ngày làm việc mới thì xoá toàn bộ dữ liệu hôm trước (không lưu lịch sử).
- **FR-009**: Cột Khung giờ dạng `HH:mm-HH:mm` (để trống = lúc nào cũng được). Ngoài khung giờ thì Start/Kẹt/Xong đều bị từ chối.
- **FR-010**: Dữ liệu hôm nay ghi vào tab `HomNay` (STT, Tên việc, Bắt đầu, Xong, Số phút, Kẹt) để anh Tung xem trực tiếp trên Sheet.
- **FR-011**: Trang tự tải lại trạng thái mỗi 60 giây và khi mở lại tab.
- **FR-012**: Danh sách việc mặc định: 14 việc ở `CONTEXT.md` mục 3 (việc 8 Hoạt động = FALSE) + việc 15 "Chạy Etsy Auto Next" khung giờ 00:00-07:00.

### Key Entities
- **Việc**: STT, tên, ghi chú, hoạt động, khung giờ.
- **Trạng thái hôm nay của việc**: giờ Start, giờ Xong, số phút, danh sách Kẹt (giờ + mô tả).

## Success Criteria
- **SC-001**: Nhân viên dùng được trên điện thoại mà không cần hướng dẫn quá 1 lần.
- **SC-002**: Nhân viên không thể làm sai lệch giờ đã ghi (đổi giờ máy, bấm lại, sửa Sheet).
- **SC-003**: Anh Tung nhìn thanh trạng thái hoặc tab `HomNay` là biết ngay hôm nay xong chưa, kẹt ở đâu.

## Assumptions
- Một nhân viên, một bảng. Không cần đăng nhập.
- Repo GitHub public (GitHub Pages miễn phí); dữ liệu nằm trong Sheet, không nằm trong repo. Ai có link đều bấm được — chấp nhận vì không cần PIN.
