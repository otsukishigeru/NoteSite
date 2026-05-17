'use strict';
/* ================================================================
   AI-COCOMO app.js — 計算ロジック & UI制御
   ================================================================ */

// ── 言語テーブル ──────────────────────────────────────────────
const LANG_OPTIONS = [
  { label: 'Python (15)',      cf: 15  },
  { label: 'TypeScript (20)', cf: 20  },
  { label: 'Go (30)',          cf: 30  },
  { label: 'C# (46)',          cf: 46  },
  { label: 'Java/JS (53)',     cf: 53  },
  { label: 'C (128)',          cf: 128 },
];

// ── SF評定ラベル ──────────────────────────────────────────────
const SF_LABELS = ['Very High','High','Nominal+','Nominal','Low','Very Low'];

// ── パラメータ定義 ────────────────────────────────────────────
const DEFAULT = {
  fp: 1500, cf: 53, rnew: 80, labor: 6250, fx: 150,
  prec: 3, flex: 3, resl: 3, team: 2, pmat: 3,
  rely: 1.00, data: 1.00, cplx: 1.10, ruse: 1.00, plat: 1.00,
  pcap: 1.00, pexp: 1.00, ailx: 0.90, tool: 0.90, sced: 1.00,
  hrate: 70, pout: 15, pin: 3.75, gamma: 2.0, lai_m: 3000, members: 1, months: 3, delta: 10,
};

let P = Object.assign({}, DEFAULT);

// ── プリセット定義 ────────────────────────────────────────────
const PRESETS = {
  current: {
    label: '知働化サイト（現状AI支援）',
    desc: 'FP=1500, α=60%, Claude Sonnet相当',
    v: {
      fp:1500, cf:53, rnew:45, labor:6250, fx:150,
      prec:1, flex:1, resl:2, team:1, pmat:3,
      rely:0.90, data:0.85, cplx:0.95, ruse:0.85, plat:0.90,
      pcap:1.05, pexp:0.90, ailx:0.80, tool:0.80, sced:1.00,
      hrate:40, pout:15, pin:3.75, gamma:2.0, lai_m:3000, members:1, months:2, delta:10,
    }
  },
  maxai: {
    label: '知働化サイト（AI最大委任）',
    desc: 'FP=1500, α=85%, 高頻度AI活用',
    v: {
      fp:1500, cf:53, rnew:35, labor:6250, fx:150,
      prec:1, flex:1, resl:1, team:1, pmat:2,
      rely:0.90, data:0.85, cplx:0.95, ruse:0.85, plat:0.90,
      pcap:1.15, pexp:0.90, ailx:0.65, tool:0.65, sced:1.00,
      hrate:15, pout:15, pin:3.75, gamma:3.0, lai_m:7500, members:1, months:2, delta:15,
    }
  },
  noai: {
    label: '従来型開発（AI無し）',
    desc: 'FP=1500, α=0%, ウォーターフォール相当',
    v: {
      fp:1500, cf:53, rnew:80, labor:6250, fx:150,
      prec:3, flex:3, resl:3, team:3, pmat:3,
      rely:1.00, data:1.00, cplx:1.00, ruse:1.00, plat:1.00,
      pcap:1.00, pexp:1.00, ailx:1.00, tool:1.00, sced:1.00,
      hrate:100, pout:0, pin:0, gamma:0, lai_m:0, members:1, months:0, delta:0,
    }
  },
};

