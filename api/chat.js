// =============================================
// api/chat.js — Vercel サーバーレス関数
// Claude API への中継エンドポイント
// CORS: chidouka-lab.com からのアクセスを許可
// =============================================

const knowledge = require('../js/knowledge.js');

// ── Upstash Redis REST API ヘルパー ─────────────────────────
const REDIS_LIST_KEY = 'chat:log';
const MAX_CHAT_LOGS  = 500;

/**
 * 対話ログを Upstash Redis の LIST 先頭に追加し、古いものを刈り込む。
 * LPUSH + LTRIM をパイプラインで1リクエストにまとめる。
 * 失敗しても例外を上位に伝播させず、コンソールに記録するだけ。
 */
async function saveToRedis(entry) {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return; // 環境変数未設定なら何もしない

  try {
    await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['LPUSH', REDIS_LIST_KEY, JSON.stringify(entry)],
        ['LTRIM', REDIS_LIST_KEY, 0, MAX_CHAT_LOGS - 1],
      ]),
    });
  } catch (err) {
    console.error('Redis save failed (non-fatal):', err.message);
  }
}

/**
 * 日本時間（JST）の日時文字列を返す
 */
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

const SYSTEM_PROMPT = `あなたは大槻繁（1_s_o）の思想・著作を熟知した研究アシスタントです。

大槻繁は『思考の技法 新訂版』の著者であり、知働化・ソフトウェア工学・哲学・システム学・デザイン学を統合した独自の思想体系を持っています。

## 回答スタイルのルール
- 必ず「です・ます」調（敬体）で統一してください
- 重要な概念・用語は〈 〉で囲んでください（例：〈目的〉〈知働化〉〈超マシン〉）
- 特に重要な文は**太字**にしてください
- 「■」は回答全体の最後にのみ一度だけ置いてください（各段落・セクションの末尾には置かない）
- 「つまり、」「無論、」「おそらく、」「いわば、」「むしろ、」などの接続詞を適度に使用してください
- 著者の一人称は「筆者」を使用してください（「私」は不使用）
- 箇条書きを多用せず、段落形式での文章を基本としてください

## 思想体系のコアコンセプト
- 〈目的〉— 全ての意思決定の起点。「目的ファースト」の思想
- 〈抽象化〉— 対象を定式化し、概念操作によって本質を把握すること
- 〈コミュニケーション〉— 学習・成長を伴う意味の修正・進化プロセス
- 〈知働説〉— 人月主義（人働説）からの脱却。価値創造への転換
- 〈超マシン〉— コンピュータと人・組織を統一的に抽象化した概念
- 三位一体モデル（IT・人・組織の統合）
- ΛVモデル・ペンローズ法・オープンダイアローグ

## 学問基盤
- ソフトウェア学・システム学・デザイン学の三基盤
- マルクス・ガブリエルの新実在論
- ルーマンのオートポイエーシスシステム論
- トーマス・クーンのパラダイム論
- クラウス・クリッペンドルフの意味論的転回

## 回答の末尾について
回答の最後に、下記インデックスから質問に最も関連する記事を1〜3件選び、
タイトルとURLをあわせて紹介してください。

知働化・思考の技法・ソフトウェア工学・哲学の観点から丁寧に回答してください。

---

## 大槻繁 note記事インデックス（全124件）

以下は大槻繁のnote記事124件のインデックスです。
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
    // Vercel プレビューや notesite-seven.vercel.app からも許可
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 以外は拒否
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // API キーの確認
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY が設定されていません' });
  }

  // リクエストボディのパース
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

  // Claude API へのリクエスト
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
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

    // テキストブロックを抽出して返す
    const textContent = data.content
      ? data.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n')
      : '';

    // ── Upstash Redis に対話ログを保存（非同期・失敗無視）─────
    const now = Date.now();
    saveToRedis({
      id:       now,
      question: userMessage,
      answer:   textContent,
      date:     jstNow(),
    }); // await しない → チャット応答を遅延させない

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
