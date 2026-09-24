import { DOVE_BOX } from "@/components/brand/dove-path";

/**
 * The page loader's driver, inlined (with the CSP nonce) right after the
 * loader markup so it runs before the page's own JavaScript, which is most of
 * what it is waiting for. Plain ES2017: it is not compiled.
 *
 * Progress is real: finished ÷ discovered across
 *   · every script, stylesheet and preload the document references
 *     (finished = a Resource Timing entry exists for it),
 *   · every eagerly loading <img> (finished = complete),
 *   · three milestones: document parsed, fonts ready, window load.
 * It reaches 100 only once the page has loaded. The count chases the real
 * value at most 100 % per 0.8 s, so a cached visit still reads as a count.
 * Twelve seconds is the ceiling: nobody is ever held longer.
 *
 * On finishing it records <html data-preloaded-at> (motion timing counts from
 * it), removes <html data-preloading> (scroll unlocks, the hero intro plays,
 * the motion engine loads) and lifts the curtain.
 */

/** The dove's ink spans these rows of its 45 × 60 box: the fill rises across them. */
const FILL_TOP = 0.7;
const FILL_BOTTOM = 58.6;

export const PRELOADER_SCRIPT = `(function () {
  var root = document.documentElement;
  var el = document.querySelector(".preloader");
  if (!el) return;
  var level = el.querySelector("[data-preloader-level]");
  var count = el.querySelector("[data-preloader-count]");
  var finished = false;
  var observer = null;

  function hide() {
    el.classList.add("preloader--done");
    root.removeAttribute("data-preloading");
  }

  if (!("PerformanceObserver" in window) || !window.requestAnimationFrame || !level || !count) {
    hide();
    el.hidden = true;
    return;
  }

  try {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var FULL_COUNT_MS = reduce ? 0 : 800;
    var CEILING_MS = 12000;
    root.setAttribute("data-preloading", "");

    var resources = {};
    var fontsReady = !(document.fonts && document.fonts.ready);
    var loaded = document.readyState === "complete";
    if (!fontsReady) document.fonts.ready.then(function () { fontsReady = true; });
    if (!loaded) window.addEventListener("load", function () { loaded = true; }, { once: true });

    var absolute = function (url) {
      try { return new URL(url, location.href).href; } catch (error) { return url; }
    };
    observer = new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (entry) {
        if (entry.initiatorType !== "img") resources[absolute(entry.name)] = true;
      });
    });
    observer.observe({ type: "resource", buffered: true });

    var progress = function () {
      var nodes = document.querySelectorAll('script[src], link[rel="stylesheet"][href], link[rel="preload"][href]');
      for (var i = 0; i < nodes.length; i++) {
        var url = absolute(nodes[i].src || nodes[i].href);
        if (!(url in resources)) resources[url] = false;
      }
      var total = 3;
      var done = (document.readyState !== "loading" ? 1 : 0) + (fontsReady ? 1 : 0) + (loaded ? 1 : 0);
      for (var key in resources) { total++; if (resources[key]) done++; }
      for (var j = 0; j < document.images.length; j++) {
        var image = document.images[j];
        if (image.loading === "lazy") continue;
        total++;
        if (image.complete) done++;
      }
      return loaded && fontsReady ? 1 : Math.min(done / total, 0.99);
    };

    var shown = 0;
    var start = performance.now();
    var last = start;
    var render = function () {
      count.textContent = String(Math.round(shown * 100));
      level.setAttribute("y", String(${FILL_TOP} + (1 - shown) * ${FILL_BOTTOM - FILL_TOP}));
    };

    var finish = function () {
      if (finished) return;
      finished = true;
      shown = 1;
      render();
      if (observer) observer.disconnect();
      setTimeout(function () {
        root.setAttribute("data-preloaded-at", String(Math.round(performance.now())));
        hide();
        setTimeout(function () { el.hidden = true; }, reduce ? 0 : 1100);
      }, reduce ? 0 : 200);
    };

    var tick = function (now) {
      if (finished) return;
      var real = now - start > CEILING_MS ? 1 : progress();
      var step = FULL_COUNT_MS ? (now - last) / FULL_COUNT_MS : 1;
      last = now;
      shown = Math.min(real, shown + step);
      render();
      if (shown >= 1) finish();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // Frames pause in background tabs; the ceiling still applies.
    setTimeout(finish, CEILING_MS);
  } catch (error) {
    if (observer) observer.disconnect();
    hide();
    el.hidden = true;
  }
})();`;

/** The fill level's starting rectangle (empty dove). */
export const PRELOADER_FILL = { y: FILL_BOTTOM, width: DOVE_BOX.width, height: DOVE_BOX.height };