// ── 計算 ──────────────────────────────────────────────────────
function calc() {
  const fp      = P.fp;
  const cf      = P.cf;
  const rreuse  = (100 - P.rnew) / 100;   // 再利用率 = 1 − 新規開発比率
  const labor   = P.labor;
  const fx      = P.fx;

  const sumSF   = P.prec + P.flex + P.resl + P.team + P.pmat;
  const E       = 0.91 + 0.01 * sumSF;

  const rely = P.rely, data = P.data, cplx = P.cplx, ruse = P.ruse;
  const plat = P.plat, pcap = P.pcap, pexp = P.pexp, ailx = P.ailx;
  const tool = P.tool, sced = P.sced;
  const piEM = rely * data * cplx * ruse * plat * pcap * pexp * ailx * tool * sced;

  const alpha  = (100 - P.hrate) / 100;   // AI代替率 = 1 − 人的担当率
  const pout   = P.pout;
  const pin    = P.pin;
  const gamma  = P.gamma;
  const lai_m  = P.lai_m;
  const months = P.months;
  const delta  = P.delta / 100;

  const A      = 2.94;
  const size   = fp * cf * (1 - rreuse) / 1000;          // KLOC
  const pm_base = A * Math.pow(size, E) * piEM;            // 人月

  // 人的コスト
  const c_human = pm_base * (1 - alpha) * labor * 160;

  // AIコスト
  const t_out  = size * 1000 * alpha * gamma * 1.5;        // Kトークン
  const t_in   = t_out * 0.3;
  const tok_usd = (t_out * pout + t_in * pin) / 1000;      // $
  const lic_jpy = lai_m * P.members * months;  // 人数課金: 単価×人数×月数
  const c_ai    = tok_usd * fx + lic_jpy;

  // 統合コスト
  const ailx_norm = 1 - ailx;
  const c_integ = pm_base * labor * 160 * delta * ailx_norm;

  const c_total = c_human + c_ai + c_integ;

  // AI無し比較（α=0, δ=0, 同パラメータで計算）
  const c_noai = A * Math.pow(size, E) * piEM * labor * 160;
  const save_pct = c_noai > 0 ? (1 - c_total / c_noai) * 100 : 0;

  return {
    fp, cf, rreuse, rnew: P.rnew, labor, fx, sumSF, E, piEM,
    alpha, hrate: P.hrate, pout, pin, gamma, lai_m, members: P.members, months, delta,
    size, pm_base, c_human, t_out, t_in, tok_usd, lic_jpy, c_ai,
    ailx_norm, c_integ, c_total, c_noai, save_pct,
  };
}

// ── フォーマット ──────────────────────────────────────────────
const fmt  = n => '¥' + Math.round(n).toLocaleString('ja-JP');
const fmtN = (n, d=2) => n.toFixed(d);
const fmtK = n => n < 1000 ? n.toFixed(1) + 'K' : (n/1000).toFixed(1) + 'M';

// ── 結果描画 ──────────────────────────────────────────────────
function render() {
  const r = calc();

  // メトリクスカード
  $('res-total').textContent      = r.c_total >= 1e6
    ? '¥' + (r.c_total/1e6).toFixed(2) + 'M'
    : fmt(r.c_total);
  $('res-size').textContent        = fmtN(r.size, 3) + ' KLOC';
  $('res-pm').textContent          = fmtN(r.pm_base, 2) + ' PM';
  $('res-save').textContent        = fmtN(Math.max(0, r.save_pct), 1) + '%';

  // 計算過程
  const d = r;
  const lines = [
    { section: '規模', lines: [
      `Size = ${d.fp} × ${d.cf} × R_new(${d.rnew.toFixed(0)}%) / 1000`,
      `     = <cv>${fmtN(d.size,3)} KLOC</cv>`,
    ]},
    { section: 'スケール指数', lines: [
      `E = 0.91 + 0.01 × ${d.sumSF}`,
      `  = <cv>${fmtN(d.E,4)}</cv>`,
    ]},
    { section: '基本工数', lines: [
      `PM_base = 2.94 × ${fmtN(d.size,3)}^${fmtN(d.E,4)} × ${fmtN(d.piEM,4)}`,
      `        = <cv>${fmtN(d.pm_base,3)} PM</cv>`,
    ]},
    { section: '人的コスト', lines: [
      `C_human = ${fmtN(d.pm_base,3)} × 人的担当率(${d.hrate.toFixed(0)}%) × ${d.labor} × 160`,
      `        = <cv>${fmt(d.c_human)}</cv>`,
      `  人的工数 = <cy>${fmtN(d.pm_base*(1-d.alpha)*160,1)} h</cy>`,
    ]},
    { section: 'AIコスト', lines: [
      `T_out = ${fmtN(d.size,3)}×1000 × ${(d.alpha*100).toFixed(0)}% × ${fmtN(d.gamma,1)} × 1.5`,
      `      = <cy>${fmtK(d.t_out)}</cy>トークン`,
      `T_in  = T_out × 0.3 = <cy>${fmtK(d.t_in)}</cy>`,
      `トークン費 = $<cy>${fmtN(d.tok_usd,2)}</cy>`,
      `ライセンス費 = ${fmt(d.lai_m)}/月 × ${d.members}人 × ${d.months}月 = <cv>${fmt(d.lic_jpy)}</cv>`,
      `C_AI  = <cv>${fmt(d.c_ai)}</cv>`,
    ]},
    { section: '統合コスト', lines: [
      `AILX_norm = 1 − ${fmtN(d.piEM > 0 ? P.ailx : 0, 2)} = ${fmtN(d.ailx_norm,2)}`,
      `C_integ = ${fmtN(d.pm_base,3)}×${d.labor}×160×${(d.delta*100).toFixed(0)}%×${fmtN(d.ailx_norm,2)}`,
      `        = <cv>${fmt(d.c_integ)}</cv>`,
    ]},
    { section: '総コスト', lines: [
      `C_total = C_human + C_AI + C_integ`,
      `        = <cv>${fmt(d.c_total)}</cv>`,
      `AI無し比 節約 = <cy>${fmtN(Math.max(0,d.save_pct),1)}%</cy>`,
    ]},
  ];

  const detailEl = document.getElementById('calc-detail');
  detailEl.innerHTML = lines.map(b =>
    `<div class="calc-block">
      <div class="calc-block-title">${b.section}</div>
      <div class="calc-line">${b.lines.join('\n')}</div>
     </div>`
  ).join('');

  // 横棒グラフ
  const total = d.c_total || 1;
  const ph = d.c_human / total * 100;
  const pa = d.c_ai    / total * 100;
  const pi = d.c_integ / total * 100;

  const setBar = (id, pct, label) => {
    const el = document.getElementById(id);
    el.style.width = pct.toFixed(1) + '%';
    el.textContent = pct >= 8 ? pct.toFixed(0) + '%' : '';
    el.title = label;
  };
  setBar('bar-human', ph, `人的コスト ${fmt(d.c_human)} (${ph.toFixed(1)}%)`);
  setBar('bar-ai',    pa, `AIコスト ${fmt(d.c_ai)} (${pa.toFixed(1)}%)`);
  setBar('bar-integ', pi, `統合コスト ${fmt(d.c_integ)} (${pi.toFixed(1)}%)`);

  document.getElementById('leg-human').textContent = `人的 ${fmt(d.c_human)} (${ph.toFixed(1)}%)`;
  document.getElementById('leg-ai').textContent    = `AI ${fmt(d.c_ai)} (${pa.toFixed(1)}%)`;
  document.getElementById('leg-integ').textContent = `統合 ${fmt(d.c_integ)} (${pi.toFixed(1)}%)`;

  // タブサマリー更新
  const sumSF = P.prec + P.flex + P.resl + P.team + P.pmat;
  const E_val = 0.91 + 0.01 * sumSF;
  document.getElementById('sf-summary').innerHTML =
    `ΣSF = ${sumSF}　→　E = <span class="val">0.91 + 0.01×${sumSF} = ${fmtN(E_val,4)}</span>`;

  const piEM = P.rely*P.data*P.cplx*P.ruse*P.plat*P.pcap*P.pexp*P.ailx*P.tool*P.sced;
  document.getElementById('em-summary').innerHTML =
    `ΠEM = <span class="val">${fmtN(piEM,4)}</span>`;

  renderChart();
}

