/**
 * Bảng việc hằng ngày — backend Google Apps Script.
 * Dán toàn bộ file này vào Extensions → Apps Script của Google Sheet, chạy setup() 1 lần,
 * rồi Deploy → Web app (Execute as: Me, Who has access: Anyone).
 */

var TZ = 'Asia/Ho_Chi_Minh';
var RESET_HOUR = 7;               // ngày làm việc bắt đầu / reset lúc 7h sáng
var SHEET_TASKS = 'DanhSachViec';
var SHEET_TODAY = 'HomNay';
var MAX_STUCK_LEN = 500;

// Ghi chú: mỗi phần tử là một dòng trong ô; trang web tự đánh số STT.1, STT.2…
var DEFAULT_TASKS = [
  [1, 'Tăng budget buổi sáng (7h–8h)', [
    'Làm bằng tay trên Amazon Ads (chưa dùng tool Auto Budget để tăng budget)',
    'Tìm các campaign đã hết budget VÀ có ACOS dưới 17%',
    'Tăng gấp đôi budget các campaign đó',
    'Đánh dấu lại các campaign đã tăng để buổi chiều kiểm tra (việc 6)',
    'Báo cáo: áo gì, campaign nào, chỉ số ra sao'], true, ''],
  [2, 'Lọc vi phạm mẫu từ tool cào idea Etsy', [
    'Load ảnh sản phẩm lần 1',
    'Lọc vi phạm các mẫu lấy từ tool cào idea Etsy',
    'Mẫu nào bị loại phải ghi rõ mình hiểu đó là loại vi phạm gì'], true, ''],
  [3, 'Chạy check POD design', [
    'Chạy tool check POD design',
    'Đặt lại tên sản phẩm',
    'Sau khi đặt lại tên xong thì bấm "Bắt đầu kiểm tra"',
    'Load ảnh sản phẩm lần 2',
    'Chốt ảnh nào tải được luôn file PNG từ Amazon',
    'Chốt ảnh nào phải tách nền bằng ChatGPT'], true, ''],
  [4, 'Tách nền và xử lý ảnh (không chờ duyệt)', [
    'Làm xong việc 3 thì tách nền luôn, không ngồi chờ duyệt',
    'Ảnh bị tool check đánh dấu vi phạm thì chưa tách vội, tách sau',
    'Mẫu đã có trên Amazon: tool download PNG từ Amazon → crop → làm nét',
    'Mẫu chưa có trên Amazon: tách nền bằng ChatGPT → tool bg_remove để về size 4500x5400',
    'Cuối cùng: nén ảnh + xoá metadata'], true, ''],
  [5, 'Up áo', [
    'Up áo sau khi được duyệt'], true, ''],
  [6, 'Kiểm tra Ads buổi chiều', [
    'Xem các campaign đã tăng budget sáng nay',
    'Có thêm đơn mới không',
    'ACOS có thay đổi nhiều không',
    'Báo cáo: áo gì, campaign nào, chỉ số ra sao'], true, ''],
  [8, 'Tăng giá áo', [
    'TẠM DỪNG — khi nào cần, anh Tung sẽ nói cụ thể áo nào, tăng lên bao nhiêu'], false, ''],
  [9, 'Check camp-A để tạo quảng cáo Key', [
    'Check các camp-A để tạo quảng cáo Key',
    'Dùng tool Auto Budget Bulk upload download, mục Bulk upload download'], true, ''],
  [10, 'Tổng hợp doanh số tất cả account', [
    'Dùng tool MBA Monitor tổng hợp doanh số tất cả account',
    'Báo cáo: doanh thu, chi phí Ads, lợi nhuận ròng thực tế'], true, ''],
  [11, 'Tạo keyword quảng cáo', [
    'Dùng tool Auto Budget Bulk upload download, mục Tạo keyword'], true, ''],
  [12, 'Chỉnh Ads', [
    'Chỉnh Ads bằng công cụ auto excel'], true, ''],
  [13, 'Tạo quảng cáo', [
    'Dùng tool Auto Budget Bulk upload download, mục Bulk upload download'], true, ''],
  [14, 'Kiểm tra trước khi đi ngủ', [
    'Xem 3 account quảng cáo có campaign nào báo out of budget không',
    'Campaign nào đủ điều kiện (hết budget + ACOS dưới 17%) thì tăng budget luôn',
    'Báo cáo: áo gì, campaign nào, chỉ số ra sao'], true, ''],
  [15, 'Chạy Etsy Auto Next trước khi ngủ', [
    'Chạy tool Etsy Auto Next',
    'Chạy lúc nào trong khoảng 0h–7h sáng cũng được'], true, '00:00-07:00']
];

