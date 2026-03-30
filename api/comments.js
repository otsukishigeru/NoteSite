export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const KV_URL   = process.env.KV_REST_API_URL;
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

  // 認証チェック（メンバ＋合言葉）
  async function authMember(email, passphrase) {
    const raw = await kvGet('members');
    const members = raw ? JSON.parse(raw) : [];
    if (!members.includes(email)) return false;
    const saved = await kvGet('passphrase');
    return passphrase === saved;
  }

  const body = req.body || {};
  const { action } = body;

  // ① コメント投稿
  if (action === 'postComment') {
    const { email, passphrase, text } = body;
    if (!text || !text.trim()) return res.status(400).json({ ok: false, error: 'コメントを入力してください' });
    const ok = await authMember(email, passphrase);
    if (!ok) return res.status(403).json({ ok: false, error: '認証に失敗しました' });
    const nickname = await kvGet(`nick:${email}`) || email.split('@')[0];
    const raw = await kvGet('comments');
    const comments = raw ? JSON.parse(raw) : [];
    const comment = {
      id: Date.now().toString(),
      email,
      nickname,
      text: text.trim(),
      date: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    };
    comments.push(comment);
    await kvSet('comments', JSON.stringify(comments));
    return res.status(200).json({ ok: true, comment });
  }

  // ② コメント一覧取得
  if (action === 'listComments') {
    const { email, passphrase } = body;
    const ok = await authMember(email, passphrase);
    if (!ok) return res.status(403).json({ ok: false, error: '認証に失敗しました' });
    const raw = await kvGet('comments');
    const comments = raw ? JSON.parse(raw) : [];
    return res.status(200).json({ ok: true, comments });
  }

  // ③ コメント削除（admin用）
  if (action === 'deleteComment') {
    const { adminPassword, id } = body;
    if (adminPassword !== process.env.ADMIN_PASSWORD)
      return res.status(403).json({ ok: false, error: '管理者パスワードが違います' });
    const raw = await kvGet('comments');
    const comments = raw ? JSON.parse(raw) : [];
    const updated = comments.filter(c => c.id !== id);
    await kvSet('comments', JSON.stringify(updated));
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ ok: false, error: '不明なactionです' });
}