// ── FP感度グラフ ──────────────────────────────────────────────
function renderChart() {
  const canvas = document.getElementById('fp-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dpr = window.devicePixelRatio || 1;
  const wrap = canvas.parentElement;
  const cssW = wrap.clientWidth - 28;
  const cssH = 150;
  if (cssW <= 0) return;
  canvas.width  = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.width  = cssW + 'px';
  canvas.style.height = cssH + 'px';
  ctx.scale(dpr, dpr);

  const W = cssW, H = cssH;
  const pad = { left: 54, right: 10, top: 10, bottom: 26 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top  - pad.bottom;

  const fpMin = 10, fpMax = 3000, N = 80;

  // FPを順番に変えてコストをサンプリング（P.fpを一時的に書き換え）
  const origFP = P.fp;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    P.fp = fpMin + (fpMax - fpMin) * i / N;
    pts.push({ fp: P.fp, cost: calc().c_total });
  }
  P.fp = origFP;

  const maxCost = Math.max(...pts.map(p => p.cost)) * 1.08;
  const xOf = fp   => pad.left + (fp - fpMin) / (fpMax - fpMin) * plotW;
  const yOf = cost => pad.top  + plotH * (1 - cost / maxCost);

  // 背景
  ctx.fillStyle = '#0B1628';
  ctx.fillRect(0, 0, W, H);

  // グリッド
  ctx.strokeStyle = 'rgba(28,48,80,0.9)';
  ctx.lineWidth = 0.5;
  for (let i = 1; i <= 4; i++) {
    const y = pad.top + plotH * (1 - i / 4);
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + plotW, y); ctx.stroke();
  }
  [500, 1000, 1500, 2000, 2500].forEach(fp => {
    const x = xOf(fp);
    ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + plotH); ctx.stroke();
  });

  // 曲線の塗り
  ctx.beginPath();
  pts.forEach((p, i) => { i === 0 ? ctx.moveTo(xOf(p.fp), yOf(p.cost)) : ctx.lineTo(xOf(p.fp), yOf(p.cost)); });
  ctx.lineTo(xOf(fpMax), pad.top + plotH);
  ctx.lineTo(xOf(fpMin), pad.top + plotH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(91,164,207,0.10)';
  ctx.fill();

  // 曲線
  ctx.beginPath();
  pts.forEach((p, i) => { i === 0 ? ctx.moveTo(xOf(p.fp), yOf(p.cost)) : ctx.lineTo(xOf(p.fp), yOf(p.cost)); });
  ctx.strokeStyle = '#5BA4CF';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 現在FPの縦線（破線）
  const curX = xOf(P.fp);
  const curY = yOf(calc().c_total);
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = 'rgba(233,196,106,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(curX, pad.top); ctx.lineTo(curX, pad.top + plotH); ctx.stroke();
  ctx.setLineDash([]);

  // 現在値ドット
  ctx.beginPath();
  ctx.arc(curX, curY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#E9C46A';
  ctx.fill();

  // 軸
  ctx.strokeStyle = 'rgba(78,106,136,0.9)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + plotH);
  ctx.lineTo(pad.left + plotW, pad.top + plotH);
  ctx.stroke();

  // Y軸ラベル
  ctx.fillStyle = '#4E6A88';
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) {
    const cost = maxCost * i / 4;
    const y = pad.top + plotH * (1 - i / 4);
    const lbl = cost >= 1e8 ? (cost / 1e8).toFixed(1) + '億'
              : cost >= 1e6 ? (cost / 1e6).toFixed(0) + 'M'
              : (cost / 1000).toFixed(0) + 'K';
    ctx.fillText('¥' + lbl, pad.left - 4, y);
  }

  // X軸ラベル
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  [500, 1000, 1500, 2000, 2500, 3000].forEach(fp => {
    ctx.fillText(fp, xOf(fp), pad.top + plotH + 4);
  });

  // 現在FPラベル
  ctx.fillStyle = '#E9C46A';
  ctx.font = 'bold 9px sans-serif';
  const labelRight = curX > W * 0.65;
  ctx.textAlign = labelRight ? 'right' : 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(Math.round(P.fp) + ' FP', labelRight ? curX - 6 : curX + 6, curY - 2);
}

