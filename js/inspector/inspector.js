/* ============================================================
   Spacecraft Inspector (inspect.html). Classic script.
   - Three.js r160 loaded lazily (js/vendor first, then jsDelivr), like the 3D game.
   - Own small orbit camera: mouse drag, wheel, touch drag/pinch, keyboard.
   - Components are selectable in 3D (raycast) AND from an accessible list.
   - Discovery journal stored in localStorage ("abnf-journal").
   - Without WebGL/Three.js the component list and all text still work.
   ============================================================ */
(function () {
  "use strict";
  var CDN = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";
  var D = window.INSPECT_DATA, MODELS = window.INSPECT_MODELS;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  var WORLDS = { moon: "The Moon", mars: "Mars", deepspace: "Deep Space" };
  var missions = (typeof MISSIONS !== "undefined") ? MISSIONS : [];
  function mission(id) { for (var i = 0; i < missions.length; i++) if (missions[i].id === id) return missions[i]; return null; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- journal ---------- */
  var KEY = "abnf-journal", journal = {};
  try { journal = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { journal = {}; }
  function saveJournal() { try { localStorage.setItem(KEY, JSON.stringify(journal)); } catch (e) {} }
  function found(craft, part) { return !!(journal[craft] && journal[craft][part]); }
  function markFound(craft, part) {
    journal[craft] = journal[craft] || {};
    if (journal[craft][part]) return false;
    journal[craft][part] = 1; saveJournal(); return true;
  }
  function counts(craft) {
    var fam = D.FAMILIES[D.CRAFT[craft]], got = 0;
    fam.parts.forEach(function (p) { if (found(craft, p.id)) got++; });
    return { got: got, total: fam.parts.length };
  }

  /* ---------- state ---------- */
  var state = { craft: null, part: null, three: null, ctx: null };
  var qs = new URLSearchParams(location.search);

  /* ---------- UI: craft picker ---------- */
  function buildPicker() {
    var sel = $("ins-craft"), html = "";
    ["moon", "mars", "deepspace"].forEach(function (w) {
      var opts = Object.keys(D.CRAFT).filter(function (id) { var m = mission(id); return m && m.location === w; });
      if (!opts.length) return;
      html += '<optgroup label="' + WORLDS[w] + '">' + opts.map(function (id) { var m = mission(id); return '<option value="' + id + '">' + esc(m.name) + "</option>"; }).join("") + "</optgroup>";
    });
    sel.innerHTML = html;
    sel.addEventListener("change", function () { openCraft(sel.value, true); });
  }

  function renderPanel() {
    var id = state.craft, fam = D.FAMILIES[D.CRAFT[id]], m = mission(id), c = counts(id);
    $("ins-title").textContent = m ? m.name : id;
    $("ins-sub").textContent = (m ? m.subtitle + " · " : "") + fam.label;
    $("ins-note").textContent = fam.note || "";
    $("ins-progress").textContent = c.got + " of " + c.total + " details discovered";
    $("ins-bar").style.width = Math.round(100 * c.got / c.total) + "%";
    var list = fam.parts.map(function (p) {
      var f = found(id, p.id), hide = p.hidden && !f;
      if (hide) return '<li><button type="button" class="ins-part ins-mystery" data-part="" disabled aria-label="Hidden detail, not found yet">? Hidden detail: look closely at the craft</button></li>';
      return '<li><button type="button" class="ins-part' + (state.part === p.id ? " on" : "") + '" data-part="' + p.id + '" aria-pressed="' + (state.part === p.id) + '"><span class="ins-dot' + (f ? " got" : "") + '" aria-hidden="true"></span>' + esc(p.name) + "</button></li>";
    }).join("");
    $("ins-parts").innerHTML = list;
    Array.prototype.forEach.call($("ins-parts").querySelectorAll("button[data-part]"), function (b) {
      if (b.dataset.part) b.addEventListener("click", function () { selectPart(b.dataset.part, true); });
    });
    /* what remains: read from the archive record, not rewritten here */
    var rec = $("ins-record");
    if (m) {
      rec.innerHTML = '<h3>What happened to it?</h3><p>' + esc(m.whereNow || m.whyStopped || "") + '</p><p class="ins-links"><a href="mission.html?id=' + m.id + '">Full mission record</a> · <a href="map.html' + (m.id === "apollo-lm" ? "?obj=apollo11-lm-descent" : "") + '">Hardware Map</a> · <a href="explore.html?id=' + m.id + '">Explore scene</a></p>';
    } else rec.innerHTML = "";
    renderJournal();
  }

  function showPart(p) {
    var box = $("ins-card");
    if (!p) { box.innerHTML = '<p class="ins-hint">Select a component, in 3D or from the list, to learn what it did.</p>'; return; }
    box.innerHTML = '<h3>' + esc(p.name) + '</h3><p>' + esc(p.text) + "</p>";
    box.classList.remove("pulse"); void box.offsetWidth; box.classList.add("pulse");
  }

  function renderJournal() {
    var rows = Object.keys(D.CRAFT).map(function (id) {
      var c = counts(id), m = mission(id), done = c.got === c.total;
      return '<li><button type="button" data-craft="' + id + '"><span>' + esc(m ? m.name : id) + '</span><span class="' + (done ? "ins-done" : "") + '">' + c.got + "/" + c.total + (done ? " complete" : "") + "</span></button></li>";
    }).join("");
    $("ins-journal-list").innerHTML = rows;
    Array.prototype.forEach.call($("ins-journal-list").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { $("ins-journal").hidden = true; $("ins-craft").value = b.dataset.craft; openCraft(b.dataset.craft, true); });
    });
    var tot = 0, got = 0; Object.keys(D.CRAFT).forEach(function (id) { var c = counts(id); tot += c.total; got += c.got; });
    $("ins-journal-total").textContent = got + " of " + tot + " details found across all craft";
  }

  function toast(msg) {
    var t = $("ins-toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("on"); }, 2800);
  }

  function selectPart(partId, fly) {
    var fam = D.FAMILIES[D.CRAFT[state.craft]], p = null;
    fam.parts.forEach(function (x) { if (x.id === partId) p = x; });
    if (!p) return;
    state.part = partId;
    var isNew = markFound(state.craft, partId);
    showPart(p);
    if (isNew) toast((p.hidden ? "Hidden detail discovered: " : "Added to journal: ") + p.name);
    renderPanel(); showPart(p);
    if (state.ctx) state.ctx.focusPart(partId, fly);
  }

  function openCraft(id, fromUser) {
    if (!D.CRAFT[id]) id = "spirit";
    state.craft = id; state.part = null;
    var url = new URL(location.href); url.searchParams.set("craft", id); try { history.replaceState(null, "", url); } catch (e) {}
    $("ins-craft").value = id;
    renderPanel(); showPart(null);
    if (state.ctx) state.ctx.load(D.CRAFT[id], mission(id) ? mission(id).location : "moon");
  }

  /* ---------- 3D ---------- */
  function webglOK() { try { var c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } }
  function loadThree() {
    var urls = [new URL("js/vendor/three.module.min.js", document.baseURI).href, CDN], i = 0;
    return (function next(err) { if (i >= urls.length) return Promise.reject(err || new Error("Three.js unavailable")); return import(urls[i++]).catch(next); })();
  }
  function fallback(msg) {
    $("ins-stage").classList.add("nogl"); $("ins-loading").hidden = true;
    var f = $("ins-fallback"); f.hidden = false; f.querySelector("p").textContent = msg;
  }

  function start3D(THREE) {
    var stage = $("ins-stage"), canvas = $("ins-canvas"), renderer;
    var qkey = "abnf-quality", qual = "balanced";
    try { qual = localStorage.getItem(qkey) || (Math.min(screen.width, innerWidth) < 700 ? "performance" : "balanced"); } catch (e) {}
    var QS = { high: { dpr: 2, shadow: 2048 }, balanced: { dpr: 1.5, shadow: 1024 }, performance: { dpr: 1, shadow: 0 } };
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: qual !== "performance", powerPreference: "high-performance" }); }
    catch (e) { fallback("The 3D view could not start on this device. All component text is still available on the right."); return; }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, 1, 0.1, 2000);
    var sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(8, 12, 6); sun.castShadow = true; scene.add(sun);
    var fill = new THREE.HemisphereLight(0x8aa0d0, 0x201510, 0.5); scene.add(fill);
    var disposables = [], craftRoot = null, groundMesh = null, stars = null, dead = false, raf = 0;

    function applyQuality(q) {
      qual = q; var o = QS[q] || QS.balanced;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, o.dpr));
      renderer.shadowMap.enabled = o.shadow > 0; sun.castShadow = o.shadow > 0;
      if (o.shadow) { sun.shadow.mapSize.set(o.shadow, o.shadow); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
      try { localStorage.setItem(qkey, q); } catch (e) {}
      if (craftRoot) craftRoot.traverse(function (n) { if (n.material) n.material.needsUpdate = true; });
      resize();
      Array.prototype.forEach.call(document.querySelectorAll("[data-q]"), function (b) { b.setAttribute("aria-pressed", b.dataset.q === q ? "true" : "false"); });
    }

    function disposeTree(o) {
      o.traverse(function (n) { if (n.geometry) n.geometry.dispose(); if (n.material) { (Array.isArray(n.material) ? n.material : [n.material]).forEach(function (m) { m.dispose(); }); } });
    }

    /* world dressing: each world has its own light, ground and sky */
    var WORLD = {
      moon: { bg: 0x000000, ground: 0x8d8c88, sun: 0xfff6e8, si: 3.2, fill: 0.12, fog: 0, stars: true, sunPos: [10, 5, 7] },
      mars: { bg: 0x2a1610, ground: 0x9a5430, sun: 0xffd7b0, si: 2.3, fill: 0.55, fog: 0.018, stars: false, sunPos: [8, 9, 6], haze: 0xb4623a },
      deepspace: { bg: 0x010208, ground: null, sun: 0xfff0dd, si: 2.6, fill: 0.2, fog: 0, stars: true, sunPos: [10, 6, 8] }
    };
    function makeStars() {
      var n = 1600, pos = new Float32Array(n * 3);
      for (var i = 0; i < n; i++) { var u = Math.random() * 2 - 1, a = Math.random() * 6.2832, r = 600 + Math.random() * 300, s = Math.sqrt(1 - u * u); pos[i * 3] = r * s * Math.cos(a); pos[i * 3 + 1] = r * u; pos[i * 3 + 2] = r * s * Math.sin(a); }
      var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      var p = new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, color: 0xffffff, depthWrite: false, fog: false }));
      return p;
    }
    function groundTexture(base) {
      var c = document.createElement("canvas"); c.width = c.height = 256; var g = c.getContext("2d");
      g.fillStyle = "#" + ("000000" + base.toString(16)).slice(-6); g.fillRect(0, 0, 256, 256);
      for (var i = 0; i < 1400; i++) { var v = Math.random(); g.fillStyle = v > 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.09)"; g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 0.6 + Math.random() * 2.2, 0, 6.28); g.fill(); }
      var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(16, 16); t.colorSpace = THREE.SRGBColorSpace; return t;
    }

    var cs = { th: 0.7, ph: 1.2, d: 14, tx: 0, ty: 1, tz: 0, gth: 0.7, gph: 1.2, gd: 14, gtx: 0, gty: 1, gtz: 0, minD: 2, maxD: 40, focus: 0, focusTo: 0, auto: !reduce, idle: 0 };
    var curWorld = "moon", curGround = null, partsMap = {}, hover = null, selected = null, ray = new THREE.Raycaster(), ptr = new THREE.Vector2();

    function load(family, world) {
      $("ins-loading").hidden = false;
      if (craftRoot) { scene.remove(craftRoot); disposeTree(craftRoot); craftRoot = null; }
      if (groundMesh) { scene.remove(groundMesh); groundMesh.geometry.dispose(); groundMesh.material.map && groundMesh.material.map.dispose(); groundMesh.material.dispose(); groundMesh = null; }
      if (stars) { scene.remove(stars); stars.geometry.dispose(); stars.material.dispose(); stars = null; }
      var W = WORLD[world] || WORLD.moon; curWorld = world;
      scene.background = new THREE.Color(W.bg); scene.fog = W.fog ? new THREE.FogExp2(W.haze, W.fog) : null;
      sun.color.setHex(W.sun); sun.intensity = W.si; sun.position.set(W.sunPos[0], W.sunPos[1], W.sunPos[2]); fill.intensity = W.fill;
      if (W.stars) { stars = makeStars(); scene.add(stars); }
      var built;
      try { built = MODELS.build(THREE, family); } catch (e) { console.error(e); fallback("This model could not be built. The component text is still available."); return; }
      craftRoot = built.root; partsMap = built.parts; scene.add(craftRoot);
      var box = new THREE.Box3().setFromObject(craftRoot), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
      var R = Math.max(size.x, size.y, size.z) * 0.5;
      if (W.ground) {
        var gt = groundTexture(W.ground);
        groundMesh = new THREE.Mesh(new THREE.CircleGeometry(60, 48), new THREE.MeshStandardMaterial({ color: 0xffffff, map: gt, roughness: 1, metalness: 0, transparent: true }));
        groundMesh.rotation.x = -Math.PI / 2; groundMesh.position.y = box.min.y - 0.01; groundMesh.receiveShadow = true; scene.add(groundMesh);
        if (W.fog) scene.fog.color.setHex(W.haze);
      } else { craftRoot.position.y = -ctr.y; }
      var cy = W.ground ? ctr.y : 0;
      cs.maxD = R * 7; cs.minD = R * 0.6; cs.gtx = ctr.x; cs.gty = cy; cs.gtz = ctr.z; cs.gd = R * 3.2; cs.gth = 0.75; cs.gph = 1.25; cs.focusTo = 0; curGround = groundMesh;
      cs.tx = cs.gtx; cs.ty = cs.gty; cs.tz = cs.gtz; cs.th = cs.gth - (reduce ? 0 : 1.2); cs.ph = cs.gph; cs.d = reduce ? cs.gd : cs.gd * 1.9; cs.home = { d: cs.gd, x: ctr.x, y: cy, z: ctr.z };
      var sh = R * 2.2; sun.shadow.camera.left = -sh; sun.shadow.camera.right = sh; sun.shadow.camera.top = sh; sun.shadow.camera.bottom = -sh; sun.shadow.camera.far = R * 20; sun.shadow.camera.updateProjectionMatrix();
      selected = null; setTimeout(function () { $("ins-loading").hidden = true; }, 120);
      $("ins-stage").classList.remove("nogl"); $("ins-fallback").hidden = true;
    }

    /* highlight: emissive pulse on every mesh of a part */
    function setEmissive(part, hex, k) {
      var g = partsMap[part]; if (!g) return;
      g.traverse(function (n) { if (n.isMesh && n.material && n.material.emissive) { n.material.emissive.setHex(hex); n.material.emissiveIntensity = k; } });
    }
    function focusPart(partId, fly) {
      if (selected && selected !== partId) setEmissive(selected, 0x000000, 0);
      selected = partId; setEmissive(partId, 0xe8925a, 0.55);
      var g = partsMap[partId]; if (!g) return;
      var b = new THREE.Box3().setFromObject(g), c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
      cs.anchor = c; cs.auto = false;
      if (fly) { cs.gtx = c.x; cs.gty = c.y; cs.gtz = c.z; cs.gd = Math.max(cs.minD * 1.4, Math.max(s.x, s.y, s.z) * 2.6); cs.focusTo = 1; }
      $("ins-back").hidden = false;
    }
    function backToCraft() {
      if (selected) setEmissive(selected, 0x000000, 0);
      selected = null; state.part = null; cs.anchor = null; cs.focusTo = 0;
      cs.gtx = cs.home.x; cs.gty = cs.home.y; cs.gtz = cs.home.z; cs.gd = cs.home.d;
      $("ins-back").hidden = true; $("ins-callout").hidden = true; showPart(null); renderPanel();
    }
    $("ins-back").addEventListener("click", backToCraft);

    /* sizing */
    function resize() {
      var w = stage.clientWidth || 800, h = stage.clientHeight || 500;
      renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    addEventListener("resize", resize);

    /* orbit input */
    var drag = null, pts = {}, pinch0 = 0, moved = 0;
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    canvas.addEventListener("pointerdown", function (e) {
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      pts[e.pointerId] = { x: e.clientX, y: e.clientY }; moved = 0; cs.auto = false;
      var ids = Object.keys(pts); if (ids.length === 2) { pinch0 = Math.hypot(pts[ids[0]].x - pts[ids[1]].x, pts[ids[0]].y - pts[ids[1]].y); }
      drag = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener("pointermove", function (e) {
      var ids = Object.keys(pts);
      if (pts[e.pointerId]) {
        if (ids.length === 2) {
          pts[e.pointerId] = { x: e.clientX, y: e.clientY };
          var d = Math.hypot(pts[ids[0]].x - pts[ids[1]].x, pts[ids[0]].y - pts[ids[1]].y);
          if (pinch0) cs.gd = clamp(cs.gd * (pinch0 / d), cs.minD, cs.maxD); pinch0 = d; moved = 9; return;
        }
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY }; moved += Math.abs(dx) + Math.abs(dy);
        cs.gth -= dx * 0.008; cs.gph = clamp(cs.gph - dy * 0.008, 0.15, 1.52);
      } else hoverAt(e);
    });
    function endPtr(e) { delete pts[e.pointerId]; if (!Object.keys(pts).length) { if (moved < 6 && e.type === "pointerup") pickAt(e); drag = null; } pinch0 = 0; }
    canvas.addEventListener("pointerup", endPtr); canvas.addEventListener("pointercancel", endPtr);
    canvas.addEventListener("wheel", function (e) { e.preventDefault(); cs.auto = false; cs.gd = clamp(cs.gd * (1 + e.deltaY * 0.0012), cs.minD, cs.maxD); }, { passive: false });
    canvas.addEventListener("keydown", function (e) {
      var k = e.key, h = true; cs.auto = false;
      if (k === "ArrowLeft") cs.gth -= 0.12; else if (k === "ArrowRight") cs.gth += 0.12; else if (k === "ArrowUp") cs.gph = clamp(cs.gph - 0.1, 0.15, 1.52); else if (k === "ArrowDown") cs.gph = clamp(cs.gph + 0.1, 0.15, 1.52);
      else if (k === "+" || k === "=") cs.gd = clamp(cs.gd * 0.88, cs.minD, cs.maxD); else if (k === "-") cs.gd = clamp(cs.gd * 1.14, cs.minD, cs.maxD); else if (k === "Escape") backToCraft(); else h = false;
      if (h) e.preventDefault();
    });

    function rayParts(e) {
      var r = canvas.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, cam); if (!craftRoot) return null;
      var hit = ray.intersectObject(craftRoot, true)[0]; return hit && hit.object.userData.part ? hit.object.userData.part : null;
    }
    function hoverAt(e) {
      var p = rayParts(e); if (p === hover) return;
      if (hover && hover !== selected) setEmissive(hover, 0x000000, 0);
      hover = p; if (p && p !== selected) setEmissive(p, 0x3f7ce0, 0.35);
      canvas.style.cursor = p ? "pointer" : "grab";
    }
    function pickAt(e) { var p = rayParts(e); if (p) selectPart(p, true); }

    /* callout: projects the selected part to the screen */
    function updateCallout() {
      var el = $("ins-callout");
      if (!cs.anchor || !state.part) { el.hidden = true; return; }
      var v = cs.anchor.clone().project(cam);
      if (v.z > 1) { el.hidden = true; return; }
      var w = stage.clientWidth, h = stage.clientHeight, x = (v.x * 0.5 + 0.5) * w, y = (-v.y * 0.5 + 0.5) * h;
      var fam = D.FAMILIES[D.CRAFT[state.craft]], name = ""; fam.parts.forEach(function (p) { if (p.id === state.part) name = p.name; });
      el.hidden = false; el.style.transform = "translate(" + Math.round(x) + "px," + Math.round(y) + "px)";
      var lab = el.querySelector("span"); if (lab.textContent !== name) lab.textContent = name;
      el.classList.toggle("flip", x > w * 0.62);
    }

    var last = performance.now(), visible = true;
    document.addEventListener("visibilitychange", function () { visible = !document.hidden; });
    function frame(now) {
      raf = requestAnimationFrame(frame); if (!visible || dead) return;
      var dt = Math.min((now - last) / 1000, 0.05); last = now;
      var k = reduce ? 1 : Math.min(1, dt * 5);
      if (cs.auto && !reduce) cs.gth += dt * 0.15;
      cs.th += (cs.gth - cs.th) * k; cs.ph += (cs.gph - cs.ph) * k; cs.d += (cs.gd - cs.d) * k;
      cs.tx += (cs.gtx - cs.tx) * k; cs.ty += (cs.gty - cs.ty) * k; cs.tz += (cs.gtz - cs.tz) * k;
      cs.focus += (cs.focusTo - cs.focus) * k;
      cam.position.set(cs.tx + cs.d * Math.sin(cs.ph) * Math.sin(cs.th), cs.ty + cs.d * Math.cos(cs.ph), cs.tz + cs.d * Math.sin(cs.ph) * Math.cos(cs.th));
      cam.lookAt(cs.tx, cs.ty, cs.tz);
      /* focus mode: surroundings fade so the craft is the subject */
      if (curGround) { curGround.material.opacity = 1 - 0.75 * cs.focus; }
      if (stars) stars.material.opacity = 1;
      if (scene.fog) scene.fog.density = (WORLD[curWorld].fog || 0) * (1 + 3 * cs.focus);
      if (selected && !reduce) { var pulse = 0.45 + 0.2 * Math.sin(now / 280); setEmissive(selected, 0xe8925a, pulse); }
      updateCallout();
      renderer.render(scene, cam);
    }

    canvas.addEventListener("webglcontextlost", function (ev) { ev.preventDefault(); dead = true; cancelAnimationFrame(raf); fallback("The 3D view stopped (graphics context lost). Reload the page to restart it. Component text still works."); });
    addEventListener("pagehide", function () { dead = true; cancelAnimationFrame(raf); if (craftRoot) disposeTree(craftRoot); renderer.dispose(); });

    Array.prototype.forEach.call(document.querySelectorAll("[data-q]"), function (b) { b.addEventListener("click", function () { applyQuality(b.dataset.q); }); });
    $("ins-spin").addEventListener("click", function () { cs.auto = !cs.auto; $("ins-spin").setAttribute("aria-pressed", String(cs.auto)); });
    $("ins-reset").addEventListener("click", function () { backToCraft(); cs.gth = 0.75; cs.gph = 1.25; });

    state.ctx = { load: load, focusPart: focusPart };
    applyQuality(qual); resize(); requestAnimationFrame(frame);
    openCraft(state.craft, false);
  }

  /* ---------- boot ---------- */
  function init() {
    buildPicker();
    var want = qs.get("craft") || qs.get("id") || "spirit"; state.craft = D.CRAFT[want] ? want : "spirit";
    $("ins-craft").value = state.craft;
    renderPanel(); showPart(null);
    $("ins-journal-btn").addEventListener("click", function () { var j = $("ins-journal"); j.hidden = !j.hidden; });
    $("ins-journal-close").addEventListener("click", function () { $("ins-journal").hidden = true; });
    $("ins-journal-reset").addEventListener("click", function () { if (confirm("Clear your discovery journal on this device?")) { journal = {}; saveJournal(); renderPanel(); } });
    if (!webglOK()) { fallback("WebGL is not available in this browser, so the 3D view cannot start. You can still read about every component on the right."); return; }
    loadThree().then(function (THREE) {
      try { start3D(THREE); } catch (e) { console.error("Inspector 3D error:", e); fallback("The 3D view hit an error and was stopped. Component text still works. Try reloading, or choose Performance quality."); }
    }, function () { fallback("Three.js could not be loaded (are you offline?). Component text still works. For offline use, save Three.js as js/vendor/three.module.min.js."); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
