// CSS holographic card effect adapted from simeydotme's CodePen
// https://codepen.io/simeydotme/pen/wvOYJKg
// Exports scoped CSS, HTML, and JS for embedding in inline HTML pages.
// Each instance uses a unique instanceId so multiple cards can coexist.

import { HOLO_GRAIN_B64, HOLO_METAFY_B64 } from '../assets/holoCardAssets.js';

const grainDataUri = `data:image/webp;base64,${HOLO_GRAIN_B64}`;
const metafyDataUri = `data:image/png;base64,${HOLO_METAFY_B64}`;

/**
 * Scoped CSS for the holographic card effect.
 * Uses .oc-holo-* namespace and oc-holo-* keyframe names.
 * Textures are inlined as data URIs.
 */
export function getHoloCardCSS() {
  return `
/* ── OOCard Holographic CSS Effect ── */
.oc-holo-wrap {
  --oc-pointer-x: 50%;
  --oc-pointer-y: 50%;
  --oc-pointer-from-center: 0;
  --oc-pointer-from-top: 0.5;
  --oc-pointer-from-left: 0.5;
  --oc-card-opacity: 0;
  --oc-rotate-x: 0deg;
  --oc-rotate-y: 0deg;
  --oc-background-x: 50%;
  --oc-background-y: 50%;
  --oc-card-scale: 1;

  --oc-grain: url(${grainDataUri});
  --oc-metafy: url(${metafyDataUri});
  --oc-sp-1: hsl(2, 100%, 73%);
  --oc-sp-2: hsl(53, 100%, 69%);
  --oc-sp-3: hsl(93, 100%, 69%);
  --oc-sp-4: hsl(176, 100%, 76%);
  --oc-sp-5: hsl(228, 100%, 74%);
  --oc-sp-6: hsl(283, 100%, 73%);

  /* CR80 landscape: 85.6 × 53.98 mm → 3.72% / 5.89% corner radius */
  --oc-card-radius: 3.72% / 5.89%;

  perspective: 500px;
  transform: translate3d(0, 0, 0.1px);
  position: relative;
  touch-action: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.oc-holo-wrap:hover,
.oc-holo-wrap.oc-active {
  --oc-card-opacity: 1;
}

.oc-holo-card {
  width: 100%;
  max-width: 420px;
  display: grid;
  aspect-ratio: 1.586;
  border-radius: var(--oc-card-radius);
  position: relative;
  overflow: hidden;
  background-blend-mode: color-dodge, normal, normal, normal;
  box-shadow: rgba(0,0,0,0.8)
    calc((var(--oc-pointer-from-left) * 10px) - 3px)
    calc((var(--oc-pointer-from-top) * 20px) - 6px)
    20px -5px;
  transition: transform 1s ease;
  transform: translate3d(0, 0, 0.1px) rotateX(0deg) rotateY(0deg);
  background-size: 100% 100%;
  background-position: 0px 0px, 0px 0px, 50% 50%, 0px 0px;
  background-image:
    radial-gradient(
      farthest-side circle at var(--oc-pointer-x, 50%) var(--oc-pointer-y, 50%),
      hsla(266, 100%, 90%, var(--oc-card-opacity)) 4%,
      hsla(266, 50%, 80%, calc(var(--oc-card-opacity) * 0.75)) 10%,
      hsla(266, 25%, 70%, calc(var(--oc-card-opacity) * 0.5)) 50%,
      hsla(266, 0%, 60%, 0) 100%
    ),
    radial-gradient(35% 52% at 55% 20%, #00FFAAC4 0%, #073AFF00 100%),
    radial-gradient(100% 100% at 50% 50%, #00C1FFFF 1%, #073AFF00 76%),
    conic-gradient(from 124deg at 50% 50%, #C137FFFF 0%, #07C6FFFF 40%, #07C6FFFF 60%, #C137FFFF 100%);
}

.oc-holo-card:hover,
.oc-holo-card.oc-active {
  transition: none;
  transform: translate3d(0,0,0.1px) rotateX(var(--oc-rotate-y)) rotateY(var(--oc-rotate-x));
}

.oc-holo-card > * {
  display: grid;
  grid-area: 1 / -1;
  border-radius: var(--oc-card-radius);
  transform: translate3d(0px, 0px, 0.1px);
  pointer-events: none;
}

.oc-holo-inside {
  inset: 1px;
  position: absolute;
  background-image: linear-gradient(145deg, #60496e8c 0%, #71C4FF44 100%);
  background-color: rgb(0 0 0 / 90%);
  transform: translate3d(0px, 0px, 0.01px);
  display: grid;
}
.oc-holo-inside > * {
  display: grid;
  grid-area: 1 / -1;
  border-radius: var(--oc-card-radius);
  transform: translate3d(0px, 0px, 0.1px);
  pointer-events: none;
}

/* ── Shine layer ── */
.oc-holo-shine {
  mask-image: var(--oc-metafy);
  -webkit-mask-image: var(--oc-metafy);
  mask-mode: luminance;
  mask-repeat: repeat;
  -webkit-mask-repeat: repeat;
  mask-size: 150%;
  -webkit-mask-size: 150%;
  mask-position: top calc(50% - var(--oc-background-y)) left calc(50% - var(--oc-background-x));
  -webkit-mask-position: top calc(50% - var(--oc-background-y)) left calc(50% - var(--oc-background-x));
  transition: filter 0.6s ease;
  filter: brightness(0.8) contrast(1.5) saturate(0.8) opacity(0.7);
  animation: oc-holo-bg 18s linear infinite;
  -webkit-animation: oc-holo-bg 18s linear infinite;
  mix-blend-mode: color-dodge;
}

.oc-holo-shine,
.oc-holo-shine::after {
  --oc-space: 5%;
  --oc-angle: -45deg;
  display: grid;
  transform: translate3d(0, 0, 1px);
  overflow: hidden;
  z-index: 3;
  background: transparent;
  background-size: cover;
  background-position: center;
  background-image:
    repeating-linear-gradient(0deg,
      var(--oc-sp-1) calc(var(--oc-space)*1),
      var(--oc-sp-2) calc(var(--oc-space)*2),
      var(--oc-sp-3) calc(var(--oc-space)*3),
      var(--oc-sp-4) calc(var(--oc-space)*4),
      var(--oc-sp-5) calc(var(--oc-space)*5),
      var(--oc-sp-6) calc(var(--oc-space)*6),
      var(--oc-sp-1) calc(var(--oc-space)*7)
    ),
    repeating-linear-gradient(
      var(--oc-angle),
      #0e152e 0%,
      hsl(180, 10%, 60%) 3.8%,
      hsl(180, 29%, 66%) 4.5%,
      hsl(180, 10%, 60%) 5.2%,
      #0e152e 10%,
      #0e152e 12%
    ),
    radial-gradient(
      farthest-corner circle at var(--oc-pointer-x) var(--oc-pointer-y),
      hsla(0, 0%, 0%, 0.1) 12%,
      hsla(0, 0%, 0%, 0.15) 20%,
      hsla(0, 0%, 0%, 0.25) 120%
    );
  background-position: 0% var(--oc-background-y), calc(var(--oc-background-x)) var(--oc-background-y), center center;
  background-blend-mode: color, hard-light;
  background-size: 500% 500%, 300% 300%, 200% 200%;
  background-repeat: repeat;
}

.oc-holo-shine::before,
.oc-holo-shine::after {
  content: "";
  background-position: center;
  background-size: cover;
  grid-area: 1/1;
  pointer-events: none;
}
.oc-holo-shine::before {
  opacity: 0.7;
}
.oc-holo-shine::after {
  opacity: 0;
}

.oc-holo-card:hover .oc-holo-shine,
.oc-holo-card.oc-active .oc-holo-shine {
  filter: brightness(0.9) contrast(1.6) saturate(1);
  animation: none;
  -webkit-animation: none;
}
.oc-holo-card:hover .oc-holo-shine::before,
.oc-holo-card:hover .oc-holo-shine::after,
.oc-holo-card.oc-active .oc-holo-shine::before,
.oc-holo-card.oc-active .oc-holo-shine::after {
  opacity: 1;
}

.oc-holo-shine::before {
  background-image:
    linear-gradient(45deg,
      var(--oc-sp-4),
      var(--oc-sp-5),
      var(--oc-sp-6),
      var(--oc-sp-1),
      var(--oc-sp-2),
      var(--oc-sp-3)
    ),
    radial-gradient(circle at var(--oc-pointer-x) var(--oc-pointer-y), hsl(0, 0%, 70%) 0%, hsla(0, 0%, 30%, 20%) 90%),
    var(--oc-grain);
  background-size: 250% 250%, 100% 100%, 220px 220px;
  background-position:
    var(--oc-pointer-x) var(--oc-pointer-y),
    center center,
    calc(var(--oc-pointer-x) * 0.01) calc(var(--oc-pointer-y) * 0.01);
  background-blend-mode: color-dodge;
  filter:
    brightness(calc(2 - var(--oc-pointer-from-center)))
    contrast(calc(var(--oc-pointer-from-center) + 2))
    saturate(calc(0.5 + var(--oc-pointer-from-center)));
  mix-blend-mode: luminosity;
}

.oc-holo-shine::after {
  background-position:
    0% var(--oc-background-y),
    calc(var(--oc-background-x) * 0.4) calc(var(--oc-background-y) * 0.5),
    center center;
  background-size: 200% 300%, 700% 700%, 100% 100%;
  mix-blend-mode: difference;
  filter: brightness(0.8) contrast(1.5);
}

/* ── Glare layer ── */
.oc-holo-glare {
  transform: translate3d(0, 0, 1.1px);
  overflow: hidden;
  background-image:
    radial-gradient(
      farthest-corner circle at var(--oc-pointer-x) var(--oc-pointer-y),
      hsl(248, 25%, 80%) 12%,
      hsla(207, 40%, 30%, 0.8) 90%
    );
  mix-blend-mode: overlay;
  filter: brightness(0.8) contrast(1.2);
  z-index: 4;
}

/* ── Content layer (card face image) ── */
.oc-holo-content {
  z-index: 2;
  overflow: hidden;
  display: grid;
}

.oc-holo-face {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--oc-card-radius);
  display: block;
  opacity: 1;
}

/* will-change for performance */
.oc-holo-shine,
.oc-holo-glare {
  will-change: transform, opacity, background-image, background-size,
    background-position, background-blend-mode, filter;
}

/* ── Keyframes ── */
@keyframes oc-holo-bg {
  0%   { background-position: 0% var(--oc-background-y), 0% 0%, center center; }
  100% { background-position: 0% var(--oc-background-y), 90% 90%, center center; }
}
@-webkit-keyframes oc-holo-bg {
  0%   { background-position: 0% var(--oc-background-y), 0% 0%, center center; }
  100% { background-position: 0% var(--oc-background-y), 90% 90%, center center; }
}

/* ── No-image placeholder ── */
.oc-holo-face[src=""],
.oc-holo-face:not([src]) {
  visibility: hidden;
}
`;
}

