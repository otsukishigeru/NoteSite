// api/inoki-ken.js — inoki-ken サイト用 API
// KV keys:
//   inoki-ken:users → JSON [{id, subid, note, created}]
//
// 管理操作（listUsers / addUser / editUser / removeUser / adminLogin）は
// サイト共通の環境変数 ADMIN_PASSWORD で保護します。

const USERS_KEY = 'inoki-ken:users';

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

  async function kvSet(key, value) {
    await fetch(`${KV_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
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

  return res.status(400).json({ ok: false, error: '不明な action です' });
}
