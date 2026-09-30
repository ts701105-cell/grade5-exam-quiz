/* 五年級段考練習網站 — 主程式
 * 紀錄同時存在瀏覽器（localStorage）與雲端（Google 試算表，透過 Apps Script）。
 * 網路斷線時先存在本機，下次連上網路自動補傳。
 */
(function () {
  'use strict';

  // 帳號:密碼 的 SHA-256（真正的驗證在雲端伺服器進行）
  const HASH = {
    student: 'd9fd94a755b4a9bfbe293a8d76fcc92913a67de71ba62ad5b72c850b44ed2ce1',
    admin: '293ef363efdf3a6f798529a557144e3aa9f5bdcfc9d18c0964979be0f487ba81'
  };
  const STUDENT_NAME = '張嘉祐';
  const API = (window.API_URL || '').trim();

  const KEY = {
    logins: 'g5q.logins',      // 登入紀錄
    results: 'g5q.results',    // 測驗成績
    wrong: 'g5q.wrongbook',    // 錯題本 {data: {unitId: {qid: 次數}}, updated}
    outbox: 'g5q.outbox',      // 等待上傳到雲端的資料
    session: 'g5q.session',    // 目前登入（sessionStorage）
    quiz: 'g5q.quiz'           // 作答中的測驗（sessionStorage）
  };

  const app = document.getElementById('app');
  const topbar = document.getElementById('topbar');
  const nav = document.getElementById('nav');
  const syncEl = document.getElementById('sync');

  // ---------- 儲存工具 ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const sess = {
    get(k) { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  // ---------- 小工具 ----------
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  function fmtTime(t) {
    if (!t) return '—';
    const d = new Date(t);
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function fmtDur(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(s / 60)} 分 ${pad(s % 60)} 秒`;
  }
  function shuffle(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
  }
  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  function findUnit(id) {
    for (const s of window.SUBJECTS) for (const u of s.units) if (u.id === id) return { subject: s, unit: u };
    return null;
  }
  function loadBank(unitId) {
    return new Promise((resolve, reject) => {
      window.QUIZ_BANK = window.QUIZ_BANK || {};
      if (window.QUIZ_BANK[unitId]) return resolve(window.QUIZ_BANK[unitId]);
      const f = findUnit(unitId);
      if (!f || !f.unit.file) return reject(new Error('找不到題庫'));
      const s = document.createElement('script');
      s.src = 'data/' + f.unit.file + '?v=' + Date.now();
      s.onload = () => window.QUIZ_BANK[unitId] ? resolve(window.QUIZ_BANK[unitId]) : reject(new Error('題庫格式錯誤'));
      s.onerror = () => reject(new Error('題庫載入失敗，請檢查網路'));
      document.head.appendChild(s);
    });
  }
  const scoreClass = sc => sc >= 90 ? 'good' : sc >= 70 ? 'mid' : 'bad';
  function tableHtml(t) {
    if (!t || !t.length) return '';
    const head = t[0].map(c => `<th>${esc(c)}</th>`).join('');
    const body = t.slice(1).map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
    return `<div class="table-wrap qtable"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  function device(ua) {
    ua = ua || '';
    const os = /iPad/.test(ua) ? 'iPad' : /iPhone/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' :
      /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /CrOS/.test(ua) ? 'Chromebook' : '其他';
    const br = /Edg\//.test(ua) ? 'Edge' : /Line\//.test(ua) ? 'LINE' : /Chrome\//.test(ua) ? 'Chrome' :
      /Safari\//.test(ua) ? 'Safari' : /Firefox\//.test(ua) ? 'Firefox' : '';
    return br ? `${os}・${br}` : os;
  }
  function byId(arr, item) { if (!arr.some(x => x.id === item.id)) arr.push(item); return arr; }

  // ---------- 錯題本 ----------
  function getBook() {
    const b = store.get(KEY.wrong, null);
    if (!b) return { data: {}, updated: 0 };
    if (!b.data) return { data: b, updated: 0 };            // 舊格式轉換
    return b;
  }
  function setBook(data) { const b = { data, updated: Date.now() }; store.set(KEY.wrong, b); return b; }

  // ---------- 雲端 ----------
  async function api(action, payload, cred) {
    if (!API) throw new Error('尚未設定雲端');
    const c = cred || sess.get(KEY.session);
    const res = await fetch(API, {
      method: 'POST',
      body: JSON.stringify(Object.assign({}, payload, { action, acc: c.acc, pwd: c.pwd }))
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || '雲端錯誤');
    return data;
  }
  function queue(action, payload) {
    const box = store.get(KEY.outbox, []);
    box.push({ action, payload });
    store.set(KEY.outbox, box);
    return flush();
  }
  let flushing = null;
  function flush() {
    if (!API) { showSync(); return Promise.resolve(); }
    const s = sess.get(KEY.session);
    if (!s || s.role !== 'student') { showSync(); return Promise.resolve(); }
    if (flushing) return flushing;
    flushing = (async () => {
      showSync('uploading');
      let box = store.get(KEY.outbox, []);
      while (box.length) {
        const item = box[0];
        try {
          const r = await api(item.action, item.payload);
          if (item.action === 'login') mergeState(r);
        } catch (e) { break; }
        box = store.get(KEY.outbox, []);
        box.shift();
        store.set(KEY.outbox, box);
      }
    })().finally(() => { flushing = null; showSync(); });
    return flushing;
  }
  // 以雲端資料為準（管理員刪除的紀錄也會同步消失），再加上還沒上傳的本機資料
  function mergeState(r) {
    if (!r || !r.logins || !r.results) return;
    const box = store.get(KEY.outbox, []);
    const pendL = new Set(box.filter(x => x.action === 'login').map(x => x.payload.login.id));
    const pendR = new Set(box.filter(x => x.action === 'result').map(x => x.payload.result.id));
    const logins = r.logins.slice();
    store.get(KEY.logins, []).forEach(l => { if (pendL.has(l.id)) byId(logins, l); });
    const cur = session();
    if (cur && cur.role === 'student' && !logins.some(l => l.id === cur.id)) {
      const mine = store.get(KEY.logins, []).find(l => l.id === cur.id);
      if (mine) logins.push(mine);
    }
    logins.sort((a, b) => a.time - b.time);
    store.set(KEY.logins, logins);
    const results = r.results.slice();
    store.get(KEY.results, []).forEach(x => { if (pendR.has(x.id)) byId(results, x); });
    results.sort((a, b) => a.end - b.end);
    store.set(KEY.results, results);
    const local = getBook();
    if (r.wrongbook && r.wrongbook.updated > local.updated) store.set(KEY.wrong, r.wrongbook);
    else if (local.updated && (!r.wrongbook || local.updated > r.wrongbook.updated)) queue('book', { wrongbook: local });
  }
  function showSync(state) {
    if (!syncEl) return;
    const s = sess.get(KEY.session);
    if (!s || s.role !== 'student') { syncEl.textContent = ''; return; }
    if (!API) { syncEl.textContent = '☁ 僅存本機'; syncEl.className = 'sync warn'; return; }
    const n = store.get(KEY.outbox, []).length;
    if (state === 'uploading' && n) { syncEl.textContent = '☁ 上傳中…'; syncEl.className = 'sync'; }
    else if (n) { syncEl.textContent = `☁ ${n} 筆待上傳`; syncEl.className = 'sync warn'; }
    else { syncEl.textContent = '☁ 已同步'; syncEl.className = 'sync ok'; }
  }
  window.addEventListener('online', () => flush());

  // ---------- 登入 ----------
  function session() { return sess.get(KEY.session); }

  function renderLogin() {
    topbar.hidden = true;
    app.innerHTML = `
      <div class="login-wrap">
        <form class="card login" id="login-form" autocomplete="off">
          <div class="emblem">五</div>
          <h1>段考練習</h1>
          <div class="muted">十全國小 五年級・第一次段考範圍</div>
          <label for="acc">帳號</label>
          <input class="input" id="acc" name="acc" autocomplete="username" autocapitalize="off" required>
          <label for="pwd">密碼</label>
          <input class="input" id="pwd" name="pwd" type="password" inputmode="numeric" autocomplete="current-password" required>
          <button class="btn block" type="submit" id="login-btn">登入</button>
          <div class="error" id="login-err"></div>
        </form>
      </div>`;
    document.getElementById('acc').focus();
    document.getElementById('login-form').addEventListener('submit', async e => {
      e.preventDefault();
      const acc = document.getElementById('acc').value.trim();
      const pwd = document.getElementById('pwd').value.trim();
      const err = document.getElementById('login-err');
      const btn = document.getElementById('login-btn');
      let h;
      try { h = await sha256(acc + ':' + pwd); }
      catch (ex) { err.textContent = '此瀏覽器無法登入，請改用 https 網址開啟。'; return; }

      if (h === HASH.admin) {
        if (!API) { err.textContent = '尚未設定雲端資料庫，管理員無法登入。'; return; }
        btn.disabled = true; btn.textContent = '驗證中…'; err.textContent = '';
        try { await api('ping', {}, { acc, pwd }); }
        catch (ex) { err.textContent = '無法連線雲端：' + ex.message; btn.disabled = false; btn.textContent = '登入'; return; }
        sess.set(KEY.session, { id: 'A' + Date.now(), time: Date.now(), role: 'admin', acc, pwd });
        return adminRoute('overview');
      }
      if (h !== HASH.student) { err.textContent = '帳號或密碼錯誤，請再試一次。'; return; }

      const login = { id: 'L' + Date.now(), time: Date.now(), ua: navigator.userAgent };
      const logins = store.get(KEY.logins, []);
      logins.push(login);
      store.set(KEY.logins, logins);
      sess.set(KEY.session, { id: login.id, time: login.time, role: 'student', acc, pwd });
      queue('login', { login });
      route('home');
    });
  }

  function logout() {
    const q = sess.get(KEY.quiz);
    if (q && !q.finished && !confirm('測驗還沒交卷，確定要登出嗎？（這次作答不會記錄）')) return;
    sess.del(KEY.quiz);
    sess.del(KEY.session);
    renderLogin();
  }

  function setNav(items) {
    nav.innerHTML = items.map(([id, label]) => `<button class="link" data-nav="${id}">${label}</button>`).join('') +
      `<button class="link" data-nav="logout">登出</button>`;
    nav.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => {
      const id = b.dataset.nav;
      if (id === 'logout') return logout();
      const s = session();
      if (s && s.role === 'admin') adminRoute(id); else route(id);
    });
  }

  // ---------- 學生：首頁 ----------
  function renderHome() {
    const login = session();
    const results = store.get(KEY.results, []);
    const book = getBook().data;
    let html = `
      <div class="card welcome">
        <div>
          <h1>${STUDENT_NAME}，加油！</h1>
          <div class="muted">本次登入時間：${fmtTime(login.time)}</div>
        </div>
        <div class="muted">選一個單元開始測驗，每單元 100 題</div>
      </div>`;
    for (const s of window.SUBJECTS) {
      html += `<section class="subject">
        <div class="subject-head"><span class="subject-dot" style="background:${s.color}"></span>
          <h2>${esc(s.name)}</h2><span class="tag">${esc(s.version)}版</span></div>`;
      for (const u of s.units) {
        const rs = results.filter(r => r.unitId === u.id && r.mode === 'test');
        const last = rs[rs.length - 1];
        const best = rs.reduce((m, r) => Math.max(m, r.score), -1);
        const wcount = Object.keys(book[u.id] || {}).length;
        let meta = '';
        if (!u.ready) meta = '題庫製作中';
        else if (last) meta = `測驗 ${rs.length} 次・最近 ${last.score} 分・最高 ${best} 分`;
        else meta = '尚未測驗';
        html += `<div class="unit ${u.ready ? '' : 'off'}">
          <div>
            <div class="unit-title">${esc(u.title)}</div>
            <div class="unit-meta">${meta} ${wcount ? `<span class="tag bad">待複習錯題 ${wcount}</span>` : ''}</div>
          </div>
          <div class="unit-actions">
            ${u.ready ? `<button class="btn small" data-start="${u.id}">開始測驗</button>` : ''}
            ${u.ready && wcount ? `<button class="btn small ghost" data-review="${u.id}">複習錯題</button>` : ''}
          </div>
        </div>`;
      }
      html += `</section>`;
    }
    app.innerHTML = html;
    app.querySelectorAll('[data-start]').forEach(b => b.onclick = () => startQuiz(b.dataset.start, 'test'));
    app.querySelectorAll('[data-review]').forEach(b => b.onclick = () => startQuiz(b.dataset.review, 'review'));
  }

  // ---------- 學生：測驗 ----------
  async function startQuiz(unitId, mode) {
    const cur = sess.get(KEY.quiz);
    if (cur && !cur.finished && !confirm('目前有測驗還沒交卷，要放棄它並開始新的嗎？')) { renderQuiz(); return; }
    let bank;
    try { bank = await loadBank(unitId); } catch (e) { alert(e.message); return; }
    let pool = bank.questions;
    if (mode === 'review') {
      const wb = getBook().data[unitId] || {};
      pool = pool.filter(q => wb[q.id]);
      if (!pool.length) { alert('這個單元目前沒有待複習的錯題！'); return; }
    }
    const items = shuffle(pool).map(q => {
      const order = q.type === 'tf' ? q.opts.map((_, i) => i) : shuffle(q.opts.map((_, i) => i));
      return { id: q.id, order, pick: null };
    });
    const login = session();
    sess.set(KEY.quiz, {
      unitId, mode, items, cur: 0, start: Date.now(),
      loginId: login.id, loginTime: login.time, finished: false
    });
    renderQuiz();
  }

  async function renderQuiz() {
    const st = sess.get(KEY.quiz);
    if (!st) return route('home');
    if (st.finished) return renderResult(st.resultId);
    let bank;
    try { bank = await loadBank(st.unitId); } catch (e) { alert(e.message); return route('home'); }
    const qById = Object.fromEntries(bank.questions.map(q => [q.id, q]));
    const total = st.items.length;
    const it = st.items[st.cur];
    const q = qById[it.id];
    const answered = st.items.filter(x => x.pick !== null).length;
    const review = st.mode === 'review';
    const keys = q.type === 'tf' ? ['○', '✕'] : ['A', 'B', 'C', 'D', 'E'];

    const optsHtml = it.order.map((oi, k) => {
      let cls = 'opt';
      if (it.pick === oi) cls += ' sel';
      if (review && it.pick !== null) {
        if (oi === q.ans) cls += ' right';
        else if (it.pick === oi) cls += ' wrong';
      }
      const label = q.type === 'tf' ? q.opts[oi].replace(/^[○✕]\s*/, '') : q.opts[oi];
      return `<button class="${cls}" data-pick="${oi}" ${review && it.pick !== null ? 'disabled' : ''}>
        <span class="key">${keys[k]}</span><span>${esc(label)}</span></button>`;
    }).join('');

    let fb = '';
    if (review && it.pick !== null) {
      const ok = it.pick === q.ans;
      fb = `<div class="feedback ${ok ? 'good' : 'bad'}"><b>${ok ? '答對了！' : '答錯了，正確答案：' + esc(q.opts[q.ans])}</b><p>${esc(q.exp)}</p></div>`;
    }

    const grid = st.items.map((x, i) => {
      let c = '';
      if (x.pick !== null) c = review ? (x.pick === qById[x.id].ans ? 'r' : 'w') : 'done';
      if (i === st.cur) c += ' cur';
      return `<button class="${c}" data-go="${i}">${i + 1}</button>`;
    }).join('');

    const f = findUnit(st.unitId);
    app.innerHTML = `
      <div class="card">
        <div class="quiz-head">
          <div><b>${esc(f.subject.name)}・${esc(f.unit.title)}</b> ${review ? '<span class="tag bad">錯題複習</span>' : ''}</div>
          <div class="muted">已作答 ${answered} / ${total}</div>
        </div>
        <div class="progress"><div style="width:${answered / total * 100}%"></div></div>
        <div class="qnum">第 ${st.cur + 1} 題<span class="tag qcat">${esc(q.cat)}</span>${q.type === 'tf' ? '<span class="tag qcat">是非題</span>' : ''}</div>
        <div class="qtext">${esc(q.q)}</div>
        ${tableHtml(q.table)}
        <div class="opts ${q.type === 'tf' ? 'tf' : ''}">${optsHtml}</div>
        ${fb}
        <div class="nav-row">
          <button class="btn ghost" id="prev" ${st.cur === 0 ? 'disabled' : ''}>← 上一題</button>
          ${st.cur < total - 1
            ? `<button class="btn" id="next">下一題 →</button>`
            : `<button class="btn" id="submit">交卷</button>`}
        </div>
      </div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <b>題號總覽</b>
          <button class="btn small" id="submit2">交卷</button>
        </div>
        <div class="grid">${grid}</div>
      </div>`;

    app.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => {
      const s = sess.get(KEY.quiz);
      s.items[s.cur].pick = Number(b.dataset.pick);
      if (!review && s.cur < s.items.length - 1) s.cur++;
      sess.set(KEY.quiz, s);
      renderQuiz();
    });
    app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(Number(b.dataset.go)));
    const prev = document.getElementById('prev'); if (prev) prev.onclick = () => go(st.cur - 1);
    const next = document.getElementById('next'); if (next) next.onclick = () => go(st.cur + 1);
    const sub = document.getElementById('submit'); if (sub) sub.onclick = submitQuiz;
    document.getElementById('submit2').onclick = submitQuiz;
  }

  function go(i) {
    const s = sess.get(KEY.quiz);
    s.cur = Math.max(0, Math.min(s.items.length - 1, i));
    sess.set(KEY.quiz, s);
    renderQuiz();
    window.scrollTo({ top: 0 });
  }

  async function submitQuiz() {
    const st = sess.get(KEY.quiz);
    const left = st.items.filter(x => x.pick === null).length;
    if (left && !confirm(`還有 ${left} 題沒有作答，沒作答的題目會算錯。確定要交卷嗎？`)) return;
    if (!left && !confirm('確定要交卷嗎？')) return;
    const bank = await loadBank(st.unitId);
    const qById = Object.fromEntries(bank.questions.map(q => [q.id, q]));
    const wrong = [];
    let correct = 0;
    const bookAll = getBook().data;
    const wb = bookAll[st.unitId] || {};
    st.items.forEach((x, i) => {
      const q = qById[x.id];
      if (x.pick === q.ans) {
        correct++;
        if (st.mode === 'review') delete wb[q.id];      // 複習答對就從錯題本移除
      } else {
        wb[q.id] = (wb[q.id] || 0) + 1;
        wrong.push({
          no: i + 1, qid: q.id, cat: q.cat, q: q.q, table: q.table || null,
          your: x.pick === null ? '（未作答）' : q.opts[x.pick],
          right: q.opts[q.ans], exp: q.exp
        });
      }
    });
    bookAll[st.unitId] = wb;
    const book = setBook(bookAll);

    const total = st.items.length;
    const f = findUnit(st.unitId);
    const result = {
      id: 'R' + Date.now(), loginId: st.loginId, loginTime: st.loginTime,
      unitId: st.unitId, unitTitle: `${f.subject.name}・${f.unit.title}`, mode: st.mode,
      start: st.start, end: Date.now(), total, correct,
      score: Math.round(correct / total * 100), wrong
    };
    const results = store.get(KEY.results, []);
    results.push(result);
    store.set(KEY.results, results);
    st.finished = true; st.resultId = result.id;
    sess.set(KEY.quiz, st);
    renderResult(result.id);
    queue('result', { result, wrongbook: book });
  }

  // ---------- 成績與錯題 ----------
  function wrongListHtml(wrong) {
    if (!wrong.length) return '<p>全部答對，太厲害了！🎉</p>';
    return wrong.map(w => `
      <div class="wrong-item">
        <div class="q">第 ${w.no} 題　<span class="tag">${esc(w.cat)}</span><br>${esc(w.q)}</div>
        ${tableHtml(w.table)}
        <div class="a">答案：<span class="you">${esc(w.your)}</span>　正確答案：<span class="ok">${esc(w.right)}</span></div>
        ${w.exp ? `<div class="exp">解析：${esc(w.exp)}</div>` : ''}
      </div>`).join('');
  }

  function resultHero(r, actions) {
    return `
      <div class="card score-hero">
        <div class="muted">${esc(r.unitTitle)}${r.mode === 'review' ? '（錯題複習）' : ''}</div>
        <div class="score-num ${r.score < 70 ? 'low' : ''}">${r.score}<small> 分</small></div>
        <div class="stats">
          <div><b>${r.correct}</b><span class="muted">答對</span></div>
          <div><b>${r.total - r.correct}</b><span class="muted">答錯</span></div>
          <div><b>${fmtDur(r.end - r.start)}</b><span class="muted">作答時間</span></div>
        </div>
        <div class="muted" style="margin-top:10px">登入時間 ${fmtTime(r.loginTime)}・交卷時間 ${fmtTime(r.end)}</div>
        <div class="actions">${actions}</div>
      </div>
      <div class="card">
        <h2>錯的題目（${r.wrong.length} 題）</h2>
        ${wrongListHtml(r.wrong)}
      </div>`;
  }

  function renderResult(resultId, fromRecords) {
    const r = store.get(KEY.results, []).find(x => x.id === resultId);
    if (!r) return route('home');
    const wcount = Object.keys(getBook().data[r.unitId] || {}).length;
    app.innerHTML = resultHero(r, `
      ${wcount ? `<button class="btn" id="do-review">複習錯題（${wcount} 題）</button>` : ''}
      <button class="btn ghost" id="back">${fromRecords ? '回學習紀錄' : '回單元列表'}</button>
      <button class="btn ghost" onclick="window.print()">列印錯題</button>`);
    const rv = document.getElementById('do-review');
    if (rv) rv.onclick = () => { sess.del(KEY.quiz); startQuiz(r.unitId, 'review'); };
    document.getElementById('back').onclick = () => { sess.del(KEY.quiz); route(fromRecords ? 'records' : 'home'); };
    window.scrollTo({ top: 0 });
  }

  // ---------- 學生：學習紀錄 ----------
  function recordsTable(logins, results, linkAttr) {
    const rows = logins.slice().sort((a, b) => b.time - a.time).map(l => {
      const rs = results.filter(r => r.loginId === l.id);
      const cells = rs.length
        ? rs.map(r => `<div><a href="#" ${linkAttr}="${r.id}">${esc(r.unitTitle)}${r.mode === 'review' ? '（複習）' : ''}</a>
            <span class="pill ${scoreClass(r.score)}">${r.score} 分</span>
            <span class="muted">錯 ${r.total - r.correct} 題・${fmtDur(r.end - r.start)}</span></div>`).join('')
        : '<span class="muted">（沒有完成測驗）</span>';
      return `<tr><td class="num">${fmtTime(l.time)}${l.ua ? `<div class="muted small">${esc(device(l.ua))}</div>` : ''}</td><td>${cells}</td></tr>`;
    }).join('');
    return `<div class="table-wrap"><table>
      <thead><tr><th style="width:150px">登入時間</th><th>測驗結果</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="2" class="muted">還沒有紀錄</td></tr>'}</tbody></table></div>`;
  }

  async function renderRecords() {
    const draw = () => {
      app.innerHTML = `
        <div class="card">
          <h1>學習紀錄</h1>
          <div class="muted">每次登入的時間與測驗成績${API ? '（已和雲端同步，換裝置也看得到）' : ''}。點單元名稱可以看當次錯的題目。</div>
        </div>
        <div class="card">${recordsTable(store.get(KEY.logins, []), store.get(KEY.results, []), 'data-r')}</div>`;
      app.querySelectorAll('[data-r]').forEach(a => a.onclick = e => { e.preventDefault(); renderResult(a.dataset.r, true); });
    };
    draw();
    if (API) {
      try { await flush(); mergeState(await api('state', {})); if (document.querySelector('[data-r], .table-wrap')) draw(); } catch (e) {}
    }
  }

  // ---------- 學生路由 ----------
  function route(page) {
    const s = session();
    if (!s) return renderLogin();
    if (s.role === 'admin') return adminRoute('overview');
    topbar.hidden = false;
    setNav([['home', '單元'], ['records', '學習紀錄']]);
    showSync();
    const q = sess.get(KEY.quiz);
    if (page !== 'quiz' && q && !q.finished) {
      if (!confirm('測驗還沒交卷，要離開嗎？（這次作答不會記錄）')) return renderQuiz();
      sess.del(KEY.quiz);
    }
    if (page === 'records') renderRecords();
    else if (page === 'quiz') renderQuiz();
    else renderHome();
    window.scrollTo({ top: 0 });
  }

  // =====================================================================
  //  管理員
  // =====================================================================
  let ADM = null;           // 從雲端讀到的資料
  let admFilter = 'all';    // 常錯題目的單元篩選

  async function adminLoad(force) {
    if (ADM && !force) return ADM;
    app.innerHTML = '<div class="card"><p class="muted">從雲端讀取資料中…</p></div>';
    ADM = await api('admin', {});
    ADM.results.sort((a, b) => b.end - a.end);
    ADM.logins.sort((a, b) => b.time - a.time);
    return ADM;
  }

  async function adminRoute(page, arg) {
    const s = session();
    if (!s || s.role !== 'admin') return renderLogin();
    topbar.hidden = false;
    setNav([['overview', '總覽'], ['tests', '測驗紀錄'], ['often', '常錯題目'], ['logins', '登入紀錄']]);
    showSync();
    try { await adminLoad(page === 'refresh'); }
    catch (e) { app.innerHTML = `<div class="card"><p class="error">讀取雲端資料失敗：${esc(e.message)}</p><button class="btn" id="retry">重試</button></div>`; document.getElementById('retry').onclick = () => adminRoute(page, arg); return; }
    if (page === 'refresh') page = arg || 'overview';
    ({ overview: adminOverview, tests: adminTests, often: adminOften, logins: adminLogins, detail: adminDetail }[page] || adminOverview)(arg);
    window.scrollTo({ top: 0 });
  }

  function admHead(title, sub, page) {
    return `<div class="card adm-head">
      <div><h1>${title}</h1><div class="muted">${sub}</div></div>
      <div class="unit-actions">
        <button class="btn small ghost" id="adm-refresh" data-page="${page}">↻ 重新整理</button>
        ${ADM.sheetUrl ? `<a class="btn small ghost" href="${esc(ADM.sheetUrl)}" target="_blank" rel="noopener">開啟試算表</a>` : ''}
      </div></div>`;
  }
  function bindRefresh() {
    const b = document.getElementById('adm-refresh');
    if (b) b.onclick = () => adminRoute('refresh', b.dataset.page);
  }

  function adminOverview() {
    const tests = ADM.results.filter(r => r.mode === 'test');
    const avg = tests.length ? Math.round(tests.reduce((s, r) => s + r.score, 0) / tests.length) : 0;
    const book = (ADM.wrongbook && ADM.wrongbook.data) || {};
    const lastLogin = ADM.logins[0];
    let units = '';
    for (const s of window.SUBJECTS) {
      units += `<section class="subject"><div class="subject-head"><span class="subject-dot" style="background:${s.color}"></span><h2>${esc(s.name)}</h2><span class="tag">${esc(s.version)}版</span></div>`;
      for (const u of s.units) {
        const rs = tests.filter(r => r.unitId === u.id).sort((a, b) => a.end - b.end);
        const last = rs[rs.length - 1];
        const best = rs.length ? Math.max(...rs.map(r => r.score)) : null;
        const uavg = rs.length ? Math.round(rs.reduce((t, r) => t + r.score, 0) / rs.length) : null;
        const wcount = Object.keys(book[u.id] || {}).length;
        const trend = rs.slice(-6).map(r => `<span class="pill ${scoreClass(r.score)}">${r.score}</span>`).join(' → ');
        units += `<div class="unit ${u.ready ? '' : 'off'}">
          <div style="flex:1;min-width:220px">
            <div class="unit-title">${esc(u.title)}</div>
            <div class="unit-meta">${!u.ready ? '題庫製作中' : rs.length
              ? `測驗 ${rs.length} 次・最近 ${last.score} 分（${fmtTime(last.end)}）・最高 ${best}・平均 ${uavg}`
              : '尚未測驗'}</div>
            ${trend ? `<div class="trend">${trend}</div>` : ''}
          </div>
          <div class="unit-actions">
            ${wcount ? `<span class="tag bad">待複習錯題 ${wcount}</span>
              <button class="btn small ghost" data-clear="${u.id}">清空錯題本</button>` : ''}
            ${rs.length ? `<button class="btn small ghost" data-often="${u.id}">常錯題目</button>` : ''}
          </div></div>`;
      }
      units += '</section>';
    }
    app.innerHTML = admHead('管理員總覽', `學生：${esc(ADM.student || STUDENT_NAME)}`, 'overview') + `
      <div class="kpis">
        <div class="card kpi"><b>${ADM.logins.length}</b><span>登入次數</span></div>
        <div class="card kpi"><b>${tests.length}</b><span>測驗次數</span></div>
        <div class="card kpi"><b>${tests.length ? avg : '—'}</b><span>平均分數</span></div>
        <div class="card kpi"><b class="small-b">${lastLogin ? fmtTime(lastLogin.time) : '—'}</b><span>最近登入</span></div>
      </div>` + units;
    bindRefresh();
    app.querySelectorAll('[data-often]').forEach(b => b.onclick = () => { admFilter = b.dataset.often; adminRoute('often'); });
    app.querySelectorAll('[data-clear]').forEach(b => b.onclick = async () => {
      const f = findUnit(b.dataset.clear);
      if (!confirm(`確定要清空「${f.unit.title}」的待複習錯題嗎？（測驗紀錄不會刪除）`)) return;
      b.disabled = true;
      try { await api('adminClearBook', { unitId: b.dataset.clear }); adminRoute('refresh', 'overview'); }
      catch (e) { alert('失敗：' + e.message); b.disabled = false; }
    });
  }

  function adminTests() {
    const rows = ADM.results.map(r => `<tr>
      <td class="num">${fmtTime(r.end)}</td>
      <td><a href="#" data-d="${r.id}">${esc(r.unitTitle)}</a>${r.mode === 'review' ? ' <span class="tag">複習</span>' : ''}</td>
      <td><span class="pill ${scoreClass(r.score)}">${r.score}</span></td>
      <td class="num">${r.total - r.correct} / ${r.total}</td>
      <td class="num">${fmtDur(r.end - r.start)}</td>
    </tr>`).join('');
    app.innerHTML = admHead('測驗紀錄', `共 ${ADM.results.length} 筆，點單元名稱看錯題`, 'tests') + `
      <div class="card"><div class="table-wrap"><table>
        <thead><tr><th>交卷時間</th><th>單元</th><th>分數</th><th>錯題</th><th>作答時間</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5" class="muted">還沒有測驗紀錄</td></tr>'}</tbody>
      </table></div></div>`;
    bindRefresh();
    app.querySelectorAll('[data-d]').forEach(a => a.onclick = e => { e.preventDefault(); adminRoute('detail', a.dataset.d); });
  }

  function adminDetail(id) {
    const r = ADM.results.find(x => x.id === id);
    if (!r) return adminTests();
    app.innerHTML = resultHero(r, `
      <button class="btn ghost" id="back">回測驗紀錄</button>
      <button class="btn ghost" onclick="window.print()">列印錯題</button>
      <button class="btn danger" id="del">刪除這筆紀錄</button>`);
    document.getElementById('back').onclick = () => adminRoute('tests');
    document.getElementById('del').onclick = async () => {
      if (!confirm('確定要刪除這筆測驗紀錄嗎？刪除後無法復原。')) return;
      try { await api('adminDelete', { kind: 'result', id }); adminRoute('refresh', 'tests'); }
      catch (e) { alert('刪除失敗：' + e.message); }
    };
  }

  function adminOften() {
    const opts = ['<option value="all">全部單元</option>'].concat(
      window.SUBJECTS.flatMap(s => s.units.filter(u => u.ready).map(u =>
        `<option value="${u.id}" ${admFilter === u.id ? 'selected' : ''}>${esc(s.name)}・${esc(u.title)}</option>`))).join('');
    const agg = {};
    ADM.results.filter(r => admFilter === 'all' || r.unitId === admFilter).forEach(r => {
      r.wrong.forEach(w => {
        const k = w.qid || (r.unitId + '|' + w.q);
        if (!agg[k]) agg[k] = { n: 0, last: 0, unit: r.unitTitle, q: w.q, cat: w.cat, right: w.right, table: w.table, answers: {} };
        agg[k].n++;
        agg[k].last = Math.max(agg[k].last, r.end);
        agg[k].answers[w.your] = (agg[k].answers[w.your] || 0) + 1;
      });
    });
    const list = Object.values(agg).sort((a, b) => b.n - a.n || b.last - a.last);
    const items = list.map(x => `
      <div class="wrong-item">
        <div class="q"><span class="pill bad">錯 ${x.n} 次</span>　<span class="tag">${esc(x.unit)}</span> <span class="tag">${esc(x.cat)}</span><br>${esc(x.q)}</div>
        ${tableHtml(x.table)}
        <div class="a">正確答案：<span class="ok">${esc(x.right)}</span></div>
        <div class="exp">曾經選過：${Object.entries(x.answers).map(([a, n]) => `${esc(a)}（${n}）`).join('、')}・最近一次 ${fmtTime(x.last)}</div>
      </div>`).join('');
    app.innerHTML = admHead('常錯題目', '依答錯次數排序，適合拿來重點複習', 'often') + `
      <div class="card no-print"><label for="flt" style="margin-top:0">選擇單元</label>
        <select class="input" id="flt">${opts}</select></div>
      <div class="card"><h2>共 ${list.length} 題曾經答錯</h2>${items || '<p class="muted">目前沒有錯題紀錄</p>'}</div>`;
    bindRefresh();
    document.getElementById('flt').onchange = e => { admFilter = e.target.value; adminOften(); };
  }

  function adminLogins() {
    const rows = ADM.logins.map(l => {
      const rs = ADM.results.filter(r => r.loginId === l.id);
      return `<tr>
        <td class="num">${fmtTime(l.time)}</td>
        <td>${esc(device(l.ua))}</td>
        <td>${rs.length ? rs.map(r => `<div><a href="#" data-d="${r.id}">${esc(r.unitTitle)}</a> <span class="pill ${scoreClass(r.score)}">${r.score}</span></div>`).join('') : '<span class="muted">沒有測驗</span>'}</td>
        <td><button class="btn small ghost danger-text" data-dl="${l.id}">刪除</button></td>
      </tr>`;
    }).join('');
    app.innerHTML = admHead('登入紀錄', `共 ${ADM.logins.length} 次登入`, 'logins') + `
      <div class="card"><div class="table-wrap"><table>
        <thead><tr><th>登入時間</th><th>裝置</th><th>這次的測驗</th><th></th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4" class="muted">還沒有登入紀錄</td></tr>'}</tbody>
      </table></div></div>`;
    bindRefresh();
    app.querySelectorAll('[data-d]').forEach(a => a.onclick = e => { e.preventDefault(); adminRoute('detail', a.dataset.d); });
    app.querySelectorAll('[data-dl]').forEach(b => b.onclick = async () => {
      if (!confirm('確定要刪除這筆登入紀錄嗎？（該次的測驗成績會保留）')) return;
      try { await api('adminDelete', { kind: 'login', id: b.dataset.dl }); adminRoute('refresh', 'logins'); }
      catch (e) { alert('刪除失敗：' + e.message); }
    });
  }

  // ---------- 啟動 ----------
  const s0 = session();
  if (s0 && s0.role === 'admin') adminRoute('overview');
  else if (s0 && sess.get(KEY.quiz) && !sess.get(KEY.quiz).finished) {
    topbar.hidden = false; setNav([['home', '單元'], ['records', '學習紀錄']]); showSync(); renderQuiz(); flush();
  } else { route('home'); if (s0) flush(); }
})();
