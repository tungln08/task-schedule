# Bảng Việc Hôm Nay

Trang web cho nhân viên bấm **Start / Kẹt / Xong** từng việc. Giờ do máy chủ Google ghi. Thanh trên đầu chỉ xanh
"Đã hoàn thành công việc" khi mọi việc có đủ Start + Xong. Mỗi ngày tự reset lúc **7h sáng**, không lưu lịch sử.

- Trang web: GitHub Pages (`index.html`, `style.css`, `app.js`, `config.js`)
- Dữ liệu: Google Sheet + Apps Script (`apps-script/Code.gs`)
- Spec: [specs/001-daily-task-board/spec.md](specs/001-daily-task-board/spec.md)

## Cài đặt (làm 1 lần, ~10 phút)

### Bước 1 — Google Sheet + Apps Script
1. Tạo Google Sheet mới (tên tuỳ ý), **không chia sẻ** cho nhân viên.
2. Menu **Extensions → Apps Script**. Xoá code mẫu, dán toàn bộ nội dung `apps-script/Code.gs`, bấm 💾 Save.
3. Ở ô chọn hàm phía trên, chọn `setup` → bấm **Run** → cấp quyền (Advanced → Go to … → Allow).
   Sheet sẽ có 2 tab: `DanhSachViec` và `HomNay`.
4. Bấm **Deploy → New deployment** → bánh răng chọn **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Bấm Deploy, copy **Web app URL** (dạng `https://script.google.com/macros/s/.../exec`).

### Bước 2 — Gắn URL vào trang
Mở `config.js`, dán URL vào: `window.SCRIPT_URL = 'https://script.google.com/macros/s/.../exec';`

### Bước 3 — GitHub Pages
Repo → **Settings → Pages** → Source: *Deploy from a branch*, branch `main`, thư mục `/ (root)` → Save.
Sau ~1 phút có link `https://<tên-github>.github.io/<tên-repo>/` — gửi link này cho nhân viên.

## Dùng hằng ngày

- **Sửa danh sách việc:** sửa tab `DanhSachViec` (STT, Tên việc, Ghi chú, Hoạt động, Khung giờ). Bỏ tích *Hoạt động*
  để ẩn việc (VD việc 8 đang tạm dừng). *Khung giờ* dạng `00:00-07:00`, để trống = lúc nào cũng được.
  Trang tự cập nhật trong vòng 1 phút.
- **Xem kết quả:** mở trang web hoặc tab `HomNay` (giờ bắt đầu, giờ xong, số phút, nội dung kẹt).
  Dữ liệu của một ngày còn đến **7h sáng hôm sau** thì bị xoá.
- **Sửa trang web:** mỗi lần sửa `style.css` / `app.js` / `config.js` phải tăng số `?v=` trong `index.html`,
  nếu không trình duyệt nhân viên có thể dùng bản cũ.
- **Sửa `Code.gs` sau này:** dán code mới → **Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy**
  (giữ nguyên URL, không cần sửa `config.js`).
