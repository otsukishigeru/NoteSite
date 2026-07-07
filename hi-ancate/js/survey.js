/* =====================================================
   hi-ancate アンケートフォーム共通ロジック
   student.html / company.html で共用（role は body[data-role]）
   ===================================================== */

(function () {
  const role = document.body.dataset.role; // 'student' | 'company'
  const roleText = ROLE_TEXT[role];
  const answers = {};

  function init() {
    document.getElementById('form-title').textContent = roleText.title;
    document.getElementById('form-lead').textContent = roleText.lead;
    renderQuestions();
    updateProgress();

    document.getElementById('survey-form').addEventListener('change', (e) => {
      if (e.target.type === 'radio') {
        answers[e.target.name] = Number(e.target.value);
        updateProgress();
      }
    });
    document.getElementById('survey-form').addEventListener('submit', onSubmit);
  }

  function renderQuestions() {
    const container = document.getElementById('questions');
    CATEGORIES.forEach((cat) => {
      const block = document.createElement('div');
      block.className = 'cat-block';

      const title = document.createElement('div');
      title.className = 'cat-title';
      title.style.borderLeftColor = cat.color;
      title.textContent = cat.label;
      block.appendChild(title);

      QUESTIONS.filter(q => q.cat === cat.id).forEach((q) => {
        block.appendChild(renderLikertCard(q));
      });

      container.appendChild(block);
    });
  }

  function renderLikertCard(q) {
    const card = document.createElement('div');
    card.className = 'likert-card';

    const text = document.createElement('div');
    text.className = 'likert-text';
    text.textContent = q.label;
    card.appendChild(text);

    const scale = document.createElement('div');
    scale.className = 'likert-scale';

    const low = document.createElement('span');
    low.className = 'likert-scale-label';
    low.textContent = roleText.scaleLow;
    scale.appendChild(low);

    const opts = document.createElement('div');
    opts.className = 'likert-options';
    for (let v = 1; v <= 5; v++) {
      const wrap = document.createElement('label');
      wrap.className = 'likert-opt';
      wrap.innerHTML = `<input type="radio" name="${q.id}" value="${v}" required><span class="dot">${v}</span>`;
      opts.appendChild(wrap);
    }
    scale.appendChild(opts);

    const high = document.createElement('span');
    high.className = 'likert-scale-label right';
    high.textContent = roleText.scaleHigh;
    scale.appendChild(high);

    card.appendChild(scale);
    return card;
  }

  function updateProgress() {
    const answered = Object.keys(answers).length;
    const total = QUESTIONS.length;
    document.getElementById('progress-fill').style.width = (answered / total * 100) + '%';
    document.getElementById('progress-count').textContent = `回答済み ${answered} / ${total}`;
    document.getElementById('btn-submit').disabled = answered < total;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const errorEl = document.getElementById('form-error');
    errorEl.classList.remove('show');

    if (Object.keys(answers).length < QUESTIONS.length) {
      errorEl.textContent = 'すべての項目にお答えください。';
      errorEl.classList.add('show');
      return;
    }

    const org = document.getElementById('org-field') ? document.getElementById('org-field').value.trim() : '';
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = '送信中…';

    try {
      const res = await fetch('/api/hi-ancate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, answers, org }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || '送信に失敗しました');

      document.getElementById('form-screen').classList.remove('active');
      document.getElementById('done-screen').classList.add('active');
      document.getElementById('done-screen').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      errorEl.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
      errorEl.classList.add('show');
      btn.disabled = false;
      btn.textContent = '回答を送信する';
    }
  }

  init();
})();
