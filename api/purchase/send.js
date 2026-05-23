// api/purchase/send.js — 思考の技法2.0 製品版 購入申込み送信

const TO_EMAIL  = 'otsuki.s.1corp@gmail.com';
const REDIS_KEY = 'purchase:submissions';

async function saveToRedis(entry) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  try {
    const value = encodeURIComponent(JSON.stringify(entry));
    await fetch(`${url}/lpush/${REDIS_KEY}/${value}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetch(`${url}/ltrim/${REDIS_KEY}/0/499`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    console.error('Redis save error:', e.message);
  }
}

async function sendMail(entry) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return { sent: false, reason: 'no_api_key' };
  }

  const { name, email, org, qty, totalAmount, docs, message, date } = entry;

  const orgRow = org
    ? `<tr><td style="${tdHead}">会社名・所属</td><td style="${tdBody}">${esc(org)}</td></tr>`
    : '';
  const docsRow = docs && docs.length > 0
    ? `<tr><td style="${tdHead}">必要書類</td><td style="${tdBody}">${esc(docs.join('・'))}</td></tr>`
    : '';
  const msgRow = message
    ? `<tr><td style="${tdHead};vertical-align:top;">メッセージ</td><td style="${tdBody};white-space:pre-wrap;">${esc(message)}</td></tr>`
    : '';

  const totalFormatted = Number(totalAmount).toLocaleString('ja-JP') + ' 円';

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#c17a00;border-bottom:2px solid #c17a00;padding-bottom:8px;">【思考の技法2.0 購入】申込み</h2>
  <table style="width:100%;border-collapse:collapse;margin-top:20px;">
    <tr><td style="${tdHead}">お名前</td><td style="${tdBody}">${esc(name)}</td></tr>
    <tr><td style="${tdHead}">返信先</td><td style="${tdBody}"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
    ${orgRow}
    <tr><td style="${tdHead}">購入希望冊数</td><td style="${tdBody}">${esc(String(qty))} 冊</td></tr>
    <tr><td style="${tdHead}">総額（税込）</td><td style="${tdBody};font-weight:700;color:#c17a00;">${totalFormatted}</td></tr>
    ${docsRow}
    ${msgRow}
  </table>
  <p style="margin-top:24px;font-size:12px;color:#888;">受信日時: ${date}</p>
</div>`;

  const text = [
    `お名前: ${name}`,
    `返信先: ${email}`,
    org ? `所属: ${org}` : null,
    `購入希望冊数: ${qty} 冊`,
    `総額（税込）: ${totalFormatted}`,
    docs && docs.length > 0 ? `必要書類: ${docs.join('・')}` : null,
    message ? `\nメッセージ:\n${message}` : null,
    `\n受信: ${date}`,
  ].filter(Boolean).join('\n');

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:     'onboarding@resend.dev',
      to:       [TO_EMAIL],
      reply_to: email,
      subject:  '【思考の技法2.0 購入】購入申込みが届きました',
      html,
      text,
    }),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Resend ${r.status}: ${txt}`);
  }
  return { sent: true };
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

  const { name, email, org, qty, totalAmount, docs, message } = body || {};

  if (!name || !email || !qty || isNaN(Number(qty)) || Number(qty) < 1)
    return res.status(400).json({ ok: false, error: '必須項目が不足しています。' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ ok: false, error: 'メールアドレスの形式が不正です。' });

  const entry = {
    name, email,
    org: org || '',
    qty: Number(qty),
    totalAmount: Number(totalAmount),
    docs: Array.isArray(docs) ? docs : [],
    message: message || '',
    date: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
  };

  await saveToRedis(entry);

  let mailResult = { sent: false, reason: 'not_attempted' };
  try {
    mailResult = await sendMail(entry);
  } catch (err) {
    console.error('sendMail error:', err.message);
    mailResult = { sent: false, reason: err.message };
  }

  console.log(`purchase saved. mail_sent=${mailResult.sent}${mailResult.reason ? ' reason='+mailResult.reason : ''}`);
  return res.status(200).json({ ok: true, mail_sent: mailResult.sent, debug_reason: mailResult.reason || null });
};

const tdHead = 'padding:10px 12px;background:#f0f4f8;font-weight:700;width:130px;border:1px solid #dde6f4;';
const tdBody = 'padding:10px 12px;border:1px solid #dde6f4;';

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
