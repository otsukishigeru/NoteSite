/* =====================================================
   hi-ancate 集計ダッシュボードロジック（results.html）
   ===================================================== */

(function () {
  const fmt = (v) => (v == null ? '—' : v.toFixed(2));
  const pct = (v) => (v == null ? 0 : (v / 5) * 100);

  function gapClass(gap) {
    const a = Math.abs(gap);
    if (a >= 1.0) return 'high';
    if (a >= 0.5) return 'mid';
    return 'low';
  }

  function categoryAverage(items, role, catId) {
    const ids = QUESTIONS.filter(q => q.cat === catId).map(q => q.id);
    const vals = ids.map(id => items[id][role]).filter(v => v != null);
    if (vals.length === 0) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  function renderSummary(data) {
    const el = document.getElementById('dash-summary');
    el.innerHTML = `
      <div class="summary-card"><div class="num">${data.counts.student}</div><div class="label">学生・卒業生の回答数</div></div>
      <div class="summary-card"><div class="num">${data.counts.company}</div><div class="label">企業の回答数</div></div>
    `;
  }

  function renderCategoryBars(data) {
    const el = document.getElementById('category-bars');
    el.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const s = categoryAverage(data.items, 'student', cat.id);
      const c = categoryAverage(data.items, 'company', cat.id);
      const row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = `
        <div class="bar-row-label">${cat.label}</div>
        <div class="bar-track"><div class="bar-fill student" style="width:${pct(s)}%"></div></div>
        <div class="bar-track"><div class="bar-fill company" style="width:${pct(c)}%"></div></div>
        <div class="bar-vals"><span>学生 ${fmt(s)}</span><span>企業 ${fmt(c)}</span></div>
      `;
      el.appendChild(row);
    });
  }

  function renderGapRanking(data) {
    const el = document.getElementById('gap-ranking');
    el.innerHTML = '';

    const rows = QUESTIONS.map(q => {
      const s = data.items[q.id].student;
      const c = data.items[q.id].company;
      const gap = (s != null && c != null) ? c - s : null;
      return { q, s, c, gap };
    }).filter(r => r.gap != null)
      .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
      .slice(0, 5);

    if (rows.length === 0) {
      el.innerHTML = '<p class="empty-note">ギャップを算出するには、両方の立場からの回答が必要です。</p>';
      return;
    }

    rows.forEach(({ q, s, c, gap }) => {
      const row = document.createElement('div');
      row.className = 'bar-row';
      const sign = gap > 0 ? '企業が重視' : '学生が重視';
      row.innerHTML = `
        <div class="bar-row-label">${q.label}<span class="gap-badge ${gapClass(gap)}">差 ${Math.abs(gap).toFixed(2)}（${sign}）</span></div>
        <div class="bar-track"><div class="bar-fill student" style="width:${pct(s)}%"></div></div>
        <div class="bar-track"><div class="bar-fill company" style="width:${pct(c)}%"></div></div>
        <div class="bar-vals"><span>学生 ${fmt(s)}</span><span>企業 ${fmt(c)}</span></div>
      `;
      el.appendChild(row);
    });
  }

  function renderGuide(data) {
    const el = document.getElementById('guide-text');

    const catRows = CATEGORIES.map(cat => {
      const s = categoryAverage(data.items, 'student', cat.id);
      const c = categoryAverage(data.items, 'company', cat.id);
      const gap = (s != null && c != null) ? c - s : null;
      return { cat, s, c, gap };
    }).filter(r => r.gap != null);

    if (catRows.length === 0) {
      el.innerHTML = '<p>まだ両方の立場からの回答が十分にそろっていないため、傾向のガイドを表示できません。</p>';
      return;
    }

    const maxGapCat = catRows.reduce((a, b) => (Math.abs(b.gap) > Math.abs(a.gap) ? b : a));
    const topCompanyCat = catRows.reduce((a, b) => ((b.c || 0) > (a.c || 0) ? b : a));
    const topStudentCat = catRows.reduce((a, b) => ((b.s || 0) > (a.s || 0) ? b : a));

    let p1 = `現在の集計結果では、企業側は〈${topCompanyCat.cat.label}〉を最も重視する傾向にあり、学生・卒業生側は〈${topStudentCat.cat.label}〉を重要だと考える傾向が最も強く出ています。`;

    let p2;
    if (Math.abs(maxGapCat.gap) >= 0.5) {
      const who = maxGapCat.gap > 0 ? '企業側の要求水準に対して学生側の自己認識がまだ追いついていない' : '学生側が重要だと考えている度合いに対して、企業側の重視度がそれほど高くない';
      p2 = `もっとも認識のズレが大きいのは〈${maxGapCat.cat.label}〉の分野で、${who}状況がうかがえます。この分野を意識した学習機会や採用選考でのすり合わせが、双方の橋渡しになると考えられます。`;
    } else {
      p2 = `カテゴリ単位で見ると、企業側と学生・卒業生側の認識に大きなズレは見られず、双方が近い重要度で捉えている傾向がうかがえます。`;
    }

    const p3 = data.preliminary
      ? `なお、現時点では回答数が少なく（学生 ${data.counts.student}件・企業 ${data.counts.company}件）、傾向は今後の回答の蓄積により変化する可能性があります。参考値としてご覧ください。`
      : `本結果は学生・卒業生 ${data.counts.student}件、企業 ${data.counts.company}件の回答をもとに集計したものです。`;

    el.innerHTML = `<p>${p1}</p><p style="margin-top:1rem;">${p2}</p><p style="margin-top:1rem;">${p3}</p>`;
  }

  async function load() {
    try {
      const res = await fetch('/api/hi-ancate');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      if (data.counts.student === 0 && data.counts.company === 0) {
        document.getElementById('dash-empty').classList.remove('hidden-el');
        document.getElementById('dash-content').classList.add('hidden-el');
        return;
      }

      renderSummary(data);
      renderCategoryBars(data);
      renderGapRanking(data);
      renderGuide(data);

      if (data.preliminary) {
        document.getElementById('preliminary-note').classList.remove('hidden-el');
      }
    } catch (err) {
      document.getElementById('dash-empty').classList.remove('hidden-el');
      document.getElementById('dash-content').classList.add('hidden-el');
    }
  }

  load();
})();
