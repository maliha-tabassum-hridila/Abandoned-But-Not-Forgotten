/* ============================================================
   Shared site behavior: starfield, nav, scroll effects
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Star field ---------- */
  function initStarfield() {
    var canvas = document.getElementById("starfield");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var stars = [];
    var w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = document.documentElement.scrollHeight;
      // Cap canvas height to a reasonable viewport multiple for perf, fixed-position covers viewport
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    }

    function buildStars() {
      var count = Math.floor((w * h) / 9000);
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.2 + 0.2,
          baseAlpha: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.015 + 0.003,
          phase: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.85 ? "mars" : "white"
        });
      }
    }

    var t = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var alpha = reduceMotion ? s.baseAlpha : s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.25;
        alpha = Math.max(0, Math.min(1, alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.hue === "mars"
          ? "rgba(232,146,90," + alpha + ")"
          : "rgba(242,244,249," + alpha + ")";
        ctx.fill();
      }
      t += 1;
      if (!reduceMotion) requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", debounce(resize, 200));
  }

  function debounce(fn, wait) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  /* ---------- Nav toggle (mobile) ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var header = document.querySelector(".site-header");
    if (!toggle || !header) return;
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      header.classList.toggle("menu-open", !expanded);
    });
    function closeMenu(restoreFocus) {
      toggle.setAttribute("aria-expanded", "false");
      header.classList.remove("menu-open");
      if (restoreFocus) toggle.focus();
    }
    // Close menu when a link is clicked
    var links = header.querySelectorAll(".nav-links a");
    links.forEach(function (a) {
      a.addEventListener("click", function () {
        closeMenu(false);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("menu-open")) {
        closeMenu(true);
      }
    });
  }

  /* ---------- Cards: light that follows the pointer ---------- */
  function initCardGlow() {
    document.addEventListener("pointermove", function (e) {
      var c = e.target.closest && e.target.closest(".about-card, .discovery-card, .trait-card");
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  /* ---------- "More" dropdown in the nav ---------- */
  function initMoreMenu() {
    var wrap = document.querySelector(".nav-more");
    if (!wrap) return;
    var btn = wrap.querySelector(".nav-more-btn");
    function set(open) { wrap.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); }
    btn.addEventListener("click", function (e) { e.stopPropagation(); set(!wrap.classList.contains("is-open")); });
    document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && wrap.classList.contains("is-open")) { set(false); btn.focus(); } });
    wrap.addEventListener("focusout", function (e) { if (e.relatedTarget && !wrap.contains(e.relatedTarget)) set(false); });
  }

  /* ---------- Scroll progress bar ---------- */
  function initScrollProgress() {
    var bar = document.getElementById("scroll-progress");
    if (!bar) return;
    function update() {
      var scrollTop = window.scrollY;
      document.body.classList.toggle("past-hero", scrollTop > window.innerHeight * 0.75);
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;
    function update() {
      if (window.scrollY > 600) btn.classList.add("visible");
      else btn.classList.remove("visible");
    }
    window.addEventListener("scroll", update, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
    update();
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal, .scene");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    }, { threshold: 0.18 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Set current nav link ---------- */
  function markCurrentNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  function initSkipLink() {
    var skip = document.querySelector(".skip-link");
    if (!skip) return;
    skip.addEventListener("focus", function () { skip.classList.add("is-visible"); });
    skip.addEventListener("blur", function () { skip.classList.remove("is-visible"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSkipLink();
    initStarfield();
    initNav();
    initMoreMenu();
    initCardGlow();
    initScrollProgress();
    initBackToTop();
    initReveal();
    initFooterYear();
    markCurrentNav();
  });

  // Expose a tiny helper for other scripts
  window.SiteUtils = {
    statusClass: function (status) { return status; },
    esc: function (str) {
      var div = document.createElement("div");
      div.textContent = str == null ? "" : str;
      return div.innerHTML;
    }
  };
})();
