/* ============================================================
   Spacecraft Inspector: procedural ILLUSTRATIVE models.
   Built from Three.js primitives. Proportions are simplified and are NOT
   engineering replicas, and none is an authentic NASA model.
   INSPECT_MODELS.build(THREE, familyId) -> { root, parts: {partId: Group} }
   Every part id used in js/inspector/craft-data.js has a group here.
   ============================================================ */
(function (root) {
  "use strict";
  var T;
  var C = { white: 0xe9ebef, grey: 0xaeb4bf, dark: 0x2b2f3a, gold: 0xc9a14a, foil: 0xd9b24f, panel: 0x1d3a7a, panelEdge: 0x9aa7c4, black: 0x0c0d12, red: 0xb0401f, dish: 0xd8dce4, rtg: 0x6d6f76, steel: 0x8e949f };

  function M(color, o) {
    o = o || {};
    return new T.MeshStandardMaterial({ color: color, roughness: o.r == null ? 0.5 : o.r, metalness: o.m == null ? 0.35 : o.m, side: o.side || T.FrontSide, emissive: 0x000000 });
  }
  function group(rootG, parts, id) { var g = new T.Group(); g.userData.part = id; rootG.add(g); parts[id] = g; return g; }
  function mesh(g, geo, mat, x, y, z, rx, ry, rz) {
    var m = new T.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0); m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = true; m.receiveShadow = true; m.userData.part = g.userData.part; g.add(m); return m;
  }
  function cyl(g, r1, r2, h, mat, x, y, z, rx, ry, rz, seg) { return mesh(g, new T.CylinderGeometry(r1, r2, h, seg || 14), mat, x, y, z, rx, ry, rz); }
  function box(g, w, h, d, mat, x, y, z, rx, ry, rz) { return mesh(g, new T.BoxGeometry(w, h, d), mat, x, y, z, rx, ry, rz); }
  function rod(g, a, b, r, mat) {
    var d = new T.Vector3().subVectors(b, a), len = d.length();
    var m = new T.Mesh(new T.CylinderGeometry(r, r, len, 8), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize());
    m.castShadow = true; m.userData.part = g.userData.part; g.add(m); return m;
  }
  function V(x, y, z) { return new T.Vector3(x, y, z); }
  function dish(g, r, mat, x, y, z, rx) {
    /* shallow concave bowl (bottom cap of a squashed sphere), opening upward toward the feed horn */
    var m = new T.Mesh(new T.SphereGeometry(r, 28, 10, 0, Math.PI * 2, Math.PI - 1.1, 1.1), mat);
    m.scale.set(1, 0.45, 1); m.position.set(x, y, z); m.rotation.x = rx || 0;
    m.castShadow = true; m.userData.part = g.userData.part; g.add(m); return m;
  }
  function wheels(g, xs, zs, r, w) {
    xs.forEach(function (x) { zs.forEach(function (z) { cyl(g, r, r, w, M(C.dark, { r: 0.8, m: 0.2 }), x, r, z, 0, 0, Math.PI / 2, 18); }); });
  }

  var B = {};

  B.mer = function (rt, P) {
    var body = new T.Group(); rt.add(body);
    box(body, 1.6, 0.5, 2.2, M(C.gold, { r: 0.6, m: 0.5 }), 0, 1.15, 0);
    var g;
    g = group(rt, P, "wheels"); [-1.15, 1.15].forEach(function (x) { [-1.15, 0, 1.15].forEach(function (z) { cyl(g, 0.4, 0.4, 0.3, M(C.dark, { r: 0.85, m: 0.15 }), x, 0.4, z, 0, 0, Math.PI / 2, 20); }); });
    g = group(rt, P, "suspension"); var sm = M(C.steel);
    [-1, 1].forEach(function (s) { rod(g, V(s * 1.0, 0.95, -0.9), V(s * 1.15, 0.4, 0), 0.05, sm); rod(g, V(s * 1.0, 0.95, 0.2), V(s * 1.15, 0.4, 1.15), 0.05, sm); rod(g, V(s * 1.15, 0.4, 0), V(s * 1.15, 0.4, -1.15), 0.05, sm); rod(g, V(s * 0.8, 1.15, 0), V(s * 1.0, 0.95, -0.9), 0.05, sm); });
    g = group(rt, P, "solar"); var pm = M(C.panel, { r: 0.35, m: 0.6 });
    box(g, 1.9, 0.06, 2.5, pm, 0, 1.45, 0); box(g, 1.96, 0.03, 2.56, M(C.panelEdge), 0, 1.41, 0);
    g = group(rt, P, "mast"); cyl(g, 0.045, 0.045, 0.95, M(C.grey), -0.4, 1.95, 0.7, 0, 0, 0, 8);
    box(g, 0.55, 0.22, 0.2, M(C.white, { r: 0.5 }), -0.4, 2.45, 0.7);
    [-0.15, 0.15].forEach(function (dx) { cyl(g, 0.05, 0.05, 0.12, M(C.black, { r: 0.2, m: 0.8 }), -0.4 + dx, 2.45, 0.82, Math.PI / 2, 0, 0, 12); });
    g = group(rt, P, "hga"); cyl(g, 0.04, 0.04, 0.6, M(C.grey), 0.55, 1.75, -0.8, 0, 0, 0, 8);
    cyl(g, 0.36, 0.36, 0.06, M(C.dish, { r: 0.4, m: 0.5 }), 0.55, 2.1, -0.8, 0.5, 0, 0, 24);
    g = group(rt, P, "arm"); var am = M(C.steel);
    rod(g, V(0.0, 1.0, 1.1), V(0.4, 0.85, 1.7), 0.06, am); rod(g, V(0.4, 0.85, 1.7), V(0.15, 0.7, 2.2), 0.06, am);
    cyl(g, 0.22, 0.22, 0.18, M(C.white), 0.15, 0.7, 2.3, Math.PI / 2, 0, 0, 14);
    [0, 1, 2, 3].forEach(function (k) { var a = k * Math.PI / 2; cyl(g, 0.045, 0.045, 0.14, M(C.black, { m: 0.7 }), 0.15 + Math.cos(a) * 0.12, 0.7 + Math.sin(a) * 0.12, 2.42, Math.PI / 2, 0, 0, 8); });
    g = group(rt, P, "hazcam"); [-0.4, 0.4].forEach(function (x) { box(g, 0.14, 0.1, 0.06, M(C.black, { m: 0.8 }), x, 1.0, 1.13); box(g, 0.14, 0.1, 0.06, M(C.black, { m: 0.8 }), x, 1.0, -1.13); });
    g = group(rt, P, "sundial"); cyl(g, 0.12, 0.12, 0.03, M(C.red, { r: 0.6 }), -0.65, 1.5, -0.95, 0, 0, 0, 20); box(g, 0.025, 0.12, 0.025, M(C.white), -0.65, 1.56, -0.95);
  };

  B.sojourner = function (rt, P) {
    var g;
    box(rt, 0.8, 0.28, 0.6, M(C.grey, { r: 0.6 }), 0, 0.55, 0);
    g = group(rt, P, "wheels"); [-0.5, 0.5].forEach(function (x) { [-0.45, 0, 0.45].forEach(function (z) { cyl(g, 0.17, 0.17, 0.14, M(C.dark, { r: 0.85 }), x, 0.17, z, 0, 0, Math.PI / 2, 16); }); });
    g = group(rt, P, "suspension"); var s = M(C.steel);
    [-1, 1].forEach(function (k) { rod(g, V(k * 0.4, 0.55, 0), V(k * 0.5, 0.17, 0.45), 0.025, s); rod(g, V(k * 0.4, 0.55, 0), V(k * 0.5, 0.17, -0.45), 0.025, s); rod(g, V(k * 0.5, 0.17, 0.45), V(k * 0.5, 0.17, -0.45), 0.02, s); });
    g = group(rt, P, "solar"); box(g, 0.8, 0.04, 0.6, M(C.panel, { r: 0.35, m: 0.6 }), 0, 0.72, 0);
    g = group(rt, P, "cameras"); [-0.15, 0.15].forEach(function (x) { cyl(g, 0.035, 0.035, 0.08, M(C.black, { m: 0.8 }), x, 0.58, 0.33, Math.PI / 2, 0, 0, 10); }); box(g, 0.1, 0.08, 0.06, M(C.black, { m: 0.8 }), 0, 0.58, -0.33);
    g = group(rt, P, "apxs"); cyl(g, 0.09, 0.09, 0.14, M(C.white), 0, 0.5, -0.42, Math.PI / 2, 0, 0, 14);
    g = group(rt, P, "antenna"); cyl(g, 0.01, 0.01, 0.7, M(C.white), 0.3, 1.05, -0.2, 0, 0, 0, 6);
  };

  function lander3(rt, P, legR, legH, deckR) {
    var g = group(rt, P, "legs"), lm = M(C.steel);
    [0, 1, 2].forEach(function (i) {
      var a = i * Math.PI * 2 / 3 + Math.PI / 6, cx = Math.cos(a), cz = Math.sin(a);
      rod(g, V(cx * deckR * 0.6, legH, cz * deckR * 0.6), V(cx * legR, 0.05, cz * legR), 0.05, lm);
      cyl(g, 0.16, 0.16, 0.05, M(C.grey), cx * legR, 0.03, cz * legR, 0, 0, 0, 16);
    });
  }

  B.phoenix = function (rt, P) {
    var g;
    cyl(rt, 1.1, 1.1, 0.25, M(C.grey, { r: 0.6 }), 0, 1.0, 0, 0, 0, 0, 10);
    lander3(rt, P, 1.6, 1.0, 1.1);
    g = group(rt, P, "solar"); var pm = M(C.panel, { r: 0.35, m: 0.6 });
    [-1, 1].forEach(function (s) { cyl(g, 1.0, 1.0, 0.04, pm, s * 1.7, 1.25, 0, 0, 0, s * 0.12, 32); cyl(g, 1.03, 1.03, 0.025, M(C.panelEdge), s * 1.7, 1.22, 0, 0, 0, s * 0.12, 32); });
    g = group(rt, P, "arm"); var am = M(C.steel);
    rod(g, V(0.0, 1.2, 0.9), V(0.5, 1.5, 1.7), 0.06, am); rod(g, V(0.5, 1.5, 1.7), V(0.6, 0.9, 2.5), 0.06, am);
    box(g, 0.28, 0.14, 0.34, M(C.white), 0.6, 0.82, 2.55);
    g = group(rt, P, "camera"); cyl(g, 0.035, 0.035, 0.9, M(C.grey), -0.5, 1.7, 0.2, 0, 0, 0, 8); box(g, 0.45, 0.16, 0.16, M(C.white), -0.5, 2.2, 0.2);
    [-0.12, 0.12].forEach(function (x) { cyl(g, 0.04, 0.04, 0.1, M(C.black, { m: 0.8 }), -0.5 + x, 2.2, 0.3, Math.PI / 2, 0, 0, 10); });
    g = group(rt, P, "met"); cyl(g, 0.02, 0.02, 1.4, M(C.white), 0.7, 1.9, -0.4, 0, 0, 0, 6); box(g, 0.12, 0.12, 0.12, M(C.dark), 0.7, 2.6, -0.4);
    g = group(rt, P, "lab"); box(g, 0.5, 0.35, 0.5, M(C.white, { r: 0.6 }), -0.2, 1.3, -0.6); box(g, 0.4, 0.3, 0.45, M(C.gold, { r: 0.6 }), 0.45, 1.28, -0.2);
    g = group(rt, P, "dvd"); cyl(g, 0.17, 0.17, 0.02, M(0xc7ccd6, { r: 0.2, m: 0.9 }), -0.1, 1.15, 0.5, 0, 0, 0, 24);
  };

  B.insight = function (rt, P) {
    var g;
    cyl(rt, 1.0, 1.0, 0.25, M(C.grey, { r: 0.6 }), 0, 1.0, 0, 0, 0, 0, 10);
    lander3(rt, P, 1.5, 1.0, 1.0);
    g = group(rt, P, "solar"); var pm = M(C.panel, { r: 0.35, m: 0.6 });
    [-1, 1].forEach(function (s) { cyl(g, 1.45, 1.45, 0.04, pm, s * 2.0, 1.15, 0, 0, 0, s * 0.05, 40); cyl(g, 1.5, 1.5, 0.025, M(C.panelEdge), s * 2.0, 1.12, 0, 0, 0, s * 0.05, 40); });
    g = group(rt, P, "arm"); var am = M(C.steel);
    rod(g, V(0.0, 1.2, 0.6), V(0.2, 1.7, 1.2), 0.07, am); rod(g, V(0.2, 1.7, 1.2), V(0.4, 1.2, 1.9), 0.07, am);
    cyl(g, 0.08, 0.14, 0.16, M(C.dark), 0.4, 1.1, 1.95, 0, 0, 0, 10);
    g = group(rt, P, "seis"); mesh(g, new T.SphereGeometry(0.62, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(C.dish, { r: 0.45, m: 0.5 }), 1.3, 0, 2.2);
    cyl(g, 0.5, 0.5, 0.02, M(C.dark), 1.3, 0.02, 2.2, 0, 0, 0, 20);
    g = group(rt, P, "hp3"); box(g, 0.45, 0.4, 0.45, M(C.gold, { r: 0.6 }), -1.3, 0.2, 2.2); rod(g, V(-1.3, 0.35, 2.2), V(-0.6, 0.08, 1.2), 0.012, M(C.black));
    g = group(rt, P, "camera"); box(g, 0.16, 0.12, 0.12, M(C.black, { m: 0.8 }), 0.4, 1.3, 0.9); box(g, 0.14, 0.1, 0.1, M(C.black, { m: 0.8 }), -0.5, 1.2, 0.9);
    g = group(rt, P, "chips"); box(g, 0.14, 0.02, 0.14, M(0xc7ccd6, { m: 0.9, r: 0.3 }), -0.1, 1.14, -0.3);
  };

  B.apollo = function (rt, P) {
    var g, foil = M(C.foil, { r: 0.35, m: 0.85 });
    g = group(rt, P, "body"); cyl(g, 1.6, 1.4, 1.0, foil, 0, 1.55, 0, 0, Math.PI / 8, 0, 8);
    cyl(g, 1.45, 1.45, 0.05, M(C.grey, { r: 0.7 }), 0, 2.07, 0, 0, Math.PI / 8, 0, 8);
    g = group(rt, P, "engine"); cyl(g, 0.25, 0.7, 0.9, M(C.steel, { r: 0.4 }), 0, 0.75, 0, 0, 0, 0, 20);
    g = group(rt, P, "legs"); var lm = M(C.foil, { r: 0.45, m: 0.7 }), st = M(C.steel);
    [0, 1, 2, 3].forEach(function (i) {
      var a = i * Math.PI / 2, cx = Math.cos(a), cz = Math.sin(a);
      rod(g, V(cx * 1.3, 1.7, cz * 1.3), V(cx * 3.0, 0.1, cz * 3.0), 0.09, lm);
      rod(g, V(cx * 1.1, 1.1, cz * 1.1), V(cx * 2.2, 0.8, cz * 2.2), 0.04, st);
      cyl(g, 0.45, 0.45, 0.07, M(C.grey), cx * 3.0, 0.04, cz * 3.0, 0, 0, 0, 20);
    });
    g = group(rt, P, "ladder"); [-0.18, 0.18].forEach(function (dx) { rod(g, V(3.0 - 0.05, 0.3, dx), V(1.85, 1.55, dx), 0.025, M(C.white)); });
    for (var r = 0; r < 6; r++) { var f = r / 5; box(g, 0.05, 0.03, 0.4, M(C.white), 2.95 - f * 1.05, 0.4 + f * 1.1, 0); }
    g = group(rt, P, "stowage"); box(g, 0.55, 0.7, 1.0, M(C.grey, { r: 0.6 }), 0, 1.5, -1.55, 0, Math.PI / 2, 0);
    g = group(rt, P, "plaque"); box(g, 0.03, 0.3, 0.42, M(0xd0d4dc, { r: 0.25, m: 0.9 }), 2.8, 0.55, 0.0);
  };

  B.surveyor = function (rt, P) {
    var g;
    cyl(rt, 0.5, 0.5, 0.7, M(C.grey, { r: 0.55 }), 0, 1.35, 0, 0, 0, 0, 6);
    g = group(rt, P, "legs"); var lm = M(C.steel);
    [0, 1, 2].forEach(function (i) { var a = i * Math.PI * 2 / 3, cx = Math.cos(a), cz = Math.sin(a);
      rod(g, V(cx * 0.35, 1.1, cz * 0.35), V(cx * 1.9, 0.05, cz * 1.9), 0.06, lm); rod(g, V(cx * 0.35, 1.5, cz * 0.35), V(cx * 1.4, 0.55, cz * 1.4), 0.03, lm);
      cyl(g, 0.22, 0.22, 0.06, M(C.grey), cx * 1.9, 0.03, cz * 1.9, 0, 0, 0, 16); });
    g = group(rt, P, "solar"); cyl(g, 0.03, 0.03, 1.1, M(C.grey), 0, 2.4, 0, 0, 0, 0, 8); cyl(g, 0.7, 0.7, 0.04, M(C.panel, { r: 0.35, m: 0.6 }), 0, 3.0, 0, 0.15, 0, 0, 6);
    g = group(rt, P, "camera"); cyl(g, 0.11, 0.11, 0.35, M(C.white), 0.3, 1.9, 0.3, 0, 0, 0, 12); box(g, 0.18, 0.18, 0.04, M(C.dish, { m: 0.9, r: 0.2 }), 0.3, 2.15, 0.3, 0.6);
    g = group(rt, P, "antennas"); rod(g, V(-0.3, 1.7, 0), V(-0.9, 2.5, -0.3), 0.025, M(C.grey)); box(g, 0.5, 0.5, 0.03, M(C.white), -0.9, 2.6, -0.3, 0.3, 0, 0.2); rod(g, V(0.0, 3.0, 0), V(0.0, 3.5, 0), 0.015, M(C.white));
    g = group(rt, P, "thrusters"); [0, 1, 2].forEach(function (i) { var a = i * Math.PI * 2 / 3 + Math.PI / 3; cyl(g, 0.07, 0.12, 0.3, M(C.dark, { r: 0.5 }), Math.cos(a) * 0.65, 1.0, Math.sin(a) * 0.65, 0, 0, 0, 10); });
    g = group(rt, P, "sampler"); var sm = M(C.steel); rod(g, V(0.4, 1.3, -0.3), V(1.0, 1.0, -0.9), 0.04, sm); rod(g, V(1.0, 1.0, -0.9), V(1.35, 0.5, -0.95), 0.04, sm); box(g, 0.18, 0.12, 0.14, M(C.white), 1.4, 0.4, -0.95);
  };

  B.pioneer = function (rt, P) {
    var g;
    g = group(rt, P, "bus"); cyl(g, 0.85, 0.85, 0.5, M(C.grey, { r: 0.55 }), 0, 0.35, 0, 0, 0, 0, 6); box(g, 0.3, 0.2, 0.3, M(C.white), 0.9, 0.25, 0.2);
    g = group(rt, P, "hga"); dish(g, 1.9, M(C.dish, { r: 0.4, m: 0.5, side: T.DoubleSide }), 0, 1.75, 0, 0);
    cyl(g, 0.12, 0.12, 0.4, M(C.grey), 0, 0.8, 0, 0, 0, 0, 10);
    cyl(g, 0.1, 0.18, 0.3, M(C.dark), 0, 2.0, 0, 0, 0, 0, 12);
    [0, 1, 2].forEach(function (i) { var a = i * Math.PI * 2 / 3; rod(g, V(Math.cos(a) * 1.69, 1.36, Math.sin(a) * 1.69), V(0, 2.0, 0), 0.015, M(C.grey)); });
    g = group(rt, P, "rtg"); var rm = M(C.rtg, { r: 0.5 }); [-1, 1].forEach(function (s) { rod(g, V(s * 0.6, 0.3, 0), V(s * 3.0, 0.3, 0), 0.025, M(C.grey)); [0.0, 0.5].forEach(function (o) { cyl(g, 0.17, 0.17, 0.5, rm, s * (2.2 + o + 0.2), 0.3, 0, 0, 0, Math.PI / 2, 14); }); });
    g = group(rt, P, "magboom"); rod(g, V(0.4, 0.3, 0.6), V(1.3, 0.3, 4.5), 0.02, M(C.grey)); box(g, 0.14, 0.14, 0.14, M(C.white), 1.3, 0.3, 4.5);
    g = group(rt, P, "plaque"); box(g, 0.5, 0.33, 0.015, M(0xd0d4dc, { r: 0.25, m: 0.9 }), 0.55, 0.45, -0.9, 0, 0.5, 0);
  };

  B.voyager = function (rt, P) {
    var g;
    g = group(rt, P, "bus"); cyl(g, 0.7, 0.7, 0.5, M(C.gold, { r: 0.5, m: 0.6 }), 0, 0.25, 0, 0, 0, 0, 10);
    g = group(rt, P, "hga"); dish(g, 1.85, M(C.dish, { r: 0.4, m: 0.5, side: T.DoubleSide }), 0, 1.63, 0, 0);
    cyl(g, 0.12, 0.12, 0.4, M(C.grey), 0, 0.7, 0, 0, 0, 0, 10);
    cyl(g, 0.08, 0.15, 0.25, M(C.dark), 0, 1.9, 0, 0, 0, 0, 12);
    [0, 1, 2].forEach(function (i) { var a = i * Math.PI * 2 / 3; rod(g, V(Math.cos(a) * 1.65, 1.25, Math.sin(a) * 1.65), V(0, 1.9, 0), 0.012, M(C.grey)); });
    g = group(rt, P, "rtg"); rod(g, V(-0.6, 0.25, 0), V(-3.2, 0.25, 0), 0.02, M(C.grey)); [0, 1, 2].forEach(function (i) { cyl(g, 0.13, 0.13, 0.42, M(C.rtg, { r: 0.5 }), -1.4 - i * 0.55, 0.25, 0, 0, 0, Math.PI / 2, 14); });
    g = group(rt, P, "scan"); rod(g, V(0.5, 0.15, 0.4), V(2.2, -0.2, 0.9), 0.025, M(C.grey)); box(g, 0.5, 0.35, 0.45, M(C.white), 2.35, -0.25, 0.95);
    [-0.12, 0.12].forEach(function (d) { cyl(g, 0.06, 0.06, 0.25, M(C.black, { m: 0.8 }), 2.35 + d, -0.25, 1.3, Math.PI / 2, 0, 0, 10); });
    g = group(rt, P, "magboom"); rod(g, V(-0.2, 0.1, -0.5), V(-1.6, 0.1, -4.6), 0.018, M(C.grey)); box(g, 0.12, 0.12, 0.12, M(C.white), -1.6, 0.1, -4.6);
    g = group(rt, P, "antennas"); rod(g, V(0.3, 0.35, 0.3), V(3.0, 1.4, -2.6), 0.012, M(C.steel)); rod(g, V(0.3, 0.35, -0.3), V(3.0, 1.0, 2.4), 0.012, M(C.steel));
    g = group(rt, P, "record"); cyl(g, 0.3, 0.3, 0.025, M(C.gold, { r: 0.2, m: 0.95 }), 0.55, 0.45, 0.4, Math.PI / 2 - 0.4, 0, 0.3, 28);
  };

  function build(THREE, family) {
    T = THREE;
    var rt = new T.Group(), P = {};
    if (!B[family]) throw new Error("Unknown craft family: " + family);
    B[family](rt, P);
    return { root: rt, parts: P };
  }
  root.INSPECT_MODELS = { build: build, families: Object.keys(B) };
  if (typeof module !== "undefined") module.exports = root.INSPECT_MODELS;
})(typeof window !== "undefined" ? window : globalThis);
