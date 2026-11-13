/* ============================================================
   Space Explorer: title screen backdrop + discovery trail.
   Canvas 2D only (no extra libraries, works offline).
   - Three parallax star layers, slow nebula drift, shooting stars
   - Moon, Mars and a ringed deep-space planet, gently bobbing
   - A small probe crossing the sky with a blinking beacon
   - One dot per mission, grouped by zone, lit when discovered
   Stops drawing when the title screen is hidden or the tab is in
   the background. With reduced motion it draws one still frame.
   All artwork is illustrative, not NASA imagery.
   ============================================================ */
(function () {
  "use strict";
  var cv = document.getElementById("se-intro-fx"), intro = document.getElementById("se-intro");
  if (!cv || !intro || !cv.getContext) return;

  var ctx = cv.getContext("2d");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = 1, raf = 0, running = false, t0 = performance.now();
  var px = 0, py = 0, tx = 0, ty = 0;          /* pointer parallax, -1..1 */
  var stars = [], shooters = [], nextShot = 2.5;

  /* small seeded random so the sky is the same on every visit */
  function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function buildStars() {
    var r = rng(2026), n = Math.round(Math.min(260, Math.max(90, W * H / 6500)));
    stars = [];
    for (var i = 0; i < n; i++) {
      var layer = i % 3;                         /* 0 far, 1 mid, 2 near */
      stars.push({ x: r() * W, y: r() * H, z: layer, s: 0.5 + layer * 0.55 + r() * 0.5, tw: r() * 6.28, sp: 0.6 + r() * 1.4, hue: r() > 0.86 ? 1 : 0 });
    }
  }

  function resize() {
    var rect = cv.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width)); H = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildStars();
    if (!running) draw(3);                       /* still frame for reduced motion / paused states */
  }

  /* ---------- layout: planets live on the right on wide screens, behind the card on narrow ones ---------- */
  function layout() {
    var u = Math.min(W, H), wide = W >= 1000;
    return {
      moon:  { x: wide ? W * 0.80 : W * 0.84, y: wide ? H * 0.24 : H * 0.10, r: u * (wide ? 0.105 : 0.07) },
      mars:  { x: wide ? W * 0.63 : W * 0.12, y: wide ? H * 0.76 : H * 0.93, r: u * (wide ? 0.075 : 0.06) },
      ring:  { x: wide ? W * 0.86 : W * 0.86, y: wide ? H * 0.62 : H * 0.80, r: u * (wide ? 0.135 : 0.075) }
    };
  }

  /* ---------- drawing helpers ---------- */
  function halo(x, y, r, rgb, a) {
    var g = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 2.1);
    g.addColorStop(0, "rgba(" + rgb + "," + a + ")"); g.addColorStop(1, "rgba(" + rgb + ",0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.1, 0, 6.2832); ctx.fill();
  }
  function sphere(x, y, r, c0, c1, c2) {
    var g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.4, r * 0.1, x, y, r * 1.05);
    g.addColorStop(0, c0); g.addColorStop(0.55, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  }
  function terminator(x, y, r) {                  /* soft night side, lit from the upper left */
    var g = ctx.createRadialGradient(x - r * 0.55, y - r * 0.55, r * 0.5, x + r * 0.2, y + r * 0.2, r * 1.25);
    g.addColorStop(0, "rgba(5,3,20,0)"); g.addColorStop(1, "rgba(5,3,20,.72)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
  }

  var CRATERS = [[-0.34, -0.1, 0.2], [0.22, -0.38, 0.14], [0.3, 0.2, 0.22], [-0.1, 0.42, 0.12], [-0.5, 0.3, 0.1], [0.05, 0.02, 0.09]];
  function drawMoon(p, t) {
    var y = p.y + Math.sin(t * 0.6) * p.r * 0.06;
    halo(p.x, y, p.r, "185,196,255", 0.16);
    sphere(p.x, y, p.r, "#f1effa", "#a9a6c4", "#4e4b78");
    ctx.save(); ctx.beginPath(); ctx.arc(p.x, y, p.r, 0, 6.2832); ctx.clip();
    CRATERS.forEach(function (c) {
      var cx = p.x + c[0] * p.r, cy = y + c[1] * p.r, cr = c[2] * p.r;
      ctx.fillStyle = "rgba(60,56,100,.35)"; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.28)"; ctx.lineWidth = Math.max(1, cr * 0.12); ctx.beginPath(); ctx.arc(cx - cr * 0.08, cy - cr * 0.08, cr, 3.6, 5.6); ctx.stroke();
    });
    ctx.restore();
    terminator(p.x, y, p.r);
  }
  function drawMars(p, t) {
    var y = p.y + Math.sin(t * 0.7 + 1.7) * p.r * 0.07;
    halo(p.x, y, p.r, "255,143,90", 0.18);
    sphere(p.x, y, p.r, "#ffc9a0", "#e0703a", "#8a331c");
    ctx.save(); ctx.beginPath(); ctx.arc(p.x, y, p.r, 0, 6.2832); ctx.clip();
    ctx.fillStyle = "rgba(90,30,14,.35)";
    ctx.beginPath(); ctx.ellipse(p.x + p.r * 0.15, y + p.r * 0.1, p.r * 0.5, p.r * 0.2, -0.3, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.ellipse(p.x - p.r * 0.4, y - p.r * 0.2, p.r * 0.22, p.r * 0.12, 0.5, 0, 6.2832); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.beginPath(); ctx.ellipse(p.x - p.r * 0.1, y - p.r * 0.95, p.r * 0.42, p.r * 0.2, 0, 0, 6.2832); ctx.fill();
    ctx.restore();
    terminator(p.x, y, p.r);
  }
  function drawRing(p, t) {
    var y = p.y + Math.sin(t * 0.5 + 3.1) * p.r * 0.05, R = p.r * 1.95;
    halo(p.x, y, p.r, "183,132,255", 0.2);
    function ring(front) {
      ctx.save(); ctx.translate(p.x, y); ctx.rotate(-0.38); ctx.scale(1, 0.3);
      [[R, p.r * 0.34, "rgba(214,190,255,.5)"], [R * 0.8, p.r * 0.12, "rgba(255,226,170,.42)"]].forEach(function (b) {
        ctx.strokeStyle = b[2]; ctx.lineWidth = b[1]; ctx.beginPath(); ctx.arc(0, 0, b[0], front ? 0 : Math.PI, front ? Math.PI : 6.2832); ctx.stroke();
      });
      ctx.restore();
    }
    ring(false);
    sphere(p.x, y, p.r, "#e8d2ff", "#8a5ad8", "#2d1a66");
    ctx.save(); ctx.beginPath(); ctx.arc(p.x, y, p.r, 0, 6.2832); ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,.14)"; ctx.lineWidth = p.r * 0.08;
    for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(p.x - p.r, y + i * p.r * 0.3); ctx.lineTo(p.x + p.r, y + i * p.r * 0.3 + p.r * 0.08); ctx.stroke(); }
    ctx.restore();
    terminator(p.x, y, p.r);
    ring(true);
  }

  function drawProbe(t) {                         /* small relay probe crossing the sky; the beacon blinks */
    var u = ((t * 0.02) % 1.25) - 0.12, x = u * W, y = H * 0.13 + Math.sin(u * 5.2) * H * 0.035, a = Math.sin(u * 5.2) * 0.18 - 0.1;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    ctx.strokeStyle = "rgba(185,196,255,.22)"; ctx.lineWidth = 1; ctx.setLineDash([2, 5]); ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-8, 0); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = "#c9c6e6"; ctx.fillRect(-5, -4, 10, 8);
    ctx.fillStyle = "#5b79d9"; ctx.fillRect(-19, -2.5, 12, 5); ctx.fillRect(7, -2.5, 12, 5);
    ctx.strokeStyle = "#e7e4ff"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -10); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -11, 3, Math.PI, 0); ctx.stroke();
    var b = (Math.sin(t * 5) + 1) / 2;
    ctx.fillStyle = "rgba(255,207,74," + (0.35 + b * 0.65) + ")"; ctx.beginPath(); ctx.arc(0, 0, 1.8, 0, 6.2832); ctx.fill();
    ctx.restore();
  }

  function nebula(t) {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    var a = ctx.createRadialGradient(W * (0.2 + 0.05 * Math.sin(t * 0.08)), H * 0.25, 0, W * 0.2, H * 0.25, W * 0.5);
    a.addColorStop(0, "rgba(88,64,200,.20)"); a.addColorStop(1, "rgba(88,64,200,0)");
    ctx.fillStyle = a; ctx.fillRect(0, 0, W, H);
    var b = ctx.createRadialGradient(W * (0.78 + 0.04 * Math.cos(t * 0.07)), H * 0.8, 0, W * 0.78, H * 0.8, W * 0.45);
    b.addColorStop(0, "rgba(255,111,97,.12)"); b.addColorStop(0.6, "rgba(124,199,255,.06)"); b.addColorStop(1, "rgba(124,199,255,0)");
    ctx.fillStyle = b; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function drawStars(t) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], drift = reduce ? 0 : t * (2 + s.z * 5);
      var x = ((s.x - drift - px * (4 + s.z * 9)) % W + W) % W, y = s.y - py * (3 + s.z * 7);
      var al = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.tw));
      ctx.fillStyle = s.hue ? "rgba(255,196,150," + al + ")" : "rgba(235,240,255," + al + ")";
      ctx.beginPath(); ctx.arc(x, y, s.s, 0, 6.2832); ctx.fill();
    }
  }

  function drawShooters(dt, t) {
    if (!reduce) {
      nextShot -= dt;
      if (nextShot <= 0) { shooters.push({ x: W * (0.45 + Math.random() * 0.55), y: -10, vx: -(380 + Math.random() * 220), vy: 230 + Math.random() * 120, life: 0 }); nextShot = 4.5 + Math.random() * 5; }
    }
    for (var i = shooters.length - 1; i >= 0; i--) {
      var s = shooters[i]; s.life += dt; s.x += s.vx * dt; s.y += s.vy * dt;
      var a = Math.max(0, 1 - s.life / 1.3), len = 0.16;
      var g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * len, s.y - s.vy * len);
      g.addColorStop(0, "rgba(255,255,255," + a + ")"); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = g; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * len, s.y - s.vy * len); ctx.stroke();
      if (a <= 0 || s.y > H + 20 || s.x < -50) shooters.splice(i, 1);
    }
  }

  var lastT = 0;
  function draw(t) {
    var dt = Math.min(0.05, Math.max(0, t - lastT)); lastT = t;
    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    ctx.clearRect(0, 0, W, H);
    nebula(t); drawStars(t);
    var L = layout();
    function at(p, depth) { return { x: p.x - px * depth, y: p.y - py * depth * 0.7, r: p.r }; }
    drawRing(at(L.ring, 16), t); drawMoon(at(L.moon, 22), t); drawMars(at(L.mars, 12), t);
    drawProbe(t); drawShooters(dt, t);
  }

  /* ---------- loop control ---------- */
  function frame(now) { if (!running) return; raf = requestAnimationFrame(frame); draw((now - t0) / 1000); }
  function start() { if (running || reduce) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  var lastOn = null;
  function sync() {
    var on = !intro.hidden;
    cv.hidden = !on;
    if (on && !document.hidden) { resize(); if (reduce) draw(3); else start(); } else stop();
    if (on !== lastOn) { renderTrail(on); lastOn = on; }
  }

  /* ---------- discovery trail ---------- */
  var trail = document.getElementById("se-trail"), shownOnce = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function renderTrail(on) {
    if (!trail || !on || !window.SE_DATA) return;
    var D = window.SE_DATA, f = (window.SE_APP && window.SE_APP.foundMap) ? window.SE_APP.foundMap() : {}, k = 0, found = 0, html = "";
    D.zoneIds.forEach(function (z) {
      html += '<span class="se-trail-group" style="--zc:' + D.zones[z].color + '">';
      D.inZone(z).forEach(function (m) {
        var is = !!f[m.id]; if (is) found++;
        html += '<span class="se-trail-dot' + (is ? " is-on" : "") + '" style="--k:' + (k++) + '" title="' + esc(m.record.name) + (is ? " (discovered)" : "") + '"></span>';
      });
      html += "</span>";
    });
    html += '<span class="se-trail-sum">' + found + " of " + D.total + " discovered</span>";
    trail.innerHTML = html;
    trail.setAttribute("aria-label", found + " of " + D.total + " missions discovered");
    trail.classList.toggle("is-again", shownOnce); shownOnce = true;
  }

  /* ---------- wiring ---------- */
  window.addEventListener("pointermove", function (e) { tx = (e.clientX / window.innerWidth - 0.5) * 2; ty = (e.clientY / window.innerHeight - 0.5) * 2; }, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(function () { if (!intro.hidden) resize(); }).observe(cv); else window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", sync);
  new MutationObserver(sync).observe(intro, { attributes: true, attributeFilter: ["hidden"] });
  sync();
})();
