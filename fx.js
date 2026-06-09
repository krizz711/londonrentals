/* ============================================================
   LondonRental.ca — motion & feel (GSAP)
   • Scroll reveals (ScrollTrigger.batch) with graceful fallback
   • Subtle hero parallax
   • Lazy hero background video (poster shows instantly)
   • Custom gold cursor with hover "magnet" on interactive els
   Everything degrades to a static, fully-visible page.
   ============================================================ */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- reveals ---------------- */
  function tagReveals() {
    document.querySelectorAll('.svc-grid, .list-grid, .stat-grid, .control-list').forEach((group) => {
      const sel = group.classList.contains('svc-grid') ? '.svc-card'
        : group.classList.contains('list-grid') ? '.listing'
        : group.classList.contains('stat-grid') ? '.stat' : '.control-item';
      group.querySelectorAll(sel).forEach((el, i) => { el.classList.add('reveal'); el.dataset.stagger = i; });
    });
  }
  function showEl(el) {
    if (el.classList.contains('in')) return;
    const i = parseInt(el.dataset.stagger || '0', 10);
    el.style.transitionDelay = (i % 6) * 70 + 'ms';
    el.classList.add('in');
    const num = el.matches('.stat') ? el.querySelector('.num[data-count]') : null;
    if (num && window.LR_countUp) window.LR_countUp(num);
  }

  function initReveals() {
    tagReveals();
    const els = Array.from(document.querySelectorAll('.reveal'));
    if (reduce || !hasGSAP || !window.ScrollTrigger) {
      els.forEach(showEl); // no motion: just show
      return;
    }
    document.documentElement.classList.add('anim');
    ScrollTrigger.batch('.reveal', {
      start: 'top 88%',
      onEnter: (batch) => batch.forEach(showEl),
      once: true,
    });
    // safety: reveal anything still hidden
    setTimeout(() => els.forEach(showEl), 6000);
  }

  /* ---------------- hero parallax ---------------- */
  function initParallax() {
    if (reduce || !hasGSAP || !window.ScrollTrigger) return;
    const inner = document.querySelector('.hero-inner');
    gsap.to('#hero-media', {
      yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '.hero-scene', start: 'top top', end: 'bottom top', scrub: 0.6 },
    });
    if (inner) gsap.to(inner, {
      yPercent: -18, opacity: 0.15, ease: 'none',
      scrollTrigger: { trigger: '.hero-scene', start: 'top top', end: 'bottom top', scrub: 0.4 },
    });
  }

  /* ---------------- custom cursor ---------------- */
  function initCursor() {
    if (!fine || reduce) return;
    const dot = document.createElement('div'); dot.id = 'lr-cur';
    const ring = document.createElement('div'); ring.id = 'lr-ring';
    document.body.appendChild(ring); document.body.appendChild(dot);
    document.body.classList.add('lr-cursor');

    let setDotX, setDotY, setRingX, setRingY;
    if (hasGSAP) {
      setDotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
      setDotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
      setRingX = gsap.quickTo(ring, 'x', { duration: 0.32, ease: 'power3' });
      setRingY = gsap.quickTo(ring, 'y', { duration: 0.32, ease: 'power3' });
    }
    window.addEventListener('mousemove', (e) => {
      if (hasGSAP) { setDotX(e.clientX); setDotY(e.clientY); setRingX(e.clientX); setRingY(e.clientY); }
      else {
        dot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
        ring.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) translate(-50%,-50%)';
      }
    }, { passive: true });
    // gsap quickTo sets x/y as transforms; align origin
    if (hasGSAP) { gsap.set([dot, ring], { xPercent: -50, yPercent: -50 }); }

    const HOT = 'a, button, .chip, .listing, .svc-card, [data-landlord], .lr-close, input, select, textarea, .lr-chiprow .c, .admin-card';
    document.addEventListener('mouseover', (e) => { if (e.target.closest(HOT)) document.body.classList.add('lr-hot'); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest(HOT) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOT))) document.body.classList.remove('lr-hot'); });
    document.addEventListener('mousedown', () => document.body.classList.add('lr-down'));
    document.addEventListener('mouseup', () => document.body.classList.remove('lr-down'));
    document.addEventListener('mouseleave', () => { dot.classList.add('hide'); ring.classList.add('hide'); });
    document.addEventListener('mouseenter', () => { dot.classList.remove('hide'); ring.classList.remove('hide'); });
  }

  /* ---------------- public refresh (after listing re-render) ---------------- */
  window.LR_FX = {
    refresh() {
      tagReveals();
      if (reduce || !hasGSAP || !window.ScrollTrigger) {
        document.querySelectorAll('.list-grid .reveal').forEach(showEl);
      } else {
        document.querySelectorAll('.list-grid .reveal:not(.in)').forEach(showEl);
        ScrollTrigger.refresh();
      }
    },
  };

  initReveals();
  initParallax();
  initCursor();
})();
