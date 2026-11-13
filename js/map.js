/* ============================================================
   Hardware Map: Moon and Mars, no mapping library.
   - Records: OBJECTS_GEOJSON (built from data/objects.geojson).
   - Basemap: NASA Solar System Treks equirectangular tiles, drawn on a
     canvas when the network allows; otherwise a built-in schematic grid.
   - Pan: drag / arrow keys. Zoom: wheel, pinch, buttons, + / - keys.
   Why not MapLibre/PMTiles: see README ("Map architecture").
   ============================================================ */
(function () {
  "use strict";
  var T = function (k, v) { return I18N.t(k, v); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.getElementById("map");
  if (!root) return;
  var panelBody = document.getElementById("panel-body");
  var DATA = (window.OBJECTS_GEOJSON && window.OBJECTS_GEOJSON.features) || [];
  if (!DATA.length) { panelBody.innerHTML = '<p class="panel-empty">' + T("state.loadError") + "</p>"; return; }

  var OBJS = DATA.map(function (f) {
    var o = Object.assign({}, f.properties); o.lon = f.geometry.coordinates[0]; o.lat = f.geometry.coordinates[1]; return o;
  });
  var byId = {}; OBJS.forEach(function (o) { byId[o.id] = o; });

  /* ---- basemaps (network-dependent; schematic always available) ---- */
  var BASE = {
    moon: { folder: "Moon", layer: "LRO_WAC_Mosaic_Global_303ppd_v02", maxZ: 8, bg: "#171b26", line: "rgba(160,175,210,.22)", credit: "map.basemap.credit.moon" },
    mars: { folder: "Mars", layer: "Mars_Viking_MDIM21_ClrMosaic_global_232m", maxZ: 7, bg: "#27140e", line: "rgba(232,146,90,.25)", credit: "map.basemap.credit.mars" }
  };
  function tileUrl(b, z, r, c) {
    return "https://trek.nasa.gov/tiles/" + b.folder + "/EQ/" + b.layer + "/1.0.0/default/default028mm/" + z + "/" + r + "/" + c + ".jpg";
  }

  var S = { body: "moon", basis: "landed", from: 1966, to: 2022, sel: null, z: 1, cx: 0, cy: 0, vw: 800, vh: 480 };
  var tiles = {}, tileState = { moon: { ok: 0, fail: 0, off: false }, mars: { ok: 0, fail: 0, off: false } };
  var inflight = 0, MAXFLIGHT = 8, queue = [];

  var statusEl = document.getElementById("map-status");
  var canvas = document.getElementById("map-canvas"), ctx = canvas.getContext("2d");
  var layer = document.getElementById("map-markers");
  var markerEl = {};

  /* ---- projection (equirectangular, 512 px wide world at z = 0) ---- */
  function W() { return 512 * Math.pow(2, S.z); }
  function wx(lon) { return (lon + 180) / 360 * W(); }
  function wy(lat) { return (90 - lat) / 180 * (W() / 2); }
  function sx(lon) { return S.vw / 2 + wx(lon) - wx(S.cx); }
  function sy(lat) { return S.vh / 2 + wy(lat) - wy(S.cy); }
  function minZ() { return Math.log(Math.max(S.vw / 512, S.vh / 256)) / Math.LN2; }
  function maxZ() { return BASE[S.body].maxZ + 2; }
  function clampView() {
    S.z = Math.max(minZ(), Math.min(maxZ(), S.z));
    var w = W(), h = w / 2;
    var halfLon = (S.vw / 2) / w * 360, halfLat = (S.vh / 2) / h * 180;
    S.cx = halfLon >= 180 ? 0 : Math.max(-180 + halfLon, Math.min(180 - halfLon, S.cx));
    S.cy = halfLat >= 90 ? 0 : Math.max(-90 + halfLat, Math.min(90 - halfLat, S.cy));
  }

  /* ---- sizing ---- */
  function resize() {
    var r = root.getBoundingClientRect();
    S.vw = Math.max(260, Math.round(r.width)); S.vh = Math.max(260, Math.round(r.height));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = S.vw * dpr; canvas.height = S.vh * dpr;
    canvas.style.width = S.vw + "px"; canvas.style.height = S.vh + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    clampView(); render();
  }

  /* ---- tiles ---- */
  function getTile(b, z, c, r) {
    var key = S.body + "/" + z + "/" + c + "/" + r;
    var t = tiles[key];
    if (t) return t;
    t = tiles[key] = { img: null, ready: false, failed: false };
    if (tileState[S.body].off) { t.failed = true; return t; }
    var body = S.body;
    queue.push(function () {
      var img = new Image(); inflight++;
      img.onload = function () { inflight--; t.img = img; t.ready = true; tileState[body].ok++; setBasemapStatus(); pump(); schedule(); };
      img.onerror = function () {
        inflight--; t.failed = true; tileState[body].fail++;
        if (tileState[body].ok === 0 && tileState[body].fail >= 4) tileState[body].off = true;
        setBasemapStatus(); pump(); schedule();
      };
      img.src = tileUrl(b, z, r, c);
    });
    pump();
    return t;
  }
  function pump() { while (inflight < MAXFLIGHT && queue.length) queue.pop()(); }

  function drawTile(b, z, c, r, dx, dy, size) {
    var t = getTile(b, z, c, r);
    if (t.ready) { ctx.drawImage(t.img, dx, dy, size + 0.5, size + 0.5); return; }
    for (var k = 1; k <= 3 && z - k >= 0; k++) {
      var p = tiles[S.body + "/" + (z - k) + "/" + (c >> k) + "/" + (r >> k)];
      if (p && p.ready) {
        var n = 1 << k, sub = 256 / n;
        ctx.drawImage(p.img, (c % n) * sub, (r % n) * sub, sub, sub, dx, dy, size + 0.5, size + 0.5);
        return;
      }
    }
  }

  /* ---- drawing ---- */
  var raf = 0;
  function schedule() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; render(); }); }
  function render() {
    var b = BASE[S.body];
    ctx.fillStyle = b.bg; ctx.fillRect(0, 0, S.vw, S.vh);
    drawGraticule(b);
    if (!tileState[S.body].off) {
      var tz = Math.max(0, Math.min(b.maxZ, Math.round(S.z)));
      var size = 256 * Math.pow(2, S.z - tz), cols = Math.pow(2, tz + 1), rows = Math.pow(2, tz);
      var left = S.cx - (S.vw / 2) / W() * 360, right = S.cx + (S.vw / 2) / W() * 360;
      var top = S.cy + (S.vh / 2) / (W() / 2) * 180, bot = S.cy - (S.vh / 2) / (W() / 2) * 180;
      var c0 = Math.max(0, Math.floor((left + 180) / 360 * cols)), c1 = Math.min(cols - 1, Math.floor((right + 180) / 360 * cols));
      var r0 = Math.max(0, Math.floor((90 - top) / 180 * rows)), r1 = Math.min(rows - 1, Math.floor((90 - bot) / 180 * rows));
      if ((c1 - c0 + 1) * (r1 - r0 + 1) <= 120) {
        for (var r = r0; r <= r1; r++) for (var c = c0; c <= c1; c++) {
          var lon = -180 + c / cols * 360, lat = 90 - r / rows * 180;
          drawTile(b, tz, c, r, sx(lon), sy(lat), size);
        }
      }
    }
    placeMarkers();
  }
  function drawGraticule(b) {
    var step = S.z < 2 ? 30 : S.z < 4 ? 10 : S.z < 6 ? 5 : 1;
    ctx.lineWidth = 1; ctx.strokeStyle = b.line; ctx.fillStyle = "rgba(200,210,235,.55)"; ctx.font = "11px Inter, sans-serif";
    var lonLo = Math.max(-180, Math.floor((S.cx - S.vw / W() * 180) / step) * step), lonHi = Math.min(180, S.cx + S.vw / W() * 180);
    for (var lo = lonLo; lo <= lonHi; lo += step) {
      var x = Math.round(sx(lo)) + 0.5; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, S.vh); ctx.stroke();
      if (step >= 5 || S.z >= 6) ctx.fillText(Math.abs(lo) + "\u00B0" + (lo < 0 ? "W" : lo > 0 ? "E" : ""), x + 3, S.vh - 6);
    }
    var latLo = Math.max(-90, Math.floor((S.cy - S.vh / W() * 180) / step) * step), latHi = Math.min(90, S.cy + S.vh / W() * 180);
    for (var la = latLo; la <= latHi; la += step) {
      var y = Math.round(sy(la)) + 0.5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(S.vw, y);
      ctx.strokeStyle = la === 0 ? "rgba(232,146,90,.5)" : b.line; ctx.stroke();
      if (step >= 5 || S.z >= 6) ctx.fillText(Math.abs(la) + "\u00B0" + (la < 0 ? "S" : la > 0 ? "N" : ""), 5, y - 3);
    }
  }

  /* ---- markers (real buttons: keyboard and screen-reader friendly) ---- */
  function buildMarkers() {
    layer.innerHTML = ""; markerEl = {};
    OBJS.forEach(function (o) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "mk mk-" + o.body; b.setAttribute("data-id", o.id);
      b.setAttribute("aria-label", o.name + ", " + o.mission);
      b.title = o.name;
      b.innerHTML = '<span class="mk-dot" aria-hidden="true"></span>';
      b.addEventListener("click", function () {
        var near = OBJS.filter(function (p) {
          return visible(p) && Math.abs(sx(p.lon) - sx(o.lon)) < 18 && Math.abs(sy(p.lat) - sy(o.lat)) < 18;
        });
        var need = S.body === "moon" ? 6.0 : 3.4;
        if (near.length > 1 && S.z < need) {      // stacked pins: zoom in first, then choose
          var cx = near.reduce(function (a, p) { return a + p.lon; }, 0) / near.length, cy = near.reduce(function (a, p) { return a + p.lat; }, 0) / near.length;
          flyTo(cx, cy, need + 0.4);
          document.getElementById("map-crowd").textContent = T("map.crowdZoom", { n: near.length });
          return;
        }
        select(o.id, { focusMap: true, fromMarker: true });
      });
      layer.appendChild(b); markerEl[o.id] = b;
    });
  }
  function eventOf(o, basis) {
    if (basis === "landed") return { date: o.landed, kind: "landed" };
    if (o.left_behind) return { date: o.left_behind, kind: "left_behind" };
    return { date: o.last_contact, kind: "last_contact" };
  }
  function yearOf(d) { return d ? parseInt(d.slice(0, 4), 10) : null; }
  function visible(o) {
    if (o.body !== S.body) return false;
    var y = yearOf(eventOf(o, S.basis).date);
    if (y === null) return S.from === 1966 && S.to === 2022;   // unknown date: only in the full range
    return y >= S.from && y <= S.to;
  }
  function placeMarkers() {
    var shown = [];
    OBJS.forEach(function (o) {
      var el = markerEl[o.id], v = visible(o);
      el.hidden = !v; if (!v) return;
      var x = sx(o.lon), y = sy(o.lat);
      el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      el.classList.toggle("sel", o.id === S.sel);
      el.setAttribute("aria-pressed", o.id === S.sel ? "true" : "false");
      el.style.zIndex = o.id === S.sel ? 3 : 2;
      shown.push({ x: x, y: y });
    });
    var crowd = false;
    for (var i = 0; i < shown.length && !crowd; i++) for (var j = i + 1; j < shown.length; j++) {
      if (Math.abs(shown[i].x - shown[j].x) < 14 && Math.abs(shown[i].y - shown[j].y) < 14) { crowd = true; break; }
    }
    root.classList.toggle("is-crowded", crowd);
  }

  /* ---- view animation ---- */
  var anim = 0;
  function flyTo(cx, cy, z) {
    cancelAnimationFrame(anim);
    var a = { cx: S.cx, cy: S.cy, z: S.z };
    var save = { z: S.z };
    S.z = z; clampView(); var tz = S.z, tcx, tcy; S.z = save.z;
    var s2 = S.z; S.cx = cx; S.cy = cy; S.z = tz; clampView(); tcx = S.cx; tcy = S.cy; tz = S.z;
    S.cx = a.cx; S.cy = a.cy; S.z = s2;
    if (reduceMotion) { S.cx = tcx; S.cy = tcy; S.z = tz; render(); return; }
    var t0 = performance.now(), D = 550;
    (function step(now) {
      var k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
      S.cx = a.cx + (tcx - a.cx) * e; S.cy = a.cy + (tcy - a.cy) * e; S.z = a.z + (tz - a.z) * e;
      render(); if (k < 1) anim = requestAnimationFrame(step);
    })(t0);
  }
  function homeView() {
    var vis = OBJS.filter(function (o) { return o.body === S.body; });
    var lons = vis.map(function (o) { return o.lon; }), lats = vis.map(function (o) { return o.lat; });
    var minLon = Math.min.apply(null, lons), maxLon = Math.max.apply(null, lons), minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
    var spanLon = Math.max(20, (maxLon - minLon) * 1.35), spanLat = Math.max(20, (maxLat - minLat) * 1.5);
    var z = Math.log(Math.min(S.vw / spanLon * 360 / 512, S.vh / spanLat * 180 / 256)) / Math.LN2;
    return { cx: (minLon + maxLon) / 2, cy: (minLat + maxLat) / 2, z: z };
  }
  function resetView(animate) {
    var h = homeView();
    if (animate) flyTo(h.cx, h.cy, h.z); else { S.cx = h.cx; S.cy = h.cy; S.z = h.z; clampView(); render(); }
  }
  function focusOn(o) { flyTo(o.lon, o.lat, Math.max(S.z, S.body === "moon" ? 6.6 : 3.4)); }

  /* ---- pointer / wheel / keyboard ---- */
  var ptrs = {}, last = null, pinch0 = null, moved = false;
  function zoomAt(px, py, dz) {
    var lon = S.cx + (px - S.vw / 2) / W() * 360, lat = S.cy - (py - S.vh / 2) / (W() / 2) * 180;
    S.z += dz; clampView();
    S.cx = lon - (px - S.vw / 2) / W() * 360; S.cy = lat + (py - S.vh / 2) / (W() / 2) * 180; clampView(); schedule();
  }
  function panBy(dx, dy) { S.cx -= dx / W() * 360; S.cy += dy / (W() / 2) * 180; clampView(); schedule(); }
  root.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".mk, .map-zoom")) return;
    root.setPointerCapture(e.pointerId); ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; moved = false; cancelAnimationFrame(anim);
    var ids = Object.keys(ptrs);
    if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), z: S.z }; }
    root.classList.add("drag");
  });
  root.addEventListener("pointermove", function (e) {
    var p = ptrs[e.pointerId]; if (!p) return;
    var ids = Object.keys(ptrs);
    if (ids.length === 2 && pinch0) {
      p.x = e.clientX; p.y = e.clientY;
      var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), r = root.getBoundingClientRect();
      var target = pinch0.z + Math.log(d / pinch0.d) / Math.LN2;
      zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, target - S.z);
    } else {
      panBy(e.clientX - p.x, e.clientY - p.y); p.x = e.clientX; p.y = e.clientY;
    }
    moved = true;
  });
  function endPtr(e) { delete ptrs[e.pointerId]; pinch0 = null; if (!Object.keys(ptrs).length) root.classList.remove("drag"); }
  root.addEventListener("pointerup", endPtr); root.addEventListener("pointercancel", endPtr);
  root.addEventListener("wheel", function (e) {
    e.preventDefault(); var r = root.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, -e.deltaY * 0.0022);
  }, { passive: false });
  root.addEventListener("keydown", function (e) {
    if (e.target !== root) return;
    var k = e.key, step = 80, hit = true;
    if (k === "ArrowLeft") panBy(step, 0); else if (k === "ArrowRight") panBy(-step, 0);
    else if (k === "ArrowUp") panBy(0, step); else if (k === "ArrowDown") panBy(0, -step);
    else if (k === "+" || k === "=") zoomAt(S.vw / 2, S.vh / 2, 0.6); else if (k === "-" || k === "_") zoomAt(S.vw / 2, S.vh / 2, -0.6);
    else if (k === "Home") resetView(true); else hit = false;
    if (hit) e.preventDefault();
  });
  document.getElementById("z-in").addEventListener("click", function () { zoomAt(S.vw / 2, S.vh / 2, 0.8); });
  document.getElementById("z-out").addEventListener("click", function () { zoomAt(S.vw / 2, S.vh / 2, -0.8); });
  document.getElementById("z-reset").addEventListener("click", function () { resetView(true); });
  var fitBtn = document.getElementById("z-fit");
  fitBtn.addEventListener("click", function () { if (S.sel) focusOn(byId[S.sel]); });

  /* ---- status text ---- */
  var creditEl = document.getElementById("map-credit");
  function setBasemapStatus() {
    var st = tileState[S.body], msg;
    if (st.off) msg = T("map.basemap.failed");
    else if (st.ok === 0) msg = T("map.basemap.loading");
    else msg = T("map.basemap.nasa");
    statusEl.textContent = msg;
    creditEl.textContent = st.ok > 0 ? T(BASE[S.body].credit) : T("map.basemap.schematic");
    root.setAttribute("data-basemap", st.off ? "schematic" : st.ok > 0 ? "nasa" : "loading");
  }

  /* ---- formatting ---- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmtDate(d) {
    if (!d) return null;
    var p = d.split("-"), dt = new Date(Date.UTC(+p[0], +p[1] - 1, +(p[2] || 1)));
    try {
      return new Intl.DateTimeFormat("en-GB", p.length === 3 ? { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" } : { month: "long", year: "numeric", timeZone: "UTC" }).format(dt);
    } catch (e) { return d; }
  }
  function fmtCoord(o) {
    return Math.abs(o.lat).toFixed(4) + "\u00B0" + (o.lat < 0 ? "S" : "N") + ", " + Math.abs(o.lon).toFixed(4) + "\u00B0" + (o.lon < 0 ? "W" : "E");
  }

  /* ---- timeline controls ---- */
  var fromEl = document.getElementById("tl-from"), toEl = document.getElementById("tl-to");
  function updateTimelineUI() {
    document.getElementById("tl-from-out").textContent = S.from; document.getElementById("tl-to-out").textContent = S.to;
    document.getElementById("basis-help").textContent = T("timeline.basisHelp." + S.basis);
    document.getElementById("basis-landed").setAttribute("aria-pressed", S.basis === "landed");
    document.getElementById("basis-ended").setAttribute("aria-pressed", S.basis === "ended");
    document.getElementById("btn-moon").setAttribute("aria-pressed", S.body === "moon");
    document.getElementById("btn-mars").setAttribute("aria-pressed", S.body === "mars");
    var ticks = document.getElementById("tl-ticks"), lo = 1966, hi = 2022, h = "";
    OBJS.filter(function (o) { return o.body === S.body; }).forEach(function (o) {
      var y = yearOf(eventOf(o, S.basis).date); if (y === null) return;
      var inR = y >= S.from && y <= S.to;
      h += '<span class="tick' + (inR ? " on" : "") + '" style="left:' + ((y - lo) / (hi - lo) * 100).toFixed(2) + '%"></span>';
    });
    ticks.innerHTML = h;
    var total = OBJS.filter(function (o) { return o.body === S.body; }).length, n = OBJS.filter(visible).length;
    document.getElementById("tl-count").textContent = T("timeline.count", { n: n, total: total }) + (n === 0 ? " " + T("timeline.empty") : "");
  }
  function onRange(which) {
    var f = +fromEl.value, t = +toEl.value;
    if (f > t) { if (which === "from") t = f; else f = t; fromEl.value = f; toEl.value = t; }
    S.from = f; S.to = t; refresh();
  }
  fromEl.addEventListener("input", function () { onRange("from"); });
  toEl.addEventListener("input", function () { onRange("to"); });
  document.getElementById("tl-all").addEventListener("click", function () { fromEl.value = 1966; toEl.value = 2022; S.from = 1966; S.to = 2022; refresh(); });
  [].forEach.call(document.querySelectorAll("[data-basis]"), function (b) {
    b.addEventListener("click", function () { S.basis = b.getAttribute("data-basis"); refresh(); });
  });
  [].forEach.call(document.querySelectorAll("[data-body]"), function (b) {
    b.addEventListener("click", function () { setBody(b.getAttribute("data-body")); });
  });
  function setBody(body) {
    if (body === S.body) return;
    S.body = body;
    if (S.sel && byId[S.sel].body !== body) { S.sel = null; renderPanel(); }
    resetView(false); setBasemapStatus(); refresh();
  }

  /* ---- list ---- */
  function renderList() {
    var ul = document.getElementById("map-list");
    var items = OBJS.filter(function (o) { return o.body === S.body; }).sort(function (a, b) {
      return String(eventOf(a, S.basis).date || "9999").localeCompare(String(eventOf(b, S.basis).date || "9999"));
    });
    ul.innerHTML = items.map(function (o) {
      var ev = eventOf(o, S.basis), vis = visible(o);
      return '<li class="' + (vis ? "" : "dim") + '"><button type="button" class="list-item' + (o.id === S.sel ? " sel" : "") + '" data-id="' + o.id + '"' + (o.id === S.sel ? ' aria-current="true"' : "") + '>' +
        '<span class="li-name">' + esc(o.name) + '</span><span class="li-meta">' + esc(o.mission) + " &middot; " + esc(T("event." + ev.kind)) + ": " +
        esc(fmtDate(ev.date) || T("panel.unknown")) + "</span></button></li>";
    }).join("");
    [].forEach.call(ul.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { select(b.getAttribute("data-id"), { scroll: true }); });
    });
  }

  /* ---- detail panel ---- */
  function row(label, val) { return "<div><dt>" + esc(label) + "</dt><dd>" + val + "</dd></div>"; }
  function verChip(group, val) {
    var base = String(val).split(" ")[0];
    if (base !== "source-checked") return "";
    return '<li class="chip chip-' + base + '"><span>' + esc(T("ver.group." + group)) + ":</span> " + esc(T("ver." + base)) + (String(val).indexOf("(") > -1 ? " " + esc(String(val).slice(String(val).indexOf("("))) : "") + "</li>";
  }
  function renderPanel() {
    var o = S.sel && byId[S.sel];
    fitBtn.disabled = !o;
    if (!o) { panelBody.innerHTML = '<p class="panel-empty">' + esc(T("panel.empty")) + "</p>"; return; }
    var m = (typeof getMissionById === "function") ? getMissionById(o.mission_id) : null;
    var na = esc(T("panel.notApplicable")), unk = esc(T("panel.unknown"));
    var dates = row(T("panel.landed"), esc(fmtDate(o.landed) || unk)) +
      row(T("panel.leftBehind"), o.left_behind ? esc(fmtDate(o.left_behind)) + '<small>' + esc(o.left_behind_basis) + "</small>" : na) +
      row(T("panel.lastContact"), o.last_contact ? esc(fmtDate(o.last_contact)) : na) +
      row(T("panel.closed"), o.mission_closed ? esc(fmtDate(o.mission_closed)) : na);
    var srcs = o.sources.map(function (s) {
      return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a><small>' + esc(T("panel.identifier")) + ": " + esc(s.id) + " &mdash; " + esc(s.supports) + "</small></li>";
    }).join("");
    var v = o.verification;
    var h = '<div class="panel-head"><p class="eyebrow">' + esc(o.mission) + " &middot; " + esc(T("map.body." + o.body)) + '</p>' +
      '<h2 id="panel-title" tabindex="-1">' + esc(o.name) + "</h2>" +
      '<button type="button" class="panel-close" id="panel-close" aria-label="' + esc(T("panel.close")) + '">&times;</button></div>' +
      '<figure class="panel-fig" id="panel-fig"><div class="fig-fallback" id="fig-fallback" role="img" aria-label="' + esc(T("panel.image.fallback")) + '"></div>' +
      '<figcaption id="fig-cap">' + esc(T("panel.image.loading")) + "</figcaption></figure>" +
      '<h3>' + esc(T("panel.location")) + "</h3><dl class=\"kv\">" +
      row(T("panel.coordinates"), "<strong>" + esc(fmtCoord(o)) + "</strong> <small>" + esc(o.site_label) + "</small>") +
      row(T("panel.status"), esc(o.status) + "<small>" + esc(T("map.markerNote." + o.marker_represents)) + "</small>") +
      row(T("panel.convention"), esc(o.coord_convention)) + row(T("panel.precision"), esc(o.coord_precision)) + "</dl>" +
      "<h3>" + esc(T("panel.dates")) + '</h3><dl class="kv">' + dates + "</dl><p class=\"small\">" + esc(o.date_notes) + "</p>" +
      "<h3>" + esc(T("panel.why")) + "</h3><p>" + esc(o.why_left) + "</p>" +
      "<h3>" + esc(T("panel.science")) + "</h3><p>" + esc(o.science) + '</p><p class="small"><strong>' + esc(T("panel.relationship")) + ":</strong> " + esc(T("rel." + o.science_relationship)) + "</p>" +
      "<h3>" + esc(T("panel.sources")) + '</h3><ul class="srcs">' + srcs + "</ul>" +
      '<p class="small"><strong>' + esc(T("panel.identifier")) + ":</strong> " + esc(o.dataset_id) + "</p>" +
      "<h3>" + esc(T("panel.verification")) + '</h3><ul class="chips">' + verChip("coordinates", v.coordinates) + verChip("dates", v.dates) + verChip("identifiers", v.identifiers) + verChip("narrative", v.narrative) + "</ul>" +
      '<div class="panel-links"><a class="btn btn-primary btn-small" href="mission.html?id=' + encodeURIComponent(o.mission_id) + '">' + esc(T("panel.mission.link")) + "</a>" +
      '<a class="btn btn-secondary btn-small" href="explore.html?id=' + encodeURIComponent(o.mission_id) + '">' + esc(T("panel.explore.link")) + "</a>" +
      '<a class="btn btn-secondary btn-small" href="game.html?id=' + encodeURIComponent(o.mission_id) + '">' + esc(T("panel.game.link")) + "</a></div>" +
      (m && m.quote ? '<details class="story"><summary>' + esc(T("story.label")) + '</summary><p class="quote-label">' + esc(T("story.imagined")) + "</p><blockquote>" + esc(m.quote) + "</blockquote></details>" : "");
    panelBody.innerHTML = h;
    document.getElementById("panel-close").addEventListener("click", function () { select(null); });
    var fb = document.getElementById("fig-fallback");
    if (m && typeof MissionIcons !== "undefined") fb.innerHTML = MissionIcons.iconFor(m);
    loadImage(o);
  }
  function setCaption(html) { var c = document.getElementById("fig-cap"); if (c) c.innerHTML = html; }
  function showFigImg(o, src, creditText, note, href) {
    var fig = document.getElementById("panel-fig"); if (!fig || S.sel !== o.id) return;
    var img = new Image(); img.alt = o.name; img.loading = "lazy";
    img.onload = function () {
      if (S.sel !== o.id) return;
      var fbk = document.getElementById("fig-fallback"); if (fbk) fbk.hidden = true;
      var old = fig.querySelector("img"); if (old) old.remove();
      fig.insertBefore(img, fig.firstChild);
      setCaption(esc(T("panel.image.credit")) + ": " + (href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(creditText) + "</a>" : esc(creditText)) + "<br><small>" + esc(note) + "</small>");
    };
    img.onerror = function () { tryApi(o); };
    img.src = src;
  }
  function tryApi(o) {
    if (typeof NasaAPI === "undefined") { setCaption(esc(T("panel.image.fallback"))); return; }
    NasaAPI.images({ id: o.id, query: o.image_query, must: o.image_must || [] }, 1).then(function (list) {
      if (S.sel !== o.id) return;
      if (!list.length) { setCaption(esc(T("panel.image.fallback"))); return; }
      var img = new Image(); img.alt = list[0].title; img.loading = "lazy";
      img.onload = function () {
        if (S.sel !== o.id) return; var fig = document.getElementById("panel-fig"), fbk = document.getElementById("fig-fallback");
        if (fbk) fbk.hidden = true; var old = fig.querySelector("img"); if (old) old.remove(); fig.insertBefore(img, fig.firstChild);
        setCaption(esc(T("panel.image.credit")) + ": " + esc(o.image_credit) + ' (<a href="' + esc(list[0].href) + '" target="_blank" rel="noopener">' + esc(list[0].id) + "</a>)<br><small>" + esc(T("panel.image.photoNote")) + "</small>");
      };
      img.onerror = function () { setCaption(esc(T("panel.image.fallback"))); };
      img.src = list[0].thumb;
    });
  }
  function loadImage(o) {
    if (o.image_local) return showFigImg(o, o.image_local, o.image_credit, "", null);
    if (o.image_remote) return showFigImg(o, o.image_remote.url, o.image_remote.credit, T("panel.image.refNote"), o.image_remote.url);
    tryApi(o);
  }

  /* ---- selection ---- */
  function select(id, opt) {
    opt = opt || {};
    S.sel = id; document.getElementById("map-crowd").textContent = "";
    try { var u = new URL(location.href); if (id) u.searchParams.set("obj", id); else u.searchParams.delete("obj"); history.replaceState(null, "", u); } catch (e) {}
    if (id) {
      var o = byId[id];
      if (o.body !== S.body) { S.body = o.body; setBasemapStatus(); }
      if (!visible(o)) { S.from = 1966; S.to = 2022; fromEl.value = 1966; toEl.value = 2022; }
      focusOn(o);
    }
    refresh(); renderPanel();
    if (id) {
      var t = document.getElementById("panel-title");
      if (opt.scroll || window.matchMedia("(max-width: 900px)").matches) {
        document.getElementById("map-panel").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
      if (t && !opt.fromMarker) t.focus({ preventScroll: true });
    }
  }
  function refresh() { updateTimelineUI(); renderList(); render(); }

  /* ---- init ---- */
  buildMarkers();
  var q = new URLSearchParams(location.search), qObj = q.get("obj");
  if (qObj && byId[qObj]) S.body = byId[qObj].body;
  I18N.apply(document);
  resize(); resetView(false); setBasemapStatus(); refresh();
  if (qObj && byId[qObj]) { select(qObj, { scroll: false, fromMarker: true }); }
  var ro = ("ResizeObserver" in window) ? new ResizeObserver(function () { resize(); }) : null;
  if (ro) ro.observe(root); else window.addEventListener("resize", resize);
  window.__MAP__ = { state: S, select: select, tileState: tileState };   // read-only handle for tests
})();
