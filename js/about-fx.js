/* ============================================================
   About page backdrop: "Signals from Earth".
   Rings leave Earth and cross the distances to the Moon, Mars and
   Voyager 1. Hardware that is still answering sends a data packet
   back; Pioneer 10 does not (last signal received in 2003).
   Canvas 2D, no libraries. Illustrative, NOT to scale.
   Pauses when the tab is hidden; one still frame for reduced motion.
   ============================================================ */
(function () {
  "use strict";
  var cv = document.getElementById("about-fx");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d"), reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 0, H = 0, dpr = 1, raf = 0, running = false, t0 = performance.now(), last = 0, nextRing = 0.4;
  var rings = [], packets = [], stars = [], E = { x: 0, y: 0 }, targets = [], maxR = 1;

  var DEFS = [
    { name: "Moon", note: "about 1.3 light-seconds", f: 0.22, a: -0.62, r: 5, rgb: "200,205,230", answers: true },
    { name: "Mars", note: "3 to 22 light-minutes", f: 0.46, a: -0.30, r: 6, rgb: "255,143,90", answers: true },
    { name: "Pioneer 10", note: "silent since 2003", f: 0.66, a: -0.78, r: 4, rgb: "150,160,190", answers: false },
    { name: "Voyager 1", note: "still transmitting", f: 0.88, a: -0.46, r: 4.5, rgb: "111,162,242", answers: true }
  ];

  function rnd(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function layout() {
    var wide = W > 760;
    E.x = W * (wide ? 0.08 : 0.12); E.y = H * (wide ? 0.88 : 0.9);
    var D = Math.hypot(W - E.x, E.y) * 0.98;
    targets = DEFS.map(function (d) {
      var dist = d.f * D;
      return { d: d, x: E.x + Math.cos(d.a) * dist, y: E.y + Math.sin(d.a) * dist, dist: dist, glow: 0 };
    });
    maxR = D * 0.96;
    var r = rnd(11), n = Math.round(Math.min(220, W * H / 7000)); stars = [];
    for (var i = 0; i < n; i++) stars.push({ x: r() * W, y: r() * H, s: 0.4 + r() * 1.1, p: r() * 6.28, v: 0.5 + r() * 1.5 });
  }
  function resize() {
    W = Math.max(1, window.innerWidth); H = Math.max(1, window.innerHeight);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout(); if (!running) draw(0, 4.2, true);
  }

  function earth(t) {
    var R = Math.max(16, Math.min(W, H) * 0.035);
    var g = ctx.createRadialGradient(E.x, E.y, R * 0.8, E.x, E.y, R * 3);
    g.addColorStop(0, "rgba(90,150,255,.35)"); g.addColorStop(1, "rgba(90,150,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(E.x, E.y, R * 3, 0, 6.2832); ctx.fill();
    var s = ctx.createRadialGradient(E.x - R * 0.35, E.y - R * 0.4, R * 0.1, E.x, E.y, R);
    s.addColorStop(0, "#9fd0ff"); s.addColorStop(0.5, "#2f68c9"); s.addColorStop(1, "#0b1f55");
    ctx.fillStyle = s; ctx.beginPath(); ctx.arc(E.x, E.y, R, 0, 6.2832); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(E.x, E.y, R, 0, 6.2832); ctx.clip();
    ctx.fillStyle = "rgba(80,170,110,.55)";
    ctx.beginPath(); ctx.ellipse(E.x + Math.sin(t * 0.15) * R * 0.5, E.y - R * 0.1, R * 0.35, R * 0.5, 0.5, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.ellipse(E.x + Math.sin(t * 0.15 + 2.4) * R * 0.5, E.y + R * 0.35, R * 0.28, R * 0.2, -0.3, 0, 6.2832); ctx.fill();
    ctx.restore();
    /* ground-station dish */
    ctx.strokeStyle = "rgba(235,240,255,.85)"; ctx.lineWidth = 1.5;
    var dx = E.x + R * 0.9, dy = E.y - R * 0.95;
    ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + 4, dy - 12); ctx.stroke();
    ctx.beginPath(); ctx.arc(dx + 4, dy - 12, 6, 0.4, 3.4); ctx.stroke();
  }

  function draw(dt, t, still) {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], a = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.v + s.p));
      ctx.fillStyle = "rgba(225,232,255," + a + ")"; ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, 6.2832); ctx.fill();
    }
    /* faint sight-lines */
    ctx.setLineDash([3, 8]); ctx.lineWidth = 1;
    targets.forEach(function (T) { ctx.strokeStyle = "rgba(150,170,210,.12)"; ctx.beginPath(); ctx.moveTo(E.x, E.y); ctx.lineTo(T.x, T.y); ctx.stroke(); });
    ctx.setLineDash([]);

    if (still && !rings.length) rings.push({ r: maxR * 0.3, prev: 0 }, { r: maxR * 0.62, prev: 0 });
    /* rings */
    for (var k = rings.length - 1; k >= 0; k--) {
      var R = rings[k], life = R.r / maxR, al = Math.max(0, 0.34 * (1 - life));
      ctx.strokeStyle = "rgba(111,162,242," + al + ")"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(E.x, E.y, R.r, -1.9, 0.2); ctx.stroke();
      if (!still) {
        R.prev = R.r; R.r += dt * maxR * 0.11;
        targets.forEach(function (T, ti) {
          if (R.prev < T.dist && R.r >= T.dist) {
            T.glow = 1;
            if (T.d.answers) packets.push({ ti: ti, u: -0.15 - Math.random() * 0.1 });
          }
        });
        if (R.r > maxR) rings.splice(k, 1);
      }
    }
    if (!still && !reduce) { nextRing -= dt; if (nextRing <= 0) { rings.push({ r: 0, prev: 0 }); nextRing = 3.4; } }

    /* packets returning to Earth */
    for (var p = packets.length - 1; p >= 0; p--) {
      var P = packets[p], T = targets[P.ti]; P.u += dt / (1.6 + T.dist / maxR * 3.2);
      if (P.u >= 1) { packets.splice(p, 1); continue; }
      if (P.u < 0) continue;
      var x = T.x + (E.x - T.x) * P.u, y = T.y + (E.y - T.y) * P.u;
      var g = ctx.createRadialGradient(x, y, 0, x, y, 10); g.addColorStop(0, "rgba(255,207,74,.95)"); g.addColorStop(1, "rgba(255,207,74,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 10, 0, 6.2832); ctx.fill();
    }

    /* targets + labels */
    ctx.font = "600 11px Inter, system-ui, sans-serif"; ctx.textBaseline = "middle";
    targets.forEach(function (T) {
      T.glow = Math.max(0, T.glow - dt * 0.7);
      var lit = still ? 0.5 : T.glow, c = T.d.rgb;
      var g = ctx.createRadialGradient(T.x, T.y, 0, T.x, T.y, 26 + lit * 20);
      g.addColorStop(0, "rgba(" + c + "," + (0.18 + lit * 0.5) + ")"); g.addColorStop(1, "rgba(" + c + ",0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(T.x, T.y, 46, 0, 6.2832); ctx.fill();
      ctx.fillStyle = T.d.answers ? "rgb(" + c + ")" : "rgba(" + c + ",.55)";
      ctx.beginPath(); ctx.arc(T.x, T.y, T.d.r, 0, 6.2832); ctx.fill();
      if (!T.d.answers) { ctx.strokeStyle = "rgba(255,111,97,.55)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(T.x - 6, T.y - 6); ctx.lineTo(T.x + 6, T.y + 6); ctx.moveTo(T.x + 6, T.y - 6); ctx.lineTo(T.x - 6, T.y + 6); ctx.stroke(); }
      ctx.fillStyle = "rgba(235,240,255,.78)"; ctx.fillText(T.d.name, T.x + 12, T.y - 7);
      ctx.fillStyle = "rgba(160,172,205,.7)"; ctx.font = "400 10.5px Inter, system-ui, sans-serif"; ctx.fillText(T.d.note, T.x + 12, T.y + 7); ctx.font = "600 11px Inter, system-ui, sans-serif";
    });
    earth(t);
    ctx.fillStyle = "rgba(150,165,200,.55)"; ctx.font = "400 10px Inter, system-ui, sans-serif"; ctx.textAlign = "right";
    ctx.fillText("Signals from Earth. Illustrative, not to scale.", W - 14, H - 12); ctx.textAlign = "left";
  }

  function frame(now) {
    if (!running) return; raf = requestAnimationFrame(frame);
    var t = (now - t0) / 1000, dt = Math.min(0.05, t - last); last = t; draw(dt, t, false);
  }
  function sync() { if (reduce) return; if (document.hidden) { running = false; cancelAnimationFrame(raf); } else if (!running) { running = true; last = (performance.now() - t0) / 1000; raf = requestAnimationFrame(frame); } }
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", sync);
  resize(); sync();
})();
