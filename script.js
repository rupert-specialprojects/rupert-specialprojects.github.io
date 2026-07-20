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

  /* sample video */
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoFrame");

  document.querySelectorAll(".video-thumb").forEach(img => {
    img.addEventListener("click", () => {
      let url = img.dataset.video;

      // Convert normal YouTube links into embed links
      if (url.includes("watch?v=")) {
        url = url.replace("watch?v=", "embed/");
      } else if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1].split("?")[0];
        url = `https://www.youtube.com/embed/${id}`;
      }

      frame.src = url + (url.includes("?") ? "&" : "?") + "autoplay=1";
      modal.classList.add("open");
    });
  });

  modal.addEventListener("click", e => {
    // Only close if the dark background is clicked
    if (e.target === modal) {
      modal.classList.remove("open");
      frame.src = "";
    }
  });
}

/* ---------- Interactive Video Hint Toast ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const hintToast = document.getElementById('video-hint-toast');
  
  if (hintToast) {
    // This will now consistently trigger 1.5 seconds after the DOM content loads
    setTimeout(() => {
      hintToast.classList.add('is-visible');
    }, 1500); 

    const closeBtn = hintToast.querySelector('.hint-toast__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        hintToast.classList.remove('is-visible');
        hintToast.classList.add('is-hidden');
      });
    }
  }
});
