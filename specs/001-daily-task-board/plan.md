# Implementation Plan: Bảng việc hằng ngày

**Branch**: `001-daily-task-board` | **Date**: 2026-10-20 | **Spec**: [spec.md](spec.md)

## Technical Context
- **Frontend**: HTML + CSS + JavaScript thuần (không framework, không build), host GitHub Pages.
- **Backend**: Google Apps Script Web App gắn với 1 Google Sheet (Execute as: Me, Access: Anyone).
- **Lưu trữ**: Tab `DanhSachViec` (anh Tung sửa), tab `HomNay` (script ghi), Script Properties `WORKDAY` (ngày làm việc hiện tại).
- **Múi giờ**: Asia/Ho_Chi_Minh, reset lúc 7h (`RESET_HOUR = 7`).

## Constitution Check
- I/II: giờ do máy chủ ghi, mọi quy tắc kiểm tra trong `Code.gs` ✔
- III: giao diện 1 cột, nút to, tiếng Việt ✔
- IV: miễn phí, không build ✔

## API (contract)
- `GET  ?action=state` → `{ ok, workday, serverNow, resetHour, tasks: [{ id, name, note, window, start, done, minutes, stuck:[{time,text}] }] }`
- `POST` body (Content-Type `text/plain` để tránh CORS preflight) `{ action: "start"|"done"|"stuck", id, text? }` → cùng dạng state, hoặc `{ ok:false, error }`.
- Mọi request đều chạy `ensureWorkday()` trước: nếu ngày làm việc đổi → xoá dữ liệu `HomNay`.
- Ghi dùng `LockService` để tránh 2 lần bấm chồng nhau.

## Cấu trúc
```
index.html, style.css, app.js, config.js   ← GitHub Pages
apps-script/Code.gs                         ← dán vào Apps Script của Sheet
README.md                                   ← hướng dẫn cài đặt
```

## Kiểm thử
Chạy `Code.gs` trong Node với bản giả lập SpreadsheetApp/PropertiesService/LockService (thư mục scratchpad),
mở trang bằng Chrome trỏ vào máy chủ giả lập, bấm thử đủ các luồng + ép đổi giờ để thử reset và khung giờ.
