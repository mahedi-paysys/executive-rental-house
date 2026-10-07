'use strict';
/* Premium v2: preloader (vanilla) + GSAP/ScrollTrigger scroll animations (loaded from cdnjs). */
(function () {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Preloader ---------- */
  const arrival = document.querySelector('.arrival');
  if (arrival) {
    if (reduced) arrival.remove();
    else {
      root.classList.add('is-loading');
      const count = document.createElement('b');
      count.className = 'arrival-count';
      count.textContent = '00';
      arrival.append(count);
      const t0 = performance.now(), DUR = 2400;
      let loaded = document.readyState === 'complete';
      addEventListener('load', () => (loaded = true));
      (function tick(t) {
        const p = Math.min((t - t0) / DUR, 1);
        const e = 1 - Math.pow(1 - p, 3);
        arrival.style.setProperty('--p', e);
        count.textContent = String(Math.round(e * 100)).padStart(2, '0');
        if (p < 1 || !loaded) return requestAnimationFrame(tick);
        arrival.classList.add('done');
        setTimeout(() => { arrival.remove(); root.classList.remove('is-loading'); window.dispatchEvent(new Event('preloaded')); }, 1200);
      })(t0);
    }
  }
  if (reduced || !window.CONTENT_READY) return;

  /* ---------- GSAP ---------- */
  const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/';
  const load = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); });
  load(CDN + 'gsap.min.js').then(() => load(CDN + 'ScrollTrigger.min.js')).then(init).catch(() => {});

  function init() {
    gsap.registerPlugin(ScrollTrigger);
    const E = 'power3.out';
    const free = els => els.forEach(e => e && e.classList.remove('reveal', 'reveal-image'));
    const st = (trigger, extra = {}) => ({ trigger, start: 'top 85%', ...extra });

    /* Headline wipe */
    $('#about .section-headline,#relocations .section-headline,#management .experience__headline,#links .section-headline').forEach(h => {
      free([h]);
      gsap.fromTo(h, { y: 70, opacity: 0, clipPath: 'inset(0% 0% 100% 0%)' },
        { y: 0, opacity: 1, clipPath: 'inset(-10% -5% -10% -5%)', duration: 1.3, ease: E, clearProps: 'opacity,transform', scrollTrigger: st(h) });
    });
    const parallax = (img, trigger) => gsap.fromTo(img, { yPercent: -6, scale: 1.2 }, { yPercent: 6, scale: 1.2, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true } });

    /* ---- About ---- */
    const photo = $('.about-photo')[0];
    if (photo) {
      const img = photo.querySelector('img');
      const ph = document.createElement('div'); ph.className = 'ph';
      img.replaceWith(ph); ph.append(img);
      free([photo]);
      gsap.from(photo, { y: 80, opacity: 0, scale: .94, duration: 1.4, ease: E, clearProps: 'opacity,transform', scrollTrigger: st(photo) });
      parallax(img, photo);
      gsap.from('.experience-stamp', { scale: 0, rotate: -120, duration: 1.4, delay: .5, ease: 'elastic.out(1,.6)', clearProps: 'transform', scrollTrigger: st(photo) });
    }
    const copy = $('#about .intro-copy')[0];
    if (copy) { free([copy]); gsap.from([...copy.children], { y: 50, opacity: 0, stagger: .14, duration: 1.1, ease: E, clearProps: 'opacity,transform', scrollTrigger: st(copy) }); }
    free($('#about .signature'));

    /* ---- Relocations: sticky image, scrub parallax, timeline + live badge ---- */
    const vis = $('.relocation-visual')[0], steps = $('.relocation-steps>div'), rs = $('.relocation-steps')[0];
    if (vis && rs) {
      free([vis, ...steps]);
      const vimg = vis.querySelector('img');
      parallax(vimg, '.relocation-grid');
      gsap.from(vis, { clipPath: 'inset(12% 8% 12% 8% round 150px 26px 26px 26px)', duration: 1.6, ease: 'power4.out', clearProps: 'clipPath', scrollTrigger: st(vis, { start: 'top 90%' }) });
      const badge = document.createElement('div');
      badge.className = 'reloc-badge';
      badge.innerHTML = '<b></b><span></span>';
      vis.append(badge);
      const setBadge = s => {
        badge.classList.add('swap');
        setTimeout(() => { badge.firstChild.textContent = s.querySelector('span').textContent; badge.lastChild.textContent = s.querySelector('h3').textContent; badge.classList.remove('swap'); }, 220);
      };
      badge.firstChild.textContent = steps[0].querySelector('span').textContent;
      badge.lastChild.textContent = steps[0].querySelector('h3').textContent;
      steps[0].classList.add('active');
      steps.forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 58%', end: 'bottom 58%',
        onToggle: self => { if (self.isActive) { steps.forEach(o => o.classList.toggle('active', o === s)); setBadge(s); } } }));
      ScrollTrigger.create({ trigger: rs, start: 'top 65%', end: 'bottom 55%', onUpdate: self => rs.style.setProperty('--p', self.progress) });
      gsap.from(steps, { x: 50, opacity: 0, stagger: .15, duration: 1, ease: E, clearProps: 'opacity,transform', scrollTrigger: st(rs) });
      $('#relocations .relocation-grid>div:last-child>p').forEach(p => { free([p]); gsap.from(p, { y: 30, opacity: 0, duration: 1, ease: E, clearProps: 'opacity,transform', scrollTrigger: st(p, { start: 'top 90%' }) }); });
    }

    /* ---- Management: stacked cards scrub in, image parallax ---- */
    const mph = $('.management-photo')[0];
    if (mph) { free([mph]); parallax(mph.querySelector('img'), mph); gsap.from(mph, { clipPath: 'inset(0 0 100% 0 round 26px)', duration: 1.5, ease: 'power4.out', clearProps: 'clipPath', scrollTrigger: st(mph) }); }
    $('#management .experience-item').forEach(card => {
      free([card]);
      gsap.fromTo(card, { y: 110, scale: .9, opacity: 0, rotateX: -10, transformPerspective: 900 },
        { y: 0, scale: 1, opacity: 1, rotateX: 0, ease: 'none', scrollTrigger: { trigger: card, start: 'top 96%', end: 'top 60%', scrub: .7, onEnter: () => card.classList.add('is-in') } });
      gsap.to(card.querySelector('.experience-item__num'), { yPercent: -25, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    $('#management .experience__sub,#management .eyebrow').forEach(el => { free([el]); gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: E, clearProps: 'opacity,transform', scrollTrigger: st(el) }); });

    /* ---- Links: staggered rise, bg parallax, 3D tilt ---- */
    const cards = $('#links .resource-card');
    cards.forEach(c => {
      free([c]);
      ScrollTrigger.create({ trigger: c, start: 'top bottom', end: 'bottom top', onUpdate: s => c.style.setProperty('--py', (s.progress - .5) * -70) });
    });
    gsap.from(cards, { y: 120, opacity: 0, scale: .92, stagger: .18, duration: 1.4, ease: E, clearProps: 'opacity,transform', scrollTrigger: st('#links .resource-grid', { start: 'top 82%' }) });
    if (matchMedia('(hover:hover) and (pointer:fine)').matches) cards.forEach(c => {
      gsap.set(c, { transformPerspective: 1000 });
      const rx = gsap.quickTo(c, 'rotationX', { duration: .6, ease: E }), ry = gsap.quickTo(c, 'rotationY', { duration: .6, ease: E });
      c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - .5) * 8); rx(((e.clientY - r.top) / r.height - .5) * -8); });
      c.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });

    addEventListener('load', () => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 2800);
  }
})();
