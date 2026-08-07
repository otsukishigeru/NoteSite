/* inoki-ken 共通スクリプト */
(function () {
  'use strict';

  /* ---------- 理解チェック ---------- */
  document.querySelectorAll('.quiz').forEach(function (quiz) {
    quiz.querySelectorAll('button.choice').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (quiz.classList.contains('done')) return;
        var correct = btn.dataset.correct === '1';
        btn.classList.add(correct ? 'ok' : 'ng');
        if (!correct) {
          var right = quiz.querySelector('button.choice[data-correct="1"]');
          if (right) right.classList.add('ok');
        }
        quiz.classList.add('done');
      });
    });
  });

  /* ---------- 命題の絞り込み ---------- */
  var filter = document.querySelector('.filter[data-filter]');
  if (filter) {
    var input   = filter.querySelector('input[type=search]');
    var chips   = Array.prototype.slice.call(filter.querySelectorAll('.chip'));
    var counter = filter.querySelector('.count');
    var groups  = Array.prototype.slice.call(document.querySelectorAll('[data-group]'));
    var props   = Array.prototype.slice.call(document.querySelectorAll('.prop'));
    var active  = 'all';

    function apply() {
      var q = (input && input.value || '').trim().toLowerCase();
      var shown = 0;

      props.forEach(function (p) {
        var byChip =
          active === 'all' ? true :
          active === 'new' ? p.dataset.new === '1' :
          p.dataset.h === active;
        var byText = q === '' || p.textContent.toLowerCase().indexOf(q) >= 0;
        var ok = byChip && byText;
        p.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });

      // 中身が全部隠れた見出しブロックも隠す
      groups.forEach(function (g) {
        var any = g.querySelectorAll('.prop:not(.is-hidden)').length > 0;
        g.classList.toggle('is-hidden', !any);
      });

      if (counter) counter.textContent = shown + ' 件を表示';
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.remove('on'); });
        c.classList.add('on');
        active = c.dataset.chip;
        apply();
      });
    });
    if (input) input.addEventListener('input', apply);
    apply();
  }

  /* ---------- 見出しへのアンカー生成（ページ内目次用） ---------- */
  document.querySelectorAll('main h2[id]').forEach(function (h) {
    h.style.scrollMarginTop = '76px';
  });
  document.querySelectorAll('main h3[id]').forEach(function (h) {
    h.style.scrollMarginTop = '76px';
  });
})();
