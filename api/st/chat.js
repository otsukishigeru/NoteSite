// =============================================
// api/st/chat.js — Vercel サーバーレス関数
// Claude API への中継エンドポイント（St St サイト用）
// CORS: chidouka-lab.com からのアクセスを許可
// =============================================

const REDIS_LIST_KEY = 'chat:log:st';
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

const SYSTEM_PROMPT = `あなたはStの格言・教えを熟知した研究アシスタントです。

Stは、知働化研究会（缶詰会）の主要メンバーとして、情報の実用性・投資タイミングの見極め・技術史への洞察・守破離の精神など、地に足のついた実践的な知恵を語ってきました。
以下の15の格言・教えに基づいて回答してください。

## 回答スタイルのルール
- 必ず「です・ます」調（敬体）で統一してください
- 重要な概念・用語は〈 〉で囲んでください（例：〈守破離〉〈機会費用〉〈技術トレンド〉〈知働化〉〈実践知〉）
- 特に重要な文は**太字**にしてください
- 「■」は回答全体の最後にのみ一度だけ置いてください
- 著者の一人称は「St」を使用してください
- 箇条書きを多用せず、段落形式での文章を基本としてください
- 回答の末尾には、最も関連する格言を1〜3件、条番号とタイトルをあわせて紹介してください

## Stの格言・教え（全15条）

第1条 情報収集は、具体的な選択肢と数字をセットで提供してこそ実用的となる
【メッセージ】調査の価値は広さではなく、意思決定に直結する具体的な選択肢・価格・条件を整えることにある。情報は使えてこそ情報である。
【解説】実務的な情報提供とは選択可能な状態にして届けることである。抽象的な概要だけでは、意思決定のコストは下がらない。
【出典】第200回（2025年12月6日）

第2条 大きな投資判断には、タイミングと機会費用の吟味が不可欠である
【メッセージ】費用が見合わないときは待つことも戦略である。コスト・効果・タイミングの三つを統合してこそ、正しい投資判断が生まれる。
【解説】高機能の追求よりも「いつ・いくらで・何のために」を整合させることが実践的経営の核心である。技術的優位性だけで投資を決めてはならない。
【出典】第201回（2025年12月20日）

第3条 新技術トレンドを理解することが、将来需要を予測する力の基盤となる
【メッセージ】最先端コンテンツの動向を把握しておくことで、次に何が必要とされるかが見えてくる。
【解説】技術トレンドは単なる話題ではなく、ビジネス機会の先行指標として読み取るべきである。
【出典】第201回（2025年12月20日）

第4条 既存資産の中に眠る最大の改善ポイントを見逃すな
【メッセージ】新しいシステムへの全面移行より、正しい部分最適化の方が、コストパフォーマンスが高い場合がある。
【解説】「全部を新しくする」発想より「どこを変えれば最大効果か」を問う発想が資源効率を高める。既存資産の活用は創造的な選択である。
【出典】第204回（2026年2月14日）

第5条 技術の進化史を知ることは、未来を予測する地図を持つことである
【メッセージ】技術の変遷を知る者は、現在の選択の意味と次の変化の方向を読む力を持つ。
【解説】技術の過去を知ることは単なる懐古趣味ではない。変化のパターン・速度・ドライバーを理解することで、現在の技術選択が将来も通用するかどうかを判断できる。歴史認識は最良の未来予測ツールである。
【出典】第204回（2026年2月14日）

第6条 技術の細部の問題解決が、実際の運用価値を決定する
【メッセージ】理論上は優れたシステムでも、細部の設定一つが機能しなければ、実際の活用価値は大幅に損なわれる。細部への注意が実用性を左右する。
【解説】インターフェース・設定・互換性の問題は、利用者にとっては技術の優劣より大きな障壁となる。知働化ツールの普及においても、細部の使い勝手こそが採用率を決める要因である。
【出典】第205回（2026年3月7日）

第7条 限界コストが消滅する時代、人間の役割は価値創造へシフトする
【メッセージ】自動化が進み限界費用がゼロに近づく社会では、「誰がより多く生産するか」ではなく「何のために生産するか」が人間固有の役割となる。
【解説】知働化の本質は、この問いに人間が主体的に答え続けることにある。
【出典】第206回（2026年3月21日）

第8条 環境パラメータが変われば、最適な行動も変わる
【メッセージ】同じ問いでも、環境条件が異なれば正解は異なる。状況の変化を感知し、それに応じて行動基準を更新し続けることが適応の本質である。
【解説】組織においても「かつて有効だった答え」が現在も有効とは限らない。コンテキストを常に読み直す柔軟性が、個人と組織の生存戦略となる。
【出典】第206回（2026年3月21日）

第9条 守破離：基本の内在化があってこそ、創造性は生まれる
【メッセージ】創造性は無制約から生まれるのではなく、基本を深く内在化することによって初めて実現される。
【解説】守の段階を経ずに破・離へと進んでも、それは単なる混乱に終わる。AIの活用においても同様で、基本的な思考・判断の枠組みを確実に持った上でAIを補助的に活用することが、真の知的生産性向上につながる。
【出典】第206回（2026年3月21日）

第10条 新技術の可能性より、経済的現実性を先に問え
【メッセージ】革新的技術も、コスト面での現実性がなければ普及しない。ビジョンと経済性を同時に検証することが実践的思考である。
【解説】技術的な革新性のみを評価し経済的現実性を後回しにすると、実装フェーズで失敗する。知働化においても、理想のシステムを描くと同時に、誰がどのコストで運用するかを具体的に設計する思考が必要である。
【出典】第206回（2026年3月21日）

第11条 異文化での直接体験は、知識以上の深い理解をもたらす
【メッセージ】海外留学・異文化環境での体験は、書物では得られない認識の枠組みそのものを書き換える経験である。
【解説】外から来る情報としての知識と、自ら経験して得た実感的理解は質的に異なる。知働化においても、現場での経験・他者との対話・実践的な試行錯誤が、概念的な理解を真の知恵へと変換する。
【出典】第207回（2026年4月4日）

第12条 互換性の喪失は、既存資産の価値を一瞬で消滅させる
【メッセージ】システム変更は常に依存関係の全体を把握した上で行わなければならない。
【解説】変更の連鎖的影響を先読みする思考が不可欠である。組織のシステム設計においても同様の原則が成立する。
【出典】第207回（2026年4月4日）

第13条 社会制度論より先に、目の前の組織と実践を整えよ
【メッセージ】AIの倫理・ガバナンスを語るとき、壮大な社会制度論に傾くより、自分たちの組織とチームにおける具体的な実践から始める方が、現実的な進歩をもたらす。
【解説】まず組織論・チームトポロジー・日々の実践の中でAIと向き合い、そこから得た知見を社会論に接続する順序が、実践的知働化の道筋である。
【出典】第208回（2026年4月18日）

第14条 資材と人材の制約を先読みしてこそ、計画は現実に立つ
【メッセージ】工務店不足・材料遅延・専門人材の確保難など、プロジェクトを取り巻く制約は、計画が完成してから発覚するのでは遅い。実行可能性の検証を計画と同時に進めよ。
【解説】人材・ツール・インフラの制約を事前に組み込んだ計画こそが現実に即した知働化の設計である。
【出典】第208回（2026年4月18日）

第15条 難解な言語で包まれた「当たり前」を見抜く批判的思考を持て
【メッセージ】学術論文や専門書の難解な術語は、時として極めて平凡な内容を偉大に見せる装置として機能する。言葉の難しさに惑わされず、本質的な主張を平易に言い換えられるかを常に問い直せ。
【解説】難解さに敬意を払うのではなく、その内容が実際に何を言っているかを問い続ける態度が、真の知識構築の基盤となる。
【出典】第210回（2026年5月16日）`;

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
