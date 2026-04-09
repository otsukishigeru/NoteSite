// =============================================
// 代表記事リスト（注目5件 — 野村一行 note.com/carl）
// 見直しタイミング：note作品が追加されるごと
//
// featured: true  → 注目記事（大きいカード・グリッド左端）
//           false → サブ記事（通常カード）
// featured は1件のみ指定すること
// =============================================

const articles = [
  {
    num: "011",
    hearts: 9,
    tag: "意識論・科学哲学",
    title: "意識の地図を歩く —— 物理学から神秘まで、私たちはどこまで解明できたのか？",
    desc: "意識研究の全体地図を鳥瞰する。量子論的アプローチから汎心論・神秘主義まで多彩な理論を俯瞰し、現代科学が意識の解明においてどこまで到達し、どこで行き詰まっているかを整理する。意識の未完成さこそが人間に探求の余地を残していると論じる。",
    date: "2026-01-20",
    url: "https://note.com/carl/n/n640b4e4fbe2e",
    featured: true
  },
  {
    num: "009",
    hearts: 8,
    tag: "哲学・意識論",
    title: "クオリアをめぐる哲学的探求：意識の謎に迫る",
    desc: "「赤の赤さ」「痛みの痛さ」という主観的体験＝クオリアを哲学的に掘り下げる。クオリアがなぜ科学的・計算論的説明では捉えきれないのかを論じ、意識のハード問題の核心に迫る。",
    date: "2025-12-14",
    url: "https://note.com/carl/n/nd3e57c98fe37",
    featured: false
  },
  {
    num: "007",
    hearts: 7,
    tag: "哲学・テクノロジー",
    title: "「知」から「心」へ：IT技術者のための哲学思想史入門",
    desc: "IT技術者を主な読者として、哲学思想史を「知（認識論）」から「心（心の哲学）」へという流れで解説する。ソクラテスから現代の心の哲学まで、技術者が知っておくべき哲学的ツールキットを提供する。",
    date: "2025-10-09",
    url: "https://note.com/carl/n/n5f30cd617f81",
    featured: false
  },
  {
    num: "010",
    hearts: 5,
    tag: "意識科学・脳科学",
    title: "「私」の感覚はどこから来るのか？ —— 脳科学と数学が挑む「意識」という最後の謎",
    desc: "統合情報理論（IIT）・グローバルワークスペース理論など、脳科学と数学から意識に迫る最新アプローチを解説する。意識の本質は情報の量ではなく統合の度合いにあるという視点から「私」という感覚の起源に迫る。",
    date: "2026-01-19",
    url: "https://note.com/carl/n/nbb758b30d31c",
    featured: false
  },
  {
    num: "013",
    hearts: 2,
    tag: "AI・認知科学・哲学",
    title: "機械に『環世界』は宿るか？：ユクスキュルと4E認知から考える次世代AIの設計図",
    desc: "ユクスキュルの「環世界（Umwelt）」概念と4E認知（身体化・埋め込み・拡張・行為的認知）を組み合わせて、次世代AIが持つべき設計思想を探る。認知は脳の中だけにあるのではなく身体と世界の相互作用の中にあることを論じる。",
    date: "2026-03-19",
    url: "https://note.com/carl/n/n13480d742ed8",
    featured: false
  }
];

// ─── 記事カード生成・描画 ───────────────────────────────
(function renderArticles() {
  const grid = document.getElementById('article-grid');
  if (!grid) return;

  articles.forEach(function(a) {
    const linkText = a.featured ? 'note.comで読む ↗' : '読む ↗';
    const cardClass = 'art-card' + (a.featured ? ' featured' : '');

    const article = document.createElement('article');
    article.className = cardClass;
    article.innerHTML =
      '<div class="art-thumb">' +
        '<div class="art-hearts">♥ ' + a.hearts + '</div>' +
        '<div class="art-num">' + a.num + '</div>' +
      '</div>' +
      '<div class="art-info">' +
        '<span class="art-tag">' + a.tag + '</span>' +
        '<h3 class="art-title">' + a.title + '</h3>' +
        '<p class="art-desc">' + a.desc + '</p>' +
        '<div class="art-meta">' + a.date + '</div>' +
        '<a class="art-link" href="' + a.url + '" target="_blank" rel="noopener">' +
          linkText +
        '</a>' +
      '</div>';

    grid.appendChild(article);
  });
})();
