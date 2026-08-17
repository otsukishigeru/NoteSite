/* =====================================================
   アンケート集計レポート（report.html）
   受け取った匿名の回答から、分布・平均・クロス集計・
   二軸マトリクス・立場別ギャップを描き出します。
   ===================================================== */
(function () {
  'use strict';
  if (!SV.guard()) return;
  SV.mountChrome('surveys');

  var stage = document.getElementById('stage');
  var sid = SV.qs('s');
  var SURVEY = null, PROFILE = null, ENTRIES = [];

  function fail(msg) {
    stage.innerHTML = '<div class="page-head"><h1>集計</h1></div>' +
      '<p class="empty-note">' + SV.esc(msg) + '</p>' +
      '<p style="text-align:center"><a class="sv-btn ghost" href="./">一覧に戻る</a></p>';
  }

  /* ---------- 取り出し ---------- */
  function likertValues(qid, subset) {
    return (subset || ENTRIES).map(function (e) { return e.a && e.a[qid]; })
      .filter(function (v) { return typeof v === 'number'; });
  }

  function sectionMean(sec, subset) {
    var vals = [];
    (sec.questions || []).forEach(function (q) {
      if (q.type !== 'likert') return;
      vals = vals.concat(likertValues(q.id, subset));
    });
    return SV.mean(vals);
  }

  function scaleOf(q) { return SV.scaleOf(q, SURVEY); }

  /* ---------- 部品 ---------- */
  function distBar(qid, sc) {
    var n = sc.max - sc.min + 1;
    var counts = new Array(n).fill(0);
    var vals = likertValues(qid);
    vals.forEach(function (v) { counts[v - sc.min]++; });
    if (!vals.length) return '<div class="dist"></div>';
    return '<div class="dist">' + counts.map(function (c, i) {
      var w = (c / vals.length) * 100;
      if (w === 0) return '';
      return '<span style="width:' + w + '%;background:' + SV.scaleColor(i, n) + '" ' +
             'title="' + (sc.min + i) + '：' + c + '件">' + (w >= 9 ? c : '') + '</span>';
    }).join('') + '</div>';
  }

  function distLegend(sc) {
    var n = sc.max - sc.min + 1;
    var out = [];
    for (var i = 0; i < n; i++) {
      var lbl = String(sc.min + i);
      if (i === 0 && sc.low) lbl += '（' + sc.low + '）';
      if (i === n - 1 && sc.high) lbl += '（' + sc.high + '）';
      out.push('<span><i style="background:' + SV.scaleColor(i, n) + '"></i>' + SV.esc(lbl) + '</span>');
    }
    return '<div class="dist-legend">' + out.join('') + '</div>';
  }

  function hbar(label, value, max, color, extra) {
    var pct = value == null ? 0 : Math.round((value / max) * 100);
    return '<div class="q-row">' +
      '<span class="q-label">' + SV.esc(label) + '</span>' +
      '<span class="bar-track"><span class="bar-fill" style="width:' + pct + '%;background:' + (color || '#2e74b5') + '"></span></span>' +
      '<span class="q-num">' + SV.fmt(value) + (extra ? ' ' + extra : '') + '</span>' +
      '</div>';
  }

  /* ---------- ① 概要 ---------- */
  function renderSummary() {
    var likertQ = SV.allQuestions(SURVEY).filter(function (q) { return q.type === 'likert'; });
    var all = [];
    likertQ.forEach(function (q) { all = all.concat(likertValues(q.id)); });
    var sheetN = ENTRIES.filter(function (e) { return e.s === 'sheet'; }).length;
    var last = ENTRIES.length ? (ENTRIES[0].t || '').slice(0, 10) : null;

    return '<div class="stat-grid">' +
      '<div class="stat"><p class="num">' + ENTRIES.length + '</p><p class="label">回答数</p></div>' +
      '<div class="stat"><p class="num">' + SV.fmt(SV.mean(all)) + '</p><p class="label">全設問の平均</p></div>' +
      '<div class="stat"><p class="num">' + SV.fmt(SV.sd(all)) + '</p><p class="label">標準偏差</p></div>' +
      '<div class="stat"><p class="num">' + sheetN + '</p><p class="label">表形式からの回答</p></div>' +
      '<div class="stat"><p class="num" style="font-size:1.15rem">' + (last || '—') + '</p><p class="label">最新の回答日</p></div>' +
      '</div>';
  }

  /* ---------- ② 回答者の構成 ---------- */
  function renderProfile() {
    var html = '<h2 id="who">回答者の構成</h2>' +
      '<p>どのような方からお答えをいただいているかを示します。' +
      '偏りがあれば、以下の数値もその偏りを反映したものとして読む必要があります。</p>';

    PROFILE.forEach(function (f) {
      if (f.type === 'text') return;
      var counts = {};
      (f.options || []).forEach(function (o) { counts[o.v] = 0; });
      ENTRIES.forEach(function (e) {
        var v = e.p && e.p[f.id];
        (Array.isArray(v) ? v : [v]).forEach(function (x) {
          if (x != null && counts[x] != null) counts[x]++;
        });
      });
      var maxC = Math.max(1, Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; })));
      html += '<h3>' + SV.esc(f.label) + '</h3>';
      html += (f.options || []).map(function (o) {
        var c = counts[o.v];
        var pct = ENTRIES.length ? Math.round((c / ENTRIES.length) * 100) : 0;
        return '<div class="q-row">' +
          '<span class="q-label">' + SV.esc(o.label) + '</span>' +
          '<span class="bar-track"><span class="bar-fill" style="width:' + Math.round((c / maxC) * 100) + '%"></span></span>' +
          '<span class="q-num">' + c + '件（' + pct + '%）</span>' +
          '</div>';
      }).join('');
    });
    return html;
  }

  /* ---------- ③ セクション別の平均 ---------- */
  function renderSections() {
    var rows = SURVEY.sections.map(function (sec) {
      var likert = (sec.questions || []).filter(function (q) { return q.type === 'likert'; });
      if (!likert.length) return '';
      var sc = scaleOf(likert[0]);
      return hbar(sec.label, sectionMean(sec), sc.max, sec.color || SURVEY.color);
    }).filter(Boolean).join('');
    if (!rows) return '';
    return '<h2 id="sections">区分ごとの平均</h2>' +
      '<p>設問の区分ごとに、段階評価の平均を並べたものです。区分のあいだの高低が、全体の重心を表します。</p>' +
      rows;
  }

  /* ---------- ④ 設問ごとの分布 ---------- */
  function renderQuestions() {
    var html = '<h2 id="items">設問ごとの分布</h2>' +
      '<p>それぞれの設問について、回答の散らばりを帯で示します。' +
      '平均だけを見ると同じに見える設問でも、散らばりの形が異なることがあります。' +
      'つまり、意見が割れているのか、それとも一致しているのかは、帯の形にあらわれるということになります。</p>';

    var legendShown = {};
    SURVEY.sections.forEach(function (sec) {
      var likert = (sec.questions || []).filter(function (q) { return q.type === 'likert'; });
      if (!likert.length) return;
      html += '<h3>' + SV.esc(sec.label) + '</h3>';
      var sc = scaleOf(likert[0]);
      var key = sc.min + '-' + sc.max + '-' + sc.low + '-' + sc.high;
      if (!legendShown[key]) { html += distLegend(sc); legendShown[key] = true; }

      html += '<div class="tbl-scroll"><table class="tbl"><thead><tr>' +
        '<th style="width:34%">設問</th><th style="width:34%">分布</th>' +
        '<th style="width:10%">平均</th><th style="width:10%">中央値</th><th style="width:12%">標準偏差</th>' +
        '</tr></thead><tbody>';
      likert.forEach(function (q) {
        var vals = likertValues(q.id);
        html += '<tr><td>' + SV.esc(q.text) + '</td>' +
          '<td>' + distBar(q.id, scaleOf(q)) + '</td>' +
          '<td>' + SV.fmt(SV.mean(vals)) + '</td>' +
          '<td>' + SV.fmt(SV.median(vals), 1) + '</td>' +
          '<td>' + SV.fmt(SV.sd(vals)) + '</td></tr>';
      });
      html += '</tbody></table></div>';
    });
    return html;
  }

  /* ---------- ⑤ 上位・下位 ---------- */
  function renderRanking() {
    var rows = SV.allQuestions(SURVEY)
      .filter(function (q) { return q.type === 'likert'; })
      .map(function (q) { return { q: q, m: SV.mean(likertValues(q.id)) }; })
      .filter(function (r) { return r.m != null; })
      .sort(function (a, b) { return b.m - a.m; });
    if (rows.length < 4) return '';

    var top = rows.slice(0, 5), bottom = rows.slice(-5).reverse();
    var sc = scaleOf(top[0].q);
    return '<h2 id="rank">高かった項目・低かった項目</h2>' +
      '<h3>平均が高かった項目</h3>' +
      top.map(function (r) { return hbar(r.q.text, r.m, sc.max, '#2e74b5'); }).join('') +
      '<h3>平均が低かった項目</h3>' +
      bottom.map(function (r) { return hbar(r.q.text, r.m, sc.max, '#c0563f'); }).join('');
  }

  /* ---------- ⑥ クロス集計 ---------- */
  function crossHTML(fieldId) {
    var f = PROFILE.filter(function (x) { return x.id === fieldId; })[0];
    if (!f) return '';
    var secs = SURVEY.sections.filter(function (sec) {
      return (sec.questions || []).some(function (q) { return q.type === 'likert'; });
    });
    if (!secs.length) return '<p class="empty-note">段階評価の設問がないため、比較できません。</p>';

    var scMax = 5;
    secs.forEach(function (sec) {
      var lk = (sec.questions || []).filter(function (q) { return q.type === 'likert'; })[0];
      if (lk) scMax = scaleOf(lk).max;
    });

    var html = '<div class="tbl-scroll"><table class="tbl"><thead><tr><th>' + SV.esc(f.label) + '</th><th>件数</th>' +
      secs.map(function (s) { return '<th>' + SV.esc(s.label) + '</th>'; }).join('') + '</tr></thead><tbody>';

    (f.options || []).forEach(function (o) {
      var subset = ENTRIES.filter(function (e) {
        var v = e.p && e.p[f.id];
        return Array.isArray(v) ? v.indexOf(String(o.v)) >= 0 : String(v) === String(o.v);
      });
      html += '<tr><td>' + SV.esc(o.label) + '</td><td>' + subset.length + '</td>' +
        secs.map(function (s) {
          var m = subset.length ? sectionMean(s, subset) : null;
          return '<td>' + SV.fmt(m) + '</td>';
        }).join('') + '</tr>';
    });
    html += '</tbody></table></div>' +
      '<p class="report-note">段階の最大は ' + scMax + ' です。件数の少ない層の数値は、参考程度にご覧ください。</p>';
    return html;
  }

  function renderCross() {
    var opts = PROFILE.filter(function (f) { return f.type !== 'text'; })
      .map(function (f) { return '<option value="' + SV.esc(f.id) + '">' + SV.esc(f.label) + '</option>'; }).join('');
    return '<h2 id="cross">層ごとの比較</h2>' +
      '<p>プロフィールの項目を軸に選ぶと、その層ごとの平均が区分別に表示されます。' +
      '層のあいだで数値が大きく動く軸こそが、この調査で意味のある軸だということになります。</p>' +
      '<div class="axis-pick"><label for="axis">比べる軸：</label>' +
      '<select id="axis">' + opts + '</select></div>' +
      '<div id="cross-body"></div>';
  }

  /* ---------- ⑦ 二軸マトリクス（重要度×困難度） ---------- */
  function renderMatrix() {
    var m = SURVEY.matrix;
    if (!m) return '';
    var xs = SURVEY.sections.filter(function (s) { return s.id === m.x.sec; })[0];
    var ys = SURVEY.sections.filter(function (s) { return s.id === m.y.sec; })[0];
    if (!xs || !ys) return '';

    var pts = [];
    var n = Math.min(xs.questions.length, ys.questions.length);
    for (var i = 0; i < n; i++) {
      var xm = SV.mean(likertValues(xs.questions[i].id));
      var ym = SV.mean(likertValues(ys.questions[i].id));
      if (xm == null || ym == null) continue;
      pts.push({ i: i + 1, label: (m.items && m.items[i]) || xs.questions[i].text, x: xm, y: ym });
    }
    if (!pts.length) return '';

    var W = 640, H = 460, PAD = 52;
    var scX = scaleOf(xs.questions[0]), scY = scaleOf(ys.questions[0]);
    var px = function (v) { return PAD + ((v - scX.min) / (scX.max - scX.min)) * (W - PAD * 2); };
    var py = function (v) { return H - PAD - ((v - scY.min) / (scY.max - scY.min)) * (H - PAD * 2); };
    var midX = (scX.min + scX.max) / 2, midY = (scY.min + scY.max) / 2;

    var svg = '<svg class="scatter" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="' + SV.esc(m.x.label) + 'と' + SV.esc(m.y.label) + 'の散布図">' +
      '<rect x="' + px(midX) + '" y="' + PAD + '" width="' + (W - PAD - px(midX)) + '" height="' + (py(midY) - PAD) + '" fill="#fdf2ee"/>' +
      '<line x1="' + PAD + '" y1="' + (H - PAD) + '" x2="' + (W - PAD) + '" y2="' + (H - PAD) + '" stroke="#c9ced4"/>' +
      '<line x1="' + PAD + '" y1="' + PAD + '" x2="' + PAD + '" y2="' + (H - PAD) + '" stroke="#c9ced4"/>' +
      '<line x1="' + px(midX) + '" y1="' + PAD + '" x2="' + px(midX) + '" y2="' + (H - PAD) + '" stroke="#e3e7eb" stroke-dasharray="4 4"/>' +
      '<line x1="' + PAD + '" y1="' + py(midY) + '" x2="' + (W - PAD) + '" y2="' + py(midY) + '" stroke="#e3e7eb" stroke-dasharray="4 4"/>' +
      '<text x="' + (W - PAD) + '" y="' + (H - 16) + '" text-anchor="end" font-size="13" fill="#6a727c">' + SV.esc(m.x.label) + ' →</text>' +
      '<text x="16" y="' + (PAD + 4) + '" font-size="13" fill="#6a727c">↑ ' + SV.esc(m.y.label) + '</text>' +
      '<text x="' + (W - PAD - 8) + '" y="' + (PAD + 18) + '" text-anchor="end" font-size="12" fill="#b5651d" font-weight="700">重要で、かつ難しい</text>';

    pts.forEach(function (p) {
      svg += '<circle cx="' + px(p.x).toFixed(1) + '" cy="' + py(p.y).toFixed(1) + '" r="14" ' +
        'fill="' + (p.x >= midX && p.y >= midY ? '#d4488f' : '#2e74b5') + '" fill-opacity=".85"/>' +
        '<text x="' + px(p.x).toFixed(1) + '" y="' + (py(p.y) + 4.5).toFixed(1) + '" text-anchor="middle" ' +
        'font-size="12" font-weight="700" fill="#fff">' + p.i + '</text>';
    });
    svg += '</svg>';

    var table = '<div class="tbl-scroll"><table class="tbl"><thead><tr>' +
      '<th style="width:8%">番号</th><th>作業</th><th style="width:14%">' + SV.esc(m.x.label) + '</th>' +
      '<th style="width:14%">' + SV.esc(m.y.label) + '</th><th style="width:14%">差</th></tr></thead><tbody>' +
      pts.slice().sort(function (a, b) { return (b.y - b.x) - (a.y - a.x); }).map(function (p) {
        var d = p.y - p.x;
        return '<tr><td>' + p.i + '</td><td>' + SV.esc(p.label) + '</td>' +
          '<td>' + SV.fmt(p.x) + '</td><td>' + SV.fmt(p.y) + '</td>' +
          '<td>' + (d >= 0 ? '+' : '') + SV.fmt(d) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    return '<h2 id="matrix">重要度と困難度の地図</h2>' +
      '<p>横軸に' + SV.esc(m.x.label) + '、縦軸に' + SV.esc(m.y.label) + 'をとり、10の作業を配置したものです。' +
      '右上の色をつけた領域に入る作業が、重要でありながら難しい、すなわち方法論と道具立てを最も必要としている場所ということになります。</p>' +
      svg +
      '<p class="report-note">下の表は、困難度から重要度を引いた差の大きい順に並べています。差が大きいほど、重要さの割に手に負えていない作業です。</p>' +
      table;
  }

  /* ---------- ⑧ 立場別ギャップ ---------- */
  function renderGap() {
    var g = SURVEY.gap;
    if (!g) return '';
    var f = PROFILE.filter(function (x) { return x.id === g.field; })[0];
    if (!f) return '';

    var groups = g.groups.map(function (grp) {
      return {
        label: grp.label,
        entries: ENTRIES.filter(function (e) {
          return grp.values.indexOf(String(e.p && e.p[g.field])) >= 0;
        })
      };
    });
    if (groups.length < 2) return '';

    var rows = SV.allQuestions(SURVEY)
      .filter(function (q) { return q.type === 'likert'; })
      .map(function (q) {
        var a = SV.mean(likertValues(q.id, groups[0].entries));
        var b = SV.mean(likertValues(q.id, groups[1].entries));
        return { q: q, a: a, b: b, gap: (a != null && b != null) ? b - a : null };
      });

    var withGap = rows.filter(function (r) { return r.gap != null; })
      .sort(function (x, y) { return Math.abs(y.gap) - Math.abs(x.gap); });

    var head = '<h2 id="gap">立場によるずれ</h2>' +
      '<p>同じ項目について、' + SV.esc(groups[0].label) + '（' + groups[0].entries.length + '件）と' +
      SV.esc(groups[1].label) + '（' + groups[1].entries.length + '件）の平均を比べたものです。' +
      '差が ' + g.mid + ' 以上を認識のずれ、' + g.big + ' 以上を大きなずれとして扱います。</p>';

    if (!withGap.length) {
      return head + '<p class="empty-note">ずれを算出するには、両方の立場からのお答えが必要です。</p>';
    }

    var table = '<div class="tbl-scroll"><table class="tbl"><thead><tr>' +
      '<th>項目</th><th style="width:15%">' + SV.esc(groups[0].label) + '</th>' +
      '<th style="width:15%">' + SV.esc(groups[1].label) + '</th>' +
      '<th style="width:14%">差</th><th style="width:14%">判定</th></tr></thead><tbody>' +
      withGap.map(function (r) {
        var abs = Math.abs(r.gap);
        var judge = abs >= g.big ? '大きなずれ' : (abs >= g.mid ? 'ずれあり' : '—');
        var who = r.gap > 0 ? groups[1].label : groups[0].label;
        return '<tr><td>' + SV.esc(r.q.text) + '</td>' +
          '<td>' + SV.fmt(r.a) + '</td><td>' + SV.fmt(r.b) + '</td>' +
          '<td>' + (r.gap >= 0 ? '+' : '') + SV.fmt(r.gap) + '</td>' +
          '<td>' + (judge === '—' ? '—' : judge + '（' + SV.esc(who) + 'が高い）') + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    return head + table;
  }

  /* ---------- ⑨ 選択式・記述式 ---------- */
  function renderChoices() {
    var qs = SV.allQuestions(SURVEY).filter(function (q) { return q.type === 'single' || q.type === 'multi'; });
    if (!qs.length) return '';
    var html = '<h2 id="choices">選択式の設問</h2>';
    qs.forEach(function (q) {
      var counts = {};
      (q.options || []).forEach(function (o) { counts[o.v] = 0; });
      var answered = 0;
      ENTRIES.forEach(function (e) {
        var v = e.a && e.a[q.id];
        if (v == null) return;
        var arr = Array.isArray(v) ? v : [v];
        if (arr.length) answered++;
        arr.forEach(function (x) { if (counts[x] != null) counts[x]++; });
      });
      var maxC = Math.max(1, Math.max.apply(null, (q.options || []).map(function (o) { return counts[o.v]; })));
      html += '<h3>' + SV.esc(q.text) + '</h3>';
      html += '<p class="report-note">回答した方：' + answered + '名' +
              (q.type === 'multi' ? '（複数選択のため合計は回答数を超えます）' : '') + '</p>';
      html += (q.options || []).map(function (o) {
        var c = counts[o.v];
        var pct = answered ? Math.round((c / answered) * 100) : 0;
        return '<div class="q-row">' +
          '<span class="q-label">' + SV.esc(o.label) + '</span>' +
          '<span class="bar-track"><span class="bar-fill" style="width:' + Math.round((c / maxC) * 100) + '%"></span></span>' +
          '<span class="q-num">' + c + '件（' + pct + '%）</span></div>';
      }).join('');
    });
    return html;
  }

  function renderTexts() {
    var qs = SV.allQuestions(SURVEY).filter(function (q) { return q.type === 'text'; });
    if (!qs.length) return '';
    var html = '<h2 id="texts">自由記述</h2>' +
      '<p>お寄せいただいた記述を、新しいものから最大30件まで並べます。表記はそのままです。</p>';
    qs.forEach(function (q) {
      var texts = ENTRIES.map(function (e) { return e.a && e.a[q.id]; })
        .filter(function (t) { return t && String(t).trim(); }).slice(0, 30);
      html += '<h3>' + SV.esc(q.text) + '</h3>';
      html += texts.length
        ? '<ul class="dots">' + texts.map(function (t) { return '<li>' + SV.esc(t) + '</li>'; }).join('') + '</ul>'
        : '<p class="empty-note">まだ記述はありません。</p>';
    });
    return html;
  }

  /* ---------- CSV ---------- */
  function buildCsv() {
    var qs = SV.allQuestions(SURVEY);
    var head = ['回答日時', '経路']
      .concat(PROFILE.map(function (f) { return f.label; }))
      .concat(qs.map(function (q) { return q.id + '：' + q.text; }));
    var rows = [head];
    ENTRIES.forEach(function (e) {
      var row = [e.t || '', e.s === 'sheet' ? '表形式' : '画面'];
      PROFILE.forEach(function (f) {
        var v = e.p && e.p[f.id];
        row.push(Array.isArray(v) ? v.map(function (x) { return SV.labelOf(f, x); }).join('｜')
                                  : (f.type === 'text' ? (v || '') : SV.labelOf(f, v)));
      });
      qs.forEach(function (q) {
        var v = e.a && e.a[q.id];
        if (v == null) { row.push(''); return; }
        if (Array.isArray(v)) row.push(v.map(function (x) { return SV.labelOf(q, x); }).join('｜'));
        else if (q.type === 'single') row.push(SV.labelOf(q, v));
        else row.push(v);
      });
      rows.push(row);
    });
    return SV.toCsv(rows);
  }

  /* ---------- 組み立て ---------- */
  function render() {
    var special = '';
    if (SURVEY.analysis === 'matrix') special = renderMatrix();
    else if (SURVEY.analysis === 'gap') special = renderGap();

    stage.innerHTML =
      '<div class="page-head"><p class="eyebrow">report</p>' +
      '<h1>' + SV.esc(SURVEY.title) + '　集計</h1>' +
      '<p class="sub">' + SV.esc(SURVEY.summary || '') + '</p></div>' +

      (ENTRIES.length === 0
        ? '<p class="empty-note">まだ回答が集まっていません。最初のお一人になっていただけますでしょうか。</p>' +
          '<p style="text-align:center"><a class="sv-btn" href="take.html?s=' + encodeURIComponent(SURVEY.id) + '">回答する →</a></p>'
        : renderSummary() +
          '<div class="box"><p class="box-title">この集計の読み方</p>' +
          '<p style="margin-bottom:0">' + SV.esc(SURVEY.policy || '') + '</p></div>' +
          (ENTRIES.length < 10
            ? '<div class="box warn"><p class="box-title">速報値です</p>' +
              '<p style="margin-bottom:0">回答数が10件に達していません。以下の数値は暫定のものとしてご覧ください。' +
              '件数が少ないうちは、一人の回答が平均を大きく動かします。</p></div>'
            : '') +
          renderProfile() + renderSections() + special +
          renderRanking() + renderCross() + renderQuestions() + renderChoices() + renderTexts() +
          '<h2 id="dl">データの書き出し</h2>' +
          '<p>集計のもとになっている回答を、そのまま表計算ソフトで扱える形（CSV）で取り出せます。' +
          'Googleスプレッドシートや Dropbox に取り込んで、独自の分析を行うことができます。</p>' +
          '<div class="dl"><p class="box-title">回答データ（CSV）</p>' +
          '<p>回答' + ENTRIES.length + '件・プロフィール' + PROFILE.length + '項目・設問' + SV.allQuestions(SURVEY).length + '問。氏名等は含まれません。</p>' +
          '<button type="button" class="dl-btn" id="dl-csv">CSVをダウンロード</button></div>'
      ) +
      '<div class="sv-actions" style="justify-content:center;margin-top:2.4em">' +
      '<a class="sv-btn ghost" href="./">一覧に戻る</a>' +
      '<a class="sv-btn ghost" href="take.html?s=' + encodeURIComponent(SURVEY.id) + '">このアンケートに回答する</a>' +
      '</div>';

    var axis = document.getElementById('axis');
    if (axis) {
      var body = document.getElementById('cross-body');
      var draw = function () { body.innerHTML = crossHTML(axis.value); };
      axis.addEventListener('change', draw);
      draw();
    }

    var dl = document.getElementById('dl-csv');
    if (dl) {
      dl.addEventListener('click', function () {
        SV.download(SURVEY.id + '_answers.csv', buildCsv());
      });
    }
  }

  /* ---------- 起動 ---------- */
  if (!sid) { fail('アンケートが指定されていません。'); return; }

  SV.api({ action: 'getReport', sid: sid }).then(function (d) {
    if (!d.ok) return fail(d.error || '読み込みに失敗しました');
    SURVEY = d.survey; PROFILE = d.profile; ENTRIES = d.entries || [];
    document.title = SURVEY.title + ' 集計 ｜ AI時代の要求工学 意識調査';
    render();
  }).catch(function () {
    fail('通信に失敗しました。時間をおいてお試しください。');
  });
})();
