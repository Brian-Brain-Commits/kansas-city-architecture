/* essay-enhance.js — scroll-spy + reveal-on-scroll for essay pages.
   No-op on pages without .page-toc / .detail-section[id]. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = typeof window.IntersectionObserver === 'function';

  // ── Scroll-spy: highlight active .page-toc link ──
  var tocLinks = document.querySelectorAll('.page-toc-inner a[href^="#"]');
  if (hasIO && tocLinks.length) {
    var tocMap = {};
    var sections = [];
    Array.prototype.forEach.call(tocLinks, function (a) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      tocMap[id] = a;
      var el = document.getElementById(id);
      if (el) sections.push(el);
    });

    var setActive = function (id) {
      Array.prototype.forEach.call(tocLinks, function (a) {
        a.classList.remove('is-active');
      });
      var link = tocMap[id];
      if (link) link.classList.add('is-active');
    };

    // Track which sections are currently intersecting; pick top-most
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible[e.target.id] = e.target;
        else delete visible[e.target.id];
      });
      var ordered = Object.keys(visible).map(function (id) {
        return { id: id, top: visible[id].getBoundingClientRect().top };
      }).sort(function (a, b) { return a.top - b.top; });
      if (ordered.length) setActive(ordered[0].id);
    }, { rootMargin: '-18% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  // ── Scroll-reveal on section/gallery/pullquote/image-detail ──
  (function () {
    if (!hasIO || reduced) return;
    var selectors = [
      '.detail-section',
      '.detail-gallery',
      '.history-pullquote',
      '.image-detail'
    ];
    var targets = document.querySelectorAll(selectors.join(','));
    if (!targets.length) return;

    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-in');
          revealObs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });

    var viewportH = window.innerHeight;
    Array.prototype.forEach.call(targets, function (t) {
      var rect = t.getBoundingClientRect();
      if (rect.top < viewportH * 0.9) return;
      t.classList.add('reveal-pending');
      revealObs.observe(t);
    });
  })();

  // ── Style specimens: add .specimen-animate when the specimen is in view.
  // The CSS gates the draw + glow on this class, so animations start fresh
  // on scroll-in rather than running at page load regardless of position. ──
  (function () {
    var specimens = document.querySelectorAll('.style-specimen');
    if (!specimens.length) return;

    // Reduced motion: mark them all animate-ready; CSS handles the no-motion
    // fallback to render them fully drawn without the stagger.
    if (reduced || !hasIO) {
      Array.prototype.forEach.call(specimens, function (s) {
        s.classList.add('specimen-animate');
      });
      return;
    }

    var viewportH = window.innerHeight;

    var specObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('specimen-animate');
        specObs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    Array.prototype.forEach.call(specimens, function (spec) {
      var rect = spec.getBoundingClientRect();
      // Animate immediately only if the specimen's top is in the upper
      // half of the viewport — otherwise the user won't see the draw.
      if (rect.top < viewportH * 0.5 && rect.top + rect.height > 0) {
        spec.classList.add('specimen-animate');
      } else {
        specObs.observe(spec);
      }
    });
  })();
})();
