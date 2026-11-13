/* ============================================================
   Space Explorer: Their Legacy - 3D world engine (classic script)
   Three.js r160 is loaded lazily with dynamic import(): first
   js/vendor/three.module.min.js (if you vendor it), then jsDelivr.
   Game logic (movement, zones, interaction) uses plain numbers so
   it does not depend on the renderer. Layout is illustrative:
   nothing here is a surveyed position or a to-scale distance.
   ============================================================ */
(function () {
  "use strict";
  var D = window.SE_DATA, MD = window.SE_MODELS, T = null;
  var CDN = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";

  function loadThree() {
    var urls = [new URL("js/vendor/three.module.min.js", document.baseURI).href, CDN], i = 0;
    function next(err) {
      if (i >= urls.length) return Promise.reject(err || new Error("Three.js could not be loaded"));
      var u = urls[i++];
      return import(u).catch(next);
    }
    return next();
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function rngFrom(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function angDiff(a, b) { var d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }

  /* ---------------- zone layouts (illustrative) ---------------- */
  var LAYOUT = {
    hub: { radius: 25, spawn: [0, 9], portals: { moon: [-15, -11], deep: [0, -19], mars: [15, -11] } },
    moon: { radius: 88, spawn: [0, 4], ret: [0, 9],
      pos: { "apollo-lm": [-24, -26], "surveyor-1": [26, -32], "surveyor-3": [50, -2], "surveyor-5": [32, 36], "surveyor-6": [-8, 48], "surveyor-7": [-46, 16] },
      craters: [[56, 16, 15, 3.2], [-60, -30, 20, 4.2], [8, -70, 18, 3.6], [-30, 62, 13, 2.6], [70, -50, 12, 2.4]] },
    mars: { radius: 92, spawn: [0, 4], ret: [0, 9],
      pos: { sojourner: [-24, -24], spirit: [16, -42], opportunity: [48, -14], phoenix: [34, 30], insight: [-20, 38], ingenuity: [-4, -54] },
      craters: [[-58, 10, 14, 2.8], [70, 44, 16, 3.2], [-10, -70, 12, 2.4]] },
    deep: { radius: 0, spawn: [0, 0], ret: [4, 3],
      path: [[0, 0], [0, -26], [22, -50], [-6, -76], [-32, -102]],
      pos: { "pioneer-10": [0, -26], "pioneer-11": [22, -50], "voyager-1": [-6, -76], "voyager-2": [-32, -102] } }
  };
  var PAD_R = 8.5, BRIDGE_W = 2.2;

  function distSeg(px, pz, a, b) {
    var dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz, t = l2 ? clamp(((px - a[0]) * dx + (pz - a[1]) * dz) / l2, 0, 1) : 0;
    var x = a[0] + dx * t - px, z = a[1] + dz * t - pz; return Math.sqrt(x * x + z * z);
  }

  /* terrain height (pure function, no renderer needed) */
  function makeHeight(zone) {
    var L = LAYOUT[zone], flats = [[L.spawn[0], L.spawn[1], 9]];
    if (L.ret) flats.push([L.ret[0], L.ret[1], 6]);
    Object.keys(L.pos || {}).forEach(function (k) { flats.push([L.pos[k][0], L.pos[k][1], 7]); });
    var amp = zone === "mars" ? 1.5 : 1.0;
    return function (x, z) {
      if (zone === "hub" || zone === "deep") return 0;
      var h = amp * (1.4 * Math.sin(x * 0.045 + 1.3) * Math.cos(z * 0.05) + 0.6 * Math.sin(x * 0.12 + z * 0.08) + 0.3 * Math.sin(z * 0.21 - x * 0.15));
      if (zone === "mars") h += 0.9 * Math.sin((x + z) * 0.07) * Math.sin((x - z) * 0.05);
      (L.craters || []).forEach(function (c) {
        var d = Math.sqrt((x - c[0]) * (x - c[0]) + (z - c[1]) * (z - c[1])) / c[2];
        if (d < 1) h -= c[3] * (1 - d * d); h += c[3] * 0.45 * Math.exp(-Math.pow((d - 1.02) / 0.16, 2));
      });
      var m = 1;
      for (var i = 0; i < flats.length; i++) {
        var f = flats[i], dd = Math.sqrt((x - f[0]) * (x - f[0]) + (z - f[1]) * (z - f[1]));
        m = Math.min(m, smooth(f[2] * 0.6, f[2] * 1.5, dd));
      }
      return h * m;
    };
  }
  function makeWalkable(zone) {
    var L = LAYOUT[zone];
    if (zone === "deep") {
      return function (x, z) {
        for (var i = 0; i < L.path.length; i++) if (Math.hypot(x - L.path[i][0], z - L.path[i][1]) <= PAD_R) return true;
        for (var j = 0; j < L.path.length - 1; j++) if (distSeg(x, z, L.path[j], L.path[j + 1]) <= BRIDGE_W) return true;
        return false;
      };
    }
    return function (x, z) { return Math.hypot(x, z) < L.radius; };
  }

  /* ============================================================ */
  function create(opts) {
    var canvas = opts.canvas, hooks = opts.hooks || {};
    var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    var coarse = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    var highQ = !coarse && window.innerWidth > 720;

    return loadThree().then(function (three) {
      T = three; MD.init(T);
      var H = MD.helpers;
      var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: !coarse, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
      if (highQ) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap; }
      var scene = new T.Scene(), camera = new T.PerspectiveCamera(58, 1, 0.1, 2500);

      /* ---------- state (plain numbers) ---------- */
      var S = {
        mode: "none", zone: "hub", blocked: true, running: false, raf: 0, last: 0, t: 0,
        p: { x: 0, y: 0, z: 0, vy: 0, heading: 0, grounded: true, moving: 0, phase: 0 },
        cam: { yaw: 0, pitch: 0.35, dist: 7.5, tx: 0, ty: 0, tz: 0 },
        keys: {}, joy: { x: 0, y: 0 }, jumpQ: false, near: null, items: [],
        found: {}, target: null, height: makeHeight("hub"), walkable: makeWalkable("hub")
      };
      var listeners = [], disposed = false;
      function on(tg, type, fn, o) { tg.addEventListener(type, fn, o); listeners.push([tg, type, fn, o]); }

      /* ---------- shared sky / lights ---------- */
      var skyGroup = new T.Group(); scene.add(skyGroup);
      var hemi = new T.HemisphereLight(0xbcd0ff, 0x30204a, 1.0); scene.add(hemi);
      var sun = new T.DirectionalLight(0xffffff, 2.4); sun.position.set(30, 50, 20);
      if (highQ) { sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); var sc = sun.shadow.camera; sc.left = -28; sc.right = 28; sc.top = 28; sc.bottom = -28; sc.near = 1; sc.far = 140; sun.shadow.bias = -0.0008; }
      scene.add(sun); scene.add(sun.target);

      var starGeo = (function () {
        var r = rngFrom(7), n = coarse ? 900 : 1800, a = new Float32Array(n * 3);
        for (var i = 0; i < n; i++) { var u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); a[i * 3] = Math.cos(th) * s * 1100; a[i * 3 + 1] = u * 1100; a[i * 3 + 2] = Math.sin(th) * s * 1100; }
        var g = new T.BufferGeometry(); g.setAttribute("position", new T.BufferAttribute(a, 3)); return g;
      })();
      var stars = new T.Points(starGeo, new T.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 }));
      skyGroup.add(stars);

      function skyDome(top, mid, bot) {
        var g = new T.SphereGeometry(1200, 24, 16), pos = g.attributes.position, col = new Float32Array(pos.count * 3);
        var ct = new T.Color(top), cm = new T.Color(mid), cb = new T.Color(bot), c = new T.Color();
        for (var i = 0; i < pos.count; i++) {
          var y = pos.getY(i) / 1200;
          if (y > 0) c.copy(cm).lerp(ct, Math.pow(y, 0.6)); else c.copy(cm).lerp(cb, Math.min(1, -y * 2.5));
          col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
        }
        g.setAttribute("color", new T.BufferAttribute(col, 3));
        return new T.Mesh(g, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
      }
      function earth(r) {
        var tex = H.canvasTex(512, 256, function (g, w, h) {
          g.fillStyle = "#2a74e0"; g.fillRect(0, 0, w, h);
          var rr = rngFrom(11);
          g.fillStyle = "#43c46b"; for (var i = 0; i < 26; i++) { g.beginPath(); g.ellipse(rr() * w, 30 + rr() * (h - 60), 14 + rr() * 38, 8 + rr() * 22, rr() * 3, 0, 7); g.fill(); }
          g.fillStyle = "rgba(255,255,255,.75)"; for (var j = 0; j < 38; j++) { g.beginPath(); g.ellipse(rr() * w, rr() * h, 10 + rr() * 34, 3 + rr() * 7, rr() * 3, 0, 7); g.fill(); }
          g.fillStyle = "#f4f8ff"; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14);
        });
        var grp = new T.Group();
        grp.add(new T.Mesh(new T.SphereGeometry(r, 32, 24), new T.MeshBasicMaterial({ map: tex, fog: false })));
        grp.add(new T.Mesh(new T.SphereGeometry(r * 1.07, 24, 16), new T.MeshBasicMaterial({ color: 0x6fb6ff, transparent: true, opacity: 0.22, side: T.BackSide, fog: false, blending: T.AdditiveBlending, depthWrite: false })));
        return grp;
      }
      function label(text, sub, color, w, h) {
        w = w || 640; h = h || 160;
        var tex = H.canvasTex(w, h, function (g) {
          g.fillStyle = "rgba(18,15,46,.86)"; g.strokeStyle = color; g.lineWidth = 6;
          var r = 34; g.beginPath(); g.moveTo(r, 4); g.arcTo(w - 4, 4, w - 4, h - 4, r); g.arcTo(w - 4, h - 4, 4, h - 4, r); g.arcTo(4, h - 4, 4, 4, r); g.arcTo(4, 4, w - 4, 4, r); g.closePath(); g.fill(); g.stroke();
          g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#fff"; g.font = "700 " + (sub ? 52 : 60) + "px 'Space Grotesk', Arial, sans-serif";
          g.fillText(text, w / 2, sub ? h * 0.38 : h / 2);
          if (sub) { g.fillStyle = color; g.font = "600 34px Inter, Arial, sans-serif"; g.fillText(sub, w / 2, h * 0.72); }
        });
        var s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); s.userData = { w: w, h: h }; return s;
      }

      /* ---------- player ---------- */
      var avatar = null, avatarCfg = { gender: "male", suit: MD.SUITS[0].hex };
      var pedestal = new T.Group(); scene.add(pedestal);
      (function () {
        var base = H.add(pedestal, new T.CylinderGeometry(1.5, 1.7, 0.25, 32), H.mat(0x26205c, { m: 0.4 }), 0, -0.13, 0);
        var ring = H.add(pedestal, new T.TorusGeometry(1.45, 0.05, 8, 48), H.mat(0x3df2c4, { e: 0x3df2c4, ei: 1.2 }), 0, 0.0, 0, false); ring.rotation.x = Math.PI / 2;
        base.receiveShadow = true;
      })();
      function setAvatar(gender, suitHex) {
        avatarCfg.gender = gender || avatarCfg.gender; avatarCfg.suit = suitHex == null ? avatarCfg.suit : suitHex;
        if (avatar && avatar.userData.female === (avatarCfg.gender === "female")) { MD.setSuit(avatar, avatarCfg.suit); return; }
        if (avatar) { scene.remove(avatar); disposeObj(avatar); }
        avatar = MD.astronaut(avatarCfg.gender, avatarCfg.suit); scene.add(avatar);
      }

      /* ---------- zone building / disposal ---------- */
      var zoneGroup = null, hubParts = null, zoneAnim = [], ambient = null, hubLabels = {}, portalMeta = {}, beacons = {}, planets = [];
      function disposeObj(o) {
        o.traverse(function (n) {
          if (n.geometry) n.geometry.dispose();
          if (n.material) { (Array.isArray(n.material) ? n.material : [n.material]).forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); }); }
        });
      }
      function scatterRocks(group, zone, count, color, minR, maxR, avoid) {
        var L = LAYOUT[zone], rnd = rngFrom(zone.length * 977 + count), geo = new T.DodecahedronGeometry(1, 0);
        var im = new T.InstancedMesh(geo, new T.MeshStandardMaterial({ color: color, roughness: 1, flatShading: true }), count);
        var d = new T.Object3D(), n = 0, tries = 0;
        while (n < count && tries++ < count * 8) {
          var a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * (L.radius - 4), x = Math.cos(a) * r, z = Math.sin(a) * r, ok = true;
          for (var i = 0; i < avoid.length; i++) if (Math.hypot(x - avoid[i][0], z - avoid[i][1]) < avoid[i][2]) { ok = false; break; }
          if (!ok) continue;
          var s = minR + rnd() * (maxR - minR);
          d.position.set(x, S.height(x, z) + s * 0.35, z); d.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); d.scale.set(s * (0.8 + rnd() * 0.6), s * (0.6 + rnd() * 0.5), s * (0.8 + rnd() * 0.6));
          d.updateMatrix(); im.setMatrixAt(n++, d.matrix);
        }
        im.count = n; im.instanceMatrix.needsUpdate = true; group.add(im); return im;
      }
      function terrain(group, zone, base, hi, lo) {
        var L = LAYOUT[zone], size = L.radius * 2 + 40, seg = coarse ? 72 : 110;
        var g = new T.PlaneGeometry(size, size, seg, seg); g.rotateX(-Math.PI / 2);
        var pos = g.attributes.position, col = new Float32Array(pos.count * 3), rnd = rngFrom(5), c = new T.Color(), cb = new T.Color(base), ch = new T.Color(hi), cl = new T.Color(lo);
        for (var i = 0; i < pos.count; i++) {
          var x = pos.getX(i), z = pos.getZ(i), h = S.height(x, z); pos.setY(i, h);
          var t = clamp((h + 3) / 6, 0, 1); c.copy(cl).lerp(cb, clamp(t * 2, 0, 1)).lerp(ch, clamp(t * 2 - 1, 0, 1));
          var j = 0.9 + rnd() * 0.2; col[i * 3] = c.r * j; col[i * 3 + 1] = c.g * j; col[i * 3 + 2] = c.b * j;
        }
        g.setAttribute("color", new T.BufferAttribute(col, 3)); g.computeVertexNormals();
        var m = new T.Mesh(g, new T.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true })); m.receiveShadow = true; group.add(m);
        var rim = new T.Mesh(new T.RingGeometry(L.radius - 0.4, L.radius + 40, 64), new T.MeshBasicMaterial({ color: new T.Color(base).multiplyScalar(0.2), side: T.DoubleSide })); rim.rotation.x = -Math.PI / 2; rim.position.y = -6; group.add(rim);
      }
      function makeBeacon(group, id, x, y, z, accent) {
        var b = new T.Group(); b.position.set(x, y, z);
        var ringM = new T.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.85, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending });
        var ring = new T.Mesh(new T.RingGeometry(3.2, 3.8, 40), ringM); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06; b.add(ring);
        var ring2 = new T.Mesh(new T.RingGeometry(1.2, 1.4, 32), ringM); ring2.rotation.x = -Math.PI / 2; ring2.position.y = 0.07; b.add(ring2);
        var beamM = new T.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.2, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
        var beam = new T.Mesh(new T.CylinderGeometry(0.18, 2.2, 11, 20, 1, true), beamM); beam.position.y = 5.5; b.add(beam);
        var gem = new T.Mesh(new T.OctahedronGeometry(0.45, 0), new T.MeshBasicMaterial({ color: accent })); gem.position.y = 9.4; b.add(gem);
        group.add(b); beacons[id] = { g: b, ringM: ringM, beamM: beamM, gem: gem, beam: beam, accent: accent, baseY: 9.4 };
        zoneAnim.push(function (t) { gem.rotation.y = t * 1.6; gem.position.y = beacons[id] && S.found[id] ? 4.6 + Math.sin(t * 2) * 0.12 : 9.4 + Math.sin(t * 2.2) * 0.3; });
        applyBeacon(id);
      }
      function applyBeacon(id) {
        var b = beacons[id]; if (!b) return; var f = !!S.found[id];
        var c = f ? 0x5cf0a0 : b.accent; b.ringM.color.setHex(c); b.beamM.color.setHex(c); b.gem.material.color.setHex(c);
        b.beam.scale.y = f ? 0.4 : 1; b.beam.position.y = f ? 2.2 : 5.5; b.beamM.opacity = f ? 0.14 : 0.22;
      }
      function addItem(it) { S.items.push(it); }
      function returnGate(group, zone, color) {
        var L = LAYOUT[zone], x = L.ret[0], z = L.ret[1], y = S.height(x, z);
        var g = new T.Group(); g.position.set(x, y, z);
        var m = H.mat(0x3df2c4, { e: 0x3df2c4, ei: 1.4 });
        var tor = H.add(g, new T.TorusGeometry(1.7, 0.16, 10, 36), m, 0, 2.2, 0); tor.rotation.y = 0;
        H.add(g, new T.CylinderGeometry(0.22, 0.28, 2.2, 8), H.mat(0x26205c), -1.7, 1.1, 0); H.add(g, new T.CylinderGeometry(0.22, 0.28, 2.2, 8), H.mat(0x26205c), 1.7, 1.1, 0);
        var disc = new T.Mesh(new T.CircleGeometry(1.55, 28), new T.MeshBasicMaterial({ color: 0x3df2c4, transparent: true, opacity: 0.28, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false })); disc.position.y = 2.2; g.add(disc);
        var lb = label("Space Hub", "Return", "#3df2c4", 480, 140); lb.scale.set(4.2, 1.22, 1); lb.position.y = 4.9; g.add(lb);
        group.add(g);
        zoneAnim.push(function (t) { disc.material.opacity = 0.22 + Math.sin(t * 2.4) * 0.06; });
        addItem({ id: "return", kind: "return", x: x, z: z, r: 3.4, label: "Return to the Space Hub" });
      }

      function buildHub() {
        var g = new T.Group(), L = LAYOUT.hub;
        S.height = makeHeight("hub"); S.walkable = makeWalkable("hub");
        var plat = H.add(g, new T.CylinderGeometry(L.radius, L.radius + 1.5, 1.2, 64), H.mat(0x2a2466, { m: 0.35, r: 0.5 }), 0, -0.6, 0); plat.receiveShadow = true; plat.castShadow = false;
        var top = new T.Mesh(new T.CircleGeometry(L.radius - 0.2, 64), new T.MeshStandardMaterial({ map: H.canvasTex(512, 512, function (c, w, h) {
          c.fillStyle = "#3a3290"; c.fillRect(0, 0, w, h);
          c.strokeStyle = "rgba(124,199,255,.35)"; c.lineWidth = 3;
          for (var r = 60; r < 260; r += 60) { c.beginPath(); c.arc(w / 2, h / 2, r, 0, 7); c.stroke(); }
          for (var a = 0; a < 12; a++) { c.beginPath(); c.moveTo(w / 2, h / 2); c.lineTo(w / 2 + Math.cos(a * Math.PI / 6) * 250, h / 2 + Math.sin(a * Math.PI / 6) * 250); c.stroke(); }
        }), roughness: 0.7 })); top.rotation.x = -Math.PI / 2; top.position.y = 0.01; top.receiveShadow = true; g.add(top);
        var edge = H.add(g, new T.TorusGeometry(L.radius - 0.1, 0.25, 8, 80), H.mat(0x3df2c4, { e: 0x3df2c4, ei: 1.3 }), 0, 0.1, 0, false); edge.rotation.x = Math.PI / 2;
        /* central mission core */
        var core = new T.Group(); core.position.set(0, 0, -2);
        H.add(core, new T.CylinderGeometry(2.2, 2.6, 0.7, 24), H.mat(0x26205c, { m: 0.4 }), 0, 0.35, 0);
        var globe = earth(1.5); globe.position.y = 3.4; core.add(globe);
        var ring = H.add(core, new T.TorusGeometry(2.3, 0.05, 6, 48), H.mat(0xffcf4a, { e: 0xffcf4a, ei: 1 }), 0, 3.4, 0, false); ring.rotation.x = 1.2;
        var moonie = H.add(core, new T.SphereGeometry(0.32, 14, 10), H.mat(0xc9cde0), 2.3, 3.4, 0, false);
        g.add(core); zoneAnim.push(function (t) { globe.rotation.y = t * 0.3; ring.rotation.z = t * 0.4; moonie.position.set(Math.cos(t * 0.8) * 2.3, 3.4 + Math.sin(t * 0.8) * 0.9, Math.sin(t * 0.8) * 2.3); });
        /* lamps around the rim */
        for (var i = 0; i < 16; i++) { var a = i / 16 * Math.PI * 2; H.add(g, new T.SphereGeometry(0.22, 10, 8), H.mat(i % 2 ? 0xffcf4a : 0x7cc7ff, { e: i % 2 ? 0xffcf4a : 0x7cc7ff, ei: 1.5 }), Math.cos(a) * (L.radius - 1.4), 0.25, Math.sin(a) * (L.radius - 1.4), false); }
        /* three portals */
        D.zoneIds.forEach(function (z) {
          var zn = D.zones[z], p = L.portals[z], pg = new T.Group(); pg.position.set(p[0], 0, p[1]);
          pg.rotation.y = Math.atan2(-p[0], 8 - p[1]) + Math.PI;           /* face the spawn point */
          pg.rotation.y = Math.atan2(0 - p[0], 8 - p[1]);
          var col = zn.hex, em = H.mat(col, { e: col, ei: 1.3 });
          H.add(pg, new T.CylinderGeometry(3.6, 4, 0.5, 24), H.mat(0x26205c, { m: 0.4 }), 0, 0.25, 0);
          H.add(pg, new T.TorusGeometry(3, 0.3, 12, 40), em, 0, 3.7, 0);
          H.add(pg, new T.CylinderGeometry(0.4, 0.5, 3.6, 10), H.mat(0x3a3290, { m: 0.4 }), -3, 1.9, 0); H.add(pg, new T.CylinderGeometry(0.4, 0.5, 3.6, 10), H.mat(0x3a3290, { m: 0.4 }), 3, 1.9, 0);
          var tex = H.canvasTex(256, 256, function (c, w, h) {
            var gr = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.35, zn.color); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
            c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 5; for (var k = 0; k < 3; k++) { c.beginPath(); c.arc(w / 2, h / 2, 40 + k * 26, k, k + 3.6); c.stroke(); }
          });
          var disc = new T.Mesh(new T.CircleGeometry(2.75, 36), new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.8, side: T.DoubleSide, blending: T.AdditiveBlending, depthWrite: false })); disc.position.y = 3.7; pg.add(disc);
          var ln = D.inZone(z).length, lb = label(zn.short.toUpperCase() === zn.short ? zn.short : zn.name.replace(" Exploration", ""), ln + " missions", zn.color, 560, 150);
          lb.scale.set(6, 1.6, 1); lb.position.y = 7.6; pg.add(lb); hubLabels[z] = lb; portalMeta[z] = { ln: ln, zn: zn };
          g.add(pg); zoneAnim.push(function (t) { disc.rotation.z = t * 0.9; });
          addItem({ id: "portal-" + z, kind: "portal", zone: z, x: p[0], z: p[1], r: 5.2, label: "Enter " + zn.name });
        });
        refreshHubLabels();
        /* floating sparkles */
        ambient = sparkles(g, 140, 34, 14, 0xfff2a8, 0.18);
        zoneGroup = g; scene.add(g);
        scene.background = new T.Color(0x120f2e); scene.fog = new T.Fog(0x120f2e, 90, 420);
        var sd = skyDome(0x0c0a24, 0x2b2170, 0x120f2e); sd.name = "dome"; skyGroup.add(sd);
        var e = earth(46); e.position.set(-260, 120, -420); e.name = "bigEarth"; skyGroup.add(e);
        hemi.color.setHex(0xbcd0ff); hemi.groundColor.setHex(0x3a2a7a); hemi.intensity = 1.15; sun.color.setHex(0xfff4e0); sun.intensity = 2.2; sun.position.set(24, 46, 30);
        stars.visible = true; stars.material.opacity = 0.95;
        S.center = { x: 0, z: 0 };
      }
      function refreshHubLabels() {
        D.zoneIds.forEach(function (z) {
          var m = portalMeta[z], lb = hubLabels[z]; if (!m || !lb) return;
          var f = D.inZone(z).filter(function (x) { return S.found[x.id]; }).length;
          var nl = label(m.zn.name.replace(" Exploration", ""), f + " of " + m.ln + " found", m.zn.color, 560, 150);
          lb.material.map.dispose(); lb.material.map = nl.material.map; lb.material.needsUpdate = true; nl.material.dispose();
        });
      }
      function sparkles(group, n, rad, hgt, color, size) {
        var a = new Float32Array(n * 3), r = rngFrom(n + 3);
        for (var i = 0; i < n; i++) { a[i * 3] = (r() * 2 - 1) * rad; a[i * 3 + 1] = r() * hgt; a[i * 3 + 2] = (r() * 2 - 1) * rad; }
        var geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(a, 3));
        var pts = new T.Points(geo, new T.PointsMaterial({ color: color, size: size * 3, sizeAttenuation: false, transparent: true, opacity: 0.7, depthWrite: false }));
        pts.userData = { rad: rad, hgt: hgt }; group.add(pts); return pts;
      }

      function buildSurface(zone) {
        var g = new T.Group(), L = LAYOUT[zone], moon = zone === "moon", z = zone;
        S.height = makeHeight(z); S.walkable = makeWalkable(z);
        var avoid = [[L.spawn[0], L.spawn[1], 10], [L.ret[0], L.ret[1], 7]];
        Object.keys(L.pos).forEach(function (k) { avoid.push([L.pos[k][0], L.pos[k][1], 7]); });
        if (moon) {
          terrain(g, z, 0xb4b8cc, 0xe6e8f6, 0x6f7391);
          scatterRocks(g, z, coarse ? 160 : 320, 0x8a8ea6, 0.4, 1.8, avoid);
          scatterRocks(g, z, 20, 0x6c7090, 2.2, 4.2, avoid);
          scene.background = new T.Color(0x03030c); scene.fog = new T.Fog(0x0a0a1c, 70, 260);
          var d = skyDome(0x000008, 0x0b0b26, 0x050512); skyGroup.add(d);
          var e = earth(58); e.position.set(-300, 210, -520); skyGroup.add(e);
          hemi.color.setHex(0xa7b8ff); hemi.groundColor.setHex(0x3a3d66); hemi.intensity = 1.1; sun.color.setHex(0xffffff); sun.intensity = 2.8; sun.position.set(60, 42, 30);
          stars.visible = true; stars.material.opacity = 1;
          /* landmarks: a glowing crater rim ring and a tall ridge */
          var ridge = new T.Group(); ridge.position.set(-62, 0, 52);
          for (var i = 0; i < 7; i++) H.add(ridge, new T.ConeGeometry(5 + i % 3 * 2, 9 + i * 1.6, 5), new T.MeshStandardMaterial({ color: 0x9296b0, flatShading: true, roughness: 1 }), i * 5 - 15, S.height(-62 + i * 5 - 15, 52) + 4, Math.sin(i) * 3);
          g.add(ridge);
        } else {
          terrain(g, z, 0xd8693a, 0xf2a36a, 0x8c3a22);
          scatterRocks(g, z, coarse ? 220 : 420, 0x9a4a2c, 0.4, 1.9, avoid);
          scatterRocks(g, z, 26, 0x7a3722, 2.2, 4.6, avoid);
          scene.background = new T.Color(0xf0a878); scene.fog = new T.Fog(0xe9a07a, 50, 230);
          var d2 = skyDome(0x7a4a78, 0xf2b08a, 0xd98a64); skyGroup.add(d2);
          hemi.color.setHex(0xffd2b0); hemi.groundColor.setHex(0x7a3a28); hemi.intensity = 1.25; sun.color.setHex(0xfff0d8); sun.intensity = 2.5; sun.position.set(-40, 48, 20);
          stars.visible = true; stars.material.opacity = 0.18;
          /* landmarks: a mesa and a rock arch */
          var mesa = H.add(g, new T.CylinderGeometry(9, 12, 16, 7), new T.MeshStandardMaterial({ color: 0xb4532f, flatShading: true, roughness: 1 }), -62, 8, -44);
          var arch = new T.Group(); arch.position.set(64, 0, 40);
          var rm = new T.MeshStandardMaterial({ color: 0xa24a2a, flatShading: true, roughness: 1 });
          H.add(arch, new T.BoxGeometry(3.4, 11, 3.4), rm, -5, 5.5, 0); H.add(arch, new T.BoxGeometry(3.4, 9, 3.4), rm, 5, 4.5, 0); H.add(arch, new T.BoxGeometry(15, 3.2, 4), rm, 0, 11.4, 0); g.add(arch);
          ambient = sparkles(g, 220, 36, 12, 0xffd8b0, 0.16);
          var sunDisc = new T.Mesh(new T.CircleGeometry(24, 28), new T.MeshBasicMaterial({ color: 0xfff1d0, fog: false })); sunDisc.position.set(-300, 230, -520); sunDisc.lookAt(0, 0, 0); skyGroup.add(sunDisc);
        }
        returnGate(g, z, 0x3df2c4);
        D.inZone(z).forEach(function (mm) {
          var p = L.pos[mm.id], y = S.height(p[0], p[1]);
          var craft = MD.craft(mm.craft, mm.accent); craft.position.set(p[0], y, p[1]); craft.rotation.y = Math.atan2(-p[0], 6 - p[1]) * 0.5 + mm.index; g.add(craft);
          makeBeacon(g, mm.id, p[0], y, p[1], mm.accent);
          addItem({ id: mm.id, kind: "mission", x: p[0], z: p[1], r: 5.2, label: mm.record.name });
        });
        zoneGroup = g; scene.add(g);
      }

      function planetTex(kind) {
        var sets = { jupiter: ["#d9a066", "#f2d3a4", "#b8743e", "#e9bd8a", "#a35f33"], saturn: ["#e8d49a", "#d2b878", "#f4e6b8", "#c8aa68"], uranus: ["#9fe6f0", "#8ad8e6", "#b6f0f6"], neptune: ["#3a63d8", "#2d4fbd", "#5a82ee", "#2644a8"] }[kind];
        return H.canvasTex(256, 128, function (g, w, h) { var r = rngFrom(kind.length * 31); for (var y = 0; y < h; y += 6) { g.fillStyle = sets[Math.floor(r() * sets.length)]; g.fillRect(0, y, w, 7); } if (kind === "jupiter") { g.fillStyle = "#c2563a"; g.beginPath(); g.ellipse(w * 0.62, h * 0.62, 20, 11, 0, 0, 7); g.fill(); } });
      }
      function buildDeep() {
        var g = new T.Group(), L = LAYOUT.deep;
        S.height = makeHeight("deep"); S.walkable = makeWalkable("deep");
        var padM = new T.MeshStandardMaterial({ color: 0x2f2a78, metalness: 0.4, roughness: 0.5 });
        var glow = H.mat(0xb784ff, { e: 0xb784ff, ei: 1.2 });
        L.path.forEach(function (p, i) {
          var pad = new T.Mesh(new T.CylinderGeometry(PAD_R, PAD_R + 0.8, 1, 36), padM); pad.position.set(p[0], -0.5, p[1]); pad.receiveShadow = true; g.add(pad);
          var rg = new T.Mesh(new T.TorusGeometry(PAD_R - 0.2, 0.14, 8, 48), glow); rg.rotation.x = Math.PI / 2; rg.position.set(p[0], 0.02, p[1]); g.add(rg);
          if (i < L.path.length - 1) {
            var q = L.path[i + 1], dx = q[0] - p[0], dz = q[1] - p[1], len = Math.hypot(dx, dz);
            var br = new T.Mesh(new T.BoxGeometry(BRIDGE_W * 2, 0.5, len), new T.MeshStandardMaterial({ color: 0x3b34a0, metalness: 0.3, roughness: 0.5, emissive: 0x2a1f80, emissiveIntensity: 0.5 }));
            br.position.set((p[0] + q[0]) / 2, -0.25, (p[1] + q[1]) / 2); br.rotation.y = Math.atan2(dx, dz); br.receiveShadow = true; g.add(br);
          }
        });
        returnGate(g, "deep", 0x3df2c4);
        D.inZone("deep").forEach(function (mm) {
          var p = L.pos[mm.id], craft = MD.craft(mm.craft, mm.accent); craft.position.set(p[0], 3.4, p[1]); craft.scale.setScalar(1.3); craft.rotation.y = 0.6; g.add(craft);
          var base = craft; zoneAnim.push(function (t) { base.position.y = 3.4 + Math.sin(t * 1 + mm.index) * 0.3; base.rotation.y = 0.6 + Math.sin(t * 0.4 + mm.index) * 0.35; });
          makeBeacon(g, mm.id, p[0], 0, p[1], mm.accent);
          addItem({ id: mm.id, kind: "mission", x: p[0], z: p[1], r: 5.4, label: mm.record.name });
        });
        /* stylised planets: names only, positions NOT to scale and not real */
        var defs = [["jupiter", "Jupiter", 26, -70, 14, -62], ["saturn", "Saturn", 20, 62, 10, -66], ["uranus", "Uranus", 14, -78, 6, -118], ["neptune", "Neptune", 15, 56, 14, -128]];
        defs.forEach(function (d) {
          var pl = new T.Group(); pl.position.set(d[3], d[4], d[5]);
          var body = new T.Mesh(new T.SphereGeometry(d[2], 40, 28), new T.MeshStandardMaterial({ map: planetTex(d[0]), roughness: 0.9 })); pl.add(body);
          if (d[0] === "saturn") { var rg = new T.Mesh(new T.RingGeometry(d[2] * 1.3, d[2] * 2.1, 64), new T.MeshBasicMaterial({ color: 0xe6d3a0, transparent: true, opacity: 0.7, side: T.DoubleSide })); rg.rotation.x = Math.PI / 2.4; pl.add(rg); }
          var lb = label(d[1], "", "#ffffff", 360, 110); lb.scale.set(7, 2.1, 1); lb.position.y = d[2] + 4; pl.add(lb);
          g.add(pl); planets.push(body); zoneAnim.push(function (t) { body.rotation.y = t * 0.05; });
        });
        var sunG = new T.Mesh(new T.SphereGeometry(10, 24, 16), new T.MeshBasicMaterial({ color: 0xfff0b0, fog: false })); sunG.position.set(220, 90, 140); g.add(sunG);
        var halo = new T.Mesh(new T.SphereGeometry(16, 24, 16), new T.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.25, blending: T.AdditiveBlending, depthWrite: false, fog: false })); halo.position.copy(sunG.position); g.add(halo);
        ambient = sparkles(g, 260, 70, 40, 0xcfd8ff, 0.14); ambient.position.y = -10;
        scene.background = new T.Color(0x07051a); scene.fog = new T.Fog(0x07051a, 150, 520);
        var d3 = skyDome(0x05030f, 0x1b1055, 0x0a0620); skyGroup.add(d3);
        /* nebula clouds */
        var nt = H.canvasTex(256, 256, function (c, w, h) { var gr = c.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
        [[-260, 60, -300, 0xff5fa8, 220], [240, 120, -380, 0x5fa8ff, 260], [0, 200, -480, 0xb784ff, 300]].forEach(function (n) {
          var s = new T.Sprite(new T.SpriteMaterial({ map: nt, color: n[3], transparent: true, opacity: 0.35, depthWrite: false, blending: T.AdditiveBlending, fog: false })); s.scale.set(n[4], n[4], 1); s.position.set(n[0], n[1], n[2]); skyGroup.add(s);
        });
        hemi.color.setHex(0xb0a8ff); hemi.groundColor.setHex(0x2a1a6a); hemi.intensity = 1.2; sun.color.setHex(0xfff2d8); sun.intensity = 2.3; sun.position.set(60, 40, 30);
        stars.visible = true; stars.material.opacity = 1;
        zoneGroup = g; scene.add(g);
      }

      function clearZone() {
        if (zoneGroup) { scene.remove(zoneGroup); disposeObj(zoneGroup); zoneGroup = null; }
        for (var i = skyGroup.children.length - 1; i >= 0; i--) { var c = skyGroup.children[i]; if (c === stars) continue; skyGroup.remove(c); disposeObj(c); }
        zoneAnim = []; S.items = []; beacons = {}; planets = []; ambient = null; hubLabels = {}; portalMeta = {}; S.near = null;
      }

      function enter(zone) {
        clearZone(); S.zone = zone;
        if (zone === "hub") buildHub(); else if (zone === "deep") buildDeep(); else buildSurface(zone);
        var L = LAYOUT[zone], sp = L.spawn;
        S.p.x = sp[0]; S.p.z = sp[1]; S.p.y = S.height(sp[0], sp[1]); S.p.vy = 0; S.p.grounded = true;
        S.p.heading = Math.PI; S.cam.yaw = 0; S.cam.pitch = 0.32; S.cam.dist = 7.5;
        snapCamera(); if (hooks.onZone) hooks.onZone(zone);
      }

      /* ---------- mode / camera ---------- */
      function setMode(m) {
        S.mode = m; pedestal.visible = (m === "creator");
        if (m === "creator") { enter("hub"); pedestal.position.set(0, 0, 9); S.p.x = 0; S.p.z = 9; S.cam.yaw = 0; }
        if (avatar) avatar.visible = true;
      }
      function snapCamera() { S.cam.tx = S.p.x; S.cam.ty = S.p.y + 1.5; S.cam.tz = S.p.z; placeCamera(1); }
      function placeCamera(k) {
        var c = S.cam, creator = S.mode === "creator", d = creator ? 4.3 : c.dist, pitch = creator ? 0.12 : c.pitch, yaw = creator ? 0.45 + Math.sin(S.t * 0.5) * 0.15 : c.yaw;
        var tx = S.p.x, ty = S.p.y + (creator ? 1.25 : 1.5), tz = S.p.z;
        if (creator) { var shiftX = window.innerWidth > 820 ? -1.3 : 0, shiftY = window.innerWidth > 820 ? 0 : -1.2; tx += Math.cos(yaw) * shiftX; tz += -Math.sin(yaw) * shiftX; ty += -shiftY * 0.0 + (shiftY ? 0.0 : 0); }
        c.tx = lerp(c.tx, tx, k); c.ty = lerp(c.ty, ty, k); c.tz = lerp(c.tz, tz, k);
        var cx = c.tx + Math.sin(yaw) * Math.cos(pitch) * d, cy = c.ty + Math.sin(pitch) * d, cz = c.tz + Math.cos(yaw) * Math.cos(pitch) * d;
        var gh = S.height(cx, cz) + 0.7; if (cy < gh) cy = gh;
        camera.position.set(cx, cy, cz); camera.lookAt(c.tx, c.ty + (creator && window.innerWidth <= 820 ? -0.35 : 0), c.tz);
      }

      /* ---------- per-frame update ---------- */
      function update(dt) {
        var p = S.p, moveOk = (S.mode === "hub" || S.mode === "zone") && !S.blocked;
        var ix = 0, iz = 0;
        if (moveOk) {
          var k = S.keys;
          ix = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0) + S.joy.x;
          iz = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0) + S.joy.y;
          var l = Math.hypot(ix, iz); if (l > 1) { ix /= l; iz /= l; }
        }
        var yaw = S.cam.yaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
        var mx = fx * iz + rx * ix, mz = fz * iz + rz * ix, mag = Math.min(1, Math.hypot(ix, iz));
        var speed = (S.keys.ShiftLeft || S.keys.ShiftRight ? 10.5 : 6.5) * mag;
        if (mag > 0.05) {
          var nx = p.x + (mx / (Math.hypot(mx, mz) || 1)) * speed * dt, nz = p.z + (mz / (Math.hypot(mx, mz) || 1)) * speed * dt;
          if (S.walkable(nx, nz)) { p.x = nx; p.z = nz; } else if (S.walkable(nx, p.z)) p.x = nx; else if (S.walkable(p.x, nz)) p.z = nz;
          p.heading += angDiff(p.heading, Math.atan2(mx, mz)) * Math.min(1, dt * 12);
        }
        p.moving = lerp(p.moving, mag > 0.05 ? 1 : 0, Math.min(1, dt * 10));
        var gh = S.height(p.x, p.z);
        if (S.jumpQ && moveOk && p.grounded) { p.vy = 6.4; p.grounded = false; }
        S.jumpQ = false;
        p.vy -= 9.5 * dt; p.y += p.vy * dt;
        if (p.y <= gh) { p.y = gh; p.vy = 0; p.grounded = true; } else if (p.y > gh + 0.05) p.grounded = false;
        if (S.zone === "deep" && p.y < -30) { var sp = LAYOUT.deep.spawn; p.x = sp[0]; p.z = sp[1]; p.y = 0; p.vy = 0; }
        /* nearest interactable */
        var best = null, bd = 1e9;
        for (var i = 0; i < S.items.length; i++) { var it = S.items[i], d = Math.hypot(it.x - p.x, it.z - p.z); if (d < it.r && d < bd) { bd = d; best = it; } }
        if (best !== S.near) { S.near = best; if (hooks.onNear) hooks.onNear(best ? { id: best.id, kind: best.kind, label: best.label, zone: best.zone } : null); }
        /* compass: nearest undiscovered mission in this zone */
        if (hooks.onCompass && S.zone !== "hub") {
          var tgt = null, td = 1e9;
          S.items.forEach(function (m) { if (m.kind === "mission" && !S.found[m.id]) { var dd = Math.hypot(m.x - p.x, m.z - p.z); if ((S.target && S.target === m.id) || (!S.target && dd < td)) { if (S.target === m.id) { td = -1; } else td = dd; tgt = m; } } });
          if (tgt) { var ang = Math.atan2(tgt.x - p.x, tgt.z - p.z); hooks.onCompass({ id: tgt.id, label: tgt.label, dist: Math.hypot(tgt.x - p.x, tgt.z - p.z), rel: angDiff(S.cam.yaw + Math.PI, ang) }); } else hooks.onCompass(null);
        }
      }
      function animate() {
        var p = S.p, t = S.t;
        if (avatar) {
          avatar.position.set(S.mode === "creator" ? 0 : p.x, S.mode === "creator" ? 0 : p.y, S.mode === "creator" ? 9 : p.z);
          var u = avatar.userData, sw = Math.sin(t * 9) * 0.75 * p.moving * (reduce ? 0.5 : 1), air = p.grounded ? 0 : 1;
          avatar.rotation.y = S.mode === "creator" ? 0.45 + Math.sin(t * 0.5) * 0.15 + Math.PI * 0 : p.heading;
          if (S.mode === "creator") avatar.rotation.y = -0.35 + Math.sin(t * 0.6) * 0.5;
          u.legL.rotation.x = sw * (1 - air) - air * 0.5; u.legR.rotation.x = -sw * (1 - air) + air * 0.3;
          u.armL.rotation.x = -sw * 0.9 * (1 - air) - air * 2.2; u.armR.rotation.x = sw * 0.9 * (1 - air) - air * 2.2;
          u.armL.rotation.z = 0.12 + air * 0.5; u.armR.rotation.z = -0.12 - air * 0.5;
          u.rig.position.y = (reduce ? 0 : Math.abs(Math.sin(t * 9)) * 0.06 * p.moving) + (reduce ? 0 : Math.sin(t * 1.6) * 0.012);
          u.head.rotation.y = Math.sin(t * 0.7) * 0.12 * (1 - p.moving);
        }
        for (var i = 0; i < zoneAnim.length; i++) zoneAnim[i](reduce ? 0 : t);
        if (ambient && !reduce) { var pa = ambient.geometry.attributes.position, h = ambient.userData.hgt, r = ambient.userData.rad; for (var j = 0; j < pa.count; j += 1) { pa.setY(j, (pa.getY(j) + 0.006 * (1 + (j % 5))) % h); } pa.needsUpdate = true; }
        if (ambient) { ambient.position.x = S.p.x; ambient.position.z = S.p.z; if (S.zone !== "deep") ambient.position.y = S.p.y - 1; }
        skyGroup.position.copy(camera.position);
        if (highQ) { sun.target.position.set(S.p.x, S.p.y, S.p.z); sun.position.set(S.p.x + 28, S.p.y + 46, S.p.z + 18); }
      }

      var frameCount = 0;
      function loop(now) {
        if (!S.running || disposed) return;
        S.raf = requestAnimationFrame(loop);
        var dt = Math.min(0.05, (now - S.last) / 1000 || 0.016); S.last = now; S.t += dt;
        update(dt);
        placeCamera(S.mode === "creator" ? 0.2 : (reduce ? 0.6 : Math.min(1, dt * 9)));
        animate(); renderer.render(scene, camera);
        if (++frameCount === 2 && hooks.onFirstFrame) hooks.onFirstFrame();
      }
      function resize() {
        var w = canvas.clientWidth || 800, h = canvas.clientHeight || 500;
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.75 ? 70 : 58; camera.updateProjectionMatrix();
      }

      /* ---------- input ---------- */
      function typing(e) { var t = e.target; return t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable); }
      on(window, "keydown", function (e) {
        if (typing(e) || e.ctrlKey || e.metaKey || e.altKey) return;
        var move = /^(KeyW|KeyA|KeyS|KeyD|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|ShiftLeft|ShiftRight)$/.test(e.code);
        var onBtn = e.target && (e.target.tagName === "BUTTON" || e.target.tagName === "A" || e.target.tagName === "SUMMARY");
        if (!S.running || S.blocked) return;
        if (move) { S.keys[e.code] = true; if (e.code.indexOf("Arrow") === 0 && !onBtn) e.preventDefault(); }
        else if (e.code === "Space" && !onBtn) { S.jumpQ = true; e.preventDefault(); }
        else if (e.code === "KeyE" && !e.repeat) interact();
      });
      on(window, "keyup", function (e) { delete S.keys[e.code]; });
      on(window, "blur", function () { S.keys = {}; S.joy.x = 0; S.joy.y = 0; });
      var drag = null;
      on(canvas, "pointerdown", function (e) { if (S.blocked) return; drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 }; try { canvas.setPointerCapture(e.pointerId); } catch (x) {} });
      on(canvas, "pointermove", function (e) {
        if (!drag || drag.id !== e.pointerId || S.mode === "creator") return;
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.moved += Math.abs(dx) + Math.abs(dy);
        S.cam.yaw -= dx * 0.0055; S.cam.pitch = clamp(S.cam.pitch + dy * 0.004, 0.05, 1.1);
      });
      function endDrag(e) { if (drag && drag.id === e.pointerId) drag = null; }
      on(canvas, "pointerup", endDrag); on(canvas, "pointercancel", endDrag);
      on(canvas, "wheel", function (e) { if (S.mode === "creator" || S.blocked) return; e.preventDefault(); S.cam.dist = clamp(S.cam.dist + e.deltaY * 0.006, 4.5, 12); }, { passive: false });
      on(canvas, "webglcontextlost", function (e) { e.preventDefault(); S.running = false; cancelAnimationFrame(S.raf); if (hooks.onLost) hooks.onLost(); });
      on(window, "resize", resize);
      var ro = (typeof ResizeObserver !== "undefined") ? new ResizeObserver(resize) : null; if (ro) ro.observe(canvas);

      function interact() {
        if (S.blocked || !S.near || S.busy) return false;
        S.busy = true; var it = S.near; setTimeout(function () { S.busy = false; }, 350);
        if (hooks.onInteract) hooks.onInteract({ id: it.id, kind: it.kind, zone: it.zone });
        return true;
      }

      /* ---------- public API ---------- */
      function start() { if (S.running || disposed) return; S.running = true; S.last = performance.now(); resize(); S.raf = requestAnimationFrame(loop); }
      function stop() { S.running = false; cancelAnimationFrame(S.raf); S.keys = {}; S.joy.x = 0; S.joy.y = 0; }
      function dispose() {
        disposed = true; stop(); listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); }); listeners = []; if (ro) ro.disconnect();
        clearZone(); if (avatar) { scene.remove(avatar); disposeObj(avatar); } disposeObj(pedestal); starGeo.dispose(); renderer.dispose();
      }
      var api = {
        setAvatar: setAvatar, setMode: setMode, enter: enter, start: start, stop: stop, dispose: dispose, interact: interact, resize: resize,
        setBlocked: function (b) { S.blocked = !!b; if (b) { S.keys = {}; S.joy.x = 0; S.joy.y = 0; } },
        setJoystick: function (x, y) { S.joy.x = clamp(x, -1, 1); S.joy.y = clamp(y, -1, 1); },
        jump: function () { S.jumpQ = true; },
        setFound: function (map) { S.found = map || {}; Object.keys(beacons).forEach(applyBeacon); refreshHubLabels(); },
        markFound: function (id) { S.found[id] = true; applyBeacon(id); refreshHubLabels(); },
        setTarget: function (id) { S.target = id || null; },
        get state() { return { zone: S.zone, target: S.target, mode: S.mode, x: S.p.x, y: S.p.y, z: S.p.z, near: S.near && S.near.id, items: S.items.length, blocked: S.blocked, running: S.running, camYaw: S.cam.yaw }; },
        /* test hooks: teleport next to an object so interaction can be exercised headlessly */
        _teleport: function (id) { var it = S.items.filter(function (i) { return i.id === id; })[0]; if (it) { S.p.x = it.x + 1; S.p.z = it.z + 1; S.p.y = S.height(S.p.x, S.p.z); } return !!it; },
        _items: function () { return S.items.map(function (i) { return i.id; }); },
        _step: function (secs, keys) { S.keys = keys || {}; var n = Math.round(secs * 60); for (var i = 0; i < n; i++) { update(1 / 60); } S.keys = {}; }
      };
      resize();
      return api;
    });
  }
  window.SE_WORLD = { create: create, layout: LAYOUT, makeHeight: makeHeight, makeWalkable: makeWalkable };
})();
