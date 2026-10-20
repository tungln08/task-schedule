(function () {
  'use strict';

  var VN_OFFSET_MS = 7 * 3600 * 1000;   // Việt Nam UTC+7, không có giờ mùa hè
  var REFRESH_MS = 60 * 1000;

  var state = null;
  var clockSkew = 0;                    // giờ máy chủ − giờ máy này
  var busy = false;
  var stuckTaskId = null;

  var $ = function (id) { return document.getElementById(id); };

  // ---------- Gọi máy chủ ----------

  function request(method, body) {
    if (!window.SCRIPT_URL) return Promise.reject(new Error('Chưa cấu hình SCRIPT_URL trong config.js.'));
    var opts = { method: method, redirect: 'follow' };
    if (body) {
      opts.body = JSON.stringify(body);
      opts.headers = { 'Content-Type': 'text/plain;charset=utf-8' };   // tránh CORS preflight của Apps Script
    }
    var url = window.SCRIPT_URL + (method === 'GET' ? '?action=state&t=' + Date.now() : '');
    return fetch(url, opts)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok) throw new Error(data.error || 'Máy chủ báo lỗi.');
        return data;
      }, function (err) {
        if (err instanceof SyntaxError) throw new Error('Máy chủ trả về dữ liệu lạ. Báo anh Tung.');
        throw new Error(err.message && err.message.indexOf('Failed to fetch') < 0 ? err.message : 'Mất mạng hoặc không kết nối được máy chủ. Thử lại.');
      });
  }

  function load() {
    return request('GET').then(apply).catch(showError);
  }

  function send(action, id, text) {
    if (busy) return Promise.resolve();
    busy = true;
    render();
    return request('POST', { action: action, id: id, text: text })
      .then(function (data) { apply(data); return true; })
      .catch(function (err) { showError(err); return false; })
      .finally(function () { busy = false; render(); });
  }

  function apply(data) {
    state = data;
    clockSkew = new Date(data.serverNow).getTime() - Date.now();
    showError(null);
    render();
  }

  function showError(err) {
    var box = $('error');
    box.hidden = !err;
    box.textContent = err ? err.message : '';
  }

  // ---------- Giờ giấc ----------

  function vnDate(ms) { return new Date(ms + VN_OFFSET_MS); }   // đọc bằng getUTC*

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function fmtTime(iso) {
    var d = vnDate(new Date(iso).getTime());
    return pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
  }

  function fmtMinutes(m) {
    if (m < 60) return m + ' phút';
    return Math.floor(m / 60) + ' giờ ' + pad(m % 60) + ' phút';
  }

  function inWindow(win) {
    var m = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(win || '');
    if (!m) return true;
    var d = vnDate(Date.now() + clockSkew);
    var cur = d.getUTCHours() * 60 + d.getUTCMinutes();
    var from = +m[1] * 60 + +m[2];
    var to = +m[3] * 60 + +m[4];
    return from <= to ? (cur >= from && cur < to) : (cur >= from || cur < to);
  }

  function windowLabel(win) {
    var m = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/.exec(win || '');
    if (!m) return '';
    var h = function (hh, mm) { return +hh + 'h' + (mm === '00' ? '' : mm); };
    return 'Chỉ bấm được từ ' + h(m[1], m[2]) + ' đến ' + h(m[3], m[4]) + (+m[3] <= 12 ? ' sáng' : '');
  }

  // ---------- Vẽ giao diện ----------

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function render() {
    if (!state) return;
    var tasks = state.tasks;
    var doneCount = tasks.filter(function (t) { return t.start && t.done; }).length;
    var complete = tasks.length > 0 && doneCount === tasks.length;

    var bar = $('statusBar');
    bar.className = 'status ' + (complete ? 'complete' : 'pending');
    $('statusText').textContent = complete ? 'Đã hoàn thành công việc' : 'Chưa hoàn thành xong công việc ngày hôm nay';
    var p = state.workday.split('-');
    $('statusSub').textContent = 'Xong ' + doneCount + '/' + tasks.length + ' việc · Ngày ' + p[2] + '/' + p[1] +
      ' · tự làm mới lúc ' + state.resetHour + 'h sáng';

    $('elapsed').textContent = elapsedText(tasks);

    var list = $('tasks');
    list.textContent = '';
    tasks.forEach(function (t) { list.appendChild(renderTask(t)); });
    tickClocks();
  }

  // Đồng hồ việc đang làm: chỉ cập nhật chữ, không vẽ lại cả trang.
  function tickClocks() {
    var now = Date.now() + clockSkew;
    var clocks = document.querySelectorAll('.running-clock');
    for (var i = 0; i < clocks.length; i++) {
      var sec = Math.max(0, Math.floor((now - new Date(clocks[i].getAttribute('data-start')).getTime()) / 1000));
      var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
      clocks[i].textContent = (h ? h + ' giờ ' + pad(m) : m) + ' phút ' + pad(s) + ' giây';
    }
  }

  // Giờ Kẹt chỉ có "HH:mm": giờ trước mốc reset thuộc ngày hôm sau của ngày làm việc.
  function stuckTimeMs(hhmm) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '');
    if (!m) return null;
    var p = state.workday.split('-');
    var dayMs = Date.UTC(+p[0], +p[1] - 1, +p[2]) + (+m[1] < state.resetHour ? 24 * 3600 * 1000 : 0);
    return dayMs + (+m[1] * 60 + +m[2]) * 60000 - VN_OFFSET_MS;
  }

  // Từ Start sớm nhất đến lần bấm Xong/Kẹt gần nhất.
  function elapsedText(tasks) {
    var first = null, last = null;
    tasks.forEach(function (t) {
      if (t.start) {
        var s = new Date(t.start).getTime();
        if (first === null || s < first) first = s;
      }
      var marks = t.stuck.map(function (k) { return stuckTimeMs(k.time); });
      if (t.done) marks.push(new Date(t.done).getTime());
      marks.forEach(function (ms) { if (ms !== null && (last === null || ms > last)) last = ms; });
    });
    if (first === null || last === null) return 'Tổng thời gian đã làm: chưa có — sẽ tính khi bấm Xong hoặc Kẹt';
    var mins = Math.max(0, Math.round((last - first) / 60000));
    return 'Tổng thời gian đã làm: ' + fmtMinutes(mins) +
      ' (từ ' + fmtTime(new Date(first).toISOString()) + ' đến ' + fmtTime(new Date(last).toISOString()) + ')';
  }

  function renderTask(t) {
    var li = el('li', 'task' + (t.done ? ' is-done' : t.start ? ' is-running' : ' is-todo'));

    var head = el('div', 'task-head');
    head.appendChild(el('span', 'task-num', t.done ? '✔ ' + t.id : t.id));
    head.appendChild(el('span', 'task-name', t.name));
    li.appendChild(head);
    if (t.note) li.appendChild(el('div', 'task-note', t.note));

    var open = inWindow(t.window);
    if (t.window && !t.done) li.appendChild(el('div', 'task-window', (open ? '✅ ' : '⏰ ') + windowLabel(t.window)));

    if (t.start) {
      var times = el('div', 'task-times');
      var s = el('span', null, 'Bắt đầu: '); s.appendChild(el('b', null, fmtTime(t.start))); times.appendChild(s);
      if (t.done) {
        var d = el('span', null, 'Xong: '); d.appendChild(el('b', null, fmtTime(t.done))); times.appendChild(d);
        var m = el('span', null, 'Mất: '); m.appendChild(el('b', null, fmtMinutes(t.minutes))); times.appendChild(m);
      }
      li.appendChild(times);
    }

    if (t.start && !t.done) {
      var run = el('div', 'running', '▶ Bạn đang làm phần việc này được ');
      var clock = el('b', 'running-clock');
      clock.setAttribute('data-start', t.start);
      run.appendChild(clock);
      run.appendChild(document.createTextNode(' rồi'));
      li.appendChild(run);
    }

    if (t.stuck.length) {
      var box = el('div', 'stuck-list');
      box.appendChild(el('strong', null, '⚠ Đã báo kẹt ' + t.stuck.length + ' lần'));
      var ul = el('ul');
      t.stuck.forEach(function (s) { ul.appendChild(el('li', null, (s.time ? s.time + ' — ' : '') + s.text)); });
      box.appendChild(ul);
      li.appendChild(box);
    }

    var actions = el('div', 'task-actions');
    actions.appendChild(button('Start', 'btn-start', 'Bấm khi bắt đầu làm việc này',
      busy || !open || !!t.start, function () { send('start', t.id); }));
    actions.appendChild(button('Kẹt', 'btn-stuck', 'Bấm khi gặp lỗi, không làm tiếp được',
      busy || !open || !t.start || !!t.done, function () { openStuck(t); }));
    actions.appendChild(button('Xong', 'btn-done', 'Bấm khi đã làm xong việc này',
      busy || !open || !t.start || !!t.done, function () { send('done', t.id); }));
    li.appendChild(actions);
    return li;
  }

  function button(label, cls, hint, disabled, onClick) {
    var wrap = el('div', 'action');
    var b = el('button', 'btn ' + cls, label);
    b.type = 'button';
    b.disabled = disabled;
    b.addEventListener('click', onClick);
    wrap.appendChild(b);
    wrap.appendChild(el('small', 'hint', hint));
    return wrap;
  }

  // ---------- Hộp báo Kẹt ----------

  function openStuck(t) {
    stuckTaskId = t.id;
    $('stuckTaskName').textContent = t.id + '. ' + t.name;
    $('stuckText').value = '';
    $('stuckDialog').hidden = false;
    $('stuckText').focus();
  }

  function closeStuck() {
    stuckTaskId = null;
    $('stuckDialog').hidden = true;
  }

  $('stuckCancel').addEventListener('click', closeStuck);
  $('stuckForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var text = $('stuckText').value.trim();
    if (!text) { $('stuckText').focus(); return; }
    $('stuckSend').disabled = true;
    send('stuck', stuckTaskId, text).then(function (ok) {
      $('stuckSend').disabled = false;
      if (ok) closeStuck();
    });
  });

  // ---------- Khởi động ----------

  load();
  setInterval(function () { if (!busy && !document.hidden) load(); }, REFRESH_MS);
  setInterval(tickClocks, 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
})();