/** Chạy 1 lần để tạo 2 tab và danh sách việc mặc định. Không ghi đè nếu tab đã có. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName(SHEET_TASKS)) writeDefaultTasks_(ss.insertSheet(SHEET_TASKS));
  var d = ss.getSheetByName(SHEET_TODAY);
  if (!d) {
    d = ss.insertSheet(SHEET_TODAY);
    writeTodayHeader_(d);
  }
}

/** Ghi đè toàn bộ tab DanhSachViec về danh sách mặc định (mất mọi sửa đổi trong tab đó). */
function resetDanhSachViec() {
  var t = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TASKS);
  t.clear();
  writeDefaultTasks_(t);
}

function writeDefaultTasks_(t) {
  var rows = DEFAULT_TASKS.map(function (r) { return [r[0], r[1], r[2].join('\n'), r[3], r[4]]; });
  t.getRange(1, 1, 1, 5).setValues([['STT', 'Tên việc', 'Ghi chú', 'Hoạt động', 'Khung giờ']]).setFontWeight('bold');
  t.getRange(2, 5, rows.length, 1).setNumberFormat('@');
  t.getRange(2, 1, rows.length, 5).setValues(rows);
  t.getRange(2, 4, rows.length, 1).insertCheckboxes();
  t.getRange(2, 3, rows.length, 1).setWrap(true);
  t.setFrozenRows(1);
}

function writeTodayHeader_(d) {
  d.getRange(1, 1, 1, 6).setValues([['STT', 'Tên việc', 'Bắt đầu', 'Xong', 'Số phút', 'Kẹt']]).setFontWeight('bold');
  d.setFrozenRows(1);
}

// ---------- HTTP ----------

function doGet() {
  return handle_(function () { return buildState_(); });
}

function doPost(e) {
  return handle_(function () {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      applyAction_(body);
    } finally {
      lock.releaseLock();
    }
    return buildState_();
  });
}

function handle_(fn) {
  var out;
  try {
    out = fn();
    out.ok = true;
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Ngày làm việc ----------

/** Ngày làm việc = ngày của (bây giờ − RESET_HOUR giờ), theo giờ Việt Nam. */
function workdayKey_(now) {
  return Utilities.formatDate(new Date(now.getTime() - RESET_HOUR * 3600 * 1000), TZ, 'yyyy-MM-dd');
}

/** Sang ngày làm việc mới thì xoá sạch dữ liệu HomNay (không lưu lịch sử). */
function ensureWorkday_(now) {
  var props = PropertiesService.getScriptProperties();
  var key = workdayKey_(now);
  if (props.getProperty('WORKDAY') === key) return key;
  var d = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TODAY);
  d.clear();
  writeTodayHeader_(d);
  props.setProperty('WORKDAY', key);
  return key;
}

// ---------- Đọc dữ liệu ----------

function readTasks_() {
  var t = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TASKS);
  var rows = t.getLastRow() > 1 ? t.getRange(2, 1, t.getLastRow() - 1, 5).getValues() : [];
  var list = [];
  rows.forEach(function (r) {
    var id = String(r[0]).trim();
    var active = r[3] === true || String(r[3]).toUpperCase() === 'TRUE';
    if (!id || !String(r[1]).trim() || !active) return;
    list.push({ id: id, name: String(r[1]).trim(), note: String(r[2] || '').trim(), window: String(r[4] || '').trim() });
  });
  return list;
}

