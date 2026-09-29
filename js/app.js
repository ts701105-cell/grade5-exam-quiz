/* 五年級段考練習網站 — 主程式
 * 所有紀錄存在瀏覽器 localStorage（同一台裝置、同一個瀏覽器才看得到）。
 */
(function () {
  'use strict';

  // 帳號密碼以 SHA-256 雜湊比對（帳號:密碼）
  const LOGIN_HASH = 'd9fd94a755b4a9bfbe293a8d76fcc92913a67de71ba62ad5b72c850b44ed2ce1';
  const STUDENT_NAME = '張嘉祐';

  const KEY = {
    logins: 'g5q.logins',      // 登入紀錄
    results: 'g5q.results',    // 測驗成績
    wrong: 'g5q.wrongbook',    // 錯題本 {unitId: {qid: 次數}}
    session: 'g5q.session',    // 目前登入（sessionStorage）
    quiz: 'g5q.quiz'           // 作答中的測驗（sessionStorage，重新整理可接續）
  };

  const app = document.getElementById('app');
  const topbar = document.getElementById('topbar');

  // ---------- 儲存工具 ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { alert('無法儲存紀錄：' + e.message); } }
  };
  const sess = {
    get(k) { try { const v = sessionStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  // ---------- 小工具 ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  function fmtTime(t) {
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
      s.onerror = () => reject(new Error('題庫載入失敗'));
      document.head.appendChild(s);
    });
  }
  const scoreClass = sc => sc >= 90 ? 'good' : sc >= 70 ? 'mid' : 'bad';

  // ---------- 登入 ----------
  function isLoggedIn() { return !!sess.get(KEY.session); }

  function renderLogin() {
    topbar.hidden = true;
    app.innerHTML = `
      <div class="login-wrap">
        <form class="card login" id="login-form" autocomplete="off">
          <div class="emblem">五</div>
          <h1>段考練習</h1>
          <div class="muted">十全國小 五年級・第一次段考範圍</div>
          <label for="acc">帳號</label>
          <input class="input" id="acc" name="acc" autocomplete="username" required>
          <label for="pwd">密碼</label>
          <input class="input" id="pwd" name="pwd" type="password" inputmode="numeric" autocomplete="current-password" required>
          <button class="btn block" type="submit">登入</button>
          <div class="error" id="login-err"></div>
        </form>
      </div>`;
    document.getElementById('acc').focus();
    document.getElementById('login-form').addEventListener('submit', async e => {
      e.preventDefault();
      const acc = document.getElementById('acc').value.trim();
      const pwd = document.getElementById('pwd').value.trim();
      const err = document.getElementById('login-err');
      let h;
      try { h = await sha256(acc + ':' + pwd); }
      catch (ex) { err.textContent = '此瀏覽器無法登入，請改用 https 網址開啟。'; return; }
      if (h !== LOGIN_HASH) { err.textContent = '帳號或密碼錯誤，請再試一次。'; return; }
      const login = { id: 'L' + Date.now(), time: Date.now() };
      const logins = store.get(KEY.logins, []);
      logins.push(login);
      store.set(KEY.logins, logins);
      sess.set(KEY.session, login);
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

  // ---------- 首頁：單元列表 ----------
  function renderHome() {
    const login = sess.get(KEY.session);
    const results = store.get(KEY.results, []);
    const wrongbook = store.get(KEY.wrong, {});
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
        const wcount = Object.keys(wrongbook[u.id] || {}).length;
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

  // ---------- 測驗 ----------
  async function startQuiz(unitId, mode) {
    const cur = sess.get(KEY.quiz);
    if (cur && !cur.finished && !confirm('目前有測驗還沒交卷，要放棄它並開始新的嗎？')) { renderQuiz(); return; }
    let bank;
    try { bank = await loadBank(unitId); } catch (e) { alert(e.message); return; }
    let pool = bank.questions;
    if (mode === 'review') {
      const wb = store.get(KEY.wrong, {})[unitId] || {};
      pool = pool.filter(q => wb[q.id]);
      if (!pool.length) { alert('這個單元目前沒有待複習的錯題！'); return; }
    }
    const items = shuffle(pool).map(q => {
      const order = q.type === 'tf' ? q.opts.map((_, i) => i) : shuffle(q.opts.map((_, i) => i));
      return { id: q.id, order, pick: null };
    });
    const login = sess.get(KEY.session);
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
    const byId = Object.fromEntries(bank.questions.map(q => [q.id, q]));
    const total = st.items.length;
    const it = st.items[st.cur];
    const q = byId[it.id];
    const answered = st.items.filter(x => x.pick !== null).length;
    const review = st.mode === 'review';
    const keys = q.type === 'tf' ? ['○', '✕'] : ['A', 'B', 'C', 'D', 'E'];

    let optsHtml = it.order.map((oi, k) => {
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
      if (x.pick !== null) c = review ? (x.pick === byId[x.id].ans ? 'r' : 'w') : 'done';
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
      sess.set(KEY.quiz, s);
      // 測驗模式選完自動跳下一題；複習模式停留看解析
      if (!review && s.cur < s.items.length - 1) { s.cur++; sess.set(KEY.quiz, s); }
      renderQuiz();
    });
    app.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(Number(b.dataset.go)));
    const prev = document.getElementById('prev'); if (prev) prev.onclick = () => go(st.cur - 1);
    const next = document.getElementById('next'); if (next) next.onclick = () => go(st.cur + 1);
    document.getElementById('submit') && (document.getElementById('submit').onclick = submitQuiz);
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
    const byId = Object.fromEntries(bank.questions.map(q => [q.id, q]));
    const wrong = [];
    let correct = 0;
    const wbAll = store.get(KEY.wrong, {});
    const wb = wbAll[st.unitId] || {};
    st.items.forEach((x, i) => {
      const q = byId[x.id];
      if (x.pick === q.ans) {
        correct++;
        if (st.mode === 'review') delete wb[q.id];      // 複習答對就從錯題本移除
      } else {
        wb[q.id] = (wb[q.id] || 0) + 1;
        wrong.push({
          no: i + 1, qid: q.id, cat: q.cat, q: q.q,
          your: x.pick === null ? '（未作答）' : q.opts[x.pick],
          right: q.opts[q.ans], exp: q.exp
        });
      }
    });
    wbAll[st.unitId] = wb;
    store.set(KEY.wrong, wbAll);

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
  }

  // ---------- 成績 ----------
  function wrongListHtml(wrong) {
    if (!wrong.length) return '<p>全部答對，太厲害了！🎉</p>';
    return wrong.map(w => `
      <div class="wrong-item">
        <div class="q">第 ${w.no} 題　<span class="tag">${esc(w.cat)}</span><br>${esc(w.q)}</div>
        <div class="a">你的答案：<span class="you">${esc(w.your)}</span>　正確答案：<span class="ok">${esc(w.right)}</span></div>
        <div class="exp">解析：${esc(w.exp)}</div>
      </div>`).join('');
  }

  function renderResult(resultId, fromRecords) {
    const r = store.get(KEY.results, []).find(x => x.id === resultId);
    if (!r) return route('home');
    const wcount = Object.keys(store.get(KEY.wrong, {})[r.unitId] || {}).length;
    app.innerHTML = `
      <div class="card score-hero">
        <div class="muted">${esc(r.unitTitle)}${r.mode === 'review' ? '（錯題複習）' : ''}</div>
        <div class="score-num ${r.score < 70 ? 'low' : ''}">${r.score}<small> 分</small></div>
        <div class="stats">
          <div><b>${r.correct}</b><span class="muted">答對</span></div>
          <div><b>${r.total - r.correct}</b><span class="muted">答錯</span></div>
          <div><b>${fmtDur(r.end - r.start)}</b><span class="muted">作答時間</span></div>
        </div>
        <div class="muted" style="margin-top:10px">登入時間 ${fmtTime(r.loginTime)}・交卷時間 ${fmtTime(r.end)}</div>
        <div class="actions">
          ${wcount ? `<button class="btn" id="do-review">複習錯題（${wcount} 題）</button>` : ''}
          <button class="btn ghost" id="back">${fromRecords ? '回學習紀錄' : '回單元列表'}</button>
          <button class="btn ghost" onclick="window.print()">列印錯題</button>
        </div>
      </div>
      <div class="card">
        <h2>錯的題目（${r.wrong.length} 題）</h2>
        ${wrongListHtml(r.wrong)}
      </div>`;
    const rv = document.getElementById('do-review');
    if (rv) rv.onclick = () => { sess.del(KEY.quiz); startQuiz(r.unitId, 'review'); };
    document.getElementById('back').onclick = () => { sess.del(KEY.quiz); route(fromRecords ? 'records' : 'home'); };
  }

  // ---------- 學習紀錄 ----------
  function renderRecords() {
    const logins = store.get(KEY.logins, []).slice().reverse();
    const results = store.get(KEY.results, []);
    const rows = logins.map(l => {
      const rs = results.filter(r => r.loginId === l.id);
      const cells = rs.length
        ? rs.map(r => `<div><a href="#" data-r="${r.id}">${esc(r.unitTitle)}${r.mode === 'review' ? '（複習）' : ''}</a>
            <span class="pill ${scoreClass(r.score)}">${r.score} 分</span>
            <span class="muted">錯 ${r.total - r.correct} 題・${fmtDur(r.end - r.start)}</span></div>`).join('')
        : '<span class="muted">（未完成測驗）</span>';
      return `<tr><td class="num">${fmtTime(l.time)}</td><td>${cells}</td></tr>`;
    }).join('');
    app.innerHTML = `
      <div class="card">
        <h1>學習紀錄</h1>
        <div class="muted">每次登入的時間與測驗成績。點單元名稱可以看當次錯的題目。</div>
      </div>
      <div class="card">
        <div class="table-wrap"><table>
          <thead><tr><th style="width:150px">登入時間</th><th>測驗結果</th></tr></thead>
          <tbody>${rows || '<tr><td colspan="2" class="muted">還沒有紀錄</td></tr>'}</tbody>
        </table></div>
      </div>
      <div class="card no-print">
        <h2>紀錄備份</h2>
        <div class="muted">紀錄存在這台裝置的瀏覽器裡。換裝置或清除瀏覽器資料前，可以先匯出備份。</div>
        <div class="actions" style="justify-content:flex-start">
          <button class="btn small ghost" id="export">匯出紀錄</button>
          <label class="btn small ghost" style="margin:0">匯入紀錄<input type="file" id="import" accept=".json" hidden></label>
        </div>
      </div>`;
    app.querySelectorAll('[data-r]').forEach(a => a.onclick = e => { e.preventDefault(); renderResult(a.dataset.r, true); });
    document.getElementById('export').onclick = () => {
      const data = { logins: store.get(KEY.logins, []), results: store.get(KEY.results, []), wrongbook: store.get(KEY.wrong, {}) };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const a = document.createElement('a');
      const d = new Date();
      a.href = URL.createObjectURL(blob);
      a.download = `學習紀錄_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
      a.click();
    };
    document.getElementById('import').onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      const rd = new FileReader();
      rd.onload = () => {
        try {
          const d = JSON.parse(rd.result);
          const merge = (k, arr) => { const cur = store.get(k, []); const ids = new Set(cur.map(x => x.id)); store.set(k, cur.concat(arr.filter(x => !ids.has(x.id))).sort((a, b) => (a.time || a.end) - (b.time || b.end))); };
          merge(KEY.logins, d.logins || []);
          merge(KEY.results, d.results || []);
          const wb = store.get(KEY.wrong, {});
          for (const u in (d.wrongbook || {})) wb[u] = Object.assign({}, d.wrongbook[u], wb[u]);
          store.set(KEY.wrong, wb);
          alert('匯入完成！'); renderRecords();
        } catch (ex) { alert('檔案格式不正確'); }
      };
      rd.readAsText(file);
    };
  }

  // ---------- 路由 ----------
  function route(page) {
    if (!isLoggedIn()) return renderLogin();
    topbar.hidden = false;
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

  document.getElementById('nav-home').onclick = () => route('home');
  document.getElementById('nav-records').onclick = () => route('records');
  document.getElementById('nav-logout').onclick = logout;

  // 啟動：已登入且有作答中的測驗就接續
  if (isLoggedIn() && sess.get(KEY.quiz) && !sess.get(KEY.quiz).finished) { topbar.hidden = false; renderQuiz(); }
  else route('home');
})();