/**
 * HTML structure for one holographic card instance.
 * @param {string} instanceId — unique suffix for element IDs
 */
export function getHoloCardHTML(instanceId) {
  return `
<div class="oc-holo-wrap" id="oc-holo-wrap-${instanceId}">
  <div class="oc-holo-card" id="oc-holo-card-${instanceId}">
    <div class="oc-holo-inside">
      <div class="oc-holo-shine"></div>
      <div class="oc-holo-glare"></div>
      <div class="oc-holo-content">
        <img id="oc-holo-face-${instanceId}" class="oc-holo-face" src="" alt="Card face" />
      </div>
    </div>
  </div>
</div>`;
}

/**
 * Pointer-tracking JS scoped to a specific instance.
 * @param {string} instanceId — matches the IDs in getHoloCardHTML
 */
export function getHoloCardJS(instanceId) {
  return `
// ── OOCard Holo pointer tracking: ${instanceId} ──
(function() {
  var wrap = document.getElementById('oc-holo-wrap-${instanceId}');
  var card = document.getElementById('oc-holo-card-${instanceId}');
  if (!wrap || !card) return;

  function ocRound(v, p) { p = p || 3; return parseFloat(v.toFixed(p)); }
  function ocClamp(v, mn, mx) { return Math.min(Math.max(v, mn), mx); }
  function ocAdjust(v, fMin, fMax, tMin, tMax) {
    return ocRound(tMin + (tMax - tMin) * (v - fMin) / (fMax - fMin));
  }
  function ocEase(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function cardUpdate(e) {
    var pos = [e.offsetX, e.offsetY];
    var dim = card.getBoundingClientRect();
    var l = pos[0], t = pos[1];
    var h = dim.height, w = dim.width;
    var px = ocClamp(Math.abs(100 / w * l), 0, 100);
    var py = ocClamp(Math.abs(100 / h * t), 0, 100);
    var cx = px - 50, cy = py - 50;

    wrap.style.cssText =
      '--oc-pointer-x:' + px + '%;' +
      '--oc-pointer-y:' + py + '%;' +
      '--oc-background-x:' + ocAdjust(px, 0, 100, 35, 65) + '%;' +
      '--oc-background-y:' + ocAdjust(py, 0, 100, 35, 65) + '%;' +
      '--oc-pointer-from-center:' + ocClamp(Math.sqrt(cy*cy + cx*cx) / 50, 0, 1) + ';' +
      '--oc-pointer-from-top:' + (py / 100) + ';' +
      '--oc-pointer-from-left:' + (px / 100) + ';' +
      '--oc-rotate-x:' + ocRound(-(cx / 5)) + 'deg;' +
      '--oc-rotate-y:' + ocRound(cy / 4) + 'deg;' +
      '--oc-card-opacity:1;';
  }

  var halfW, halfH, easer;

  function recalcHalf() {
    halfW = wrap.clientWidth / 2;
    halfH = wrap.clientHeight / 2;
  }
  recalcHalf();

  function easedFunc(dur, onProgress, onComplete) {
    var start = performance.now();
    var canceled = false;
    function loop() {
      if (canceled) return;
      var p = (performance.now() - start) / dur;
      onProgress(ocEase(Math.min(p, 1)));
      if (p < 1) { requestAnimationFrame(loop); }
      else if (onComplete) { onComplete(); }
    }
    loop();
    return { cancel: function() { canceled = true; } };
  }

  card.addEventListener('pointerenter', function() {
    if (easer) easer.cancel();
    recalcHalf();
  });

  card.addEventListener('pointermove', cardUpdate);

  card.addEventListener('pointerout', function(e) {
    easer = easedFunc(1000,
      function(p) {
        var x = ocAdjust(p, 0, 1, e.offsetX, halfW);
        var y = ocAdjust(p, 0, 1, e.offsetY, halfH);
        cardUpdate({ offsetX: x, offsetY: y });
      },
      function() {
        card.classList.remove('oc-active');
        wrap.classList.remove('oc-active');
        wrap.style.cssText = '';
      }
    );
  });
})();
`;
}

