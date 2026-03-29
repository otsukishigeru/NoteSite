// =============================================
// js/knowledge.js — 大槻繁 note記事インデックス（全124件）
// 更新タイミング：新記事追加時
// ブラウザ・Node.js（Vercel）両対応
// =============================================

const knowledge = [
  {
    num: "001",
    title: "難しいことを難しいままに書く",
    category: "思考の技法",
    summary: "知識や思想を平易にするだけでは本質が失われる。難解さを保ちながら正確に伝えることの重要性を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/nbf0897ad7244"
  },
  {
    num: "002",
    title: "人働説から知働説へ",
    category: "組織論",
    summary: "体を動かす「人働き」から知識・思考を働かせる「知働き」へのパラダイムシフトを論じる。",
    url: "https://note.com/ichi_s_otsuki/n/na2c302d3063d"
  },
  {
    num: "003",
    title: "ソフトウェアってなんだろう？",
    category: "ソフトウェア学",
    summary: "ソフトウェアの本質的定義を問い直し、知働化時代における意味を探求する。",
    url: "https://note.com/ichi_s_otsuki/n/n4619e9d9b785"
  },
  {
    num: "004",
    title: "正しいコミュニケーションの定義",
    category: "思考の技法",
    summary: "コミュニケーションを学習・成長を伴う意味の修正・進化プロセスとして定義し直す。",
    url: "https://note.com/ichi_s_otsuki/n/n8929b2a0f9e0"
  },
  {
    num: "005",
    title: "便利な「モデル」という言葉",
    category: "思考の技法",
    summary: "モデルという概念の多義性を整理し、思考ツールとしての正確な使い方を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n9f6302a4e8d7"
  },
  {
    num: "006",
    title: "組織化の原理",
    category: "組織論",
    summary: "組織が形成・維持される根本原理を論じ、目的を中心とした組織設計を提唱する。",
    url: "https://note.com/ichi_s_otsuki/n/nec78e737848f"
  },
  {
    num: "007",
    title: "『思考の技法』の探求：その哲学",
    category: "哲学",
    summary: "思考の技法の哲学的基盤と探求の姿勢を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/ncb3f2b4ec0de"
  },
  {
    num: "008",
    title: "『思考の技法』におけるシステム学の系譜",
    category: "システム学",
    summary: "システム学の歴史的系譜を辿り、思考の技法への影響を明らかにする。",
    url: "https://note.com/ichi_s_otsuki/n/n172b9019fa1d"
  },
  {
    num: "009",
    title: "哲学の系譜：言語ゲーム・心の哲学・新実在論",
    category: "哲学",
    summary: "ウィトゲンシュタインからマルクス・ガブリエルへと続く哲学的系譜を解説する。",
    url: "https://note.com/ichi_s_otsuki/n/n6f6948f6fd13"
  },
  {
    num: "010",
    title: "『思考の技法』におけるデザイン学の系譜",
    category: "思考の技法",
    summary: "デザイン学の系譜を辿り、意味論的転回を思考の技法に位置づける。",
    url: "https://note.com/ichi_s_otsuki/n/n57983f7bfbe1"
  },
  {
    num: "011",
    title: "テクノロジー進化と民主主義の危機",
    category: "AI時代",
    summary: "デジタル技術の急進がもたらす民主主義への脅威を考察する。",
    url: "https://note.com/ichi_s_otsuki/n/n6662214eef0a"
  },
  {
    num: "012",
    title: "アイデンティティより他者性という形相",
    category: "哲学",
    summary: "自己同一性より他者との関係性・差異を重視するガブリエル哲学を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n660f2c273cae"
  },
  {
    num: "013",
    title: "ペンローズの世界観",
    category: "哲学",
    summary: "ロジャー・ペンローズの三世界論（物理世界・精神世界・数学世界）を解説する。",
    url: "https://note.com/ichi_s_otsuki/n/n7920a34b4f89"
  },
  {
    num: "014",
    title: "ソフトウェア学のパラダイムシフト史",
    category: "ソフトウェア学",
    summary: "ウォータフォールからアジャイル、そしてAI時代の知働化へのパラダイムシフト史を辿る。",
    url: "https://note.com/ichi_s_otsuki/n/n00cb318c636d"
  },
  {
    num: "015",
    title: "抽象化とは？",
    category: "思考の技法",
    summary: "対象を定式化し概念操作によって本質を把握する〈抽象化〉の技法を解説する。",
    url: "https://note.com/ichi_s_otsuki/n/n888bacf728eb"
  },
  {
    num: "016",
    title: "意味論的転回",
    category: "哲学",
    summary: "クリッペンドルフの意味論的転回とデザイン学・知働化への影響を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n536d8d698263"
  },
  {
    num: "017",
    title: "組織における目的の表明",
    category: "組織論",
    summary: "組織の存在意義としての〈目的〉を明確に表明することの重要性を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n6f8fb909a8a9"
  },
  {
    num: "018",
    title: "実感としてのパラダイムシフト",
    category: "思考の技法",
    summary: "パラダイムシフトを理論でなく実感として捉え直す視点を提示する。",
    url: "https://note.com/ichi_s_otsuki/n/nd22f81eb1b76"
  },
  {
    num: "019",
    title: "個人の能力と発達",
    category: "組織論",
    summary: "解像度・真摯さ・尊厳という三要素から個人の発達・成長を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/na0c34680dd60"
  },
  {
    num: "020",
    title: "ドラッカーの著作",
    category: "組織論",
    summary: "ピーター・ドラッカーの著作群と知働化思想への影響を解説する。",
    url: "https://note.com/ichi_s_otsuki/n/nd9a9a5d62478"
  },
  {
    num: "021",
    title: "ガブリエルの著作",
    category: "哲学",
    summary: "マルクス・ガブリエルの新実在論の著作群とその思想の核心を解説する。",
    url: "https://note.com/ichi_s_otsuki/n/nc158438083eb"
  },
  {
    num: "022",
    title: "オープンダイアローグという実践的手法",
    category: "思考の技法",
    summary: "対話による学習・成長を促すオープンダイアローグの理論と実践を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n383660906676"
  },
  {
    num: "023",
    title: "心理 語りえぬもの",
    category: "哲学",
    summary: "ウィトゲンシュタインの「語りえないものについては沈黙せよ」と心の哲学を考察する。",
    url: "https://note.com/ichi_s_otsuki/n/n3f3c6bf5298c"
  },
  {
    num: "024",
    title: "複雑性の諸概念と対処",
    category: "システム学",
    summary: "複雑系における複雑性の種類を整理し、組織・システムとしての対処法を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n9ee645634f6e"
  },
  {
    num: "025",
    title: "ベルガンディと思考の技法との比較",
    category: "思考の技法",
    summary: "Roberto Vergantiのデザイン駆動イノベーション論と思考の技法を比較考察する。",
    url: "https://note.com/ichi_s_otsuki/n/n9ee139942bb4"
  },
  {
    num: "026",
    title: "『思考の技法』の世界観：実行可能知識",
    category: "思考の技法",
    summary: "実際の行動・実践に変換できる〈実行可能知識〉の定義と構成を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n580e279b6b65"
  },
  {
    num: "027",
    title: "缶詰会という試み",
    category: "組織論",
    summary: "合宿形式による集中的な対話・知識構成の実験的試みを紹介する。",
    url: "https://note.com/ichi_s_otsuki/n/nb2a87b33833c"
  },
  {
    num: "028",
    title: "東大話法というハラスメント",
    category: "哲学",
    summary: "権威的・論点ずらし的な言語使用をハラスメントとして批判し、真のコミュニケーションを問う。",
    url: "https://note.com/ichi_s_otsuki/n/n685b8ad323aa"
  },
  {
    num: "029",
    title: "ヴィトゲンシュタインの著作",
    category: "哲学",
    summary: "言語ゲーム論を提唱したウィトゲンシュタインの主要著作と思想を解説する。",
    url: "https://note.com/ichi_s_otsuki/n/nd18d52190399"
  },
  {
    num: "030",
    title: "X = ソフトウェア化",
    category: "ソフトウェア学",
    summary: "あらゆる産業・領域のソフトウェア化という現象とその含意を分析する。",
    url: "https://note.com/ichi_s_otsuki/n/n1fd7417e9517"
  },
  {
    num: "031",
    title: "知働化をテーマとするシンポジウム企画",
    category: "シンポジウム",
    summary: "知働化をテーマとするシンポジウムの趣旨・構成・企画内容を紹介する。",
    url: "https://note.com/ichi_s_otsuki/n/n9a863b5ec717"
  },
  {
    num: "032",
    title: "〔対談〕人働説から知働説へ",
    category: "対談",
    summary: "対談形式で人働説から知働説へのパラダイムシフトを多角的に論じる。",
    url: "https://note.com/ichi_s_otsuki/n/nf53043ce4148"
  },
  {
    num: "033",
    title: "〔対談〕AI領域で起こっていること 第１回",
    category: "対談",
    summary: "AI技術の最前線で起きている変化と知働化への影響を対談で探る（第1回）。",
    url: "https://note.com/ichi_s_otsuki/n/n47be6c84c581"
  },
  {
    num: "034",
    title: "〔対談〕AI領域で起こっていること 第2回",
    category: "対談",
    summary: "AI技術の最前線で起きている変化と知働化への影響を対談で探る（第2回）。",
    url: "https://note.com/ichi_s_otsuki/n/n6ac3e967a0a5"
  },
  {
    num: "035",
    title: "〔対談〕システム思考とAIシステム１・２・３",
    category: "対談",
    summary: "システム思考とAIの三段階進化モデルを対談形式で論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n4d40255a14b8"
  },
  {
    num: "036",
    title: "プラグマティズムとは？",
    category: "哲学",
    summary: "実践的有用性を真理の基準とするプラグマティズム哲学の本質を解説する。",
    url: "https://note.com/ichi_s_otsuki/n/n0da9890f40d8"
  },
  {
    num: "037",
    title: "発達の本質：解像度・真摯さ・尊厳",
    category: "組織論",
    summary: "人の成長・発達を解像度・真摯さ・尊厳の三要素で捉えるモデルを提示する。",
    url: "https://note.com/ichi_s_otsuki/n/n250790eaf2c8"
  },
  {
    num: "038",
    title: "生命・進化と計算理論の系譜",
    category: "システム学",
    summary: "生命科学・進化論と計算理論の交叉点を系譜として描き知働化に接続する。",
    url: "https://note.com/ichi_s_otsuki/n/nb39f2055353e"
  },
  {
    num: "039",
    title: "実世界埋込型 抽象山モデル",
    category: "思考の技法",
    summary: "実世界に埋め込まれた知識の抽象階層を「抽象山」モデルとして可視化・定式化する。",
    url: "https://note.com/ichi_s_otsuki/n/nb61684c10bed"
  },
  {
    num: "040",
    title: "知を構成していくということ",
    category: "思考の技法",
    summary: "知識は外から与えられるものではなく、問い・探求・対話を通じて自ら構成するものである。",
    url: "https://note.com/ichi_s_otsuki/n/n38467b1d6ebb"
  },
  {
    num: "041",
    title: "実行可能知識とΛＶモデル",
    category: "ソフトウェア学",
    summary: "実践に変換できる知識とΛVモデルの関係性・活用法を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n5a99c0d76792"
  },
  {
    num: "042",
    title: "IT-CMF",
    category: "ソフトウェア学",
    summary: "IT能力成熟度フレームワーク（IT-CMF）を知働化・組織進化の観点から解説する。",
    url: "https://note.com/ichi_s_otsuki/n/n432f1b3db371"
  },
  {
    num: "043",
    title: "予測：科学的アプローチ",
    category: "思考の技法",
    summary: "科学的手法による予測・フォーキャストの思考法と知働化への応用を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n8720a663d73c"
  },
  {
    num: "044",
    title: "超マシンという抽象化",
    category: "システム学",
    summary: "コンピュータと人・組織を統一的に抽象化した〈超マシン〉概念を定義・解説する。",
    url: "https://note.com/ichi_s_otsuki/n/n18aac7e8b3c4"
  },
  {
    num: "045",
    title: "知働化辞典",
    category: "思考の技法",
    summary: "知働化に関する主要概念・用語を辞典形式で整理・解説する。",
    url: "https://note.com/ichi_s_otsuki/n/n58523081b375"
  },
  {
    num: "046",
    title: "知働化探求史",
    category: "思考の技法",
    summary: "知働化という概念が形成・深化してきた歴史的経緯を辿る。",
    url: "https://note.com/ichi_s_otsuki/n/nf9700fbfc4b3"
  },
  {
    num: "047",
    title: "人財の二極化",
    category: "組織論",
    summary: "AI時代における創造的人財（アーキテクト型）と技能型人財への二極化を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n3b2e95dfe869"
  },
  {
    num: "048",
    title: "アーキテクトに要請される能力",
    category: "組織論",
    summary: "知識時代のアーキテクトに求められる知的能力・資質を提示する。",
    url: "https://note.com/ichi_s_otsuki/n/nd1291ee163b2"
  },
  {
    num: "049",
    title: "言語ゲームがもたらすパラダイムシフト",
    category: "哲学",
    summary: "ウィトゲンシュタインの言語ゲーム論がもたらす認識の根本的転換を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n3c5047391680"
  },
  {
    num: "050",
    title: "目的策定＝存在意義のデザイン",
    category: "組織論",
    summary: "〈目的〉を策定することは単なる目標設定を超えた存在意義そのものをデザインする行為である。",
    url: "https://note.com/ichi_s_otsuki/n/n94c8b5fed7c6"
  },
  {
    num: "051",
    title: "思考の技法：HIとAIのための新実在論",
    category: "哲学",
    summary: "ガブリエルの新実在論を基盤に、人間知能とAI双方に適した思考の哲学的基盤を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n5d956db3dc96"
  },
  {
    num: "052",
    title: "理性・知性・感性の限界",
    category: "哲学",
    summary: "人間の三つの認知能力（理性・知性・感性）の限界と相互補完を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n766e5a55ea44"
  },
  {
    num: "053",
    title: "用語「アーキテクチャ」の再定義",
    category: "組織論",
    summary: "ソフトウェア・組織を横断するアーキテクチャ概念を知働化の文脈で再定義する。",
    url: "https://note.com/ichi_s_otsuki/n/nb44939fcb380"
  },
  {
    num: "054",
    title: "システム：オープン/クローズ 自律/他律",
    category: "システム学",
    summary: "システムの基本分類軸としてオープン/クローズ・自律/他律の二軸を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/nffc808178501"
  },
  {
    num: "055",
    title: "セル組織：自律的チームの様相",
    category: "組織論",
    summary: "自律的な小チーム（セル）による組織運営の原理と知働化組織への適用を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/naf9beca1a043"
  },
  {
    num: "056",
    title: "オートポイエーシス・システムの定式化",
    category: "システム学",
    summary: "ルーマンのオートポイエーシス論を定式化し、組織・知識システムへの応用を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n3e9c67063648"
  },
  {
    num: "057",
    title: "対談：ソフトウェア・アーキテクト",
    category: "対談",
    summary: "ソフトウェアアーキテクトの役割・資質・知働化時代の位置づけを対談で掘り下げる。",
    url: "https://note.com/ichi_s_otsuki/n/na518065671dd"
  },
  {
    num: "058",
    title: "表紙が示す知働化作品群の全体像",
    category: "思考の技法",
    summary: "知働化作品群の全体的な構成・位置づけ・一貫性を表紙デザインから読み解く。",
    url: "https://note.com/ichi_s_otsuki/n/n8b69dbca055d"
  },
  {
    num: "059",
    title: "思考停止の技法",
    category: "思考の技法",
    summary: "思考停止という呪縛を自覚し解放するための逆説的技法を提示する。",
    url: "https://note.com/ichi_s_otsuki/n/nf10c8a4bf0bc"
  },
  {
    num: "060",
    title: "対談：出版における昭和の幻想からの脱却",
    category: "対談",
    summary: "出版業界に残る旧来的発想（昭和の幻想）からの脱却を対談形式で論じる。",
    url: "https://note.com/ichi_s_otsuki/n/nd0990fc75009"
  },
  {
    num: "061",
    title: "Symposium2025への参加要領",
    category: "シンポジウム",
    summary: "Symposium2025の参加方法・スケジュール・テーマを案内する。",
    url: "https://note.com/ichi_s_otsuki/n/n5d0cd4e325a1"
  },
  {
    num: "062",
    title: "ベルタランフィの一般システム論",
    category: "システム学",
    summary: "ルートヴィヒ・フォン・ベルタランフィの一般システム論の骨格と知働化への含意を解説する。",
    url: "https://note.com/ichi_s_otsuki/n/n3569f5e552ef"
  },
  {
    num: "063",
    title: "ハイグラフによる図式の定式化",
    category: "ソフトウェア学",
    summary: "ハイグラフを用いたシステム・構造の図式化手法とその応用を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/nc9ec8db607a6"
  },
  {
    num: "064",
    title: "ソフトウェア・セル組織論",
    category: "ソフトウェア学",
    summary: "ソフトウェア開発へのセル組織論の適用と知働化プロセスの実践を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n31c9a853dce6"
  },
  {
    num: "065",
    title: "組織知能：知の三位一体説",
    category: "組織論",
    summary: "暗黙知・形式知・実践知の三位一体として組織知能を捉えるモデルを提示する。",
    url: "https://note.com/ichi_s_otsuki/n/ne015c297417d"
  },
  {
    num: "066",
    title: "変化対応から適応進化へ",
    category: "組織論",
    summary: "変化への「対応」から自律的「適応進化」への組織的転換を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n325181484944"
  },
  {
    num: "067",
    title: "普遍的なモジュール概念",
    category: "システム学",
    summary: "ソフトウェア・組織・思考に共通する普遍的なモジュール概念を定義・解説する。",
    url: "https://note.com/ichi_s_otsuki/n/naded0c7ee088"
  },
  {
    num: "068",
    title: "ミームによるディスコース醸成",
    category: "思考の技法",
    summary: "ミーム（文化的遺伝子）を活用した組織文化・言説（ディスコース）の形成を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/nf43c31d174d8"
  },
  {
    num: "069",
    title: "作品群の一貫性保持",
    category: "思考の技法",
    summary: "124本の作品群全体に哲学的一貫性を保つための方法論と意図を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/ne36cfe08fdcc"
  },
  {
    num: "070",
    title: "ドーキンスと進化論",
    category: "システム学",
    summary: "リチャード・ドーキンスの進化論・ミーム論を知働化・組織進化に接続して論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n3f5d362b5f92"
  },
  {
    num: "071",
    title: "AIとの対話",
    category: "AI時代",
    summary: "人間知能（HI）とAIが対話・協働する新しい形と知働化への影響を考察する。",
    url: "https://note.com/ichi_s_otsuki/n/n4473b1487e59"
  },
  {
    num: "072",
    title: "デザインにおける概念創造",
    category: "思考の技法",
    summary: "デザイン学における概念の創造プロセスと意味論的転回の関係を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/nb835d5988718"
  },
  {
    num: "073",
    title: "〔対談〕アジャイルプロセス",
    category: "対談",
    summary: "アジャイル開発の本質・現場での実践・知働化との関係を対談形式で掘り下げる。",
    url: "https://note.com/ichi_s_otsuki/n/ndffe5b7af362"
  },
  {
    num: "074",
    title: "Symposium2025 トラック企画",
    category: "シンポジウム",
    summary: "Symposium2025の各トラックの企画内容・テーマ・ねらいを詳説する。",
    url: "https://note.com/ichi_s_otsuki/n/nff8638bd6178"
  },
  {
    num: "075",
    title: "思考の技法 / セル組織に関するQA",
    category: "組織論",
    summary: "セル組織論に関する読者の質問への回答を通じて理解を深める。",
    url: "https://note.com/ichi_s_otsuki/n/n706d71866595"
  },
  {
    num: "076",
    title: "『思考の技法』各章始めのエピグラフ",
    category: "思考の技法",
    summary: "各章冒頭に置いた格言・引用の意図と思想的位置づけを解説する。",
    url: "https://note.com/ichi_s_otsuki/n/n94a588e273fb"
  },
  {
    num: "077",
    title: "思考の技法 / セル組織論 FAQ（前半）",
    category: "組織論",
    summary: "セル組織論に関するよくある質問への回答（前半）。理論的基盤を中心に解説する。",
    url: "https://note.com/ichi_s_otsuki/n/nf1e49d2b7b67"
  },
  {
    num: "078",
    title: "思考の技法 / セル組織論 FAQ（後半）",
    category: "組織論",
    summary: "セル組織論に関するよくある質問への回答（後半）。実践・応用を中心に解説する。",
    url: "https://note.com/ichi_s_otsuki/n/nf799035d2e1b"
  },
  {
    num: "079",
    title: "ソフトウェアセルの起源",
    category: "ソフトウェア学",
    summary: "ソフトウェアセル概念の起源・由来と知働化思想への発展の歴史を辿る。",
    url: "https://note.com/ichi_s_otsuki/n/n2dc78b56b391"
  },
  {
    num: "080",
    title: "本質的困難への学際的アプローチ",
    category: "思考の技法",
    summary: "複雑な本質的問題への学際的・横断的なアプローチと思考の技法の役割を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n89de2e338de5"
  },
  {
    num: "081",
    title: "死の行進からの脱却",
    category: "ソフトウェア学",
    summary: "ソフトウェアプロジェクトの崩壊（死の行進）から根本的に脱却するための方法論を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n861e3979bfeb"
  },
  {
    num: "082",
    title: "オートポイエーシス論の本質的困難",
    category: "システム学",
    summary: "オートポイエーシス論が抱える根本的困難と限界を分析し、克服の方向性を示す。",
    url: "https://note.com/ichi_s_otsuki/n/n4f993f8c6a97"
  },
  {
    num: "083",
    title: "人は言語によって思考するのか？",
    category: "哲学",
    summary: "言語と思考の関係性を哲学的に問い直し、言語ゲーム論の含意を探る。",
    url: "https://note.com/ichi_s_otsuki/n/n69f23f6ea6f7"
  },
  {
    num: "084",
    title: "『思考の技法の歩き方』へ向けて",
    category: "思考の技法",
    summary: "入門書的ガイドとしての『思考の技法の歩き方』の構想と読者へのメッセージを伝える。",
    url: "https://note.com/ichi_s_otsuki/n/na280c372a818"
  },
  {
    num: "085",
    title: "仏教の御利益",
    category: "哲学",
    summary: "仏教思想が提供する認識・思考の転換を知働化・哲学の視点から考察する。",
    url: "https://note.com/ichi_s_otsuki/n/nae587fcbdd2a"
  },
  {
    num: "086",
    title: "旧 序文より",
    category: "思考の技法",
    summary: "思考の技法の旧版序文から知働化思想の原点・出発点を振り返る。",
    url: "https://note.com/ichi_s_otsuki/n/n733b7dac4648"
  },
  {
    num: "087",
    title: "旧 序文より 続き",
    category: "思考の技法",
    summary: "旧版序文の続きから「昨日の安穏の延長線上に明日はない」という核心思想を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/ne4ecd4e45d87"
  },
  {
    num: "088",
    title: "思考の技法 新訂版 の構想",
    category: "思考の技法",
    summary: "新訂版として再編・拡充した構想と改訂の意図・全体像を説明する。",
    url: "https://note.com/ichi_s_otsuki/n/n46f1e4a9089d"
  },
  {
    num: "089",
    title: "思考の技法 / 序",
    category: "思考の技法",
    summary: "なぜ今この書を著すかという根本的問いを提示する序文。",
    url: "https://note.com/ichi_s_otsuki/n/n25bc7e7d2c1e"
  },
  {
    num: "090",
    title: "思考の技法 / 第１章 思考の技法とは何か？",
    category: "思考の技法",
    summary: "思考の技法の定義・全体像・本書の目的と位置づけを論じる第1章。",
    url: "https://note.com/ichi_s_otsuki/n/n92ce7b899f28"
  },
  {
    num: "091",
    title: "思考の技法 / 第2章 核心概念",
    category: "思考の技法",
    summary: "〈目的〉〈抽象化〉〈コミュニケーション〉の三核心概念を体系的に解説する第2章。",
    url: "https://note.com/ichi_s_otsuki/n/nbdbc53e58fed"
  },
  {
    num: "092",
    title: "思考の技法 / 第3章 哲学",
    category: "哲学",
    summary: "ウィトゲンシュタイン・ガブリエル・ペンローズ等の哲学的基盤を論じる第3章。",
    url: "https://note.com/ichi_s_otsuki/n/n6ba38c447264"
  },
  {
    num: "093",
    title: "思考の技法 / 第4章 システム",
    category: "システム学",
    summary: "オートポイエーシス・複雑性・超マシン等のシステム学を解説する第4章。",
    url: "https://note.com/ichi_s_otsuki/n/nbdd40e43dade"
  },
  {
    num: "094",
    title: "思考の技法 / 第7章 7.2 知働化AIフレーム",
    category: "AI時代",
    summary: "HI（人間知能）とAIの役割分担フレームを提示するトピックス章。",
    url: "https://note.com/ichi_s_otsuki/n/n215da49b6fa5"
  },
  {
    num: "095",
    title: "思考の技法 / 第5章 組織と能力",
    category: "組織論",
    summary: "セル組織・アーキテクト・人財発達等の組織論を体系的に論じる第5章。",
    url: "https://note.com/ichi_s_otsuki/n/n40e5351351db"
  },
  {
    num: "096",
    title: "思考の技法 / 第6章 6.1 三位一体モデル",
    category: "思考の技法",
    summary: "IT・人・組織を統合する三位一体モデルを解説する応用技法章。",
    url: "https://note.com/ichi_s_otsuki/n/n23ae1db2d039"
  },
  {
    num: "097",
    title: "思考の技法 / 第6章 6.2 ペンローズ法",
    category: "思考の技法",
    summary: "三世界論に基づく円環的思考技法〈ペンローズ法〉を解説する応用技法章。",
    url: "https://note.com/ichi_s_otsuki/n/n1d94f866ef63"
  },
  {
    num: "098",
    title: "思考の技法 / 第6章 6.3 ΛＶモデル",
    category: "ソフトウェア学",
    summary: "実行可能知識と意味論的転回を結ぶ〈ΛVモデル〉を解説する応用技法章。",
    url: "https://note.com/ichi_s_otsuki/n/n9acf24563c5f"
  },
  {
    num: "099",
    title: "思考の技法 / 第6章 6.4 超マシン",
    category: "システム学",
    summary: "コンピュータと人・組織を統一する〈超マシン〉概念を解説する応用技法章。",
    url: "https://note.com/ichi_s_otsuki/n/nc4172bd35ee6"
  },
  {
    num: "100",
    title: "思考の技法 / 第6章 6.5 オープンダイアローグ",
    category: "思考の技法",
    summary: "対話による共同知識構成手法〈オープンダイアローグ〉を解説する応用技法章。",
    url: "https://note.com/ichi_s_otsuki/n/na67ca4778f0b"
  },
  {
    num: "101",
    title: "思考の技法 / 第6章 6.6 思考停止の技法",
    category: "思考の技法",
    summary: "思考停止という呪縛から解放される逆説的技法を解説する応用技法章。",
    url: "https://note.com/ichi_s_otsuki/n/n12fd603d7bc4"
  },
  {
    num: "102",
    title: "思考の技法 / 第6章 6.7 ディスコースとミーム",
    category: "思考の技法",
    summary: "文化・言説（ディスコース）デザインとミームの役割を論じる応用技法章。",
    url: "https://note.com/ichi_s_otsuki/n/n86143f15a64a"
  },
  {
    num: "103",
    title: "思考の技法 / 第7章 7.3 ラディカル知働化プロセス",
    category: "ソフトウェア学",
    summary: "知働化の根本的プロセスを論じるトピックス章。",
    url: "https://note.com/ichi_s_otsuki/n/n37887a428829"
  },
  {
    num: "104",
    title: "思考の技法 / 第7章 7.1 目的なきシステムの混迷",
    category: "システム学",
    summary: "〈目的〉を持たないシステムが陥る混迷を論じるトピックス章。",
    url: "https://note.com/ichi_s_otsuki/n/n3c9c47fda00b"
  },
  {
    num: "105",
    title: "思考の技法 / 終章 執筆後記",
    category: "思考の技法",
    summary: "執筆の経緯・苦労・想いと読者へのメッセージを後記として記す。",
    url: "https://note.com/ichi_s_otsuki/n/n67e7f7749705"
  },
  {
    num: "106",
    title: "Symposium2025の意義",
    category: "シンポジウム",
    summary: "Symposium2025が知働化の普及・対話の促進にもつ意義と目的を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n1ffbdca6dbe3"
  },
  {
    num: "107",
    title: "作品の後処理",
    category: "思考の技法",
    summary: "note発表後の作品の整理・発展・再活用プロセスを論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n1a5971e8528b"
  },
  {
    num: "108",
    title: "Symposium2025のトラック「HIとAI」",
    category: "シンポジウム",
    summary: "HIとAIの協働をテーマとするシンポジウムトラックの詳細企画を紹介する。",
    url: "https://note.com/ichi_s_otsuki/n/n9773b51e1fc5"
  },
  {
    num: "109",
    title: "期待と現実とのギャップ",
    category: "組織論",
    summary: "組織・プロジェクトにおける期待と現実のギャップの構造と対処を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/nfaf8a984c0a9"
  },
  {
    num: "110",
    title: "人間知能の思考法",
    category: "AI時代",
    summary: "AI時代に人間固有の知能・思考法をどう活かすかを〈知働化AIフレーム〉で論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n9e970478fbeb"
  },
  {
    num: "111",
    title: "偉人・賢人のフォロー",
    category: "思考の技法",
    summary: "知的巨人の著作を深く学び「肩の上に立つ」ことで独自の思考の高みに達する方法を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/nc8d9149f100b"
  },
  {
    num: "112",
    title: "情報ネットワーク社会のデザイン",
    category: "AI時代",
    summary: "情報ネットワーク社会の設計原理と知働化・民主主義への含意を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/nb2ad202f28b0"
  },
  {
    num: "113",
    title: "サールの社会存在論：社会的世界の制作",
    category: "哲学",
    summary: "ジョン・サールの社会存在論・集合的志向性を解説し、組織・社会の成立原理を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n957275fe758c"
  },
  {
    num: "114",
    title: "オートポイエーシス論再考",
    category: "システム学",
    summary: "オートポイエーシス論を現代的視点から再考・再解釈し、知働化への接続を試みる。",
    url: "https://note.com/ichi_s_otsuki/n/ne983203c7465"
  },
  {
    num: "115",
    title: "AIのプラトン表現への収斂",
    category: "AI時代",
    summary: "AIが生成する表現がプラトン的理想形に収斂するという現象を哲学的に考察する。",
    url: "https://note.com/ichi_s_otsuki/n/nb685c0cfa778"
  },
  {
    num: "116",
    title: "並行プロセスモデルの体系",
    category: "システム学",
    summary: "並行処理・並列プロセスの体系的モデル化とソフトウェア・組織への応用を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n44c39c37d613"
  },
  {
    num: "117",
    title: "シャノン情報理論の限界と複雑度メトリックス（前半）",
    category: "システム学",
    summary: "シャノン情報理論の限界を論じ、代替的な複雑度指標を提示する（前半）。",
    url: "https://note.com/ichi_s_otsuki/n/n213b3efc86a4"
  },
  {
    num: "118",
    title: "シャノン情報理論の限界と複雑度メトリックス（後半）",
    category: "システム学",
    summary: "シャノン情報理論の限界を論じ、代替的な複雑度指標を提示する（後半）。",
    url: "https://note.com/ichi_s_otsuki/n/neff522033f68"
  },
  {
    num: "119",
    title: "4E認知",
    category: "哲学",
    summary: "身体化・組み込み・延長・行為化の4E認知科学と知働化・AIへの含意を解説する。",
    url: "https://note.com/ichi_s_otsuki/n/nfe6e9452ae80"
  },
  {
    num: "120",
    title: "自律的システム進化による雇用ゼロ組織経営",
    category: "システム学",
    summary: "自律進化するシステムが雇用を必要としない組織経営の可能性と課題を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n833aa5ed1ac3"
  },
  {
    num: "121",
    title: "AI時代に要請される人の能力",
    category: "AI時代",
    summary: "AIに代替されない創造性・判断力・意味形成・倫理的感性という人間固有の能力を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/neb02cd2ed246"
  },
  {
    num: "122",
    title: "AI資本主義の構造と射程",
    category: "AI時代",
    summary: "AI技術が資本主義の構造・競争原理・価値創造をどう変えるかを分析する。",
    url: "https://note.com/ichi_s_otsuki/n/ned9496c8bdae"
  },
  {
    num: "123",
    title: "『思考の技法2.0』へ向けて",
    category: "思考の技法",
    summary: "次世代版『思考の技法2.0』の構想・方向性・AI時代への対応を提示する。",
    url: "https://note.com/ichi_s_otsuki/n/ndee896a18568"
  },
  {
    num: "124",
    title: "AIによる限界費用ゼロ社会",
    category: "AI時代",
    summary: "AIがもたらす限界費用ゼロ社会の産業構造・競争原理・価値創造への根本的影響を論じる。",
    url: "https://note.com/ichi_s_otsuki/n/n6977fbce4e84"
  }
];

// Node.js / Vercel サーバーレス関数からも require できるようにする
if (typeof module !== 'undefined' && module.exports) {
  module.exports = knowledge;
}
