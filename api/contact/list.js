// api/contact/list.js — 問い合わせ一覧（管理者用）
// ADMIN_PASSWORD ヘッダーで認証

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const pw = req.headers['x-admin-password'] || req.query.pw;
  if (!pw || pw !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return res.status(500).json({ ok: false, error: 'Redis not configured' });

  try {
    const r = await fetch(`${url}/lrange/contact:submissions/0/99`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    const items = (data.result || []).map(s => {
      try { return JSON.parse(decodeURIComponent(s)); } catch { return null; }
    }).filter(Boolean);
    return res.status(200).json({ ok: true, count: items.length, items });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};
