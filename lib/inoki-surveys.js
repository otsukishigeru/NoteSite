// lib/inoki-surveys.js — アンケートサイトの既定の設問定義（シード）
//
// このファイルは「初期値」です。実際に配信される定義は KV（キー inoki-ken:surveys）に
// 保存されており、管理画面（/inoki-ken/admin/）から設問の追加・削除・変更ができます。
// KV に定義が無いときだけ、このシードが書き込まれて使われます。
//
// 設問の型：
//   likert … 段階評価（scale の min〜max）
//   single … 単一選択（options）
//   multi  … 複数選択（options、max で上限）
//   text   … 自由記述（maxlen）

export const SURVEY_SCHEMA_VERSION = 1;

// ──────────────────────────────────────────────────────────
// 共通プロフィール（方針8-(1)）
// 氏名・所属機関名・連絡先など、個人を特定しうる項目は一切置きません。
// ──────────────────────────────────────────────────────────
export const PROFILE_FIELDS = [
  {
    id: 'pos',
    label: '現在の立場',
    type: 'single',
    required: true,
    options: [
      { v: 'ug12', label: '学部1〜2年' },
      { v: 'ug34', label: '学部3〜4年' },
      { v: 'grad', label: '大学院生' },
      { v: 'teacher', label: '教員・研究者' },
      { v: 'proIT', label: '実務者（情報システム・ソフトウェア）' },
      { v: 'proOther', label: '実務者（上記以外の分野）' },
      { v: 'other', label: 'その他' }
    ]
  },
  {
    id: 'field',
    label: '主たる分野',
    type: 'single',
    required: true,
    options: [
      { v: 'info', label: '情報系' },
      { v: 'eng', label: '工学系（情報系を除く）' },
      { v: 'sci', label: '理学系' },
      { v: 'human', label: '人文・社会科学系' },
      { v: 'biz', label: '経営・ビジネス' },
      { v: 'other', label: 'その他' }
    ]
  },
  {
    id: 're',
    label: '要求工学の学習レベル',
    type: 'single',
    required: true,
    options: [
      { v: '1', label: '学んだことがありません' },
      { v: '2', label: '講義や書籍で概要を学びました' },
      { v: '3', label: '演習・実習で実際に手を動かしました' },
      { v: '4', label: '実際のプロジェクトで実践しました' },
      { v: '5', label: '指導する立場・研究する立場にあります' }
    ]
  },
  {
    id: 'prog',
    label: 'プログラミング経験',
    type: 'single',
    required: true,
    options: [
      { v: '1', label: 'ほとんどありません' },
      { v: '2', label: '授業の演習で書いた程度です' },
      { v: '3', label: '個人でひととおり作ったことがあります' },
      { v: '4', label: '業務や研究で日常的に書いています' },
      { v: '5', label: '実務経験が3年以上あります' }
    ]
  },
  {
    id: 'ai',
    label: '生成AIの活用経験',
    type: 'single',
    required: true,
    options: [
      { v: '1', label: '使ったことがありません' },
      { v: '2', label: '何度か試したことがあります' },
      { v: '3', label: '日常的に使っています' },
      { v: '4', label: '業務・研究で本格的に使っています' },
      { v: '5', label: 'AIを組み込む仕組みを作る側にいます' }
    ]
  }
];

// 段階評価の既定スケール
const S_AGREE   = { min: 1, max: 5, low: 'あてはまらない', high: 'よくあてはまる' };
const S_KNOW    = { min: 1, max: 5, low: 'まったく知りません', high: '人に説明できます' };
const S_FREQ    = { min: 1, max: 5, low: 'まったくありません', high: 'いつも行います' };
const S_USE     = { min: 1, max: 5, low: 'まったく使いません', high: '中心的に使います' };
const S_HELP    = { min: 1, max: 5, low: 'まったく役立ちません', high: '非常に役立ちます' };
const S_WORRY   = { min: 1, max: 5, low: 'まったく感じません', high: '強く感じます' };
const S_IMPORT  = { min: 1, max: 5, low: '重要ではありません', high: '非常に重要です' };
const S_HARD    = { min: 1, max: 5, low: 'やさしいと感じます', high: '非常に難しいと感じます' };

