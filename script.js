// ============================================================
// To edit the stat numbers, don't touch this file — go to
// index.html and change the data-count="..." values in the
// .stats-line under the About section.
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Animated counters (About section stats line) ---------- */
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';

  if (prefersReducedMotion || isNaN(target)) {
    el.textContent = target + suffix;
    return;
  }

  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

const countEls = document.querySelectorAll('.stats-line b[data-count]');

if (countEls.length) {
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  countEls.forEach(el => countObserver.observe(el));
}

/* ---------- Scroll reveal — subtle fade/rise as content enters view ---------- */
const revealEls = document.querySelectorAll('.reveal');

if (revealEls.length) {
  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealEls.forEach(el => revealObserver.observe(el));
  }
}
