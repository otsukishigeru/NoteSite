// api/inoki-ken.js — アンケートサイト（/inoki-ken/）用 API
//
// Vercel Hobby プランのサーバーレス関数数の上限（12個）を超えないよう、
// 利用者認証・管理・アンケート（定義／回答／集計）のすべてを
// この1ファイルに action ベースで集約しています。新しい機能を足すときも
// 原則としてここに action を追加してください。
//
// KV keys:
//   inoki-ken:users        → JSON [{id, subid, note, created}]
//   inoki-ken:surveys      → JSON {version, updated, profile:[...], surveys:[...]}
//   inoki-ken:ans:<sid>    → list  各要素は JSON {t, p, a, s}
//
// 管理操作（listUsers / addUser / editUser / removeUser / adminLogin /
// saveDefinition / resetDefinition / clearAnswers）は
// サイト共通の環境変数 ADMIN_PASSWORD で保護します。

import { seedDefinition } from '../lib/inoki-surveys.js';

const USERS_KEY = 'inoki-ken:users';
const SURVEY_KEY = 'inoki-ken:surveys';
const ANS_KEY = (sid) => `inoki-ken:ans:${sid}`;

const MAX_ENTRIES = 5000;   // 1調査あたりに保持する回答の上限
const MAX_SHEET_ROWS = 300; // スプレッドシート型で一度に取り込める行数

