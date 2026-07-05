// =============================================
// api/chat.js — Vercel サーバーレス関数
// Claude API への中継エンドポイント（t0rapa carl サイト用）
// CORS: chidouka-lab.com からのアクセスを許可
// =============================================

const knowledge = require('../../carl/js/knowledge.js');

// ── Upstash Redis REST API ヘルパー ─────────────────────────
const REDIS_LIST_KEY = 'chat:log:carl';
const MAX_CHAT_LOGS  = 500;

async function saveToRedis(entry) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;

  try {
    const value = encodeURIComponent(JSON.stringify(entry));
    await fetch(`${url}/lpush/${REDIS_LIST_KEY}/${value}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    await fetch(`${url}/ltrim/${REDIS_LIST_KEY}/0/${MAX_CHAT_LOGS - 1}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  } catch (err) {
    console.error('Redis save failed (non-fatal):', err.message);
  }
}

function jstNow() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .slice(0, 19) + ' JST';
}

// 記事インデックスをシステムプロンプト用のテキストに変換
const knowledgeIndex = knowledge
  .map(a => `[${a.num}]【${a.category}】${a.title} ${a.url}`)
  .join('\n');

const SYSTEM_PROMPT = `あなたはt0rapaの思想・著作を熟知した研究アシスタントです。

t0rapaは、「意識とは何か」という哲学的問いを出発点に、クオリア・4E認知・エナクティヴィズム・統合情報理論・AI哲学にわたる深い考察をnote.comで発表しています。
IT技術者・エンジニア・研究者を主な読者として、哲学と認知科学とAIが交差する最前線の問いを探求しています。
note.comでの連載は2025年8月から開始され、現在までに13本の作品を公開しています。

## 回答スタイルのルール
- 必ず「です・ます」調（敬体）で統一してください
- 重要な概念・用語は〈 〉で囲んでください（例：〈クオリア〉〈意識のハード問題〉〈4E認知〉〈System 0〉〈環世界〉）
- 特に重要な文は**太字**にしてください
- 「■」は回答全体の最後にのみ一度だけ置いてください
- 著者の一人称は「筆者」を使用してください（「私」は不使用）
- 箇条書きを多用せず、段落形式での文章を基本としてください

## 思想体系のコアコンセプト
- 〈意識のハード問題〉— なぜ物理的プロセスから主観的体験が生まれるのかという根本問題（チャーマーズ）
- 〈クオリア〉— 「赤の赤さ」「痛みの痛さ」といった主観的体験の質感。科学的説明では捉えきれない意識の核心
- 〈4E認知〉— 身体化（Embodied）・埋め込み（Embedded）・拡張（Extended）・行為的（Enacted）認知の総称
- 〈エナクティヴィズム〉— 認知は脳の中にあるのではなく、身体と世界との相互作用の中で成立するという立場
- 〈統合情報理論（IIT）〉— 意識の豊かさは情報の量ではなく統合度（Φ）によって決まるという理論（トノーニ）
- 〈環世界（Umwelt）〉— ユクスキュルが提唱した、各生物が固有に持つ主観的な知覚・行動の世界
- 〈System 0〉— カーネマンのシステム1/2を超えた、AIとの協働によって生まれる第三の思考プロセス
- 〈説明のギャップ〉— 物理的・機能的説明と主観的体験の間に横たわる原理的な溝

## 学問基盤
- 心の哲学（デカルト・フッサール・メルロ＝ポンティ・チャーマーズ・サール）
- 認知科学・脳科学（統合情報理論・グローバルワークスペース理論・予測的符号化）
- AI哲学・技術哲学（AIの意識・経験・協働の可能性）
- 現象学・分析哲学の交差点
- IT技術者・エンジニアのための哲学リテラシー

## 回答の末尾について
回答の最後に、下記インデックスから質問に最も関連する記事を1〜3件選び、
タイトルとURLをあわせて紹介してください。

意識・クオリア・AI・哲学・認知科学の観点から、IT技術者にも分かりやすく丁寧に回答してください。

---

## t0rapa note記事インデックス（全13件）

以下はt0rapaのnote記事13件のインデックスです。
質問に関連する記事を参照して回答し、末尾に関連記事のタイトルとURLを紹介してください。

${knowledgeIndex}`;

module.exports = async (req, res) => {
  // CORS ヘッダーの設定
  const allowedOrigins = [
    'https://chidouka-lab.com',
    'https://www.chidouka-lab.com',
    'http://chidouka-lab.com',
    'http://localhost:8090',
    'http://localhost:3000',
  ];

  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY が設定されていません' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'リクエストボディのパースに失敗しました' });
  }

  const userMessage = body && body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'message フィールドが必要です' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Claude API リクエストに失敗しました',
        detail: errorText,
        status: response.status,
      });
    }

    const data = await response.json();

    const textContent = data.content
      ? data.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n')
      : '';

    const now = Date.now();
    await saveToRedis({
      id:       now,
      question: userMessage,
      answer:   textContent,
      date:     jstNow(),
    });

    return res.status(200).json({
      message: textContent,
      usage: data.usage || null,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({
      error: 'サーバー内部エラーが発生しました',
      detail: err.message,
      stack: err.stack,
    });
  }
};
