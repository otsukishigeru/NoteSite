// ================================================================
// 大槻繁 note メッセージ紹介サイト — メインスクリプト
// ================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── スムーズスクロール ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = document.querySelector('.site-header')?.offsetHeight ?? 64;
      window.scrollTo({ top: target.offsetTop - offset - 8, behavior: 'smooth' });
      // モバイルナビを閉じる
      document.querySelector('.mobile-nav')?.classList.remove('open');
    });
  });

  // ── ハンバーガーメニュー ──
  const hamburger = document.querySelector('.hamburger');
  const mobileNav  = document.querySelector('.mobile-nav');
  hamburger?.addEventListener('click', () => {
    mobileNav?.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (mobileNav?.classList.contains('open')) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // ── ページトップボタン ──
  const topBtn = document.querySelector('.page-top');
  window.addEventListener('scroll', () => {
    if (topBtn) {
      topBtn.classList.toggle('visible', window.scrollY > 300);
    }
  }, { passive: true });
  topBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ── スクロールフェードイン ──
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

});
