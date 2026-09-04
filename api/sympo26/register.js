// =============================================
// api/sympo26/register.js — Symposium2026 参加申込フォーム送信
// 1) Upstash Redis に常に保存（バックアップ）
// 2) Google スプレッドシート「Sympo26Reg」へ追記
//    （Apps Script ウェブアプリ経由：SYMPO26_SHEET_WEBHOOK_URL）
// 3) Resend API でメール送信（RESEND_API_KEY が設定済みの場合）
//    - 事務局宛　：「Sympo26Reg：参加申込」
//    - 申込者宛　：「Re:Sympo26Reg：参加申込」（御礼・参加料明示）
// =============================================

const TO_EMAIL   = 'otsuki.s.1corp@gmail.com';
const SITE_NAME  = 'Symposium2026';
const REDIS_KEY  = 'sympo26:registrations';
const FEE_GENERAL = 5000;

// 区分の定義（キー → 表示名）。いずれかに該当すれば参加料は無料。
const CATEGORY_LABELS = {
  apa_member: 'アジャイルプロセス協議会 会員',
  student:    '学生',
  speaker:    'シンポジウムコーディネータまたはスピーカー',
};

// ── 区分と参加料の判定 ────────────────────────────────────────
function normalizeCategories(input) {
  const list = Array.isArray(input) ? input : [];
  return list.filter((k) => Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, k));
}
function categoryLabels(keys) {
  return keys.length ? keys.map((k) => CATEGORY_LABELS[k]) : ['一般'];
}
function feeOf(keys) {
  return keys.length ? 0 : FEE_GENERAL;
}
function feeText(fee) {
  return fee === 0 ? '無料' : `¥${fee.toLocaleString('en-US')}`;
}

// ── Upstash Redis 保存 ────────────────────────────────────────
async function saveToRedis(entry) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return { saved: false, reason: 'no_redis_config' };
  try {
    const value = encodeURIComponent(JSON.stringify(entry));
    await fetch(`${url}/lpush/${REDIS_KEY}/${value}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetch(`${url}/ltrim/${REDIS_KEY}/0/999`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return { saved: true };
  } catch (e) {
    console.error('Redis save error:', e.message);
    return { saved: false, reason: e.message };
  }
}

// ── Google スプレッドシート「Sympo26Reg」へ追記 ───────────────
// Apps Script のウェブアプリ（doPost）に JSON を POST する。
// 設定方法は sympo26/gas/README.md を参照。
async function appendToSheet(entry) {
  const endpoint = process.env.SYMPO26_SHEET_WEBHOOK_URL;
  if (!endpoint) return { saved: false, reason: 'no_sheet_webhook' };

  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token:      process.env.SYMPO26_SHEET_TOKEN || '',
      date:       entry.date,
      name:       entry.name,
      kana:       entry.kana,
      email:      entry.email,
      org:        entry.org,
      categories: entry.categoryLabels.join(' / '),
      fee:        entry.fee,
      feeText:    entry.feeText,
      message:    entry.message,
    }),
    redirect: 'follow',
  });

  const txt = await r.text();
  if (!r.ok) throw new Error(`Sheet ${r.status}: ${txt.slice(0, 200)}`);
  return { saved: true };
}

// ── Resend でメール送信 ───────────────────────────────────────
async function resendSend(payload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: 'no_api_key' };

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: process.env.SYMPO26_MAIL_FROM || 'onboarding@resend.dev', ...payload }),
  });

  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Resend ${r.status}: ${txt.slice(0, 200)}`);
  }
  return { sent: true };
}

function row(k, v, pre) {
  return `<tr><td style="padding:10px 12px;background:#F7F7F7;font-weight:700;width:150px;border:1px solid #E2E2E2;vertical-align:top;">${esc(k)}</td><td style="padding:10px 12px;border:1px solid #E2E2E2;${pre ? 'white-space:pre-wrap;' : ''}">${esc(v)}</td></tr>`;
}

