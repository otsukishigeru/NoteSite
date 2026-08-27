// api/learn.js — 要求工学「学習」サイト用 API
//
// 初級・中級・上級の内容は lib/learn-content.js（版管理の対象）から供給し、
// 「独自」だけを KV に置く。学習画面はこの API から両方をまとめて受け取る。
//
// KV keys:
//   learn:custom      → JSON（「独自」の内容）
//   learn:custom:rev  → 整数（更新回数。同時編集の検出に使う）
//
// 管理操作（adminLogin / getCustomAdmin / saveCustom / resetCustom）は
// サイト共通の環境変数 ADMIN_PASSWORD で保護する。

import { STAGES, CUSTOM_SEED, CONTENT_VERSION } from '../lib/learn-content.js';

const CUSTOM_KEY = 'learn:custom';
const REV_KEY = 'learn:custom:rev';

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

  async function kvSet(key, value) {
    const r = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'text/plain' },
      body: value
    });
    if (!r.ok) throw new Error(`KV set failed: ${r.status}`);
  }

  async function kvIncr(key) {
    const r = await fetch(`${KV_URL}/incr/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const d = await r.json();
    return Number(d.result || 0);
  }

  // 「独自」を読む。まだ無ければ仮置きの初期値を書き込む。
  async function loadCustom() {
    const raw = await kvGet(CUSTOM_KEY);
    if (raw) {
      try {
        const c = JSON.parse(raw);
        if (c && Array.isArray(c.terms) && Array.isArray(c.refs)) return c;
      } catch {}
    }
    const seed = JSON.parse(JSON.stringify(CUSTOM_SEED));
    await kvSet(CUSTOM_KEY, JSON.stringify(seed));
    await kvSet(REV_KEY, '1');
    return seed;
  }

  async function currentRev() {
    const raw = await kvGet(REV_KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }

  // 保存前の構造検査。意味の正しさまでは見ないが、画面が壊れる形は弾く。
  function validateCustom(c) {
    if (!c || typeof c !== 'object') return '内容が JSON オブジェクトではありません';
    if (!c.title) return '表題（title）がありません';
    if (!Array.isArray(c.terms)) return 'terms が配列ではありません';
    if (!Array.isArray(c.refs)) return 'refs が配列ではありません';
    if (!c.quiz || !Array.isArray(c.quiz.questions)) return 'quiz.questions が配列ではありません';

    const idPat = /^[A-Za-z0-9][A-Za-z0-9\-_]{0,39}$/;
    const seenT = new Set();
    for (const t of c.terms) {
      if (!idPat.test(String(t.id || ''))) return `用語の id が不正です（${t && t.id}）`;
      if (seenT.has(t.id)) return `用語の id が重複しています（${t.id}）`;
      seenT.add(t.id);
      if (!t.term) return `用語 ${t.id} に見出し語がありません`;
      if (!t.definition) return `用語 ${t.id} に定義がありません`;
    }
    const seenR = new Set();
    for (const r of c.refs) {
      if (!idPat.test(String(r.id || ''))) return `文献の id が不正です（${r && r.id}）`;
      if (seenR.has(r.id)) return `文献の id が重複しています（${r.id}）`;
      seenR.add(r.id);
      if (!r.label) return `文献 ${r.id} に書誌がありません`;
    }
    const seenQ = new Set();
    for (const q of c.quiz.questions) {
      if (!idPat.test(String(q.id || ''))) return `設問の id が不正です（${q && q.id}）`;
      if (seenQ.has(q.id)) return `設問の id が重複しています（${q.id}）`;
      seenQ.add(q.id);
      if (!q.text) return `設問 ${q.id} に問題文がありません`;
      if (!Array.isArray(q.choices) || q.choices.length < 2) return `設問 ${q.id} の選択肢が足りません`;
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) {
        return `設問 ${q.id} の正答の指定が不正です`;
      }
      if (q.term && !seenT.has(q.term)) return `設問 ${q.id} の復習先（${q.term}）が用語にありません`;
    }
    const pass = Number(c.quiz.pass);
    if (!Number.isInteger(pass) || pass < 0 || pass > c.quiz.questions.length) {
      return '合格ラインが設問数の範囲にありません';
    }
    return null;
  }

  const body = req.body || {};
  const { action } = body;

  // ──────────────────────────────────────────────────────────
  // ① 学習内容の取得（公開）
  // ──────────────────────────────────────────────────────────
  if (action === 'getAll') {
    try {
      const custom = await loadCustom();
      return res.status(200).json({
        ok: true, version: CONTENT_VERSION,
        stages: STAGES, custom
      });
    } catch (err) {
      console.error('learn getAll error:', err.message);
      // 「独自」が読めなくても、三段階だけは配れるようにする
      return res.status(200).json({ ok: true, version: CONTENT_VERSION, stages: STAGES, custom: null });
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
  // ② 編集用に取得（更新回数つき）
  // ──────────────────────────────────────────────────────────
  if (action === 'getCustomAdmin') {
    try {
      const custom = await loadCustom();
      const rev = await currentRev();
      return res.status(200).json({ ok: true, custom, rev });
    } catch (err) {
      console.error('learn getCustomAdmin error:', err.message);
      return res.status(500).json({ ok: false, error: '取得に失敗しました' });
    }
  }

  // ──────────────────────────────────────────────────────────
  // ③ 保存（更新回数を照合し、他の管理者の変更を上書きしない）
  // ──────────────────────────────────────────────────────────
  if (action === 'saveCustom') {
    let custom = body.custom;
    if (typeof custom === 'string') {
      try { custom = JSON.parse(custom); }
      catch (e) { return res.status(400).json({ ok: false, error: 'JSON として読めません：' + e.message }); }
    }
    const err = validateCustom(custom);
    if (err) return res.status(400).json({ ok: false, error: err });

    try {
      const now = await currentRev();
      const sent = Number(body.rev);
      if (!Number.isInteger(sent) || sent !== now) {
        return res.status(409).json({
          ok: false, conflict: true, rev: now,
          error: '他の方が先に保存しました。お手数ですが、いちど読み直してから保存し直してください。'
        });
      }
      custom.id = 'custom';
      custom.provisional = false;   // 一度でも保存されたら仮置きの帯を外す
      custom.updated = new Date().toISOString().slice(0, 10);
      await kvSet(CUSTOM_KEY, JSON.stringify(custom));
      const rev = await kvIncr(REV_KEY);
      return res.status(200).json({ ok: true, custom, rev });
    } catch (e) {
      console.error('learn saveCustom error:', e.message);
      return res.status(500).json({ ok: false, error: '保存に失敗しました' });
    }
  }

  // ──────────────────────────────────────────────────────────
  // ④ 仮置きの初期内容に戻す
  // ──────────────────────────────────────────────────────────
  if (action === 'resetCustom') {
    try {
      const seed = JSON.parse(JSON.stringify(CUSTOM_SEED));
      await kvSet(CUSTOM_KEY, JSON.stringify(seed));
      const rev = await kvIncr(REV_KEY);
      return res.status(200).json({ ok: true, custom: seed, rev });
    } catch (e) {
      console.error('learn resetCustom error:', e.message);
      return res.status(500).json({ ok: false, error: '初期化に失敗しました' });
    }
  }

  return res.status(400).json({ ok: false, error: '不明な action です' });
}
