// ============================================================
// Telemetry counters: numbers count up from 0 the first time
// the stat strip scrolls into view.
//
// To edit the numbers themselves, don't touch this file —
// go to index.html and change the data-count="..." values
// on the <span class="telemetry__num"> elements.
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';

  if (prefersReducedMotion || isNaN(target)) {
    el.textContent = target + suffix;
    return;
  }

  const duration = 1400; // ms
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // ease-out for a natural "settling" feel
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = value.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

const telemetryEls = document.querySelectorAll('.telemetry__num');

if (telemetryEls.length) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target); // only run once
      }
    });
  }, { threshold: 0.4 });

  telemetryEls.forEach(el => observer.observe(el));
}