// ── DOM ヘルパー ──────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function makeSlider(id, key, min, max, step, fmt_fn) {
  const slider = document.getElementById('sl-' + id);
  const disp   = document.getElementById('val-' + id);
  if (!slider || !disp) return;
  slider.min   = min;
  slider.max   = max;
  slider.step  = step;
  slider.value = P[key];
  disp.textContent = fmt_fn(P[key]);
  slider.addEventListener('input', () => {
    P[key] = parseFloat(slider.value);
    disp.textContent = fmt_fn(P[key]);
    if (key in SF_SIDE_EFFECT) SF_SIDE_EFFECT[key]();
    render();
  });
}

const SF_SIDE_EFFECT = {
  prec: () => updateSfLabel('prec'),
  flex: () => updateSfLabel('flex'),
  resl: () => updateSfLabel('resl'),
  team: () => updateSfLabel('team'),
  pmat: () => updateSfLabel('pmat'),
};

function updateSfLabel(key) {
  const el = document.getElementById('sf-label-' + key);
  if (el) el.textContent = SF_LABELS[Math.round(P[key])] || '';
}

// ── 初期化 ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── AI診断ページからのパラメータ適用 ──────────────────────────
  const _aiDiag = localStorage.getItem('aicocomo_ai_params');
  if (_aiDiag) {
    try {
      const _ap = JSON.parse(_aiDiag);
      ['hrate','ailx','gamma','delta','pout','pin','lai_m','members','tool','months'].forEach(k => {
        if (_ap[k] !== undefined) P[k] = _ap[k];
      });
      localStorage.removeItem('aicocomo_ai_params');
      // 適用通知バナーを表示
      const banner = document.getElementById('diag-applied-banner');
      if (banner) { banner.style.display = 'flex'; setTimeout(() => banner.remove(), 6000); }
    } catch(e) { /* ignore */ }
  }

  // 言語セレクト
  const langSel = document.getElementById('sel-lang');
  LANG_OPTIONS.forEach((opt, i) => {
    const o = document.createElement('option');
    o.value = opt.cf;
    o.textContent = opt.label;
    if (opt.cf === P.cf) o.selected = true;
    langSel.appendChild(o);
  });
  langSel.addEventListener('change', () => {
    P.cf = parseFloat(langSel.value);
    render();
  });

  // 基本パラメータ スライダー
  makeSlider('fp',    'fp',    10,   3000, 10,  v => v + ' FP');
  makeSlider('rnew',  'rnew',  20,   100,  5,   v => v + '%');
  makeSlider('labor', 'labor', 3000, 20000,250, v => '¥' + v.toLocaleString('ja-JP'));
  makeSlider('fx',    'fx',    100,  200,  1,   v => v + ' ¥/$');

  // SF スライダー
  ['prec','flex','resl','team','pmat'].forEach(key => {
    makeSlider(key, key, 0, 5, 1, v => v);
    updateSfLabel(key);
  });

  // EM スライダー
  ['rely','data','cplx','ruse','plat','pcap','pexp','ailx','tool','sced'].forEach(key => {
    makeSlider(key, key, 0.50, 1.50, 0.05, v => parseFloat(v).toFixed(2));
  });

  // AI設定スライダー
  makeSlider('hrate',  'hrate',  10,  100,  5,    v => v + '%');
  makeSlider('pout',   'pout',   1,   80,   1,    v => '$' + v + '/MTok');
  makeSlider('pin',    'pin',    0.25,20,   0.25, v => '$' + parseFloat(v).toFixed(2) + '/MTok');
  makeSlider('gamma',  'gamma',  1.0, 5.0,  0.1,  v => parseFloat(v).toFixed(1) + '×');
  makeSlider('lai_m',   'lai_m',   0,  30000, 500, v => '¥' + v.toLocaleString('ja-JP'));
  makeSlider('members', 'members', 1,  20,    1,   v => v + '人');
  makeSlider('months',  'months',  1,  36,    1,   v => v + '月');
  makeSlider('delta',  'delta',  0,   30,   1,    v => v + '%');

  // 折りたたみパネル
  document.querySelectorAll('.panel-header[data-toggle]').forEach(h => {
    h.addEventListener('click', () => {
      const target = document.getElementById(h.dataset.toggle);
      if (!target) return;
      const isHidden = target.classList.toggle('hidden');
      h.closest('.panel')?.classList.toggle('collapsed', isHidden);
    });
  });

  // タブ切替
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.tabGroup;
      document.querySelectorAll(`.tab-btn[data-tab-group="${group}"]`).forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`.tab-panel[data-tab-group="${group}"]`).forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab)?.classList.add('active');
    });
  });

  // プリセット
  Object.keys(PRESETS).forEach(key => {
    const btn = document.getElementById('preset-' + key);
    if (!btn) return;
    btn.addEventListener('click', () => {
      P = Object.assign({}, PRESETS[key].v);
      applyAllInputs();
      render();
    });
  });

  // 初回描画
  render();
});

