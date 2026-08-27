/* =====================================================
   要求工学「学習」サイト 共通スクリプト
   ===================================================== */
(function (global) {
  'use strict';

  var CACHE = null;

  function api(payload) {
    return fetch('/api/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  /* 学習内容は一度だけ取りにいき、同じページ内では使い回す */
  function load() {
    if (CACHE) return Promise.resolve(CACHE);
    return api({ action: 'getAll' }).then(function (d) {
      if (!d.ok) throw new Error(d.error || '読み込みに失敗しました');
      var stages = (d.stages || []).slice();
      if (d.custom) stages.push(d.custom);
      CACHE = { stages: stages, version: d.version };
      return CACHE;
    });
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function qs(name) {
    return new URLSearchParams(location.search).get(name) || '';
  }

  function findStage(data, id) {
    return data.stages.filter(function (s) { return s.id === id; })[0] || null;
  }

  /* 用語 id から、その用語が属する段階と用語そのものを引く */
  function findTerm(data, termId) {
    for (var i = 0; i < data.stages.length; i++) {
      var t = data.stages[i].terms.filter(function (x) { return x.id === termId; })[0];
      if (t) return { stage: data.stages[i], term: t };
    }
    return null;
  }

  function kindClass(kind) {
    if (kind === '標準' || kind === '方法論') return 'std';
    if (kind === '哲学') return 'phil';
    if (kind === '論文') return 'paper';
    return '';
  }

  /* ---------- ヘッダ・フッタ ---------- */
  function chrome(current) {
    var nav = [
      { href: '/learn/', label: 'ホーム', key: 'home' },
      { href: '/learn/stage.html?s=beginner', label: '初級', key: 'beginner' },
      { href: '/learn/stage.html?s=intermediate', label: '中級', key: 'intermediate' },
      { href: '/learn/stage.html?s=advanced', label: '上級', key: 'advanced' },
      { href: '/learn/stage.html?s=custom', label: '独自', key: 'custom' },
      { href: '/learn/refs.html', label: '参考文献', key: 'refs' }
    ];
    return '' +
      '<header class="site-head"><div class="wrap head-inner">' +
        '<a class="brand" href="/learn/">' +
          '<span class="brand-mark">学</span>' +
          '<span><span class="brand-name">要求工学 学習</span>' +
          '<span class="brand-sub">Requirements Engineering</span></span>' +
        '</a>' +
        '<nav class="site-nav" aria-label="メインナビゲーション">' +
          nav.map(function (n) {
            return '<a href="' + n.href + '"' + (n.key === current ? ' class="on"' : '') + '>' + n.label + '</a>';
          }).join('') +
          '<a class="out" href="/inoki-ken/">意識調査 ↗</a>' +
        '</nav>' +
      '</div></header>';
  }

  function footer() {
    return '' +
      '<footer class="site-foot"><div class="wrap">' +
      '<p>要求工学の分野の初学者に向けて、主要な概念と、参考とすべき文献への道案内を提供しています。</p>' +
      '<p class="quiet">学習の記録は保存していません。テストの採点はご自身の端末の中だけで行われます。</p>' +
      '<p class="quiet"><a href="/">知働化コミュニティ</a>　／　<a href="/inoki-ken/">AI時代の要求工学 意識調査</a></p>' +
      '</div></footer>';
  }

  function mount(current) {
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) h.innerHTML = chrome(current);
    if (f) f.innerHTML = footer();
  }

  function setStageColor(color) {
    if (color) document.documentElement.style.setProperty('--stage', color);
  }

  function fail(el, msg) {
    el.innerHTML = '<div class="page-head"><h1>学習</h1></div>' +
      '<p class="empty-note">' + esc(msg) + '</p>' +
      '<p style="text-align:center"><a class="btn ghost" href="/learn/">ホームに戻る</a></p>';
  }

  function counts(stage) {
    return {
      terms: stage.terms.length,
      refs: stage.refs.length,
      quiz: stage.quiz && stage.quiz.questions ? stage.quiz.questions.length : 0
    };
  }

  global.LEARN = {
    api: api, load: load, esc: esc, qs: qs,
    findStage: findStage, findTerm: findTerm, kindClass: kindClass,
    mount: mount, setStageColor: setStageColor, fail: fail, counts: counts
  };
})(window);