/** Trả về { id: { row, start, done, stuck[] } } từ tab HomNay. */
function readToday_() {
  var d = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TODAY);
  var map = {};
  if (d.getLastRow() < 2) return map;
  d.getRange(2, 1, d.getLastRow() - 1, 6).getValues().forEach(function (r, i) {
    var id = String(r[0]).trim();
    if (!id) return;
    map[id] = {
      row: i + 2,
      start: r[2] instanceof Date ? r[2] : null,
      done: r[3] instanceof Date ? r[3] : null,
      stuck: String(r[5] || '').split('\n').filter(String).map(function (line) {
        var p = line.indexOf(' — ');
        return p < 0 ? { time: '', text: line } : { time: line.slice(0, p), text: line.slice(p + 3) };
      })
    };
  });
  return map;
}

function buildState_() {
  var now = new Date();
  var workday = ensureWorkday_(now);
  var today = readToday_();
  var tasks = readTasks_().map(function (t) {
    var s = today[t.id] || {};
    return {
      id: t.id, name: t.name, note: t.note, window: t.window,
      start: s.start ? s.start.toISOString() : null,
      done: s.done ? s.done.toISOString() : null,
      minutes: s.start && s.done ? minutesBetween_(s.start, s.done) : null,
      stuck: s.stuck || []
    };
  });
  return { workday: workday, serverNow: now.toISOString(), resetHour: RESET_HOUR, tasks: tasks };
}

// ---------- Ghi dữ liệu ----------

function applyAction_(body) {
  var now = new Date();
  ensureWorkday_(now);
  var task = readTasks_().filter(function (t) { return t.id === String(body.id); })[0];
  if (!task) throw new Error('Không tìm thấy việc này (có thể anh Tung vừa tắt). Tải lại trang.');
  if (!inWindow_(task.window, now)) throw new Error('Việc này chỉ bấm được trong khung giờ ' + task.window + '.');

  var d = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TODAY);
  var s = readToday_()[task.id];
  var row = s ? s.row : d.getLastRow() + 1;
  if (!s) {
    d.getRange(row, 1, 1, 2).setValues([[task.id, task.name]]);
    s = { start: null, done: null };
  }

  if (body.action === 'start') {
    if (s.start) throw new Error('Việc này đã Start rồi.');
    d.getRange(row, 3).setValue(now).setNumberFormat('HH:mm:ss');
  } else if (body.action === 'done') {
    if (!s.start) throw new Error('Phải bấm Start trước rồi mới bấm Xong.');
    if (s.done) throw new Error('Việc này đã Xong rồi.');
    d.getRange(row, 4).setValue(now).setNumberFormat('HH:mm:ss');
    d.getRange(row, 5).setValue(minutesBetween_(s.start, now));
  } else if (body.action === 'stuck') {
    if (!s.start) throw new Error('Phải bấm Start trước rồi mới báo Kẹt.');
    if (s.done) throw new Error('Việc này đã Xong, không báo Kẹt được.');
    var text = String(body.text || '').replace(/\s+/g, ' ').trim();
    if (!text) throw new Error('Phải ghi rõ đang kẹt chuyện gì.');
    if (text.length > MAX_STUCK_LEN) text = text.slice(0, MAX_STUCK_LEN);
    var cell = d.getRange(row, 6);
    var old = String(cell.getValue() || '');
    cell.setValue((old ? old + '\n' : '') + Utilities.formatDate(now, TZ, 'HH:mm') + ' — ' + text);
  } else {
    throw new Error('Lệnh không hợp lệ.');
  }
}

function minutesBetween_(a, b) {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

/** window dạng "HH:mm-HH:mm"; rỗng = luôn được. Hỗ trợ khung qua nửa đêm (VD 22:00-02:00). */
function inWindow_(window, now) {
  var m = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(window || '');
  if (!m) return true;
  var cur = Number(Utilities.formatDate(now, TZ, 'H')) * 60 + Number(Utilities.formatDate(now, TZ, 'm'));
  var from = Number(m[1]) * 60 + Number(m[2]);
  var to = Number(m[3]) * 60 + Number(m[4]);
  return from <= to ? (cur >= from && cur < to) : (cur >= from || cur < to);
}
