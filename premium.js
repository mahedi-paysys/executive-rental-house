'use strict';
/* Premium interactions: scroll progress, hero parallax, card spotlight, count-up. Purely additive. */
(function () {
  if (!window.CONTENT_READY) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.prepend(bar);

  const bg = document.getElementById('hero-bg');
  const heroContent = document.querySelector('.hero__content');
  let ticking = false;
  function frame() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (!reduced && y < innerHeight * 1.2) {
      if (bg) bg.style.transform = `translate3d(0,${y * 0.16}px,0) scale(${1 + y / 6000})`;
      if (heroContent) {
        heroContent.style.opacity = Math.max(0, 1 - y / 650);
        heroContent.style.transform = `translate3d(0,${y * -0.08}px,0)`;
      }
    }
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();

  /* Cursor spotlight on property cards (delegated, survives re-renders) */
  const grid = document.getElementById('rental-grid');
  if (grid && !reduced) {
    grid.addEventListener('pointermove', e => {
      const card = e.target.closest('.rental-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  }

  /* Count-up for the experience badge (e.g. "20+") */
  const stat = document.querySelector('.experience-stamp strong');
  if (stat && !reduced && 'IntersectionObserver' in window) {
    const m = stat.textContent.match(/^(\D*)(\d+)(.*)$/);
    if (m) {
      const [, pre, num, suf] = m, end = Number(num);
      new IntersectionObserver((entries, obs) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        const t0 = performance.now();
        (function tick(t) {
          const p = Math.min((t - t0) / 1600, 1);
          stat.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 4))) + suf;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      }, { threshold: 0.6 }).observe(stat);
    }
  }
})();