const SEED_USERS = [
  { id: 'kogakuin', subid: 'inoki-ken', note: '初期登録', created: '2026-08-07' }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  async function kvGet(key) {
    const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const d = await r.json();
    return d.result ?? null;
  }

  // 値は本文（body）で送ります。設問定義のように長い JSON でも
  // URL 長の制限にかからないようにするためです。
  async function kvSet(key, value) {
    const r = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'text/plain' },
      body: value
    });
    if (!r.ok) throw new Error(`KV set failed: ${r.status}`);
  }

  async function kvLPush(key, value) {
    const r = await fetch(`${KV_URL}/lpush/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'text/plain' },
      body: value
    });
    if (!r.ok) throw new Error(`KV lpush failed: ${r.status}`);
  }

  async function kvLTrim(key, start, stop) {
    await fetch(`${KV_URL}/ltrim/${encodeURIComponent(key)}/${start}/${stop}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
  }

  async function kvLRange(key, start, stop) {
    const r = await fetch(`${KV_URL}/lrange/${encodeURIComponent(key)}/${start}/${stop}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const d = await r.json();
    return Array.isArray(d.result) ? d.result : [];
  }

  async function kvDel(key) {
    await fetch(`${KV_URL}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
  }

  async function loadUsers() {
    const raw = await kvGet(USERS_KEY);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      } catch {}
    }
    await kvSet(USERS_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS.slice();
  }

  async function saveUsers(users) {
    await kvSet(USERS_KEY, JSON.stringify(users));
  }

  // ──────────────────────────────────────────────────────────
  // アンケート定義（設問マスタ）
  // ──────────────────────────────────────────────────────────
  async function loadDefinition() {
    const raw = await kvGet(SURVEY_KEY);
    if (raw) {
      try {
        const def = JSON.parse(raw);
        if (def && Array.isArray(def.surveys) && Array.isArray(def.profile)) return def;
      } catch {}
    }
    const seed = seedDefinition();
    await kvSet(SURVEY_KEY, JSON.stringify(seed));
    return seed;
  }

  function findSurvey(def, sid) {
    return def.surveys.find(s => s.id === sid) || null;
  }

  function allQuestions(survey) {
    const out = [];
    (survey.sections || []).forEach(sec => {
      (sec.questions || []).forEach(q => out.push({ ...q, sec: sec.id }));
    });
    return out;
  }

  // 定義そのものが壊れていないかを確かめます（管理画面からの保存時に使います）
  function validateDefinition(def) {
    if (!def || typeof def !== 'object') return '定義が JSON オブジェクトではありません';
    if (!Array.isArray(def.profile)) return 'profile が配列ではありません';
    if (!Array.isArray(def.surveys)) return 'surveys が配列ではありません';
    if (def.surveys.length === 0) return 'アンケートが1件もありません';

    const idPat = /^[a-z0-9][a-z0-9\-_]{1,39}$/i;
    const seenSurvey = new Set();

    for (const f of def.profile) {
      if (!f || !idPat.test(String(f.id || ''))) return `プロフィール項目の id が不正です（${f && f.id}）`;
      if (!f.label) return `プロフィール項目 ${f.id} の label がありません`;
      if (!['single', 'multi', 'text'].includes(f.type)) return `プロフィール項目 ${f.id} の type が不正です`;
      if (f.type !== 'text' && !Array.isArray(f.options)) return `プロフィール項目 ${f.id} に options がありません`;
    }

    for (const s of def.surveys) {
      if (!idPat.test(String(s.id || ''))) return `アンケートの id が不正です（${s.id}）`;
      if (seenSurvey.has(s.id)) return `アンケートの id が重複しています（${s.id}）`;
      seenSurvey.add(s.id);
      if (!s.title) return `アンケート ${s.id} の title がありません`;
      if (!Array.isArray(s.sections) || s.sections.length === 0) return `アンケート ${s.id} に sections がありません`;

      const seenQ = new Set();
      for (const sec of s.sections) {
        if (!sec.id) return `アンケート ${s.id} に id のないセクションがあります`;
        if (!Array.isArray(sec.questions) || sec.questions.length === 0) {
          return `アンケート ${s.id} のセクション ${sec.id} に設問がありません`;
        }
        for (const q of sec.questions) {
          if (!idPat.test(String(q.id || ''))) return `アンケート ${s.id} の設問 id が不正です（${q.id}）`;
          if (seenQ.has(q.id)) return `アンケート ${s.id} で設問 id が重複しています（${q.id}）`;
          seenQ.add(q.id);
          if (!q.text) return `アンケート ${s.id} の設問 ${q.id} に text がありません`;
          if (!['likert', 'single', 'multi', 'text'].includes(q.type)) {
            return `アンケート ${s.id} の設問 ${q.id} の type が不正です`;
          }
          if (q.type === 'likert') {
            const sc = q.scale || s.scale;
            if (!sc || !Number.isInteger(sc.min) || !Number.isInteger(sc.max) || sc.max <= sc.min) {
              return `アンケート ${s.id} の設問 ${q.id} の scale が不正です`;
            }
          }
          if ((q.type === 'single' || q.type === 'multi') && (!Array.isArray(q.options) || q.options.length < 2)) {
            return `アンケート ${s.id} の設問 ${q.id} に選択肢が足りません`;
          }
        }
      }
    }
    return null;
  }

  // 1件分の回答を、定義に照らして検査・整形します
  function cleanEntry(def, survey, rawProfile, rawAnswers) {
    const profile = {};
    for (const f of def.profile) {
      const v = rawProfile ? rawProfile[f.id] : undefined;
      if (f.type === 'text') {
        profile[f.id] = String(v == null ? '' : v).slice(0, 200);
      } else if (f.type === 'multi') {
        const allowed = new Set(f.options.map(o => String(o.v)));
        const arr = Array.isArray(v) ? v.map(String).filter(x => allowed.has(x)) : [];
        if (f.required !== false && arr.length === 0) return { error: `プロフィール「${f.label}」が未回答です` };
        profile[f.id] = arr;
      } else {
        const allowed = new Set(f.options.map(o => String(o.v)));
        const sv = String(v == null ? '' : v);
        if (!allowed.has(sv)) {
          if (f.required === false) { profile[f.id] = ''; continue; }
          return { error: `プロフィール「${f.label}」が未回答か、選択肢にない値です` };
        }
        profile[f.id] = sv;
      }
    }

    const answers = {};
    for (const q of allQuestions(survey)) {
      const v = rawAnswers ? rawAnswers[q.id] : undefined;
      const required = q.required !== false;

      if (q.type === 'likert') {
        const sc = q.scale || survey.scale || { min: 1, max: 5 };
        const n = typeof v === 'string' ? Number(v) : v;
        if (!Number.isInteger(n) || n < sc.min || n > sc.max) {
          if (!required) continue;
          return { error: `設問 ${q.id} が未回答か、範囲外の値です` };
        }
        answers[q.id] = n;
      } else if (q.type === 'single') {
        const allowed = new Set(q.options.map(o => String(o.v)));
        const sv = String(v == null ? '' : v);
        if (!allowed.has(sv)) {
          if (!required) continue;
          return { error: `設問 ${q.id} が未回答か、選択肢にない値です` };
        }
        answers[q.id] = sv;
      } else if (q.type === 'multi') {
        const allowed = new Set(q.options.map(o => String(o.v)));
        let arr = Array.isArray(v) ? v.map(String).filter(x => allowed.has(x)) : [];
        if (q.max && arr.length > q.max) arr = arr.slice(0, q.max);
        if (arr.length === 0 && required) return { error: `設問 ${q.id} が未回答です` };
        answers[q.id] = arr;
      } else {
        const sv = String(v == null ? '' : v).slice(0, q.maxlen || 500);
        if (!sv && required) return { error: `設問 ${q.id} が未回答です` };
        if (sv) answers[q.id] = sv;
      }
    }

    return { entry: { p: profile, a: answers } };
  }

  async function fetchEntries(sid) {
    const rows = await kvLRange(ANS_KEY(sid), 0, MAX_ENTRIES - 1);
    return rows.map(s => {
      try { return JSON.parse(s); } catch { return null; }
    }).filter(Boolean);
  }

  const body = req.body || {};
  const { action } = body;

  // ──────────────────────────────────────────────────────────
  // ① 利用者ログイン（ID + SubID）
  // ──────────────────────────────────────────────────────────
  if (action === 'login') {
    const id = String(body.id || '').trim();
    const subid = String(body.subid || '').trim();
    if (!id || !subid) {
      return res.status(400).json({ ok: false, error: 'ID・SubID を入力してください' });
    }
    const users = await loadUsers();
    const found = users.some(u => u.id === id && u.subid === subid);
    if (!found) {
      return res.status(403).json({ ok: false, error: 'ID または SubID が正しくありません' });
    }
    return res.status(200).json({ ok: true, id });
  }

  // ──────────────────────────────────────────────────────────
  // ② アンケート定義の取得（回答画面・一覧・レポートが使います）
  // ──────────────────────────────────────────────────────────
  if (action === 'getSurveys') {
    try {
      const def = await loadDefinition();
      return res.status(200).json({ ok: true, def });
    } catch (err) {
      console.error('inoki-ken getSurveys error:', err.message);
      return res.status(500).json({ ok: false, error: '設問の取得に失敗しました' });
    }
  }

  // ──────────────────────────────────────────────────────────
  // ③ 回答の送信（1件）
  // ──────────────────────────────────────────────────────────
  if (action === 'submitSurvey') {
    try {
      const def = await loadDefinition();
      const survey = findSurvey(def, String(body.sid || ''));
      if (!survey) return res.status(404).json({ ok: false, error: '該当するアンケートが見つかりません' });
      if (survey.status === 'closed') return res.status(403).json({ ok: false, error: 'このアンケートは受付を終了しています' });

      const { entry, error } = cleanEntry(def, survey, body.profile, body.answers);
      if (error) return res.status(400).json({ ok: false, error });

      entry.t = new Date().toISOString();
      entry.s = 'web';
      await kvLPush(ANS_KEY(survey.id), JSON.stringify(entry));
      await kvLTrim(ANS_KEY(survey.id), 0, MAX_ENTRIES - 1);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('inoki-ken submitSurvey error:', err.message);
      return res.status(500).json({ ok: false, error: '保存に失敗しました' });
    }
  }

  // ──────────────────────────────────────────────────────────
  // ④ スプレッドシート型の一括送信（方針8-(6)）
  //    Web画面からの回答と同じ検査を通しますので、結果は等価です。
  // ──────────────────────────────────────────────────────────
  if (action === 'submitSheet') {
    try {
      const def = await loadDefinition();
      const survey = findSurvey(def, String(body.sid || ''));
      if (!survey) return res.status(404).json({ ok: false, error: '該当するアンケートが見つかりません' });
      if (survey.status === 'closed') return res.status(403).json({ ok: false, error: 'このアンケートは受付を終了しています' });

      const rows = Array.isArray(body.rows) ? body.rows : [];
      if (rows.length === 0) return res.status(400).json({ ok: false, error: '取り込む行がありません' });
      if (rows.length > MAX_SHEET_ROWS) {
        return res.status(400).json({ ok: false, error: `一度に取り込めるのは ${MAX_SHEET_ROWS} 行までです` });
      }

      const entries = [];
      const errors = [];
      rows.forEach((row, i) => {
        const { entry, error } = cleanEntry(def, survey, row && row.profile, row && row.answers);
        if (error) { errors.push({ line: i + 1, error }); return; }
        entry.t = new Date().toISOString();
        entry.s = 'sheet';
        entries.push(entry);
      });

      if (entries.length === 0) {
        return res.status(400).json({ ok: false, error: '取り込める行がありませんでした', errors });
      }
      for (const e of entries) await kvLPush(ANS_KEY(survey.id), JSON.stringify(e));
      await kvLTrim(ANS_KEY(survey.id), 0, MAX_ENTRIES - 1);
      return res.status(200).json({ ok: true, saved: entries.length, errors });
    } catch (err) {
      console.error('inoki-ken submitSheet error:', err.message);
      return res.status(500).json({ ok: false, error: '取り込みに失敗しました' });
    }
  }

  // ──────────────────────────────────────────────────────────
  // ⑤ レポート用データの取得
  //    回答は元から匿名ですので、そのまま返して集計は画面側で行います。
  // ──────────────────────────────────────────────────────────
  if (action === 'getReport') {
    try {
      const def = await loadDefinition();
      const sid = String(body.sid || '');
      const survey = findSurvey(def, sid);
      if (!survey) return res.status(404).json({ ok: false, error: '該当するアンケートが見つかりません' });
      const entries = await fetchEntries(sid);
      return res.status(200).json({ ok: true, survey, profile: def.profile, entries, count: entries.length });
    } catch (err) {
      console.error('inoki-ken getReport error:', err.message);
      return res.status(500).json({ ok: false, error: '集計データの取得に失敗しました' });
    }
  }

  // ──────────────────────────────────────────────────────────
  // ⑥ 全アンケートの回答件数（一覧カードの表示に使います）
  // ──────────────────────────────────────────────────────────
  if (action === 'getCounts') {
    try {
      const def = await loadDefinition();
      const counts = {};
      for (const s of def.surveys) {
        const rows = await kvLRange(ANS_KEY(s.id), 0, MAX_ENTRIES - 1);
        counts[s.id] = rows.length;
      }
      return res.status(200).json({ ok: true, counts });
    } catch (err) {
      console.error('inoki-ken getCounts error:', err.message);
      return res.status(200).json({ ok: true, counts: {} });
    }
  }

  // 以下は管理者専用 ────────────────────────────────────────
  const adminPassword = body.adminPassword;

  if (action === 'adminLogin') {
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ ok: false, error: 'パスワードが正しくありません' });
    }
    return res.status(200).json({ ok: true });
  }

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ ok: false, error: '管理者パスワードが違います' });
  }

  // ──────────────────────────────────────────────────────────
  // ② 利用者一覧
  // ──────────────────────────────────────────────────────────
  if (action === 'listUsers') {
    const users = await loadUsers();
    return res.status(200).json({ ok: true, users });
  }

  // ──────────────────────────────────────────────────────────
  // ③ 利用者追加
  // ──────────────────────────────────────────────────────────
  if (action === 'addUser') {
    const id = String(body.id || '').trim();
    const subid = String(body.subid || '').trim();
    const note = String(body.note || '').trim();

    if (!id || !subid) {
      return res.status(400).json({ ok: false, error: 'ID と SubID の両方を入力してください' });
    }
    if (!/^[A-Za-z0-9_\-.]{2,40}$/.test(id)) {
      return res.status(400).json({ ok: false, error: 'ID は半角の英数字・ハイフン・アンダースコア・ピリオドで、2〜40文字にしてください' });
    }
    if (subid.length < 4 || subid.length > 60) {
      return res.status(400).json({ ok: false, error: 'SubID は 4〜60文字にしてください' });
    }

    const users = await loadUsers();
    if (users.some(u => u.id === id)) {
      return res.status(200).json({ ok: false, error: 'その ID はすでに登録されています' });
    }
    users.push({ id, subid, note, created: new Date().toISOString().slice(0, 10) });
    await saveUsers(users);
    return res.status(200).json({ ok: true, users });
  }

  // ──────────────────────────────────────────────────────────
  // ④ SubID の変更
  // ──────────────────────────────────────────────────────────
  if (action === 'editUser') {
    const id = String(body.id || '');
    const subid = String(body.subid || '').trim();
    if (subid.length < 4 || subid.length > 60) {
      return res.status(400).json({ ok: false, error: 'SubID は 4〜60文字にしてください' });
    }
    const users = await loadUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) {
      return res.status(404).json({ ok: false, error: '該当する ID が見つかりませんでした' });
    }
    users[idx].subid = subid;
    await saveUsers(users);
    return res.status(200).json({ ok: true, users });
  }

  // ──────────────────────────────────────────────────────────
  // ⑤ 利用者削除
  // ──────────────────────────────────────────────────────────
  if (action === 'removeUser') {
    const id = String(body.id || '');
    const users = await loadUsers();
    if (users.length <= 1) {
      return res.status(200).json({ ok: false, error: '最後の1件は削除できません。先に別の ID を追加してください' });
    }
    const updated = users.filter(u => u.id !== id);
    if (updated.length === users.length) {
      return res.status(404).json({ ok: false, error: '該当する ID が見つかりませんでした' });
    }
    await saveUsers(updated);
    return res.status(200).json({ ok: true, users: updated });
  }

  // ──────────────────────────────────────────────────────────
  // ⑨ 設問定義の取得（管理画面の編集用）
  // ──────────────────────────────────────────────────────────
  if (action === 'getDefinition') {
    try {
      const def = await loadDefinition();
      const counts = {};
      for (const s of def.surveys) {
        const rows = await kvLRange(ANS_KEY(s.id), 0, MAX_ENTRIES - 1);
        counts[s.id] = rows.length;
      }
      return res.status(200).json({ ok: true, def, counts });
    } catch (err) {
      console.error('inoki-ken getDefinition error:', err.message);
      return res.status(500).json({ ok: false, error: '設問定義の取得に失敗しました' });
    }
  }

  // ──────────────────────────────────────────────────────────
  // ⑩ 設問定義の保存（方針6：追加・削除・変更のメタ機能）
  // ──────────────────────────────────────────────────────────
  if (action === 'saveDefinition') {
    let def = body.def;
    if (typeof def === 'string') {
      try { def = JSON.parse(def); }
      catch (e) { return res.status(400).json({ ok: false, error: 'JSON として読めません：' + e.message }); }
    }
    const err = validateDefinition(def);
    if (err) return res.status(400).json({ ok: false, error: err });

    def.version = def.version || 1;
    def.updated = new Date().toISOString().slice(0, 10);
    try {
      await kvSet(SURVEY_KEY, JSON.stringify(def));
      return res.status(200).json({ ok: true, def });
    } catch (e) {
      console.error('inoki-ken saveDefinition error:', e.message);
      return res.status(500).json({ ok: false, error: '保存に失敗しました' });
    }
  }

  // ──────────────────────────────────────────────────────────
  // ⑪ 設問定義を初期値に戻す
  // ──────────────────────────────────────────────────────────
  if (action === 'resetDefinition') {
    try {
      const seed = seedDefinition();
      await kvSet(SURVEY_KEY, JSON.stringify(seed));
      return res.status(200).json({ ok: true, def: seed });
    } catch (e) {
      console.error('inoki-ken resetDefinition error:', e.message);
      return res.status(500).json({ ok: false, error: '初期化に失敗しました' });
    }
  }

  // ──────────────────────────────────────────────────────────
  // ⑫ 回答の全消去（1調査分）
  // ──────────────────────────────────────────────────────────
  if (action === 'clearAnswers') {
    const sid = String(body.sid || '');
    if (!sid) return res.status(400).json({ ok: false, error: 'sid を指定してください' });
    try {
      await kvDel(ANS_KEY(sid));
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('inoki-ken clearAnswers error:', e.message);
      return res.status(500).json({ ok: false, error: '削除に失敗しました' });
    }
  }

  return res.status(400).json({ ok: false, error: '不明な action です' });
}