// 事務局宛メール
async function sendAdminMail(entry) {
  const html = `
<div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px;">
  <h2 style="color:#16181D;border-bottom:3px solid #E42C2C;padding-bottom:8px;">${SITE_NAME} — 参加申込</h2>
  <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:14px;">
    ${row('お名前', entry.name)}
    ${entry.kana ? row('お名前の読み', entry.kana) : ''}
    ${row('メールアドレス', entry.email)}
    ${entry.org ? row('会社名・所属', entry.org) : ''}
    ${row('区分', entry.categoryLabels.join(' / '))}
    ${row('参加料', entry.feeText)}
    ${entry.message ? row('メッセージ', entry.message, true) : ''}
  </table>
  <p style="margin-top:24px;font-size:12px;color:#8A9099;">受信日時: ${esc(entry.date)}</p>
</div>`;

  const text = [
    `お名前: ${entry.name}`,
    entry.kana ? `お名前の読み: ${entry.kana}` : '',
    `メールアドレス: ${entry.email}`,
    entry.org ? `会社名・所属: ${entry.org}` : '',
    `区分: ${entry.categoryLabels.join(' / ')}`,
    `参加料: ${entry.feeText}`,
    entry.message ? `\nメッセージ:\n${entry.message}` : '',
    `\n受信: ${entry.date}`,
  ].filter(Boolean).join('\n');

  return resendSend({
    to:       [TO_EMAIL],
    reply_to: entry.email,
    subject:  'Sympo26Reg：参加申込',
    html,
    text,
  });
}

