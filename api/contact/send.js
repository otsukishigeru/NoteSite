// =============================================
// api/contact/send.js — お問い合わせフォーム送信
// Resend API を使用してメール送信
// RESEND_API_KEY 環境変数が必要
// 送信先: otsuki.s.1corp@gmail.com
// =============================================

const TO_EMAIL   = 'otsuki.s.1corp@gmail.com';
const FROM_EMAIL = 'contact@chidouka-lab.com'; // Resend で認証済みドメイン
const SITE_NAME  = '知働化コミュニティ';

module.exports = async function handler(req, res) {
  // CORS ヘッダー
  res.setHeader('Access-Control-Allow-Origin', 'https://chidouka-lab.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ ok: false, error: '送信設定が未構成です。' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid JSON' });
  }

  const { name, email, org, subject, message } = body || {};

  // バリデーション
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ ok: false, error: '必須項目が不足しています。' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'メールアドレスの形式が不正です。' });
  }

  // メール本文（HTML）
  const htmlBody = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1d2f5f;border-bottom:2px solid #1d2f5f;padding-bottom:8px;">
    ${SITE_NAME} お問い合わせ
  </h2>
  <table style="width:100%;border-collapse:collapse;margin-top:20px;">
    <tr>
      <td style="padding:10px 12px;background:#f0f4f8;font-weight:700;width:130px;border:1px solid #dde6f4;">お名前</td>
      <td style="padding:10px 12px;border:1px solid #dde6f4;">${escapeHtml(name)}</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;background:#f0f4f8;font-weight:700;border:1px solid #dde6f4;">メールアドレス</td>
      <td style="padding:10px 12px;border:1px solid #dde6f4;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
    </tr>
    ${org ? `
    <tr>
      <td style="padding:10px 12px;background:#f0f4f8;font-weight:700;border:1px solid #dde6f4;">会社名・所属</td>
      <td style="padding:10px 12px;border:1px solid #dde6f4;">${escapeHtml(org)}</td>
    </tr>` : ''}
    <tr>
      <td style="padding:10px 12px;background:#f0f4f8;font-weight:700;border:1px solid #dde6f4;">件名</td>
      <td style="padding:10px 12px;border:1px solid #dde6f4;">${escapeHtml(subject)}</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;background:#f0f4f8;font-weight:700;border:1px solid #dde6f4;vertical-align:top;">メッセージ</td>
      <td style="padding:10px 12px;border:1px solid #dde6f4;white-space:pre-wrap;">${escapeHtml(message)}</td>
    </tr>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#666;">
    送信元: chidouka-lab.com/contact/ — ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
  </p>
</div>`;

  // テキスト本文
  const textBody = [
    `${SITE_NAME} お問い合わせ`,
    '---',
    `お名前: ${name}`,
    `メール: ${email}`,
    org ? `所属: ${org}` : null,
    `件名: ${subject}`,
    '',
    'メッセージ:',
    message,
    '---',
    `送信元: chidouka-lab.com/contact/`,
  ].filter(l => l !== null).join('\n');

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${SITE_NAME} <${FROM_EMAIL}>`,
        to:   [TO_EMAIL],
        reply_to: email,
        subject: `[${SITE_NAME}] ${subject}`,
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend API error:', resendRes.status, errText);
      return res.status(500).json({ ok: false, error: 'メール送信に失敗しました。' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact send error:', err);
    return res.status(500).json({ ok: false, error: 'サーバーエラーが発生しました。' });
  }
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
