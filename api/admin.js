// =============================================
// api/admin.js — 対話履歴管理 API
// GET /api/admin?password=xxxx
// 環境変数 ADMIN_PASSWORD でパスワード設定
// 環境変数 KV_REST_API_URL / KV_REST_API_TOKEN で Redis 接続
// =============================================

const REDIS_LIST_KEY = 'chat:log';
const FETCH_COUNT    = 50; // 最新50件を返す

module.exports = async (req, res) => {
  // CORS（開発用 localhost も許可）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ── パスワード認証 ────────────────────────────────────────
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD が設定されていません' });
  }

  // クエリパラメータ ?password=xxx または Authorization: Bearer xxx を受け付ける
  const queryPassword  = req.query && req.query.password;
  const authHeader     = req.headers && req.headers.authorization;
  const bearerPassword = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  const provided = queryPassword || bearerPassword || '';
  if (provided !== adminPassword) {
    return res.status(401).json({ error: '認証に失敗しました' });
  }

  // ── Upstash Redis から最新N件を取得 ──────────────────────
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: 'Redis 環境変数が設定されていません' });
  }

  try {
    const redisRes = await fetch(
      `${url}/lrange/${REDIS_LIST_KEY}/0/${FETCH_COUNT - 1}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );

    if (!redisRes.ok) {
      const errText = await redisRes.text();
      console.error('Redis LRANGE error:', redisRes.status, errText);
      return res.status(500).json({ error: 'Redis 取得に失敗しました', detail: errText });
    }

    const redisData = await redisRes.json();
    // result は JSON文字列の配列（Upstash REST API 形式）
    const logs = (redisData.result || []).map((item) => {
      try { return JSON.parse(item); }
      catch { return { raw: item }; }
    });

    return res.status(200).json({
      count: logs.length,
      logs,
    });
  } catch (err) {
    console.error('Admin API error:', err);
    return res.status(500).json({ error: 'サーバー内部エラー', detail: err.message });
  }
};
