/* ==========================================================
   Cinematic 3D journey for the homepage.
   - Classic script (works from file://). Three.js r160 is loaded lazily
     with dynamic import(): js/vendor/three.module.min.js first, then jsDelivr
     (same approach as the 3D game).
   - Everything is procedural: no external models/textures, so nothing
     here is a NASA photograph. All bodies are ILLUSTRATIVE reconstructions.
   - If WebGL or Three.js is unavailable, nothing changes: the original
     2D page stays exactly as it was.
   ========================================================== */
(function () {
  "use strict";
  var CDN = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = Math.min(screen.width, innerWidth) < 700;
  var Q = { stars: small ? 1200 : 2800, tex: small ? 256 : 512, seg: small ? 40 : 72, dpr: Math.min(devicePixelRatio || 1, small ? 1 : 1.5) };

  function webglOK() {
    try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; }
  }
  function loadThree() {
    var urls = [new URL("js/vendor/three.module.min.js", document.baseURI).href, CDN], i = 0;
    return (function next(err) {
      if (i >= urls.length) return Promise.reject(err || new Error("Three.js unavailable"));
      return import(urls[i++]).catch(next);
    })();
  }
  if (!webglOK()) return;

  var chapters = [
    { at: 0.00, name: "01 · LEAVING EARTH" }, { at: 0.17, name: "02 · THE MOON" },
    { at: 0.42, name: "03 · MARS" }, { at: 0.66, name: "04 · DEEP SPACE" }, { at: 0.88, name: "05 · THE ARCHIVE" }
  ];

  /* ---------- procedural textures ---------- */
  function hash(x, y) { var h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); }
  function vnoise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return (hash(xi, yi) * (1 - u) + hash(xi + 1, yi) * u) * (1 - v) + (hash(xi, yi + 1) * (1 - u) + hash(xi + 1, yi + 1) * u) * v;
  }
  function fbm(x, y) { var s = 0, a = 0.5; for (var o = 0; o < 5; o++) { s += a * vnoise(x, y); x *= 2.03; y *= 2.03; a *= 0.5; } return s; }
  function paint(w, h, fn) {
    var c = document.createElement("canvas"); c.width = w; c.height = h;
    var g = c.getContext("2d"), im = g.createImageData(w, h);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var rgb = fn(x / w, y / h), k = (y * w + x) * 4;
      im.data[k] = rgb[0]; im.data[k + 1] = rgb[1]; im.data[k + 2] = rgb[2]; im.data[k + 3] = 255;
    }
    g.putImageData(im, 0, 0); return c;
  }
  function earthTex(w) {
    return paint(w, w / 2, function (u, v) {
      var n = fbm(u * 6, v * 6), lat = Math.abs(v - 0.5) * 2;
      if (lat > 0.88) return [235, 240, 248];
      if (n > 0.52) { var d = (n - 0.52) * 3; return [40 + d * 90, 95 + d * 60, 45 + d * 20]; }
      return [10, 40 + n * 60, 95 + n * 90];
    });
  }
  function moonTex(w) {
    var craters = []; for (var i = 0; i < 70; i++) craters.push([Math.random(), Math.random(), 0.01 + Math.random() * 0.04]);
    return paint(w, w / 2, function (u, v) {
      var g = 110 + fbm(u * 14, v * 14) * 90;
      for (var i = 0; i < craters.length; i++) {
        var c = craters[i], dx = (u - c[0]) * 2, dy = v - c[1], d = Math.sqrt(dx * dx + dy * dy) / c[2];
        if (d < 1) g -= 38 * (1 - d) ; else if (d < 1.25) g += 22 * (1.25 - d) * 4;
      }
      g = Math.max(30, Math.min(235, g)); return [g, g, g * 0.97];
    });
  }
  function marsTex(w) {
    return paint(w, w / 2, function (u, v) {
      var n = fbm(u * 7 + 3, v * 7), m = fbm(u * 22, v * 22), lat = Math.abs(v - 0.5) * 2;
      if (lat > 0.93) return [236, 230, 224];
      var dark = n > 0.58 ? 0.55 : 1;
      return [(150 + m * 80) * dark, (70 + m * 40) * dark, (38 + m * 22) * dark];
    });
  }
  function glowTex(rgb) {
    var c = document.createElement("canvas"); c.width = c.height = 128;
    var g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(" + rgb + ",0.55)"); r.addColorStop(0.5, "rgba(" + rgb + ",0.16)"); r.addColorStop(1, "rgba(" + rgb + ",0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); return c;
  }

  loadThree().then(function (THREE) {
    try { start(THREE); } catch (e) { console.error("Cinema 3D error:", e); document.body.classList.remove("cin-on", "cin-lock"); }
  }, function () { /* Three.js unavailable: the original page remains */ });

  function start(THREE) {
    var canvas = document.createElement("canvas");
    canvas.id = "cinema"; canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !small, powerPreference: "high-performance" }); }
    catch (e) { canvas.remove(); return; }
    renderer.setPixelRatio(Q.dpr); renderer.setSize(innerWidth, innerHeight, false);
    var scene = new THREE.Scene(); scene.background = new THREE.Color(0x02030a);
    var cam = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 1200);
    var disposables = [], dead = false, raf = 0;
    function track(o) { disposables.push(o); return o; }

    /* lights */
    var sun = new THREE.DirectionalLight(0xfff2dd, 2.6); sun.position.set(60, 25, 40); scene.add(sun);
    scene.add(new THREE.AmbientLight(0x1a2240, 0.55));

    /* stars: long box along the travel path so scrolling gives real parallax */
    var N = Q.stars, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 700; pos[i * 3 + 1] = (Math.random() - 0.5) * 420; pos[i * 3 + 2] = 120 - Math.random() * 720;
      var t = Math.random(), c = t < 0.15 ? [1, 0.8, 0.6] : t < 0.3 ? [0.7, 0.8, 1] : [1, 1, 1], b = 0.4 + Math.random() * 0.6;
      col[i * 3] = c[0] * b; col[i * 3 + 1] = c[1] * b; col[i * 3 + 2] = c[2] * b;
    }
    var sg = track(new THREE.BufferGeometry());
    sg.setAttribute("position", new THREE.BufferAttribute(pos, 3)); sg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    var dotC = document.createElement("canvas"); dotC.width = dotC.height = 32; var dg = dotC.getContext("2d");
    var dgr = dg.createRadialGradient(16, 16, 0, 16, 16, 16); dgr.addColorStop(0, "rgba(255,255,255,1)"); dgr.addColorStop(0.4, "rgba(255,255,255,.7)"); dgr.addColorStop(1, "rgba(255,255,255,0)");
    dg.fillStyle = dgr; dg.fillRect(0, 0, 32, 32);
    var dotTex = track(new THREE.CanvasTexture(dotC));
    var sm = track(new THREE.PointsMaterial({ size: 1.3, map: dotTex, alphaTest: 0.02, sizeAttenuation: true, vertexColors: true, transparent: true, depthWrite: false }));
    var starPts = new THREE.Points(sg, sm); scene.add(starPts); var nebulae = [];

    /* nebula sprites */
    [["120,70,200", -90, 40, -120, 260], ["60,110,230", 110, -30, -230, 300], ["220,110,60", -80, -20, -330, 240], ["110,60,190", 70, 50, -440, 320]].forEach(function (n) {
      var tx = track(new THREE.CanvasTexture(glowTex(n[0])));
      var sp = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: tx, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 })));
      sp.position.set(n[1], n[2], n[3]); sp.scale.set(n[4], n[4], 1); scene.add(sp); nebulae.push(sp);
    });

    /* planets */
    function planet(tex, r, p, atmoRGB) {
      var t = track(new THREE.CanvasTexture(tex)); t.colorSpace = THREE.SRGBColorSpace;
      var m = new THREE.Mesh(track(new THREE.SphereGeometry(r, Q.seg, Q.seg / 2)), track(new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, metalness: 0 })));
      m.position.set(p[0], p[1], p[2]); scene.add(m);
      if (atmoRGB) {
        var a = new THREE.Mesh(track(new THREE.SphereGeometry(r * 1.1, Q.seg, Q.seg / 2)), track(new THREE.ShaderMaterial({
          transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
          uniforms: { c: { value: new THREE.Color(atmoRGB) } },
          vertexShader: "varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}",
          fragmentShader: "uniform vec3 c;varying vec3 n;varying vec3 v;void main(){float f=pow(0.72-dot(-n,v),3.);gl_FragColor=vec4(c,1.)*clamp(f,0.,1.)*1.6;}"
        })));
        a.position.copy(m.position); scene.add(a);
      }
      return m;
    }
    var earth = planet(earthTex(Q.tex), 10, [-22, -2, -30], 0x4aa3ff);
    var moon = planet(moonTex(Q.tex), 4, [14, 1, -150], null);
    var mars = planet(marsTex(Q.tex), 7, [-18, -1, -290], 0xff8a55);

    /* simple primitive models (illustrative, not accurate hardware) */
    function mat(c, m) { return track(new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: m == null ? 0.4 : m })); }
    function add(g, geo, m, x, y, z) { var o = new THREE.Mesh(track(geo), m); o.position.set(x, y, z); g.add(o); return o; }
    var astro = new THREE.Group(), W = mat(0xeeeeee, 0.1);
    add(astro, new THREE.CapsuleGeometry(0.55, 0.9, 4, 10), W, 0, 0, 0);
    add(astro, new THREE.SphereGeometry(0.5, 16, 12), W, 0, 1.05, 0);
    add(astro, new THREE.SphereGeometry(0.36, 14, 10), mat(0x1a2233, 0.9), 0, 1.07, 0.26);
    add(astro, new THREE.BoxGeometry(0.9, 1.2, 0.4), mat(0xbbbbbb, 0.2), 0, 0.1, -0.55);
    [-1, 1].forEach(function (s) {
      var a = add(astro, new THREE.CylinderGeometry(0.16, 0.16, 0.9, 8), W, s * 0.75, 0.2, 0.15); a.rotation.z = s * 0.7;
      var l = add(astro, new THREE.CylinderGeometry(0.2, 0.2, 1, 8), W, s * 0.28, -1.15, 0); l.rotation.x = s * 0.25;
    });
    astro.scale.setScalar(1.5); astro.position.set(2.5, -0.5, 20); scene.add(astro);

    var sat = new THREE.Group();
    add(sat, new THREE.BoxGeometry(1.2, 1, 1), mat(0xcfa64a, 0.8), 0, 0, 0);
    [-1, 1].forEach(function (s) { add(sat, new THREE.BoxGeometry(2.6, 0.08, 1.1), mat(0x1c3a78, 0.6), s * 2, 0, 0); });
    scene.add(sat);

    var lander = new THREE.Group();
    add(lander, new THREE.CylinderGeometry(0.9, 1.1, 0.9, 8), mat(0xc9a24a, 0.7), 0, 1.3, 0);
    for (var k = 0; k < 4; k++) { var a = k * Math.PI / 2 + Math.PI / 4, leg = add(lander, new THREE.CylinderGeometry(0.05, 0.05, 1.8, 5), mat(0xbbbbbb, 0.5), Math.cos(a) * 1.1, 0.5, Math.sin(a) * 1.1); leg.rotation.z = -Math.cos(a) * 0.5; leg.rotation.x = Math.sin(a) * 0.5; }
    lander.position.set(10.5, 4.6, -141); lander.scale.setScalar(0.7); scene.add(lander);

    var rover = new THREE.Group();
    add(rover, new THREE.BoxGeometry(1.8, 0.5, 1.2), mat(0xb9b9b9, 0.4), 0, 0.5, 0);
    for (var w = 0; w < 6; w++) { var wh = add(rover, new THREE.CylinderGeometry(0.28, 0.28, 0.22, 10), mat(0x333333, 0.3), (w % 3 - 1) * 0.8, 0.2, w < 3 ? 0.7 : -0.7); wh.rotation.x = Math.PI / 2; }
    add(rover, new THREE.CylinderGeometry(0.04, 0.04, 1, 5), mat(0xdddddd), 0.6, 1.2, 0);
    rover.position.set(-12, 5, -280); rover.rotation.y = 0.6; scene.add(rover);

    var voy = new THREE.Group();
    add(voy, new THREE.SphereGeometry(1.6, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xe8e8e8, 0.2), 0, 0, 0).rotation.x = -Math.PI / 2;
    add(voy, new THREE.CylinderGeometry(0.06, 0.06, 4, 5), mat(0x999999), -2.2, -0.4, 0).rotation.z = Math.PI / 2;
    add(voy, new THREE.BoxGeometry(0.9, 0.9, 0.9), mat(0xb9a05a, 0.6), 0, -0.2, 0.9);
    voy.position.set(5, 0, -420); scene.add(voy);

    /* camera path (scroll progress 0..1) */
    var path = [[0, 0, 46, -6], [0.18, 1, -95, 4], [0.42, 0, -245, -6], [0.66, -1, -380, 0], [1, 0, -450, 0]];
    function pathAt(p) {
      for (var i = 0; i < path.length - 1; i++) if (p <= path[i + 1][0]) {
        var a = path[i], b = path[i + 1], t = (p - a[0]) / (b[0] - a[0]); t = t * t * (3 - 2 * t);
        return { y: a[1] + (b[1] - a[1]) * t, z: a[2] + (b[2] - a[2]) * t, x: a[3] + (b[3] - a[3]) * t };
      }
      var l = path[path.length - 1]; return { y: l[1], z: l[2], x: l[3] };
    }

    /* independent cloud layer on Earth (own rotation speed) */
    var cloudTex = track(new THREE.CanvasTexture(paint(Q.tex, Q.tex / 2, function (u, v) { var n = fbm(u * 9 + 11, v * 9), g = Math.max(0, Math.min(1, (n - 0.45) * 3.2)) * 255; return [g, g, g]; })));
    var clouds = new THREE.Mesh(track(new THREE.SphereGeometry(10.14, Q.seg, Q.seg / 2)), track(new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: cloudTex, transparent: true, opacity: 0.8, depthWrite: false, roughness: 1, metalness: 0 })));
    clouds.position.copy(earth.position); scene.add(clouds);

    /* ---------- quality: High / Balanced / Performance ---------- */
    var QK = "abnf-quality", qual = small ? "performance" : "balanced";
    try { qual = localStorage.getItem(QK) || qual; } catch (e) {}
    var QMODES = { high: { dpr: 2, stars: 1, neb: true, aa: true }, balanced: { dpr: 1.5, stars: 0.7, neb: true, aa: true }, performance: { dpr: 1, stars: 0.4, neb: false, aa: false } };
    var qBtn = null;
    function applyQ(q) {
      if (!QMODES[q]) q = "balanced"; qual = q; var o = QMODES[q];
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, o.dpr));
      starPts.geometry.setDrawRange(0, Math.floor(N * o.stars));
      nebulae.forEach(function (n) { n.visible = o.neb; });
      renderer.setSize(innerWidth, innerHeight, false);
      try { localStorage.setItem(QK, q); } catch (e) {}
      if (qBtn) qBtn.textContent = "Quality: " + q.charAt(0).toUpperCase() + q.slice(1);
    }

    /* ---------- optional sound (procedural, muted by default) ---------- */
    var audio = { ctx: null, master: null, filt: null, noise: null, on: false };
    function audioInit() {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      try {
        var c = new AC(), m = c.createGain(), f = c.createBiquadFilter(), lfo = c.createOscillator(), lg = c.createGain();
        m.gain.value = 0; f.type = "lowpass"; f.frequency.value = 300; f.Q.value = 0.7;
        [[55, "sine", 0.5], [82.41, "triangle", 0.25], [110.7, "sine", 0.12]].forEach(function (d) { var o = c.createOscillator(), g = c.createGain(); o.type = d[1]; o.frequency.value = d[0]; g.gain.value = d[2]; o.connect(g); g.connect(f); o.start(); });
        var len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
        for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        var ns = c.createBufferSource(), nf = c.createBiquadFilter(), ng = c.createGain(); ns.buffer = buf; ns.loop = true; nf.type = "bandpass"; nf.frequency.value = 500; ng.gain.value = 0;
        ns.connect(nf); nf.connect(ng); ng.connect(m); ns.start();
        lfo.frequency.value = 0.07; lg.gain.value = 70; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
        f.connect(m); m.connect(c.destination);
        audio.ctx = c; audio.master = m; audio.filt = f; audio.noise = ng; return true;
      } catch (e) { audio.ctx = null; return false; }
    }
    var CH_SOUND = [[300, 0.0], [160, 0.0], [520, 0.35], [130, 0.0], [240, 0.0]]; /* Moon and deep space: no air, no wind */
    function audioChapter(ci) { if (!audio.ctx) return; var t = audio.ctx.currentTime, c = CH_SOUND[ci] || CH_SOUND[0]; audio.filt.frequency.setTargetAtTime(c[0], t, 1.2); audio.noise.gain.setTargetAtTime(c[1] * 0.12, t, 1.2); }
    var sndBtn = null;
    function setSound(on) {
      if (on && !audio.ctx && audioInit() === false) { if (sndBtn) { sndBtn.textContent = "Sound unavailable"; sndBtn.disabled = true; } return; }
      audio.on = on; if (!audio.ctx) return;
      if (on) { audio.ctx.resume && audio.ctx.resume(); audioChapter(Math.max(lastCh, 0)); }
      audio.master.gain.setTargetAtTime(on ? 0.16 : 0, audio.ctx.currentTime, on ? 0.7 : 0.25);
      if (sndBtn) { sndBtn.textContent = "Sound: " + (on ? "On" : "Off"); sndBtn.setAttribute("aria-pressed", String(on)); }
    }

    /* ---------- HUD + controls ---------- */
    var hud = document.createElement("div"); hud.id = "cin-hud"; hud.setAttribute("aria-hidden", "true");
    hud.innerHTML = '<span id="cin-chapter"></span><small>Illustrative real-time 3D reconstruction. Not NASA photography. Positions and sizes are not to scale.</small>';
    document.body.appendChild(hud);
    var chapterEl = hud.firstChild, lastCh = -1;
    var ctl = document.createElement("div"); ctl.id = "cin-ctl"; ctl.setAttribute("role", "group"); ctl.setAttribute("aria-label", "Experience controls");
    ctl.innerHTML = '<button type="button" id="cin-snd" aria-pressed="false">Sound: Off</button><button type="button" id="cin-q"></button><button type="button" id="cin-replay">Replay intro</button>';
    document.body.appendChild(ctl);
    sndBtn = ctl.querySelector("#cin-snd"); qBtn = ctl.querySelector("#cin-q");
    sndBtn.addEventListener("click", function () { setSound(!audio.on); });
    qBtn.addEventListener("click", function () { var k = ["performance", "balanced", "high"]; applyQ(k[(k.indexOf(qual) + 1) % 3]); });
    applyQ(qual);

    /* ---------- staged opening: darkness > approach > astronaut > title > enter ---------- */
    var INTRO_SEC = 14;
    var CAPS = [[0, "The darkness between worlds."], [0.2, "Earth. Where every mission begins."], [0.42, "Some of what we sent never came home."]];
    var seen = false; try { seen = sessionStorage.getItem("abnf-intro") === "1"; } catch (e) {}
    var introT = (seen || reduce) ? 1 : 0, introRun = introT < 1, ov = null, capIdx = -1, ovStage = 0;
    function esc(e) { if (e.key === "Escape") closeIntro(true); }
    function closeIntro(skip) {
      if (!ov) return; try { sessionStorage.setItem("abnf-intro", "1"); } catch (e) {}
      var o = ov; ov = null; o.classList.add("out"); setTimeout(function () { document.body.classList.remove("cin-lock"); }, 150);
      introRun = true; if (skip) introT = 1; setTimeout(function () { o.remove(); }, 900); document.removeEventListener("keydown", esc);
      lastFocus && lastFocus.focus && lastFocus.focus();
    }
    var lastFocus = null;
    function openIntro(instant) {
      if (ov) return; lastFocus = document.activeElement;
      ov = document.createElement("div"); ov.id = "cin-intro"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", "Introduction");
      ov.innerHTML = '<button type="button" id="cin-skip" class="cin-skip">Skip intro</button>' +
        '<p class="cin-cap" id="cin-cap" aria-live="polite"></p>' +
        '<div class="cin-reveal"><p class="cin-k">NASA SPACE APPS CHALLENGE 2026</p><h2><span>ABANDONED,</span> <span>BUT NOT</span> <span>FORGOTTEN</span></h2><p class="cin-s">Every mission leaves something behind. Every abandoned object has a story.</p></div>' +
        '<button type="button" id="cin-enter" class="btn btn-primary cin-enter">BEGIN THE MISSION</button>';
      document.body.appendChild(ov); document.body.classList.add("cin-lock");
      ov.querySelector("#cin-enter").addEventListener("click", function () { closeIntro(false); });
      ov.querySelector("#cin-skip").addEventListener("click", function () { closeIntro(true); });
      document.addEventListener("keydown", esc);
      capIdx = -1; ovStage = 0;
      if (instant) { introT = 1; setOvStage(3); } else { introT = 0; introRun = true; canvas.style.opacity = "0"; }
      ov.querySelector(instant ? "#cin-enter" : "#cin-skip").focus();
    }
    function setOvStage(n) { if (!ov || n === ovStage) return; ovStage = n; ov.classList.toggle("s-title", n >= 1); ov.classList.toggle("s-tag", n >= 2); ov.classList.toggle("s-btn", n >= 3); if (n >= 1) { var c = ov.querySelector("#cin-cap"); c.textContent = ""; } }
    if (!seen && !reduce) openIntro(false);
    ctl.querySelector("#cin-replay").addEventListener("click", function () {
      scrollTo(0, 0); prog = 0; if (ov) return; openIntro(reduce);
    });
    document.body.classList.add("cin-on");

    /* ---------- input + loop ---------- */
    var mx = 0, my = 0, prog = 0, story = document.querySelector(".story"), clock = new THREE.Clock(), visible = true;
    var fwd = new THREE.Vector3(), rgt = new THREE.Vector3(), astroHome = astro.position.clone(), passing = false;
    addEventListener("mousemove", function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
    document.addEventListener("visibilitychange", function () { visible = !document.hidden; });
    function resize() { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight, false); }
    addEventListener("resize", resize);

    function frame() {
      raf = requestAnimationFrame(frame); if (!visible || dead) return;
      var dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
      var endY = story ? story.offsetTop + story.offsetHeight - innerHeight : innerHeight * 6;
      var target = Math.max(0, Math.min(1, scrollY / Math.max(endY, 1)));
      prog += (target - prog) * (reduce ? 1 : Math.min(1, dt * 4));
      if (introRun && introT < 1) introT = Math.min(1, introT + dt / INTRO_SEC);
      var e = 1 - Math.pow(1 - introT, 3), p = pathAt(prog);
      var px = reduce ? 0 : mx, py = reduce ? 0 : my;
      var sweep = (1 - e);
      cam.position.set(p.x + px * 3 - sweep * 14, p.y - py * 2 + sweep * 3, p.z + sweep * 150);
      cam.lookAt(p.x * 0.4 - 4 + px * 2, p.y * 0.5, p.z - 40);
      if (introT < 1) canvas.style.opacity = String(Math.min(1, introT * INTRO_SEC / 2.5)); else if (canvas.style.opacity) canvas.style.opacity = "";

      /* intro captions and title stages */
      if (ov && introT < 1) {
        var ci2 = 0; for (var c2 = 0; c2 < CAPS.length; c2++) if (introT >= CAPS[c2][0]) ci2 = c2;
        if (introT >= 0.68) setOvStage(introT >= 0.88 ? 3 : introT >= 0.78 ? 2 : 1);
        else if (ci2 !== capIdx) { capIdx = ci2; var cap = ov.querySelector("#cin-cap"); cap.textContent = CAPS[ci2][1]; cap.classList.remove("in"); void cap.offsetWidth; cap.classList.add("in"); }
      } else if (ov && introT >= 1 && ovStage < 3) setOvStage(3);

      /* spacecraft/astronaut fly-by during the approach */
      var k = (introT - 0.38) / 0.34;
      if (!reduce && introT < 1 && k > 0 && k < 1) {
        passing = true; var s = k * k * (3 - 2 * k);
        cam.getWorldDirection(fwd); rgt.crossVectors(fwd, cam.up).normalize();
        astro.position.copy(cam.position).addScaledVector(fwd, 60 - s * 66).addScaledVector(rgt, 4 - s * 3.4).addScaledVector(cam.up, -1.2 + s * 0.6);
      } else if (passing) { astro.position.lerp(astroHome, Math.min(1, dt * 0.9)); if (astro.position.distanceTo(astroHome) < 0.3) passing = false; }
      if (!reduce) {
        earth.rotation.y += dt * 0.03; clouds.rotation.y += dt * 0.042; moon.rotation.y += dt * 0.01; mars.rotation.y += dt * 0.025;
        astro.rotation.set(t * 0.2, t * 0.15, t * 0.1); if (!passing) astro.position.y = -0.5 + Math.sin(t * 0.6) * 0.5;
        voy.position.z = -420 - prog * 25 - t * 0.4; rover.rotation.y = 0.6 + Math.sin(t * 0.2) * 0.2;
      }
      sat.position.set(-22 + Math.cos(t * 0.15) * 16, -2 + Math.sin(t * 0.15) * 3, -30 + Math.sin(t * 0.15) * 16); sat.rotation.y = t * 0.3;
      var ci = 0; for (var i = 0; i < chapters.length; i++) if (prog >= chapters[i].at) ci = i;
      if (ci !== lastCh) { lastCh = ci; chapterEl.textContent = chapters[ci].name; audioChapter(ci); }
      renderer.render(scene, cam);
    }
    frame();

    /* robustness: context loss and teardown */
    canvas.addEventListener("webglcontextlost", function (ev) {
      ev.preventDefault(); dead = true; cancelAnimationFrame(raf);
      document.body.classList.remove("cin-on", "cin-lock"); hud.remove(); ctl.remove(); ov && ov.remove(); ov = null; canvas.style.display = "none";
      if (audio.ctx) { try { audio.ctx.close(); } catch (e2) {} }
    });
    addEventListener("pagehide", function () {
      dead = true; cancelAnimationFrame(raf); if (audio.ctx) { try { audio.ctx.close(); } catch (e3) {} }
      disposables.forEach(function (d) { d.dispose && d.dispose(); }); renderer.dispose();
    });
  }
})();