// スライダー・セレクトをPの値に同期
function applyAllInputs() {
  const setSlider = (id, key, fmt_fn) => {
    const sl = document.getElementById('sl-' + id);
    const dv = document.getElementById('val-' + id);
    if (!sl || !dv) return;
    sl.value = P[key];
    dv.textContent = fmt_fn(P[key]);
  };

  const langSel = document.getElementById('sel-lang');
  langSel.value = P.cf;

  setSlider('fp',    'fp',    v => v + ' FP');
  setSlider('rnew',  'rnew',  v => v + '%');
  setSlider('labor', 'labor', v => '¥' + v.toLocaleString('ja-JP'));
  setSlider('fx',    'fx',    v => v + ' ¥/$');

  ['prec','flex','resl','team','pmat'].forEach(key => {
    setSlider(key, key, v => v);
    updateSfLabel(key);
  });
  ['rely','data','cplx','ruse','plat','pcap','pexp','ailx','tool','sced'].forEach(key => {
    setSlider(key, key, v => parseFloat(v).toFixed(2));
  });
  setSlider('hrate',  'hrate',  v => v + '%');
  setSlider('pout',   'pout',   v => '$' + v + '/MTok');
  setSlider('pin',    'pin',    v => '$' + parseFloat(v).toFixed(2) + '/MTok');
  setSlider('gamma',  'gamma',  v => parseFloat(v).toFixed(1) + '×');
  setSlider('lai_m',   'lai_m',   v => '¥' + v.toLocaleString('ja-JP'));
  setSlider('members', 'members', v => v + '人');
  setSlider('months',  'months',  v => v + '月');
  setSlider('delta',  'delta',  v => v + '%');
}
