// ============================================================
// To edit the stat numbers themselves, don't touch this file —
// go to index.html and change the data-count="..." values
// on the <span class="stat__num"> elements in the About section.
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Animated counters (About section stats) ---------- */
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
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out
    const value = Math.round(eased * target);
    el.textContent = value.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

const countEls = document.querySelectorAll('.stat__num');

if (countEls.length) {
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target); // only run once per element
      }
    });
  }, { threshold: 0.4 });

  countEls.forEach(el => countObserver.observe(el));
}

/* ---------- Scroll reveal (fade/slide in as sections enter view) ---------- */
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
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
  }
}

/* ---------- Back-to-top button ---------- */
const backToTop = document.getElementById('backToTop');

if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}