// ─────────────────────────────────────────────────────────
// Model-Viewer Overlay Mode
// Layers the holographic shine + glare ON TOP of a model-viewer.
// Model-viewer handles 3D rendering and camera; CSS handles shimmer.
// ─────────────────────────────────────────────────────────

/**
 * Additional CSS for the model-viewer overlay mode.
 * Reuses the shine/glare styles from the card mode via shared classes.
 */
export function getHoloOverlayCSS() {
  return `
/* ── Model-Viewer Holographic Overlay ── */
.oc-mv-holo-wrap {
  --oc-pointer-x: 50%;
  --oc-pointer-y: 50%;
  --oc-pointer-from-center: 0;
  --oc-card-opacity: 0;

  position: relative;
  width: 100%;
  height: 100%;
}

.oc-mv-holo-wrap:hover,
.oc-mv-holo-wrap.oc-active {
  --oc-card-opacity: 1;
}

/* Overlay — just a subtle cursor-tracking glare.
   No rainbow gradients, no metafy mask.
   Model-viewer iridescence handles the spectrum effect. */
.oc-mv-overlay {
  display: none;
}

.oc-mv-overlay .oc-mv-glare {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(
      farthest-corner circle at var(--oc-pointer-x) var(--oc-pointer-y),
      hsla(0, 0%, 100%, calc(0.2 * var(--oc-card-opacity))) 0%,
      hsla(0, 0%, 100%, calc(0.08 * var(--oc-card-opacity))) 35%,
      transparent 70%
    );
  mix-blend-mode: overlay;
  pointer-events: none;
}

.oc-mv-overlay .oc-mv-grain {
  position: absolute;
  inset: 0;
  background-image: url(${grainDataUri});
  background-size: 220px 220px;
  background-repeat: repeat;
  opacity: calc(0.08 * var(--oc-card-opacity));
  mix-blend-mode: overlay;
  pointer-events: none;
}

.oc-mv-overlay .oc-mv-metafy {
  position: absolute;
  inset: 0;
  background-image: url(${metafyDataUri});
  background-size: 150%;
  background-repeat: repeat;
  opacity: calc(0.12 * var(--oc-card-opacity));
  mix-blend-mode: soft-light;
  pointer-events: none;
}
`;
}

