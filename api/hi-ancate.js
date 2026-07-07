// api/hi-ancate.js — hi-ancate アンケート（送信・集計・管理者用取得を1関数に集約）
// Vercel Hobbyプランのサーバーレス関数数上限（12個）を超えないよう、
// submit / results / admin を action ベースで1ファイルにまとめている。
//
// POST /api/hi-ancate                          … 回答送信
// GET  /api/hi-ancate                          … 集計結果（公開・認証不要）
// GET  /api/hi-ancate?action=admin&password=x  … 生データ取得（管理者用）

const QUESTION_IDS = [
  'a1', 'a2', 'a3', 'a4',
  'b1', 'b2', 'b3',
  'c1', 'c2', 'c3',
  'd1', 'd2', 'd3', 'd4',
  'e1', 'e2', 'e3',
  'f1', 'f2', 'f3',
];

const MIN_N = 10; // これ未満は preliminary 扱い

function redisEnv() {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return { url, token };
}

async function fetchEntries(role) {
  const { url, token } = redisEnv();
  if (!url || !token) return [];
  const r = await fetch(`${url}/lrange/hi-ancate:${role}/0/1999`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await r.json();
  return (data.result || []).map(s => {
    try { return JSON.parse(decodeURIComponent(s)); } catch { return null; }
  }).filter(Boolean);
}

async function saveEntry(role, entry) {
  const { url, token } = redisEnv();
  if (!url || !token) throw new Error('Redis not configured');
  const key = `hi-ancate:${role}`;
  const value = encodeURIComponent(JSON.stringify(entry));
  await fetch(`${url}/lpush/${key}/${value}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  await fetch(`${url}/ltrim/${key}/0/1999`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

function aggregate(entries) {
  const sums = {};
  const counts = {};
  QUESTION_IDS.forEach(id => { sums[id] = 0; counts[id] = 0; });
  entries.forEach(entry => {
    QUESTION_IDS.forEach(id => {
      const v = entry.answers && entry.answers[id];
      if (Number.isInteger(v) && v >= 1 && v <= 5) {
        sums[id] += v;
        counts[id] += 1;
      }
    });
  });
  const avgs = {};
  QUESTION_IDS.forEach(id => { avgs[id] = counts[id] > 0 ? sums[id] / counts[id] : null; });
  return avgs;
}

async function handleSubmit(req, res) {
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ ok: false, error: 'Invalid JSON' }); }

  const { role, answers, org } = body || {};
  if (role !== 'student' && role !== 'company')
    return res.status(400).json({ ok: false, error: 'role は student または company を指定してください' });
  if (!answers || typeof answers !== 'object')
    return res.status(400).json({ ok: false, error: 'answers が不正です' });

  for (const id of QUESTION_IDS) {
    const v = answers[id];
    if (!Number.isInteger(v) || v < 1 || v > 5)
      return res.status(400).json({ ok: false, error: `設問 ${id} の回答が不正です` });
  }

  const cleanAnswers = {};
  QUESTION_IDS.forEach(id => { cleanAnswers[id] = answers[id]; });

  const entry = {
    answers: cleanAnswers,
    org: role === 'company' ? String(org || '').slice(0, 100) : '',
    date: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
  };

  try {
    await saveEntry(role, entry);
  } catch (err) {
    console.error('hi-ancate submit error:', err.message);
    return res.status(500).json({ ok: false, error: '保存に失敗しました' });
  }
  return res.status(200).json({ ok: true });
}

async function handleResults(req, res) {
  try {
    const [studentEntries, companyEntries] = await Promise.all([
      fetchEntries('student'),
      fetchEntries('company'),
    ]);
    const studentN = studentEntries.length;
    const companyN = companyEntries.length;

    const studentAvgs = aggregate(studentEntries);
    const companyAvgs = aggregate(companyEntries);
    const items = {};
    QUESTION_IDS.forEach(id => { items[id] = { student: studentAvgs[id], company: companyAvgs[id] }; });

    return res.status(200).json({
      ok: true,
      counts: { student: studentN, company: companyN },
      preliminary: studentN < MIN_N || companyN < MIN_N,
      minN: MIN_N,
      items,
    });
  } catch (err) {
    console.error('hi-ancate results error:', err.message);
    return res.status(500).json({ ok: false, error: '集計の取得に失敗しました' });
  }
}

async function handleAdmin(req, res) {
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
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') return handleSubmit(req, res);

  if (req.method === 'GET') {
    const action = req.query && req.query.action;
    if (action === 'admin') return handleAdmin(req, res);
    return handleResults(req, res);
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
};
