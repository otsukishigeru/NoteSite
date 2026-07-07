// api/hi-ancate/admin.js — hi-ancate アンケート 生データ取得（管理者用）
// GET /api/hi-ancate/admin?password=xxx
// 環境変数 ADMIN_PASSWORD / KV_REST_API_URL / KV_REST_API_TOKEN を使用

async function fetchEntries(role) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return [];

  const r = await fetch(`${url}/lrange/hi-ancate:${role}/0/1999`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await r.json();
  return (data.result || []).map(s => {
    try { return JSON.parse(decodeURIComponent(s)); } catch { return null; }
  }).filter(Boolean);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return res.status(500).json({ ok: false, error: 'ADMIN_PASSWORD が設定されていません' });

  const queryPassword  = req.query && req.query.password;
  const authHeader     = req.headers && req.headers.authorization;
  const bearerPassword = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const provided = queryPassword || bearerPassword || '';
  if (provided !== adminPassword) return res.status(401).json({ ok: false, error: '認証に失敗しました' });

  try {
    const [student, company] = await Promise.all([fetchEntries('student'), fetchEntries('company')]);
    return res.status(200).json({ ok: true, student, company });
  } catch (err) {
    console.error('hi-ancate admin error:', err.message);
    return res.status(500).json({ ok: false, error: 'サーバー内部エラー', detail: err.message });
  }
};
