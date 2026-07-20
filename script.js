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
    gain.gain.linearRampToValueAtTime(volume, startAt + 0.01);
    gain.gain.linearRampToValueAtTime(0, startAt + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + duration);
  } catch (e) {
    console.warn("Audio error:", e);
  }
}

/* ---------- System Initialization & Audio Playback ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const initScreen = document.getElementById('init-screen');
  const initBtn = document.getElementById('init-btn');
  const bootCurtain = document.getElementById('bootCurtain');
  
  // Setup MP3 Audio
  const bootSound = new Audio('loading_sfx.mp3');

  // We only run this if the init button is actually on the page
  if (initBtn && initScreen && bootCurtain) {
    initBtn.addEventListener('click', () => {
      // 1. Hide initialization screen
      initScreen.style.display = 'none';

      // 2. Play MP3
      bootSound.play().catch(error => {
        console.warn("Audio playback failed:", error);
      });

      // 3. Trigger Boot Animation
      bootCurtain.removeAttribute('aria-hidden'); 
      
      // Optional: You can still play the synth beeps alongside the MP3!
      playBeep({ freq: 880, duration: 0.1, delay: 0.2 });
      playBeep({ freq: 1200, duration: 0.2, delay: 0.4 });
    });
  }
});

/* ---------- Video Modal Logic ---------- */
function setupVideoModal() {
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

document.addEventListener('DOMContentLoaded', setupVideoModal);

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