// 要求定義の10作業（調査3で重要度・困難度の二軸に使います）
const RE_TASKS = [
  '目的をはっきりさせること',
  '利害関係者を漏れなく見つけること',
  '本当に必要なことを聞き出すこと',
  '暗黙の前提を言葉にすること',
  '要求を過不足なく書き表すこと',
  '用語の意味を関係者でそろえること',
  '要求どうしの矛盾や重複を見つけること',
  '非機能要求を具体的な水準まで決めること',
  '優先順位について合意すること',
  '決めたあとの変更を管理し続けること'
];

const importanceItems = RE_TASKS.map((t, i) => ({ id: 'i' + (i + 1), type: 'likert', text: t, scale: S_IMPORT }));
const difficultyItems = RE_TASKS.map((t, i) => ({ id: 'd' + (i + 1), type: 'likert', text: t, scale: S_HARD }));

export const SEED_SURVEYS = [
  // ════════════════════════════════════════════════════════
  // 1. 要求工学リテラシー実態調査
  // ════════════════════════════════════════════════════════
  {
    id: 're-literacy',
    title: '要求工学リテラシー実態調査',
    eyebrow: 'RE Literacy',
    color: '#2e74b5',
    status: 'open',
    minutes: 6,
    summary: '要求工学の中核となる概念が、どの程度まで共有された知識になっているかを調べます。',
    purpose:
      'この調査の目的は、〈要求〉をめぐる中核的な概念が、学ぶ側・実践する側のあいだでどの程度まで共有された知識になっているかを確かめることにあります。' +
      '要求工学は長く体系化されてきた分野ですが、その用語や考え方が実際にどこまで届いているかは、意外なほど分かっていません。' +
      'ここで得られる分布は、教育の設計や、AIに任せられる部分と人が引き受けるべき部分の境界を考えるための、基礎的な材料になります。',
    conditions: [
      '所要時間は6分程度です。設問は17問で、うち記述式は1問（任意）です。',
      '正答を測る試験ではありません。分からない場合は、遠慮なく低い段階をお選びください。',
      '氏名・所属機関名・連絡先は採取しません。回答は統計的にのみ扱います。',
      '同じ方が複数回お答えになった場合も、そのまま件数として数えます。'
    ],
    policy:
      '結果は、まず設問ごとの分布として示します。そのうえで、プロフィールの〈要求工学の学習レベル〉を軸としたクロス集計を行い、' +
      '学習段階が進むにつれてどの概念が先に定着し、どの概念が最後まで残るのかを見ます。' +
      'つまり、概念の習得には順序があるという仮説を、分布の形から検討することになります。',
    sections: [
      {
        id: 'A',
        label: '用語・概念の理解度',
        color: '#2e74b5',
        note: 'それぞれの用語について、いまのご自身の理解の程度をお選びください。',
        questions: [
          { id: 'a1', type: 'likert', text: '〈要求〉と〈要件〉の違い', scale: S_KNOW },
          { id: 'a2', type: 'likert', text: '〈機能要求〉と〈非機能要求〉の区別', scale: S_KNOW },
          { id: 'a3', type: 'likert', text: '〈ステークホルダ〉（利害関係者）の同定', scale: S_KNOW },
          { id: 'a4', type: 'likert', text: '〈トレーサビリティ〉（要求の追跡可能性）', scale: S_KNOW },
          { id: 'a5', type: 'likert', text: '〈妥当性確認〉と〈検証〉の違い', scale: S_KNOW },
          { id: 'a6', type: 'likert', text: '〈ユースケース〉による記述', scale: S_KNOW },
          { id: 'a7', type: 'likert', text: '〈ドメインモデル〉（対象領域の概念構造）', scale: S_KNOW },
          { id: 'a8', type: 'likert', text: '〈要求の優先順位づけ〉の考え方', scale: S_KNOW }
        ]
      },
      {
        id: 'B',
        label: '実践の頻度',
        color: '#4aad7a',
        note: '次の作業を、これまでにどの程度行ってきたかをお答えください。',
        questions: [
          { id: 'b1', type: 'likert', text: '利害関係者への聞き取りを行う', scale: S_FREQ },
          { id: 'b2', type: 'likert', text: '要求を文書として書き表す', scale: S_FREQ },
          { id: 'b3', type: 'likert', text: '要求に優先順位をつける', scale: S_FREQ },
          { id: 'b4', type: 'likert', text: '要求の変更を記録し管理する', scale: S_FREQ },
          { id: 'b5', type: 'likert', text: '要求を他者とレビューする', scale: S_FREQ },
          { id: 'b6', type: 'likert', text: '対象領域を図やモデルで表す', scale: S_FREQ }
        ]
      },
      {
        id: 'C',
        label: '学習の経路',
        color: '#b5651d',
        questions: [
          {
            id: 'c1', type: 'multi', max: 4,
            text: '要求工学について学んだ経路をお選びください（最大4つ）',
            options: [
              { v: 'class', label: '大学・大学院の講義' },
              { v: 'exercise', label: '演習・実習・グループワーク' },
              { v: 'book', label: '書籍・教科書' },
              { v: 'web', label: 'Web記事・動画' },
              { v: 'ojt', label: '職場での実務・指導' },
              { v: 'seminar', label: '社外の研修・勉強会' },
              { v: 'ai', label: '生成AIとの対話' },
              { v: 'none', label: '学んだことはありません' }
            ]
          },
          {
            id: 'c2', type: 'single',
            text: '要求工学は、いまのご自身にとってどのような位置づけですか',
            options: [
              { v: 'core', label: '中心的に取り組んでいる主題です' },
              { v: 'related', label: '関心はありますが中心ではありません' },
              { v: 'need', label: '必要に迫られて学んでいます' },
              { v: 'unknown', label: 'よく分かっていません' }
            ]
          },
          { id: 'c3', type: 'text', maxlen: 300, required: false, text: '要求工学を学ぶうえで難しいと感じることがあれば、お書きください（任意）' }
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════
  // 2. 生成AI活用実態調査
  // ════════════════════════════════════════════════════════
  {
    id: 'ai-practice',
    title: '生成AI活用実態調査',
    eyebrow: 'AI Practice',
    color: '#7c6cf0',
    status: 'open',
    minutes: 7,
    summary: '要求定義のどの局面で生成AIが使われ、どこで有効に働き、どこで不十分なのかを調べます。',
    purpose:
      'この調査の目的は、要求を定めるという営みのどの局面で生成AIが実際に使われているのかを、局面ごとに分けて把握することにあります。' +
      '「AIを使っているか」という粗い問いでは、何も見えてきません。目的を明確にする局面と、文書を清書する局面とでは、AIの働き方はまったく異なるからです。' +
      'ここでは活用度・有効性・懸念の三つの面から尋ね、AIが人の思考を助けている場所と、かえって妨げている場所とを見分けます。',
    conditions: [
      '所要時間は7分程度です。設問は22問で、うち記述式は1問（任意）です。',
      '生成AIを使った経験がない方も、そのままお答えいただけます（「使っていません」をお選びください）。',
      '特定の製品を評価する調査ではありません。用途の分布を見るための調査です。',
      '氏名・所属機関名・連絡先は採取しません。'
    ],
    policy:
      '結果は、まず局面ごとの活用度の分布として示します。次に、有効性と懸念を対比させ、' +
      '「よく使われているが有効性の実感が低い局面」と「使われていないが有効性が高いと見られている局面」を抜き出します。' +
      'つまり、活用の実態と手応えのずれこそが、この調査で最も見たいものだということになります。',
    sections: [
      {
        id: 'A',
        label: '局面別の活用度',
        color: '#7c6cf0',
        note: '要求を定めるそれぞれの局面で、生成AIをどの程度使っていますか。',
        questions: [
          { id: 'a1', type: 'likert', text: '〈目的〉を明確にする', scale: S_USE },
          { id: 'a2', type: 'likert', text: '利害関係者を洗い出す', scale: S_USE },
          { id: 'a3', type: 'likert', text: '現状の業務や仕組みを理解し整理する', scale: S_USE },
          { id: 'a4', type: 'likert', text: '要求を抽出し、発想を広げる', scale: S_USE },
          { id: 'a5', type: 'likert', text: '要求を文書として書き表す', scale: S_USE },
          { id: 'a6', type: 'likert', text: '矛盾や抜け漏れを点検する', scale: S_USE },
          { id: 'a7', type: 'likert', text: '用語を整理し、用語集を作る', scale: S_USE },
          { id: 'a8', type: 'likert', text: 'モデル図や表を作成する', scale: S_USE }
        ]
      },
      {
        id: 'B',
        label: '有効性の実感',
        color: '#4aad7a',
        note: '生成AIを使ったとき、次の点でどの程度役に立ったと感じますか。',
        questions: [
          { id: 'b1', type: 'likert', text: '発想が広がること', scale: S_HELP },
          { id: 'b2', type: 'likert', text: '文書を作る速さ', scale: S_HELP },
          { id: 'b3', type: 'likert', text: '抜け漏れの発見', scale: S_HELP },
          { id: 'b4', type: 'likert', text: '表現の分かりやすさ', scale: S_HELP },
          { id: 'b5', type: 'likert', text: '関係者の合意づくり', scale: S_HELP },
          { id: 'b6', type: 'likert', text: '自分の考えの整理', scale: S_HELP }
        ]
      },
      {
        id: 'C',
        label: '懸念',
        color: '#b5651d',
        note: '生成AIを要求定義に使うにあたって、次のことをどの程度感じますか。',
        questions: [
          { id: 'c1', type: 'likert', text: '出力の正しさを確かめきれません', scale: S_WORRY },
          { id: 'c2', type: 'likert', text: 'もっともらしい誤りが混じります', scale: S_WORRY },
          { id: 'c3', type: 'likert', text: '前提や文脈がうまく伝わりません', scale: S_WORRY },
          { id: 'c4', type: 'likert', text: '自分で考える力が落ちていきます', scale: S_WORRY },
          { id: 'c5', type: 'likert', text: '機密情報の取り扱いが心配です', scale: S_WORRY },
          { id: 'c6', type: 'likert', text: '責任の所在があいまいになります', scale: S_WORRY }
        ]
      },
      {
        id: 'D',
        label: '使い方',
        color: '#6b3e8c',
        questions: [
          {
            id: 'd1', type: 'single',
            text: '生成AIとのやりとりで、ご自身に最も近いものをお選びください',
            options: [
              { v: 'answer', label: '答えを出してもらうために使います' },
              { v: 'draft', label: 'たたき台を作らせ、自分で仕上げます' },
              { v: 'dialog', label: '考えを整理するための対話相手として使います' },
              { v: 'check', label: '自分の成果物を点検させるために使います' },
              { v: 'none', label: '使っていません' }
            ]
          },
          { id: 'd2', type: 'text', maxlen: 300, required: false, text: 'AIに任せてよいと感じる作業、任せたくないと感じる作業があれば、お書きください（任意）' }
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════
  // 3. 要求定義の困難度調査
  // ════════════════════════════════════════════════════════
  {
    id: 're-difficulty',
    title: '要求定義の困難度調査',
    eyebrow: 'Difficulty Map',
    color: '#d4488f',
    status: 'open',
    minutes: 5,
    analysis: 'matrix',
    matrix: { x: { sec: 'I', label: '重要度' }, y: { sec: 'D', label: '困難度' }, items: RE_TASKS },
    summary: '要求定義の10の作業について、重要度と困難度の二軸で尋ね、その差から難所を描き出します。',
    purpose:
      'この調査の目的は、要求を定めるという営みのなかで、どこに難所があるのかを地図として描き出すことにあります。' +
      '同じ10の作業について〈重要度〉と〈困難度〉を別々に尋ね、その差を取ります。' +
      '重要でありながら難しい作業こそが、方法論と道具立てを最も必要としている場所である、と考えられるからです。',
    conditions: [
      '所要時間は5分程度です。設問は20問で、記述式はありません。',
      '同じ10項目について、重要度と困難度を続けてお尋ねします。',
      '実務経験のない方は、学習や演習での実感に基づいてお答えください。',
      '氏名・所属機関名・連絡先は採取しません。'
    ],
    policy:
      '結果は、重要度を横軸・困難度を縦軸とする散布図として示します。右上に位置する作業が、優先して取り組むべき難所ということになります。' +
      'さらに、プロフィールの〈立場〉によって難所の位置がどう動くかを比較します。' +
      '学ぶ側と実務の側とで難所が異なるのであれば、教育の重点と現場の重点とがずれていることになります。',
    sections: [
      { id: 'I', label: '重要度', color: '#2e74b5', note: '次の作業は、良い要求を得るうえでどれくらい重要だと思いますか。', questions: importanceItems },
      { id: 'D', label: '困難度', color: '#d4488f', note: '同じ作業について、実際にはどれくらい難しいと感じますか。', questions: difficultyItems }
    ]
  },

  // ════════════════════════════════════════════════════════
  // 4. 要求思考の特性セルフチェック
  // ════════════════════════════════════════════════════════
  {
    id: 're-thinking',
    title: '要求思考の特性セルフチェック',
    eyebrow: 'Self Check',
    color: '#4aad7a',
    status: 'open',
    minutes: 5,
    feedback: 'sections',
    summary: '〈目的〉〈抽象化・具体化〉〈コミュニケーション〉の三本柱から、思考の傾向を確認します。回答直後に結果が出ます。',
    purpose:
      'この調査の目的は、要求を定めるときの思考の傾向を、三つの柱に沿って自ら確かめられるようにすることにあります。' +
      '拠りどころとするのは、〈目的〉〈抽象化・具体化〉〈コミュニケーション〉という三本柱です。' +
      '優劣を判定するものではありません。どの柱に重心が寄っているかを知ることが、次に何を伸ばすかを考える手がかりになります。',
    conditions: [
      '所要時間は5分程度です。設問は15問で、記述式はありません。',
      '回答を送信すると、その場で三本柱それぞれの傾向が表示されます。',
      '能力を測定する検査ではありません。自己認識を整理するための道具です。',
      '氏名・所属機関名・連絡先は採取しません。'
    ],
    policy:
      '結果は、三本柱それぞれの平均として個人にただちに返します。あわせて全体の分布のなかでの位置も示します。' +
      '集計としては、プロフィールの〈要求工学の学習レベル〉および〈生成AIの活用経験〉との関係を見ます。' +
      'つまり、学習や経験が三本柱のどれを先に育てるのかを、分布の変化から検討することになります。',
    sections: [
      {
        id: 'P',
        label: '目的',
        color: '#2e74b5',
        note: 'ふだんの仕事や学習をふりかえって、あてはまる度合いをお選びください。',
        questions: [
          { id: 'p1', type: 'likert', text: '作業に入る前に「何のためか」を確かめます', scale: S_AGREE },
          { id: 'p2', type: 'likert', text: '依頼された内容の背後にある狙いを問い直します', scale: S_AGREE },
          { id: 'p3', type: 'likert', text: '目的が曖昧なまま進むことに落ち着かなさを感じます', scale: S_AGREE },
          { id: 'p4', type: 'likert', text: '手段の議論が長引くと、目的に立ち返って整理します', scale: S_AGREE },
          { id: 'p5', type: 'likert', text: '目的が変わったときは、決めたことを見直します', scale: S_AGREE }
        ]
      },
      {
        id: 'A',
        label: '抽象化・具体化',
        color: '#6b3e8c',
        questions: [
          { id: 'a1', type: 'likert', text: '個別の事例から、共通する型を取り出します', scale: S_AGREE },
          { id: 'a2', type: 'likert', text: '抽象的な話は、具体例に置き換えて確かめます', scale: S_AGREE },
          { id: 'a3', type: 'likert', text: '考えを図や表にして整理します', scale: S_AGREE },
          { id: 'a4', type: 'likert', text: '例外や特殊な場合を意識しながら一般化します', scale: S_AGREE },
          { id: 'a5', type: 'likert', text: '話すときに概念の粒度をそろえます', scale: S_AGREE }
        ]
      },
      {
        id: 'C',
        label: 'コミュニケーション',
        color: '#b5651d',
        questions: [
          { id: 'c1', type: 'likert', text: '相手の言葉づかいに合わせて説明を変えます', scale: S_AGREE },
          { id: 'c2', type: 'likert', text: '分かったつもりを避け、言い換えて確認します', scale: S_AGREE },
          { id: 'c3', type: 'likert', text: '意見の違いを、対立ではなく理解の材料として扱います', scale: S_AGREE },
          { id: 'c4', type: 'likert', text: '自分の理解が変わったことを率直に伝えます', scale: S_AGREE },
          { id: 'c5', type: 'likert', text: '話し合いのあと、認識のずれが残っていないか確かめます', scale: S_AGREE }
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════
  // 5. 期待される要求技術者像ギャップ調査
  // ════════════════════════════════════════════════════════
  {
    id: 'role-image',
    title: '期待される要求技術者像ギャップ調査',
    eyebrow: 'Role Image',
    color: '#0f8f9e',
    status: 'open',
    minutes: 6,
    analysis: 'gap',
    gap: {
      field: 'pos',
      groups: [
        { label: '学ぶ側', values: ['ug12', 'ug34', 'grad'] },
        { label: '実務・指導の側', values: ['teacher', 'proIT', 'proOther'] }
      ],
      mid: 0.5, big: 1.0
    },
    summary: 'AI時代の要求技術者に求められる力について、学ぶ側と実務の側の認識差を明らかにします。',
    purpose:
      'この調査の目的は、AI時代の要求技術者に求められる力について、学ぶ側と実務の側とで認識がどれだけ隔たっているかを測ることにあります。' +
      '同じ16項目を両者に尋ね、その差を取ります。差が大きい項目は、教育の場で軽んじられているか、あるいは現場で言語化されていないかのいずれかです。' +
      'いずれにせよ、そこに橋を架けることが、要求工学を社会的な必要に応えるものにしていく道筋になります。',
    conditions: [
      '所要時間は6分程度です。設問は17問で、うち記述式は1問（任意）です。',
      'どの立場の方でも回答いただけます。立場の区分はプロフィールの回答から自動的に判定します。',
      '生成AIが普及した状況を前提としてお答えください。',
      '氏名・所属機関名・連絡先は採取しません。'
    ],
    policy:
      '結果は、立場（学ぶ側／実務の側）ごとの平均を並べ、差の大きい順に並べ替えて示します。' +
      '差が0.5以上の項目を「認識のずれ」として抜き出し、1.0以上を「大きなずれ」として扱います。' +
      'つまり、順位そのものよりも、両者の順位の食い違いに注目するということになります。',
    sections: [
      {
        id: 'A',
        label: '問いを立てる力',
        color: '#2e74b5',
        note: 'AI時代の要求技術者にとって、次の力はどれくらい重要だと思いますか。',
        questions: [
          { id: 'a1', type: 'likert', text: 'そもそも何が問題なのかを自ら見つけ出す力', scale: S_IMPORT },
          { id: 'a2', type: 'likert', text: '〈目的〉を言葉にして共有する力', scale: S_IMPORT },
          { id: 'a3', type: 'likert', text: '当然とされている前提を疑う力', scale: S_IMPORT }
        ]
      },
      {
        id: 'B',
        label: '抽象と具体を往復する力',
        color: '#6b3e8c',
        questions: [
          { id: 'b1', type: 'likert', text: '概念を定義し、意味を確定させる力', scale: S_IMPORT },
          { id: 'b2', type: 'likert', text: '対象をモデルとして表す力', scale: S_IMPORT },
          { id: 'b3', type: 'likert', text: '具体例に落として妥当性を確かめる力', scale: S_IMPORT }
        ]
      },
      {
        id: 'C',
        label: '対話の力',
        color: '#b5651d',
        questions: [
          { id: 'c1', type: 'likert', text: '相手から本当の必要を聞き出す力', scale: S_IMPORT },
          { id: 'c2', type: 'likert', text: '立場の異なる人のあいだで合意を作る力', scale: S_IMPORT },
          { id: 'c3', type: 'likert', text: '異なる分野の言葉を翻訳して橋を架ける力', scale: S_IMPORT }
        ]
      },
      {
        id: 'D',
        label: 'AIを使いこなす力',
        color: '#7c6cf0',
        questions: [
          { id: 'd1', type: 'likert', text: 'AIに適切な問いを与える力', scale: S_IMPORT },
          { id: 'd2', type: 'likert', text: 'AIの出力の正しさを検証する力', scale: S_IMPORT },
          { id: 'd3', type: 'likert', text: 'AIに任せる仕事と人が担う仕事を分ける力', scale: S_IMPORT }
        ]
      },
      {
        id: 'E',
        label: '職業人としての姿勢',
        color: '#4aad7a',
        questions: [
          { id: 'e1', type: 'likert', text: '決めたことの結果を引き受ける姿勢', scale: S_IMPORT },
          { id: 'e2', type: 'likert', text: '学び続け、自らの前提を更新する姿勢', scale: S_IMPORT },
          { id: 'e3', type: 'likert', text: '倫理的な観点から判断する姿勢', scale: S_IMPORT },
          { id: 'e4', type: 'likert', text: '決まらない状態に耐えながら進める姿勢', scale: S_IMPORT }
        ]
      },
      {
        id: 'F',
        label: '自由記述',
        color: '#6a727c',
        questions: [
          { id: 'f1', type: 'text', maxlen: 300, required: false, text: '上の16項目に含まれていないが重要だと思う力があれば、お書きください（任意）' }
        ]
      }
    ]
  }
];

export function seedDefinition() {
  return {
    version: SURVEY_SCHEMA_VERSION,
    updated: '2026-08-18',
    profile: PROFILE_FIELDS,
    surveys: SEED_SURVEYS
  };
}
