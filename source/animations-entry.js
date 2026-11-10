// The original taste-skill modules are bundled as an ordinary script so file:// works.
import './vendor/motion/motion.js';
import * as lib from './vendor/moments/lib.js';
import mountWords from './vendor/moments/word-highlight/moment.js';
import mountPhotos from './vendor/moments/photo-chapters/moment.js';

function initMoments() {
  const mounts = { 'word-highlight': mountWords, 'photo-chapters': mountPhotos };
  let count = 0;
  document.querySelectorAll('[data-moment]').forEach(root => {
    const mount = mounts[root.dataset.moment];
    if (!mount) return;
    try {
      root.__moment = mount(root, {}, lib);
      root.dataset.momentMounted = '1';
      count++;
    } catch (error) {
      root.classList.add('mo-safe');
      root.dataset.momentFailed = '1';
    }
  });
  document.documentElement.dataset.momentsReady = String(count);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMoments, { once: true });
else initMoments();