/**
 * HTML overlay for model-viewer. Wraps a model-viewer slot with shine + glare layers.
 * The model-viewer element itself should be placed INSIDE this wrapper.
 * @param {string} instanceId — unique suffix for element IDs
 */
export function getHoloOverlayHTML(instanceId) {
  return `
<div class="oc-mv-holo-wrap" id="oc-mv-wrap-${instanceId}">
  <div class="oc-mv-overlay">
    <div class="oc-mv-glare"></div>
    <div class="oc-mv-grain"></div>
    <div class="oc-mv-metafy"></div>
  </div>`;
}

/**
 * Closing tag for the overlay wrapper. Place after the model-viewer element.
 */
export function getHoloOverlayHTMLClose() {
  return `</div>`;
}

/**
 * Pointer-tracking JS for model-viewer overlay mode.
 * Uses clientX/clientY so events bubbling from model-viewer work correctly.
 * No tilt transform — model-viewer handles 3D rotation.
 * @param {string} instanceId — matches the IDs in getHoloOverlayHTML
 */
export function getHoloOverlayJS(instanceId) {
  return `
// ── OOCard Model-Viewer Holo overlay tracking: ${instanceId} ──
(function() {
  var wrap = document.getElementById('oc-mv-wrap-${instanceId}');
  if (!wrap) return;

  function ocRound(v, p) { p = p || 3; return parseFloat(v.toFixed(p)); }
  function ocClamp(v, mn, mx) { return Math.min(Math.max(v, mn), mx); }
  function ocAdjust(v, fMin, fMax, tMin, tMax) {
    return ocRound(tMin + (tMax - tMin) * (v - fMin) / (fMax - fMin));
  }

  function overlayUpdate(e) {
    var rect = wrap.getBoundingClientRect();
    var l = e.clientX - rect.left;
    var t = e.clientY - rect.top;
    var w = rect.width, h = rect.height;
    var px = ocClamp(100 / w * l, 0, 100);
    var py = ocClamp(100 / h * t, 0, 100);
    var cx = px - 50, cy = py - 50;

    wrap.style.setProperty('--oc-pointer-x', px + '%');
    wrap.style.setProperty('--oc-pointer-y', py + '%');
    wrap.style.setProperty('--oc-background-x', ocAdjust(px, 0, 100, 47, 53) + '%');
    wrap.style.setProperty('--oc-background-y', ocAdjust(py, 0, 100, 47, 53) + '%');
    wrap.style.setProperty('--oc-pointer-from-center', ocClamp(Math.sqrt(cy*cy + cx*cx) / 50, 0, 1));
    wrap.style.setProperty('--oc-pointer-from-top', py / 100);
    wrap.style.setProperty('--oc-pointer-from-left', px / 100);
    wrap.style.setProperty('--oc-card-opacity', '1');
  }

  wrap.addEventListener('pointerenter', function() {
    wrap.classList.add('oc-active');
  });

  wrap.addEventListener('pointermove', overlayUpdate);

  wrap.addEventListener('pointerleave', function() {
    wrap.classList.remove('oc-active');
    wrap.style.setProperty('--oc-card-opacity', '0');
  });
})();
`;
}
