// api/library.js — ライブラリメンバ & ファイル管理 API
// KV keys:
//   lib:members → JSON [{id, subId, registeredAt, accessCount}]
//   lib:files   → JSON [{no, title, description, creator, filename, uploadDate, fileSize, notes, isPaid}]

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const KV_URL   = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  async function kvGet(key) {
    const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
    const d = await r.json();
    return d.result ?? null;
  }

  async function kvSet(key, value) {
    await fetch(`${KV_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` }
    });
  }

  const body = req.body || {};
  const { action } = body;

  // ──────────────────────────────────────────────────────────
  // ① ライブラリメンバ認証（ID + サブID）
  // ──────────────────────────────────────────────────────────
  if (action === 'verifyLibraryMember') {
    const { id, subId } = body;
    if (!id || !subId) return res.status(400).json({ ok: false, error: 'ID・サブIDを入力してください' });
    const raw = await kvGet('lib:members');
    const members = raw ? JSON.parse(raw) : [];
    const idx = members.findIndex(m => m.id === id && m.subId === subId);
    if (idx === -1) return res.status(403).json({ ok: false, error: 'ID・サブIDが登録されていません' });
    members[idx].accessCount = (members[idx].accessCount || 1) + 1;
    await kvSet('lib:members', JSON.stringify(members));
    return res.status(200).json({ ok: true, id, subId });
  }

  // ──────────────────────────────────────────────────────────
  // ② ファイル一覧（全公開）
  // ──────────────────────────────────────────────────────────
  if (action === 'listFiles') {
    const raw = await kvGet('lib:files');
    const files = raw ? JSON.parse(raw) : [];
    return res.status(200).json({ ok: true, files });
  }

  // 以下は admin 専用 ─────────────────────────────────────────
  const { adminPassword } = body;
  if (adminPassword !== process.env.ADMIN_PASSWORD)
    return res.status(403).json({ ok: false, error: '管理者パスワードが違います' });

  // ──────────────────────────────────────────────────────────
  // ③ ライブラリメンバ一覧
  // ──────────────────────────────────────────────────────────
  if (action === 'listLibraryMembers') {
    const raw = await kvGet('lib:members');
    const members = raw ? JSON.parse(raw) : [];
    return res.status(200).json({ ok: true, members });
  }

  // ──────────────────────────────────────────────────────────
  // ④ ライブラリメンバ追加
  // ──────────────────────────────────────────────────────────
  if (action === 'addLibraryMember') {
    const { id, subId } = body;
    if (!id || !subId) return res.status(400).json({ ok: false, error: 'ID・サブIDを入力してください' });
    const raw = await kvGet('lib:members');
    const members = raw ? JSON.parse(raw) : [];
    const exists = members.some(m => m.id === id && m.subId === subId);
    if (exists) return res.status(200).json({ ok: true, message: '既に登録済みです' });
    members.push({
      id, subId,
      registeredAt: new Date().toISOString().slice(0, 10),
      accessCount: 1
    });
    await kvSet('lib:members', JSON.stringify(members));
    return res.status(200).json({ ok: true });
  }

  // ──────────────────────────────────────────────────────────
  // ⑤ ライブラリメンバ削除
  // ──────────────────────────────────────────────────────────
  if (action === 'removeLibraryMember') {
    const { id, subId } = body;
    if (!id || !subId) return res.status(400).json({ ok: false, error: 'ID・サブIDを入力してください' });
    const raw = await kvGet('lib:members');
    const members = raw ? JSON.parse(raw) : [];
    const updated = members.filter(m => !(m.id === id && m.subId === subId));
    await kvSet('lib:members', JSON.stringify(updated));
    return res.status(200).json({ ok: true });
  }

  // ──────────────────────────────────────────────────────────
  // ⑥ ファイル追加（メタデータ登録）
  // ──────────────────────────────────────────────────────────
  if (action === 'addFile') {
    const { file } = body;
    if (!file || !file.no || !file.title || !file.filename)
      return res.status(400).json({ ok: false, error: 'no・title・filenameは必須です' });
    const raw = await kvGet('lib:files');
    const files = raw ? JSON.parse(raw) : [];
    const exists = files.some(f => f.no === file.no);
    if (exists) return res.status(200).json({ ok: false, error: '同じ項目番号が既に登録されています' });
    files.push(file);
    files.sort((a, b) => a.no.localeCompare(b.no));
    await kvSet('lib:files', JSON.stringify(files));
    return res.status(200).json({ ok: true });
  }

  // ──────────────────────────────────────────────────────────
  // ⑦ ファイル更新
  // ──────────────────────────────────────────────────────────
  if (action === 'updateFile') {
    const { file } = body;
    if (!file || !file.no || !file.title || !file.filename)
      return res.status(400).json({ ok: false, error: 'no・title・filenameは必須です' });
    const raw = await kvGet('lib:files');
    const files = raw ? JSON.parse(raw) : [];
    const idx = files.findIndex(f => f.no === file.no);
    if (idx === -1) return res.status(404).json({ ok: false, error: '該当ファイルが見つかりません' });
    files[idx] = file;
    files.sort((a, b) => a.no.localeCompare(b.no));
    await kvSet('lib:files', JSON.stringify(files));
    return res.status(200).json({ ok: true });
  }

  // ──────────────────────────────────────────────────────────
  // ⑧ ファイル削除
  // ──────────────────────────────────────────────────────────
  if (action === 'removeFile') {
    const { no } = body;
    if (!no) return res.status(400).json({ ok: false, error: '項目番号を指定してください' });
    const raw = await kvGet('lib:files');
    const files = raw ? JSON.parse(raw) : [];
    const updated = files.filter(f => f.no !== no);
    await kvSet('lib:files', JSON.stringify(updated));
    return res.status(200).json({ ok: true });
  }

  // ──────────────────────────────────────────────────────────
  // ⑧ ファイル初期データ投入（初回のみ）
  // ──────────────────────────────────────────────────────────
  if (action === 'seedFiles') {
    const raw = await kvGet('lib:files');
    const files = raw ? JSON.parse(raw) : [];
    if (files.length > 0) return res.status(200).json({ ok: true, message: '既にデータがあります', files });
    const seed = [{
      no: '001',
      title: '思考の技法2.0 改訂新版 ドラフト',
      description: '思考の技法1.0をベースに再構成（AIテクノロジ対応）',
      creator: '大槻 繁',
      filename: 'ArtOfThought2_Draft.pdf',
      uploadDate: '2026.5.5',
      fileSize: '10.8MB',
      notes: '有料版公開（５月１７日予定）までのドラフト（無料）です。',
      isPaid: false
    }];
    await kvSet('lib:files', JSON.stringify(seed));
    return res.status(200).json({ ok: true, files: seed });
  }

  return res.status(400).json({ ok: false, error: '不明なactionです' });
}
