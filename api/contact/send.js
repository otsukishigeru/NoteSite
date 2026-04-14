// =============================================
// api/contact/send.js — お問い合わせフォーム送信
// nodemailer + Gmail SMTP を使用
// 必要な環境変数:
//   GMAIL_USER         : otsuki.s.1corp@gmail.com
//   GMAIL_APP_PASSWORD : Gmail アプリパスワード（16文字）
// =============================================

const nodemailer = require('nodemailer');

const TO_EMAIL  = 'otsuki.s.1corp@gmail.com';
const SITE_NAME = '知働化コミュニティ';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD is not set');
    return res.status(500).json({ ok: false, error: '送信設定が未構成です。管理者にご連絡ください。' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON' });
  }

  const { name, email, org, subject, message } = body || {};

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ ok: false, error: '必須項目が不足しています。' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'メールアドレスの形式が不正です。' });
  }

  // Gmail SMTP トランスポート
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const orgLine = org ? `<tr><td style="padding:10px 12px;background:#f0f4f8;font-weight:700;width:130px;border:1px solid #dde6f4;">会社名・所属</td><td style="padding:10px 12px;border:1px solid #dde6f4;">${esc(org)}</td></tr>` : '';

  const htmlBody = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1d2f5f;border-bottom:2px solid #1d2f5f;padding-bottom:8px;">${SITE_NAME} — お問い合わせ</h2>
  <table style="width:100%;border-collapse:collapse;margin-top:20px;">
    <tr>
      <td style="padding:10px 12px;background:#f0f4f8;font-weight:700;width:130px;border:1px solid #dde6f4;">お名前</td>
      <td style="padding:10px 12px;border:1px solid #dde6f4;">${esc(name)}</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;background:#f0f4f8;font-weight:700;border:1px solid #dde6f4;">返信先メール</td>
      <td style="padding:10px 12px;border:1px solid #dde6f4;"><a href="mailto:${esc(email)}">${esc(email)}</a></td>
    </tr>
    ${orgLine}
    <tr>
      <td style="padding:10px 12px;background:#f0f4f8;font-weight:700;border:1px solid #dde6f4;">件名</td>
      <td style="padding:10px 12px;border:1px solid #dde6f4;">${esc(subject)}</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;background:#f0f4f8;font-weight:700;border:1px solid #dde6f4;vertical-align:top;">メッセージ</td>
      <td style="padding:10px 12px;border:1px solid #dde6f4;white-space:pre-wrap;">${esc(message)}</td>
    </tr>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#888;">
    送信元: chidouka-lab.com/contact/ — ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
  </p>
</div>`;

  const textBody = [
    `${SITE_NAME} お問い合わせ`,
    '---',
    `お名前: ${name}`,
    `返信先: ${email}`,
    org ? `所属: ${org}` : null,
    `件名: ${subject}`,
    '',
    'メッセージ:',
    message,
    '---',
    `送信元: chidouka-lab.com/contact/`,
  ].filter(l => l !== null).join('\n');

  try {
    await transporter.sendMail({
      from: `"${SITE_NAME}" <${gmailUser}>`,
      to:       TO_EMAIL,
      replyTo:  email,
      subject:  `[${SITE_NAME}] ${subject}`,
      html:     htmlBody,
      text:     textBody,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('sendMail error:', err.message);
    return res.status(500).json({ ok: false, error: 'メール送信に失敗しました。しばらくしてから再度お試しください。' });
  }
};

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
