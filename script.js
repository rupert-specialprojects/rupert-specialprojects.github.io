// ============================================================
// To edit the stat numbers, don't touch this file — go to
// index.html and change the data-count="..." values in the
// .stats-line under the About section.
// ============================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Synthesized sound helper (no audio file needed) ---------- */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

// freq: pitch in Hz, duration: seconds, delay: seconds from now,
// volume: 0-1 (keep this low, these are meant to be subtle)
function playBeep({ freq = 440, duration = 0.1, delay = 0, volume = 0.05, type = 'sine' } = {}) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const startAt = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    // Quick fade in/out so the tone doesn't click or pop
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(volume, startAt + 0.015);
    gain.gain.linearRampToValueAtTime(0, startAt + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  } catch (e) {
    // Audio isn't critical to the page — fail silently if it's unsupported/blocked
  }
}

/* ---------- Boot sequence (index.html home page, first load per browser session) ---------- */
const bootCurtain = document.getElementById('bootCurtain');

if (bootCurtain) {
  const alreadyBooted = sessionStorage.getItem('rr_booted');

  if (alreadyBooted) {
    bootCurtain.remove();
  } else {
    sessionStorage.setItem('rr_booted', '1');

    if (prefersReducedMotion) {
      bootCurtain.remove();
    } else {
      document.body.classList.add('boot-lock');

      const fill = document.getElementById('bootBarFill');
      const pctEl = document.getElementById('bootPct');
      const statusEl = document.getElementById('bootStatus');
      const bootAudio = document.getElementById('bootAudio');

      const fillDelay = 550;     // ms before the bar starts moving
      const fillDuration = 2000; // ms for the bar to reach 100%
      const start = performance.now();
      let finished = false;

      function playBootAudio() {
        if (!bootAudio) return;
        bootAudio.currentTime = 0;
        bootAudio.volume = 0.5; // 0–1, adjust to taste
        const playPromise = bootAudio.play();
        // Autoplay policies may block this before the visitor has interacted
        // with the page at all — that rejection is expected, not a bug.
        if (playPromise && playPromise.catch) playPromise.catch(() => {});
      }

      function stopBootAudio() {
        if (!bootAudio) return;
        bootAudio.pause();
        bootAudio.currentTime = 0;
      }

      function finishBoot() {
        if (finished) return;
        finished = true;
        stopBootAudio();
        bootCurtain.classList.add('boot-done');
        document.body.classList.remove('boot-lock');
        setTimeout(() => bootCurtain.remove(), 650);
      }

      function tick(now) {
        if (finished) return;
        const elapsed = now - start - fillDelay;
        const progress = Math.max(0, Math.min(elapsed / fillDuration, 1));
        const pct = Math.round(progress * 100);
        if (fill) fill.style.width = pct + '%';
        if (pctEl) pctEl.textContent = pct + '%';

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          if (statusEl) statusEl.textContent = 'ACCESS GRANTED';
          setTimeout(finishBoot, 350);
        }
      }

      requestAnimationFrame(tick);
      playBootAudio();
    }
  }
}

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

  if (modal && frame) {
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
}

/* ---------- Image gallery lightbox (rocketry-camp.html) ----------
   Only does anything if #imageLightbox exists on the page, so it's
   a no-op everywhere else. Wires up any .gallery-item__img that has
   a data-fullsrc attribute — placeholders without one are ignored. */
const imageLightbox = document.getElementById('imageLightbox');
const imageLightboxImg = document.getElementById('imageLightboxImg');
const imageLightboxCaption = document.getElementById('imageLightboxCaption');

if (imageLightbox && imageLightboxImg) {
  document.querySelectorAll('.gallery-item__img[data-fullsrc]').forEach(img => {
    img.addEventListener('click', () => {
      imageLightboxImg.src = img.dataset.fullsrc;
      imageLightboxImg.alt = img.alt || '';
      if (imageLightboxCaption) {
        const figcaption = img.closest('figure')?.querySelector('figcaption');
        imageLightboxCaption.textContent = figcaption ? figcaption.textContent : (img.alt || '');
      }
      imageLightbox.classList.add('open');
    });
  });

  function closeImageLightbox() {
    imageLightbox.classList.remove('open');
    imageLightboxImg.src = '';
  }

  imageLightbox.addEventListener('click', e => {
    if (e.target === imageLightbox) closeImageLightbox();
  });

  const lightboxCloseBtn = imageLightbox.querySelector('.image-lightbox__close');
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeImageLightbox);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeImageLightbox();
  });
}

/* ---------- Hero rocket launch (rocketry-camp.html) ----------
   A small easter egg — click or Enter/Space on the rocket sends
   it flying, using the same synthesized-beep helper as elsewhere. */
const heroRocket = document.getElementById('heroRocket');

if (heroRocket && !prefersReducedMotion) {
  let launching = false;

  function launchHeroRocket() {
    if (launching) return;
    launching = true;
    heroRocket.classList.add('is-launching');
    playBeep({ freq: 200, duration: 0.5, type: 'square', volume: 0.04 });
    playBeep({ freq: 260, duration: 0.35, delay: 0.08, type: 'square', volume: 0.03 });
    setTimeout(() => {
      heroRocket.classList.remove('is-launching');
      launching = false;
    }, 1150);
  }

  heroRocket.addEventListener('click', launchHeroRocket);
}

/* ---------- Custom cursor (rocketry-camp.html only) ----------
   Only activates with a fine pointer (real mouse/trackpad) and
   when the visitor hasn't asked for reduced motion — otherwise the
   ordinary system cursor is left completely alone. */
const campCursor = document.querySelector('.camp-cursor');

if (campCursor && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.body.classList.add('camp-cursor-on');

  const cursorDot = campCursor.querySelector('.camp-cursor__dot');
  const cursorRing = campCursor.querySelector('.camp-cursor__ring');

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let cursorStarted = false;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!cursorStarted) {
      cursorStarted = true;
      ringX = mouseX;
      ringY = mouseY;
      campCursor.classList.add('is-active');
    }

    if (cursorDot) {
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    }
  });

  // The ring trails slightly behind the raw mouse position for a
  // little smooth "weight" — the dot above stays glued to the pointer.
  function tickCursorRing() {
    ringX += (mouseX - ringX) * 0.9;
    ringY += (mouseY - ringY) * 0.9;
    if (cursorRing) {
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    }
    requestAnimationFrame(tickCursorRing);
  }
  requestAnimationFrame(tickCursorRing);

  document.addEventListener('mouseleave', () => campCursor.classList.remove('is-active'));
  document.addEventListener('mouseenter', () => { if (cursorStarted) campCursor.classList.add('is-active'); });

  // Re-scans on a short delay so it catches gallery images etc. that
  // are all present at load on this page (no dynamic content here).
  setTimeout(() => {
    document.querySelectorAll('a, button, .gallery-item__img').forEach(el => {
      el.addEventListener('mouseenter', () => campCursor.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => campCursor.classList.remove('is-hovering'));
    });
  }, 0);
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
