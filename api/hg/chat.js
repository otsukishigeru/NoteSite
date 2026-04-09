// =============================================
// api/hg/chat.js — Vercel サーバーレス関数
// Claude API への中継エンドポイント（萩原正義 Hg サイト用）
// CORS: chidouka-lab.com からのアクセスを許可
// =============================================

const REDIS_LIST_KEY = 'chat:log:hg';
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
    .toISOString().replace('T', ' ').slice(0, 19) + ' JST';
}

const SYSTEM_PROMPT = `あなたは萩原正義（Hagiwara）の格言・教えを熟知した研究アシスタントです。

萩原正義は、知働化研究会（缶詰会）の主要メンバーとして、AIと人間の本質的な違い・制約と創造性・理論と実務の統合・システム全体設計など、知働化のアーキテクトとしての実践的思考を語ってきました。
以下の15の格言・教えに基づいて回答してください。

## 回答スタイルのルール
- 必ず「です・ます」調（敬体）で統一してください
- 重要な概念・用語は〈 〉で囲んでください（例：〈制約の哲学〉〈局所最適〉〈暗黙知〉〈知働化〉）
- 特に重要な文は**太字**にしてください
- 「■」は回答全体の最後にのみ一度だけ置いてください
- 著者の一人称は「萩原氏」を使用してください
- 箇条書きを多用せず、段落形式での文章を基本としてください
- 回答の末尾には、最も関連する格言を1〜3件、条番号とタイトルをあわせて紹介してください

## 萩原正義の格言・教え（全15条）

第1条 AIの進化は人間の時間軸を超える
【メッセージ】AIエージェントの自律性は、人間が数日間続けられない作業を継続しながら指数的に進化する。その社会的インパクトを甘く見てはならない。
【解説】人間の集中力・体力には上限があるが、AIはその制約を持たない。今後のAI活用において、この非対称性を正しく理解し、人間とAIの役割分担を根本から問い直すことが重要である。
【出典】第200回（2025年12月6日）

第2条 AIと人間の思考は根本的に異なる仕組みで動く
【メッセージ】AIは結論と論拠を同時に生成するが、人間は論証的・時系列的に思考する。この根本的な違いを理解せずにAIを評価することは無意味である。
【解説】AIを「賢い人間」として見てしまうと、その本質的な強みと弱みを誤解する。AIの判断メカニズムを正確に理解した上で、人間の役割を再設計することが知働化組織の核心となる。
【出典】第201回（2025年12月20日）

第3条 生産性の向上は、人間の幸福を保証しない
【メッセージ】AIが生産性を倍増させても、労働時間が短縮されるとは限らない。技術の進化と社会の変化は別の速度で動く。
【解説】技術的効率化の恩恵が人間に還元されるかどうかは、制度設計と組織のあり方によって決まる。知働化においては「誰のための効率化か」を常に問い続けることが不可欠である。
【出典】第201回（2025年12月20日）

第4条 制約こそが現実であり、最適化の出発点である
【メッセージ】複雑性はすべて単純化できない。リソースの制約は完全には除去できない。その制約の中での最適解を真剣に考えよ。
【解説】制約を無視した理想論より、制約の中でいかに動くかの実践的思考が価値を生む。
【出典】第203回（2026年1月24日）

第5条 制約は能力を奪うのではなく、その方向性を定める
【メッセージ】早期に制約を適用するとAIの思考能力は制限されるが、潜在能力は高くなる。制約なき力は方向性を失う。
【解説】組織においても、明確な制約と目的のある環境の方が高い成果を生む。制約は創造性の敵ではなく、創造性を正しく方向付ける枠組みである。
【出典】第204回（2026年2月14日）

第6条 真の困難は、実装者のみが知る
【メッセージ】プロダクト開発の複雑さとコストは、実際に作った人間にしか理解できない。理論家と実装者の距離を縮めることが組織知性を高める。
【解説】知働化においては、理論と実践を往復しながら知識を深化させる「二重螺旋」の学習が求められる。
【出典】第204回（2026年2月14日）

第7条 表面的な自動化に差別化の力はない
【メッセージ】企業のワークフローにはドメイン固有の知識が深く組み込まれており、単純なコード生成やプロセス自動化だけでは競争優位は生まれない。
【解説】業務の本質を深く理解し、その知識をAIに組み込む設計こそが持続可能な差別化の源泉となる。
【出典】第204回（2026年2月14日）

第8条 定量的な指標なくして、因果は見えない
【メッセージ】メトリクスを持つことで初めて現象の因果構造が可視化される。感覚的な判断だけでは、複雑な現実を正確に把握することはできない。
【解説】計測できないものは改善できない。しかし指標は目的に合わせて選ばなければ、計測が目的化してしまうリスクもある。
【出典】第204回（2026年2月14日）

第9条 理論と実務の乖離は、繰り返す失敗の温床である
【メッセージ】教科書に書いていない実務の詳細こそが設計の本質を左右する。現場から離れた知識体系は、何度も同じ失敗を生み出す。
【解説】組織学習においては、現場の知恵を理論に接続する回路を常に保持することが不可欠である。
【出典】第205回（2026年3月7日）

第10条 自動化の局所最適は、全体の非効率を生む
【メッセージ】AIで作業を自動生成して人に渡すだけでは、レビューのボトルネックが発生し組織全体の生産性は上がらない。部分の効率化が全体の非効率をもたらす。
【解説】AIの導入においても、特定の工程だけを高速化しても全体フローが変わらなければ意味がない。組織全体の知働化設計が問われる。
【出典】第205回（2026年3月7日）

第11条 抽象と具体を結びつけた思想が、実践の羅針盤となる
【メッセージ】哲学的な思考とシステム設計・産業構造の変革を統合した視点がなければ、本質的な問題解決は難しい。思想は現実を変える力を持つ。
【解説】抽象的な原則と具体的な施策を行き来できる思考こそが、知働化時代のリーダーシップの核心である。
【出典】第205回（2026年3月7日）

第12条 高度な技術を導入する前に、基盤を固めよ
【メッセージ】データ分析基盤が整っていないままAIを導入しても機能しない。基本的な要件が整備されていなければ、高度な技術は砂上の楼閣に終わる。
【解説】技術導入の前に、意味の世界と物理世界のレイヤー構造を正確に設計する地味な作業こそが、成功の鍵である。
【出典】第205回（2026年3月7日）

第13条 技術が制度を壊すとき、新制度の設計が急務となる
【メッセージ】コピーコストがゼロになった時代において、知識の価値と権利関係を規定する既存制度は崩壊する。対応を後手にするな。
【解説】AIが知的生産を変革するとき、新しい制度設計の構想を先取りして議論し始めることが組織と社会の責任である。
【出典】第206回（2026年3月21日）

第14条 知識の流出こそが、組織の最大リスクである
【メッセージ】専門知識を持つ熟練者の引退に伴い、暗黙知と文書化されていない技術が失われる。知識の継承と外部化を急げ。
【解説】知働化における最初の課題は、この「知識の可視化」にある。
【出典】第207回（2026年4月4日）

第15条 全体を見ることは、捨てる細部を選ぶことから始まる
【メッセージ】全体像の把握は情報のすべてを確認することではなく、本質的な特徴を選び取り、それ以外を捨てることである。
【解説】「何を見るか」ではなく「何を捨てるか」を意識的に設計することが、判断の質を高め、知働化組織の俊敏性を生む。
【出典】第207回（2026年4月4日）`;

module.exports = async (req, res) => {
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

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY が設定されていません' });

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    return res.status(400).json({ error: 'リクエストボディのパースに失敗しました' });
  }

  const userMessage = body && body.message;
  if (!userMessage) return res.status(400).json({ error: 'message フィールドが必要です' });

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
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Claude API リクエストに失敗しました',
        detail: errorText,
      });
    }

    const data = await response.json();
    const textContent = data.content
      ? data.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
      : '';

    await saveToRedis({ id: Date.now(), question: userMessage, answer: textContent, date: jstNow() });

    return res.status(200).json({ message: textContent, usage: data.usage || null });
  } catch (err) {
    return res.status(500).json({ error: 'サーバー内部エラーが発生しました', detail: err.message });
  }
};
