// =============================================
// api/contact/send.js — お問い合わせフォーム送信
// 1) Upstash Redis に常に保存（バックアップ）
// 2) nodemailer + Gmail SMTP でメール送信（GMAIL_APP_PASSWORD が設定済みの場合）
// =============================================

const nodemailer = require('nodemailer');

const TO_EMAIL  = 'otsuki.s.1corp@gmail.com';
const SITE_NAME = '知働化コミュニティ';
const REDIS_KEY = 'contact:submissions';

// ── Upstash Redis 保存 ────────────────────────────────────────
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
    // 最大500件保持
    await fetch(`${url}/ltrim/${REDIS_KEY}/0/499`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    console.error('Redis save error:', e.message);
  }
}

// ── メール送信 ────────────────────────────────────────────────
async function sendMail(entry) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    console.warn('GMAIL_APP_PASSWORD not set — skipping email');
    return { sent: false, reason: 'no_credentials' };
  }

  const { name, email, org, subject, message, date } = entry;
  const orgLine = org
    ? `<tr><td style="padding:10px 12px;background:#f0f4f8;font-weight:700;width:130px;border:1px solid #dde6f4;">会社名・所属</td><td style="padding:10px 12px;border:1px solid #dde6f4;">${esc(org)}</td></tr>`
    : '';

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1d2f5f;border-bottom:2px solid #1d2f5f;padding-bottom:8px;">${SITE_NAME} — お問い合わせ</h2>
  <table style="width:100%;border-collapse:collapse;margin-top:20px;">
    <tr><td style="padding:10px 12px;background:#f0f4f8;font-weight:700;width:130px;border:1px solid #dde6f4;">お名前</td><td style="padding:10px 12px;border:1px solid #dde6f4;">${esc(name)}</td></tr>
    <tr><td style="padding:10px 12px;background:#f0f4f8;font-weight:700;border:1px solid #dde6f4;">返信先</td><td style="padding:10px 12px;border:1px solid #dde6f4;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
    ${orgLine}
    <tr><td style="padding:10px 12px;background:#f0f4f8;font-weight:700;border:1px solid #dde6f4;">件名</td><td style="padding:10px 12px;border:1px solid #dde6f4;">${esc(subject)}</td></tr>
    <tr><td style="padding:10px 12px;background:#f0f4f8;font-weight:700;border:1px solid #dde6f4;vertical-align:top;">メッセージ</td><td style="padding:10px 12px;border:1px solid #dde6f4;white-space:pre-wrap;">${esc(message)}</td></tr>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#888;">受信日時: ${date}</p>
</div>`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  });

  await transporter.sendMail({
    from:    `"${SITE_NAME}" <${gmailUser}>`,
    to:      TO_EMAIL,
    replyTo: email,
    subject: `[${SITE_NAME}] ${subject}`,
    html,
    text: `お名前: ${name}\n返信先: ${email}\n${org ? `所属: ${org}\n` : ''}件名: ${subject}\n\n${message}\n\n受信: ${date}`,
  });

  return { sent: true };
}

// ── ハンドラ ──────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ ok: false, error: 'Invalid JSON' }); }

  const { name, email, org, subject, message } = body || {};
  if (!name || !email || !subject || !message)
    return res.status(400).json({ ok: false, error: '必須項目が不足しています。' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ ok: false, error: 'メールアドレスの形式が不正です。' });

  const entry = {
    name, email, org: org || '', subject, message,
    date: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
  };

  // 1) Redis に保存（常に実行）
  await saveToRedis(entry);

  // 2) メール送信（失敗してもフォームはOKを返す）
  let mailResult = { sent: false, reason: 'not_attempted' };
  try {
    mailResult = await sendMail(entry);
  } catch (err) {
    console.error('sendMail error:', err.message);
    mailResult = { sent: false, reason: err.message };
  }

  console.log(`contact saved. mail_sent=${mailResult.sent}${mailResult.reason ? ' reason='+mailResult.reason : ''}`);
  return res.status(200).json({ ok: true, mail_sent: mailResult.sent, debug_reason: mailResult.reason || null });
};

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
