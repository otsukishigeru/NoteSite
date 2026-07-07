// api/hi-ancate/submit.js — hi-ancate アンケート回答の送信
// Upstash Redis にロール別リストとして保存する（api/contact/send.js と同じ lpush+ltrim パターン）

const QUESTION_IDS = [
  'a1', 'a2', 'a3', 'a4',
  'b1', 'b2', 'b3',
  'c1', 'c2', 'c3',
  'd1', 'd2', 'd3', 'd4',
  'e1', 'e2', 'e3',
  'f1', 'f2', 'f3',
];

function redisKeyFor(role) {
  return `hi-ancate:${role}`;
}

async function saveToRedis(role, entry) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Redis not configured');

  const key = redisKeyFor(role);
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

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
    await saveToRedis(role, entry);
  } catch (err) {
    console.error('hi-ancate submit error:', err.message);
    return res.status(500).json({ ok: false, error: '保存に失敗しました' });
  }

  return res.status(200).json({ ok: true });
};
