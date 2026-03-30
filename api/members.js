export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const KV_URL   = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  async function kvGet(key) {
    const r = await fetch(`${KV_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const d = await r.json();
    return d.result ?? null;
  }

  async function kvSet(key, value) {
    const r = await fetch(`${KV_URL}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([key, value])
    });
    return r.json();
  }

  const body = req.body || {};
  const { action } = body;

  if (action === 'login') {
    const { email, passphrase } = body;
    const raw = await kvGet('members');
    const members = Array.isArray(raw) ? raw : (raw ? JSON.parse(raw) : []);
    if (!members.includes(email)) return res.status(403).json({ ok: false, error: 'メンバ登録がありません' });
    const saved = await kvGet('passphrase');
    if (passphrase !== saved) return res.status(403).json({ ok: false, error: '合言葉が違います' });
    const nickname = await kvGet(`nick:${email}`) || '';
    return res.status(200).json({ ok: true, nickname });
  }

  if (action === 'addMember') {
    const { adminPassword, email } = body;
    if (adminPassword !== process.env.ADMIN_PASSWORD)
      return res.status(403).json({ ok: false, error: '管理者パスワードが違います' });
    const raw = await kvGet('members');
    const members = Array.isArray(raw) ? raw : (raw ? JSON.parse(raw) : []);
    if (members.includes(email)) return res.status(200).json({ ok: true, message: '既に登録済みです' });
    members.push(email);
    await kvSet('members', JSON.stringify(members));
    return res.status(200).json({ ok: true });
  }

  if (action === 'removeMember') {
    const { adminPassword, email } = body;
    if (adminPassword !== process.env.ADMIN_PASSWORD)
      return res.status(403).json({ ok: false, error: '管理者パスワードが違います' });
    const raw = await kvGet('members');
    const members = Array.isArray(raw) ? raw : (raw ? JSON.parse(raw) : []);
    const updated = members.filter(m => m !== email);
    await kvSet('members', JSON.stringify(updated));
    return res.status(200).json({ ok: true });
  }

  if (action === 'setNickname') {
    const { email, passphrase, nickname } = body;
    const raw = await kvGet('members');
    const members = Array.isArray(raw) ? raw : (raw ? JSON.parse(raw) : []);
    if (!members.includes(email)) return res.status(403).json({ ok: false, error: 'メンバ登録がありません' });
    const saved = await kvGet('passphrase');
    if (passphrase !== saved) return res.status(403).json({ ok: false, error: '合言葉が違います' });
    await kvSet(`nick:${email}`, nickname);
    return res.status(200).json({ ok: true });
  }

  if (action === 'setPassphrase') {
    const { adminPassword, passphrase } = body;
    if (adminPassword !== process.env.ADMIN_PASSWORD)
      return res.status(403).json({ ok: false, error: '管理者パスワードが違います' });
    await kvSet('passphrase', passphrase);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ ok: false, error: '不明なactionです' });
}
