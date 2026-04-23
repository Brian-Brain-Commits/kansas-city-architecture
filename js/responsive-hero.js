// v17d: On narrow viewports, swap signature-scene SVGs from
// preserveAspectRatio="xMidYMid slice" (fills container, clips sides) to
// "xMidYMid meet" (fits entire viewBox inside container with small letterbox).
// Ensures mobile users see the full left/right details of fountain & scene pages.
(function () {
  'use strict';
  var MOBILE_BREAKPOINT = 640;
  var SELECTOR = [
    '.nichols-hero-svg',
    '.meyer-hero-svg',
    '.bacchus-hero-svg',
    '.pomona-hero-svg',
    '.volker-hero-svg',
    '.firefighters-hero-svg',
    '.fountain-day-svg',
    '.midtown-hero-svg',
    '.vine-hero-svg'
  ].join(',');

  function applyAspectMode() {
    var svgs = document.querySelectorAll(SELECTOR);
    var isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    var mode = isMobile ? 'xMidYMid meet' : 'xMidYMid slice';
    svgs.forEach(function (svg) {
      if (svg.getAttribute('preserveAspectRatio') !== mode) {
        svg.setAttribute('preserveAspectRatio', mode);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAspectMode);
  } else {
    applyAspectMode();
  }

  // Throttled resize handler so rotations + browser chrome toggles stay in sync
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyAspectMode, 150);
  });
})();