// 申込者宛メール（御礼）
async function sendThanksMail(entry) {
  const feeNote = entry.fee === 0
    ? 'ご記入いただいた区分により、参加料は<strong>無料</strong>です。'
    : `参加料は<strong>${esc(entry.feeText)}（総額）</strong>です。当日、受付にて現金にてお支払いください。`;
  const feeNoteText = entry.fee === 0
    ? 'ご記入いただいた区分により、参加料は無料です。'
    : `参加料は ${entry.feeText}（総額）です。当日、受付にて現金にてお支払いください。`;

  const html = `
<div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#16181D;line-height:1.8;">
  <h2 style="color:#16181D;border-bottom:3px solid #E42C2C;padding-bottom:8px;">${SITE_NAME} 参加申込みを受け付けました</h2>
  <p style="margin-top:20px;">${esc(entry.name)} 様</p>
  <p>このたびは ${SITE_NAME}（アジャイルプロセス協議会 知働化研究会）へお申込みいただき、ありがとうございます。<br>
  以下の内容で参加申込みを受け付けました。</p>

  <table style="width:100%;border-collapse:collapse;margin-top:20px;font-size:14px;">
    ${row('お名前', entry.name)}
    ${entry.kana ? row('お名前の読み', entry.kana) : ''}
    ${row('メールアドレス', entry.email)}
    ${entry.org ? row('会社名・所属', entry.org) : ''}
    ${row('区分', entry.categoryLabels.join(' / '))}
    ${entry.message ? row('メッセージ', entry.message, true) : ''}
  </table>

  <div style="margin-top:22px;padding:18px 20px;background:#F7F7F7;border-left:4px solid #E42C2C;border-radius:6px;">
    <p style="font-size:13px;font-weight:800;letter-spacing:.1em;color:#E42C2C;margin:0 0 6px;">参加料</p>
    <p style="font-size:22px;font-weight:900;margin:0 0 8px;">${esc(entry.feeText)}</p>
    <p style="font-size:14px;margin:0;">${feeNote}</p>
  </div>

  <div style="margin-top:22px;font-size:14px;">
    <p style="margin:0 0 4px;"><strong>開催日時</strong>：2026年11月14日（土）9時半 開場 ～ 18時 閉会</p>
    <p style="margin:0 0 4px;"><strong>会場</strong>：工学院大学 新宿キャンパス</p>
    <p style="margin:0;"><strong>開催要領</strong>：https://chidouka-lab.com/sympo26/</p>
  </div>

  <p style="margin-top:22px;font-size:14px;">
    このメールは送信専用ではありません。ご不明な点は、このメールへの返信、または
    <a href="mailto:${TO_EMAIL}" style="color:#E42C2C;">${TO_EMAIL}</a> までお問い合わせください。
  </p>
  <p style="margin-top:18px;font-size:13px;color:#4A4F58;">
    アジャイルプロセス協議会 知働化研究会　Symposium2026 事務局<br>大槻 繁
  </p>
</div>`;

  const text = [
    `${entry.name} 様`,
    '',
    `このたびは ${SITE_NAME}（アジャイルプロセス協議会 知働化研究会）へお申込みいただき、ありがとうございます。`,
    '以下の内容で参加申込みを受け付けました。',
    '',
    `お名前: ${entry.name}`,
    entry.kana ? `お名前の読み: ${entry.kana}` : '',
    `メールアドレス: ${entry.email}`,
    entry.org ? `会社名・所属: ${entry.org}` : '',
    `区分: ${entry.categoryLabels.join(' / ')}`,
    entry.message ? `メッセージ:\n${entry.message}` : '',
    '',
    `【参加料】${entry.feeText}`,
    feeNoteText,
    '',
    '開催日時：2026年11月14日（土）9時半 開場 ～ 18時 閉会',
    '会場：工学院大学 新宿キャンパス',
    '開催要領：https://chidouka-lab.com/sympo26/',
    '',
    `お問い合わせ：${TO_EMAIL}`,
    'アジャイルプロセス協議会 知働化研究会　Symposium2026 事務局　大槻 繁',
  ].filter(Boolean).join('\n');

  return resendSend({
    to:       [entry.email],
    reply_to: TO_EMAIL,
    subject:  'Re:Sympo26Reg：参加申込',
    html,
    text,
  });
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

  const { name, kana, email, org, categories, message } = body || {};
  if (!name || !email)
    return res.status(400).json({ ok: false, error: '必須項目（お名前・メールアドレス）が不足しています。' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ ok: false, error: 'メールアドレスの形式が不正です。' });

  const catKeys = normalizeCategories(categories);
  const fee     = feeOf(catKeys);
  const entry = {
    name:    String(name).trim().slice(0, 100),
    kana:    String(kana || '').trim().slice(0, 100),
    email:   String(email).trim().slice(0, 200),
    org:     String(org || '').trim().slice(0, 200),
    categories:     catKeys,
    categoryLabels: categoryLabels(catKeys),
    fee,
    feeText: feeText(fee),
    message: String(message || '').trim().slice(0, 4000),
    date:    new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
  };

  // 1) Redis に保存（バックアップ）
  const redisResult = await saveToRedis(entry);

  // 2) スプレッドシート「Sympo26Reg」へ追記
  let sheetResult = { saved: false, reason: 'not_attempted' };
  try {
    sheetResult = await appendToSheet(entry);
  } catch (err) {
    console.error('appendToSheet error:', err.message);
    sheetResult = { saved: false, reason: err.message };
  }

  // 3) メール送信（事務局宛／申込者宛）
  let adminMail  = { sent: false, reason: 'not_attempted' };
  let thanksMail = { sent: false, reason: 'not_attempted' };
  try { adminMail = await sendAdminMail(entry); }
  catch (err) { console.error('sendAdminMail error:', err.message); adminMail = { sent: false, reason: err.message }; }
  try { thanksMail = await sendThanksMail(entry); }
  catch (err) { console.error('sendThanksMail error:', err.message); thanksMail = { sent: false, reason: err.message }; }

  console.log(`sympo26 registration: redis=${redisResult.saved} sheet=${sheetResult.saved} admin_mail=${adminMail.sent} thanks_mail=${thanksMail.sent}`);

  return res.status(200).json({
    ok: true,
    fee,
    fee_text:    entry.feeText,
    saved:       redisResult.saved,
    sheet_saved: sheetResult.saved,
    admin_mail:  adminMail.sent,
    thanks_mail: thanksMail.sent,
    debug: {
      redis:  redisResult.reason  || null,
      sheet:  sheetResult.reason  || null,
      admin:  adminMail.reason    || null,
      thanks: thanksMail.reason   || null,
    },
  });
};

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
