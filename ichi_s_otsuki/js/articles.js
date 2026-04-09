// =============================================
// 代表記事リスト（5件前後を厳選して掲載）
// 見直しタイミング：note作品が10件追加されるごと
// 全記事インデックスは assets/pdfs/NoteIdx.pdf を更新
//
// featured: true  → 注目記事（大きいカード・グリッド左端）
//           false → サブ記事（通常カード）
// featured は1件のみ指定すること
// =============================================

const articles = [
  {
    num: "001",
    hearts: 18,
    tag: "思考の技法",
    title: "難しいことを難しいままに書く",
    desc: "知識や思想を平易に「わかりやすく」するだけでは本質が失われることを論じる。難解さを保ちながら正確に伝えることの重要性を問う。読者への過度な迎合を戒め、思考の深度を大切にする姿勢を示す。",
    date: "2025-05-02",
    url: "https://note.com/ichi_s_otsuki/n/nbf0897ad7244",
    featured: true
  },
  {
    num: "124",
    hearts: 0,
    tag: "AI時代",
    title: "AI による限界費用ゼロ社会",
    desc: "AIがもたらす「限界費用ゼロ社会」を論じる。産業構造・競争原理・価値創造の根本的変化を分析し、新時代の社会デザインへの示唆を提供する。",
    date: "2026-03-25",
    url: "https://note.com/ichi_s_otsuki/n/n6977fbce4e84",
    featured: false
  },
  {
    num: "121",
    hearts: 10,
    tag: "AI時代",
    title: "AI 時代に要請される人の能力",
    desc: "AI時代において人間に真に求められる能力・資質を論じる。HIとAIの役割分担を明確にし、創造性・判断力・意味形成など人間固有の能力を提示する。",
    date: "2026-02-13",
    url: "https://note.com/ichi_s_otsuki/n/neb02cd2ed246",
    featured: false
  },
  {
    num: "051",
    hearts: 4,
    tag: "哲学",
    title: "思考の技法：HI と AI のための新実在論",
    desc: "マルクス・ガブリエルの新実在論を基盤に、人間知能（HI）とAIの両方に適した思考の技法の哲学的基盤を論じる。",
    date: "2025-06-26",
    url: "https://note.com/ichi_s_otsuki/n/n5d956db3dc96",
    featured: false
  },
  {
    num: "039",
    hearts: 3,
    tag: "思考の技法",
    title: "実世界埋込型 抽象山モデル",
    desc: "実世界に埋め込まれた知識の抽象階層を「抽象山」モデルとして可視化・定式化する。具体的現実から高度な抽象概念へと登る知的プロセスをモデル化する。",
    date: "2025-06-14",
    url: "https://note.com/ichi_s_otsuki/n/nb61684c10bed",
    featured: false
  }
];

// ─── 記事カード生成・描画 ───────────────────────────────
(function renderArticles() {
  const grid = document.getElementById('article-grid');
  if (!grid) return;

  articles.forEach(function(a) {
    // featured かどうかでリンクテキストを変える
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
