/* =====================================================
   アンケートサイト 共通スクリプト
   （一覧・回答・レポート・スプレッドシート型で共有します）
   ===================================================== */
(function (global) {
  'use strict';

  /* ---------- ログインの確認 ---------- */
  function guard() {
    if (sessionStorage.getItem('inoki_ok') !== '1') {
      location.replace('../?back=' + encodeURIComponent(location.pathname + location.search));
      return false;
    }
    return true;
  }

  /* ---------- API ---------- */
  function api(payload) {
    return fetch('/api/inoki-ken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  /* ---------- 小道具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function qs(name) {
    return new URLSearchParams(location.search).get(name) || '';
  }

  function scaleOf(q, survey) {
    return q.scale || (survey && survey.scale) || { min: 1, max: 5, low: '', high: '' };
  }

  function allQuestions(survey) {
    var out = [];
    (survey.sections || []).forEach(function (sec) {
      (sec.questions || []).forEach(function (q) { out.push(Object.assign({}, q, { sec: sec.id })); });
    });
    return out;
  }

  function labelOf(field, value) {
    var o = (field.options || []).filter(function (x) { return String(x.v) === String(value); })[0];
    return o ? o.label : '';
  }

  function isRequired(q) { return q.required !== false; }

  /* ---------- 設問の描画 ---------- */
  function questionHTML(q, survey, no) {
    var head = '<p class="q-text"><span class="q-no">Q' + no + '</span>' + esc(q.text) +
      (isRequired(q) ? '' : '<span class="q-no">（任意）</span>') + '</p>';
    var body = '';

    if (q.type === 'likert') {
      var sc = scaleOf(q, survey);
      var opts = '';
      for (var v = sc.min; v <= sc.max; v++) {
        opts += '<label><input type="radio" name="q_' + esc(q.id) + '" value="' + v + '"><span>' + v + '</span></label>';
      }
      body =
        '<div class="likert">' +
          '<span class="lk-end">' + esc(sc.low || '') + '</span>' +
          '<span class="lk-opts">' + opts + '</span>' +
          '<span class="lk-end hi">' + esc(sc.high || '') + '</span>' +
        '</div>';
    } else if (q.type === 'single' || q.type === 'multi') {
      var type = q.type === 'multi' ? 'checkbox' : 'radio';
      body = '<div class="opt-list">' + (q.options || []).map(function (o) {
        return '<label><input type="' + type + '" name="q_' + esc(q.id) + '" value="' + esc(o.v) + '">' +
               '<span>' + esc(o.label) + '</span></label>';
      }).join('') + '</div>';
      if (q.type === 'multi' && q.max) body += '<p class="q-hint">最大 ' + q.max + ' つまでお選びいただけます。</p>';
    } else {
      body = '<textarea name="q_' + esc(q.id) + '" maxlength="' + (q.maxlen || 500) + '" ' +
             'placeholder="ご自由にお書きください"></textarea>';
    }

    return '<fieldset class="q-block" data-qid="' + esc(q.id) + '" data-type="' + esc(q.type) + '">' +
           head + body + '</fieldset>';
  }

  function fieldHTML(f, no) {
    var head = '<p class="q-text"><span class="q-no">' + (no ? 'P' + no : '') + '</span>' + esc(f.label) +
      (f.required === false ? '<span class="q-no">（任意）</span>' : '') + '</p>';
    var body;
    if (f.type === 'text') {
      body = '<textarea name="p_' + esc(f.id) + '" maxlength="200"></textarea>';
    } else {
      var type = f.type === 'multi' ? 'checkbox' : 'radio';
      body = '<div class="opt-list">' + (f.options || []).map(function (o) {
        return '<label><input type="' + type + '" name="p_' + esc(f.id) + '" value="' + esc(o.v) + '">' +
               '<span>' + esc(o.label) + '</span></label>';
      }).join('') + '</div>';
    }
    return '<fieldset class="q-block" data-pid="' + esc(f.id) + '" data-type="' + esc(f.type) + '">' +
           head + body + '</fieldset>';
  }

  /* ---------- 入力値の取り出し ---------- */
  function readBlock(root, name, type) {
    if (type === 'text') {
      var ta = root.querySelector('[name="' + name + '"]');
      return ta ? ta.value.trim() : '';
    }
    if (type === 'multi') {
      return Array.prototype.slice.call(root.querySelectorAll('[name="' + name + '"]:checked'))
        .map(function (el) { return el.value; });
    }
    var el = root.querySelector('[name="' + name + '"]:checked');
    if (!el) return null;
    return type === 'likert' ? Number(el.value) : el.value;
  }

  /* ---------- 統計 ---------- */
  function mean(arr) {
    if (!arr.length) return null;
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  }

  function sd(arr) {
    if (arr.length < 2) return null;
    var m = mean(arr);
    var v = arr.reduce(function (a, b) { return a + (b - m) * (b - m); }, 0) / (arr.length - 1);
    return Math.sqrt(v);
  }

  function median(arr) {
    if (!arr.length) return null;
    var s = arr.slice().sort(function (a, b) { return a - b; });
    var h = Math.floor(s.length / 2);
    return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2;
  }

  function fmt(v, d) {
    return v == null ? '—' : v.toFixed(d == null ? 2 : d);
  }

  /* ---------- 5段階の色（低→高） ---------- */
  var SCALE_COLORS = ['#c0563f', '#dc9a5a', '#c9c2b4', '#7ba7cf', '#2e74b5'];
  function scaleColor(i, n) {
    if (n === 5) return SCALE_COLORS[i];
    var t = n <= 1 ? 0 : i / (n - 1);
    var k = Math.round(t * (SCALE_COLORS.length - 1));
    return SCALE_COLORS[k];
  }

  /* ---------- CSV ---------- */
  function toCsv(rows) {
    return rows.map(function (r) {
      return r.map(function (c) {
        var s = String(c == null ? '' : c);
        return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\r\n');
  }

  // Excel が UTF-8 と判定できるよう BOM を付けます
  function download(filename, text, mime) {
    var blob = new Blob(['﻿' + text], { type: (mime || 'text/csv') + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- 共通ヘッダ・フッタ ---------- */
  function header(current) {
    var nav = [
      { href: '../', label: 'ホーム', key: 'home' },
      { href: './', label: 'アンケート', key: 'surveys' },
      { href: '../concept/', label: '概念', key: 'concept' },
      { href: '../hypo/', label: '仮説', key: 'hypo' },
      { href: '../guide/', label: '参考', key: 'guide' }
    ];
    return '' +
      '<header class="site-head"><div class="wrap head-inner">' +
      '<a class="brand" href="../">' +
      '<span class="brand-name">AI時代の要求工学</span>' +
      '<span class="brand-sub">意識調査</span></a>' +
      '<nav class="site-nav">' +
      nav.map(function (n) {
        return '<a href="' + n.href + '"' + (n.key === current ? ' class="on"' : '') + '>' + n.label + '</a>';
      }).join('') +
      '<a class="quiet" href="#" id="logout-link">ログアウト</a>' +
      '</nav></div></header>';
  }

  function footer() {
    return '' +
      '<footer class="site-foot"><div class="wrap">' +
      '<p>本サイトは、AI時代の要求工学に関する意識調査を行い、要求工学を社会的な必要に応えるものにしていくことを目的としています。</p>' +
      '<p class="quiet">回答は匿名で集計され、統計的な分析にのみ用いられます。</p>' +
      '</div></footer>';
  }

  function mountChrome(current) {
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) h.innerHTML = header(current);
    if (f) f.innerHTML = footer();
    var link = document.getElementById('logout-link');
    if (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        sessionStorage.removeItem('inoki_ok');
        sessionStorage.removeItem('inoki_id');
        location.href = '../';
      });
    }
  }

  global.SV = {
    guard: guard, api: api, esc: esc, qs: qs,
    scaleOf: scaleOf, allQuestions: allQuestions, labelOf: labelOf, isRequired: isRequired,
    questionHTML: questionHTML, fieldHTML: fieldHTML, readBlock: readBlock,
    mean: mean, sd: sd, median: median, fmt: fmt,
    scaleColor: scaleColor, toCsv: toCsv, download: download,
    mountChrome: mountChrome
  };
})(window);
