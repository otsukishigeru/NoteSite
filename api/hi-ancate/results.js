// api/hi-ancate/results.js — hi-ancate アンケートの集計結果（公開・認証不要）
// 個人が特定できる情報は返さず、項目ごとの平均・件数のみを返す

const QUESTION_IDS = [
  'a1', 'a2', 'a3', 'a4',
  'b1', 'b2', 'b3',
  'c1', 'c2', 'c3',
  'd1', 'd2', 'd3', 'd4',
  'e1', 'e2', 'e3',
  'f1', 'f2', 'f3',
];

const MIN_N = 10; // これ未満は preliminary 扱い

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
  QUESTION_IDS.forEach(id => {
    avgs[id] = counts[id] > 0 ? sums[id] / counts[id] : null;
  });
  return avgs;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    const [studentEntries, companyEntries] = await Promise.all([
      fetchEntries('student'),
      fetchEntries('company'),
    ]);

    const studentN = studentEntries.length;
    const companyN = companyEntries.length;

    const items = {};
    const studentAvgs = aggregate(studentEntries);
    const companyAvgs = aggregate(companyEntries);
    QUESTION_IDS.forEach(id => {
      items[id] = { student: studentAvgs[id], company: companyAvgs[id] };
    });

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
};
