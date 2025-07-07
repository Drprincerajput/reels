const API_URL = 'https://fvmh12m8mc.execute-api.ap-south-1.amazonaws.com/api/clips';
let globalUnmuted = false;
let clipsData = [];
let loadedClips = 0;
const BATCH_SIZE = 4;
let observer;

async function fetchClips() {
  const res = await fetch(API_URL);
  const data = await res.json();
  const loader = document.getElementById('loader');
  loader.style.display = 'none';

  // Filter valid MP4 clips only
  clipsData = data.filter(clip => clip.src && clip.src.endsWith('.mp4'));
  loadNextBatch();
}

function loadNextBatch() {
  const container = document.getElementById('clip-container');
  const batch = clipsData.slice(loadedClips, loadedClips + BATCH_SIZE);

  batch.forEach((clip) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'reel';

    const video = document.createElement('video');
    video.src = clip.src;
    video.muted = !globalUnmuted;
    video.loop = true;
    video.playsInline = true;
    wrapper.appendChild(video);

    // ✅ Play/pause on click
    video.addEventListener('click', () => {
      if (video.paused) video.play();
      else video.pause();
    });

    // 🔊 Controls
    const controls = document.createElement('div');
    controls.className = 'controls';

    const soundBtn = document.createElement('button');
    soundBtn.innerHTML = video.muted ? '🔇' : '🔊';
    soundBtn.className = 'sound-btn';

    soundBtn.onclick = () => {
      globalUnmuted = !globalUnmuted;
      document.querySelectorAll('video').forEach(v => v.muted = !globalUnmuted);
      document.querySelectorAll('.sound-btn').forEach(btn => {
        btn.innerHTML = globalUnmuted ? '🔊' : '🔇';
      });
    };

    const shareBtn = document.createElement('button');
    const shareIcon = document.createElement('img');
    shareIcon.src = 'web-app-manifest-192x192.png';
    shareIcon.alt = 'Share';
    shareIcon.style.width = '24px';
    shareBtn.appendChild(shareIcon);

    shareBtn.onclick = async () => {
      try {
        if (navigator.share) {
          await navigator.share({ title: clip.title || "Clip", url: clip.src });
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(clip.src);
          alert('Link copied to clipboard!');
        } else {
          prompt('Copy this link:', clip.src);
        }
      } catch (err) {
        alert('Could not share: ' + (err.message || 'Unknown error'));
      }
    };

    controls.appendChild(soundBtn);
    controls.appendChild(shareBtn);
    wrapper.appendChild(controls);
    container.appendChild(wrapper);
  });

  loadedClips += BATCH_SIZE;

  setupScrollAutoPlay();
}

function setupScrollAutoPlay() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;

      if (entry.isIntersecting) {
        video.muted = !globalUnmuted;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    const container = document.getElementById('clip-container');
    const lastReel = document.querySelector('.reel:last-child');
    const lastRect = lastReel.getBoundingClientRect();

    const scrolledPastLast =
      lastRect.top < -lastReel.offsetHeight * 0.5; // More than half out of view above

    if (scrolledPastLast) {
      const firstReel = document.querySelector('.reel:first-child');
      if (firstReel) {
        setTimeout(() => {
          firstReel.scrollIntoView({ behavior: 'smooth' });
        }, 500); // slight delay for smooth UX
      }
    } else if (
      lastRect.top < window.innerHeight * 1.5 &&
      loadedClips < clipsData.length
    ) {
      // Lazy load more clips when close to end
      loadNextBatch();
    }
  }, { threshold: 0.9 });

  document.querySelectorAll('video').forEach(video => observer.observe(video));
}


fetchClips();
