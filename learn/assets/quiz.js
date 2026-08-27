/* =====================================================
   理解度判定テスト
   採点はこの端末の中だけで行い、結果は送信も保存もしない。
   ===================================================== */
(function () {
  'use strict';
  var el = document.getElementById('quiz');
  var sid = LEARN.qs('s') || 'beginner';
  var STAGE = null, DATA = null, ORDER = [], done = false;

  /* 出題順を毎回入れ替える（同じ設問の並びで覚えてしまわないように） */
  function shuffled(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function render() {
    var q = STAGE.quiz;
    el.innerHTML =
      '<div class="page-head">' +
        '<p class="eyebrow">quiz</p>' +
        '<h1>' + LEARN.esc(STAGE.title) + '　理解度判定テスト</h1>' +
        '<p class="sub">全' + ORDER.length + '問　／　合格ライン ' + q.pass + '問正答　／　結果は記録されません</p>' +
      '</div>' +

      '<div class="box"><p class="box-title">このテストについて</p>' +
      '<p style="margin-bottom:0">選別のための試験ではありません。' +
      '誤答した設問から、復習すべき用語へ直接たどれるようにしてあります。' +
      '何度受けても構いませんし、そのたびに設問の並びは入れ替わります。' +
      '採点はこの端末の中だけで行われ、答案がどこかへ送られることはありません。</p></div>' +

      '<div id="msg"></div>' +
      '<div id="qs">' + ORDER.map(function (q2, i) { return question(q2, i); }).join('') + '</div>' +

      '<div class="progress-bar">' +
        '<a class="btn ghost mini" href="stage.html?s=' + encodeURIComponent(STAGE.id) + '">← 学習に戻る</a>' +
        '<span class="state" id="state">0 / ' + ORDER.length + ' 問に回答</span>' +
        '<button type="button" class="btn mini" id="submit">採点する</button>' +
      '</div>';

    el.addEventListener('change', onChange);
    document.getElementById('submit').addEventListener('click', grade);
  }

  function question(q, i) {
    return '<fieldset class="q-card" data-qid="' + LEARN.esc(q.id) + '">' +
      '<p class="q-no">問 ' + (i + 1) + '</p>' +
      '<p class="q-text">' + LEARN.esc(q.text) + '</p>' +
      '<div class="choices">' +
        q.choices.map(function (c, k) {
          return '<label><input type="radio" name="q_' + LEARN.esc(q.id) + '" value="' + k + '">' +
                 '<span>' + LEARN.esc(c) + '</span></label>';
        }).join('') +
      '</div>' +
    '</fieldset>';
  }

  function onChange() {
    if (done) return;
    var n = ORDER.filter(function (q) {
      return el.querySelector('[name="q_' + q.id + '"]:checked');
    }).length;
    document.getElementById('state').textContent = n + ' / ' + ORDER.length + ' 問に回答';
  }

  function grade() {
    if (done) return;
    var unanswered = [];
    var results = ORDER.map(function (q) {
      var picked = el.querySelector('[name="q_' + q.id + '"]:checked');
      var v = picked ? Number(picked.value) : null;
      if (v === null) unanswered.push(q.id);
      return { q: q, picked: v, ok: v === q.answer };
    });

    var msg = document.getElementById('msg');
    if (unanswered.length) {
      msg.innerHTML = '<div class="msg err">お答えいただいていない設問が ' + unanswered.length +
        ' 問あります（赤い枠の設問です）。</div>';
      var first = null;
      ORDER.forEach(function (q) {
        var card = el.querySelector('[data-qid="' + q.id + '"]');
        var bad = unanswered.indexOf(q.id) >= 0;
        card.classList.toggle('need', bad);
        if (bad && !first) first = card;
      });
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    done = true;
    msg.innerHTML = '';
    var score = results.filter(function (r) { return r.ok; }).length;
    var pass = score >= STAGE.quiz.pass;

    // 各設問に正誤と解説を出す
    results.forEach(function (r) {
      var card = el.querySelector('[data-qid="' + r.q.id + '"]');
      card.classList.remove('need');
      card.classList.add('done');
      card.querySelector('.q-no').insertAdjacentHTML('beforeend',
        '<span class="mark ' + (r.ok ? 'ok' : 'ng') + '">' + (r.ok ? '正解' : '不正解') + '</span>');
      var labels = card.querySelectorAll('.choices label');
      labels.forEach(function (lb, k) {
        lb.querySelector('input').disabled = true;
        if (k === r.q.answer) lb.classList.add('correct');
        else if (k === r.picked) lb.classList.add('wrong');
      });
      var review = '';
      if (r.q.term) {
        var f = LEARN.findTerm(DATA, r.q.term);
        if (f) {
          review = '　→　復習：<a href="stage.html?s=' + encodeURIComponent(f.stage.id) +
                   '#t-' + encodeURIComponent(r.q.term) + '">' + LEARN.esc(f.term.term) + '</a>';
        }
      }
      card.insertAdjacentHTML('beforeend',
        '<p class="explain"><b>解説</b>　' + LEARN.esc(r.q.explain || '') + review + '</p>');
    });

    // 総合結果
    var wrong = results.filter(function (r) { return !r.ok && r.q.term; });
    var seen = {};
    var chips = wrong.map(function (r) {
      if (seen[r.q.term]) return null;
      seen[r.q.term] = 1;
      var f = LEARN.findTerm(DATA, r.q.term);
      if (!f) return null;
      return '<a href="stage.html?s=' + encodeURIComponent(f.stage.id) +
             '#t-' + encodeURIComponent(r.q.term) + '">' + LEARN.esc(f.term.term) + '</a>';
    }).filter(Boolean).join('');

    var idx = DATA.stages.map(function (x) { return x.id; }).indexOf(STAGE.id);
    var next = idx >= 0 && idx < DATA.stages.length - 1 ? DATA.stages[idx + 1] : null;

    var html =
      '<div class="score">' +
        '<p class="big">' + score + ' / ' + ORDER.length + '</p>' +
        '<p class="verdict ' + (pass ? 'pass' : 'again') + '">' +
          (pass ? '合格ラインに達しました' : 'もう少しです') + '</p>' +
        '<p>' + (pass
          ? (next ? '次は「' + LEARN.esc(next.title) + '」に進めます。もちろん、この段階を読み返しても構いません。'
                  : 'この段階までの内容は、ひととおり押さえられています。')
          : '合格ラインは ' + STAGE.quiz.pass + ' 問正答です。下の語を読み直してから、もう一度お試しください。') + '</p>' +
        (chips ? '<div class="review">' + chips + '</div>' : '') +
      '</div>' +
      '<div class="btn-row center">' +
        '<button type="button" class="btn ghost" id="retry">もう一度受ける</button>' +
        '<a class="btn ghost" href="stage.html?s=' + encodeURIComponent(STAGE.id) + '">学習に戻る</a>' +
        (pass && next ? '<a class="btn" href="stage.html?s=' + encodeURIComponent(next.id) + '">' +
          LEARN.esc(next.title) + 'へ進む →</a>' : '') +
      '</div>';

    msg.innerHTML = html;
    document.getElementById('retry').addEventListener('click', function () {
      done = false;
      ORDER = shuffled(STAGE.quiz.questions);
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.getElementById('submit').disabled = true;
    document.getElementById('state').textContent = '採点しました';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  LEARN.load().then(function (data) {
    DATA = data;
    STAGE = LEARN.findStage(data, sid);
    if (!STAGE || !STAGE.quiz || !STAGE.quiz.questions.length) {
      LEARN.mount('');
      return LEARN.fail(el, 'この段階にはテストが用意されていません。');
    }
    LEARN.mount(STAGE.id);
    LEARN.setStageColor(STAGE.color);
    document.title = STAGE.title + '　理解度判定テスト ｜ 要求工学 学習';
    ORDER = shuffled(STAGE.quiz.questions);
    render();
  }).catch(function (e) {
    LEARN.mount('');
    LEARN.fail(el, e.message || '読み込みに失敗しました');
  });
})();
