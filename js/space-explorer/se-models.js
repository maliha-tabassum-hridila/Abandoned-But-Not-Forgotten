/* ============================================================
   Space Explorer: Their Legacy - procedural models (classic script)
   Everything is built from Three.js primitives. Spacecraft are
   STYLISED REPRESENTATIONS, not exact engineering replicas.
   Call SE_MODELS.init(THREE) once Three.js has loaded.
   ============================================================ */
(function () {
  "use strict";
  var T;

  function mat(color, o) {
    o = o || {};
    return new T.MeshStandardMaterial({
      color: color, roughness: o.r == null ? 0.55 : o.r, metalness: o.m == null ? 0.15 : o.m,
      emissive: o.e || 0x000000, emissiveIntensity: o.ei || 0, flatShading: !!o.flat,
      transparent: o.a != null, opacity: o.a == null ? 1 : o.a, side: o.side || T.FrontSide
    });
  }
  function add(parent, geo, m, x, y, z, shadow) {
    var o = new T.Mesh(geo, m);
    o.position.set(x || 0, y || 0, z || 0);
    if (shadow !== false) o.castShadow = true;
    parent.add(o); return o;
  }
  function strut(parent, a, b, r, m) {
    var d = new T.Vector3().subVectors(b, a), len = d.length();
    var o = new T.Mesh(new T.CylinderGeometry(r, r, len, 6), m);
    o.position.copy(a).addScaledVector(d, 0.5);
    o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
    o.castShadow = true; parent.add(o); return o;
  }
  function canvasTex(w, h, draw) {
    var c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
  }
  function shade(hex, f) {
    var c = new T.Color(hex); c.multiplyScalar(f); return c.getHex();
  }

  /* ---------------- astronauts: two deliberate characters ---------------- */
  var SUITS = [
    { id: "sun", name: "Sunny yellow", hex: 0xffc83d },
    { id: "coral", name: "Coral red", hex: 0xff5d5d },
    { id: "mint", name: "Mint green", hex: 0x2fd7a3 },
    { id: "sky", name: "Sky blue", hex: 0x3fa7ff },
    { id: "grape", name: "Grape purple", hex: 0x9a62ff },
    { id: "snow", name: "Snow white", hex: 0xeef2ff }
  ];

  function buildAstronaut(gender, suitHex) {
    var female = gender === "female";
    var root = new T.Group(), rig = new T.Group(); root.add(rig);
    var suit = mat(suitHex, { r: 0.6 }), trim = mat(shade(suitHex, 0.62), { r: 0.6 });
    var white = mat(0xf4f6ff, { r: 0.5 }), dark = mat(0x2a2f4a, { r: 0.7 });
    var visor = mat(female ? 0x5fe8ff : 0xffb347, { r: 0.12, m: 0.85, e: female ? 0x1b8fb0 : 0xa8601a, ei: 0.5 });
    var light = mat(0xfff2a8, { e: 0xffe066, ei: 1.2 });
    var parts = { suit: suit, trim: trim };

    /* legs (pivot at hips) */
    function leg(sx) {
      var g = new T.Group(); g.position.set(sx * (female ? 0.17 : 0.2), 0.86, 0);
      add(g, new T.CapsuleGeometry(female ? 0.115 : 0.14, 0.38, 4, 8), suit, 0, -0.3, 0);
      add(g, new T.BoxGeometry(female ? 0.2 : 0.25, 0.15, 0.36), white, 0, -0.66, 0.05);
      add(g, new T.BoxGeometry(female ? 0.21 : 0.26, 0.06, 0.2), trim, 0, -0.52, 0.02);
      rig.add(g); return g;
    }
    var legL = leg(-1), legR = leg(1);

    /* torso */
    var tw = female ? 0.28 : 0.35;
    add(rig, new T.CapsuleGeometry(tw, 0.42, 4, 10), suit, 0, 1.2, 0);
    add(rig, new T.CylinderGeometry(tw * 0.95, tw * 0.8, 0.2, 12), trim, 0, 0.95, 0);   /* belt */
    if (female) {
      add(rig, new T.CylinderGeometry(0.13, 0.13, 0.04, 20), white, 0, 1.26, tw + 0.005).rotation.x = Math.PI / 2;
      add(rig, new T.SphereGeometry(0.05, 10, 8), light, 0, 1.26, tw + 0.04, false);
    } else {
      add(rig, new T.BoxGeometry(0.34, 0.26, 0.08), white, 0, 1.26, tw + 0.0);
      add(rig, new T.BoxGeometry(0.06, 0.06, 0.04), mat(0xff5d5d, { e: 0xff3030, ei: 0.8 }), -0.09, 1.28, tw + 0.05, false);
      add(rig, new T.BoxGeometry(0.06, 0.06, 0.04), mat(0x5dff9a, { e: 0x30ff70, ei: 0.8 }), 0.04, 1.28, tw + 0.05, false);
      add(rig, new T.BoxGeometry(0.62, 0.12, 0.32), trim, 0, 1.55, 0);                    /* shoulder yoke */
    }

    /* backpack: boxy tank pack vs slim rounded pack */
    if (female) {
      var bp = add(rig, new T.CapsuleGeometry(0.17, 0.4, 4, 10), white, 0, 1.22, -0.33);
      bp.scale.set(1.25, 1, 0.8);
      add(rig, new T.CylinderGeometry(0.06, 0.06, 0.5, 8), trim, 0.18, 1.2, -0.46);
      add(rig, new T.CylinderGeometry(0.06, 0.06, 0.5, 8), trim, -0.18, 1.2, -0.46);
    } else {
      add(rig, new T.BoxGeometry(0.56, 0.7, 0.3), white, 0, 1.25, -0.36);
      add(rig, new T.CylinderGeometry(0.1, 0.1, 0.6, 10), trim, -0.15, 1.2, -0.58);
      add(rig, new T.CylinderGeometry(0.1, 0.1, 0.6, 10), trim, 0.15, 1.2, -0.58);
    }

    /* arms (pivot at shoulders) */
    function arm(sx) {
      var g = new T.Group(); g.position.set(sx * (female ? 0.4 : 0.5), 1.5, 0);
      add(g, new T.CapsuleGeometry(female ? 0.09 : 0.11, 0.4, 4, 8), suit, 0, -0.27, 0);
      add(g, new T.SphereGeometry(female ? 0.11 : 0.13, 10, 8), white, 0, -0.6, 0);
      add(g, new T.CylinderGeometry(0.115, 0.115, 0.07, 10), trim, 0, -0.45, 0);
      rig.add(g); return g;
    }
    var armL = arm(-1), armR = arm(1);

    /* head + helmet */
    var head = new T.Group(); head.position.set(0, 1.86, 0.02); rig.add(head);
    add(head, new T.SphereGeometry(female ? 0.34 : 0.37, 20, 16), white, 0, 0, 0);
    var v = add(head, new T.SphereGeometry(0.3, 16, 12), visor, 0, 0.0, 0.16, false);
    v.scale.set(female ? 1.0 : 1.08, female ? 0.78 : 0.66, 0.7);
    add(head, new T.TorusGeometry(0.2, 0.035, 6, 20), trim, 0, -0.33, 0, false).rotation.x = Math.PI / 2;
    if (female) {                       /* hair buns, ear pods and a helmet crest */
      var hair = mat(0x4a2a1a, { r: 0.8 });
      add(head, new T.SphereGeometry(0.14, 10, 8), hair, -0.3, 0.22, -0.12);
      add(head, new T.SphereGeometry(0.14, 10, 8), hair, 0.3, 0.22, -0.12);
      add(head, new T.CylinderGeometry(0.07, 0.07, 0.06, 12), trim, -0.36, -0.02, 0, false).rotation.z = Math.PI / 2;
      add(head, new T.CylinderGeometry(0.07, 0.07, 0.06, 12), trim, 0.36, -0.02, 0, false).rotation.z = Math.PI / 2;
      add(head, new T.BoxGeometry(0.05, 0.1, 0.34), trim, 0, 0.36, 0, false);
    } else {                            /* antenna and a squared helmet band */
      add(head, new T.CylinderGeometry(0.015, 0.015, 0.34, 6), dark, 0.18, 0.46, -0.08, false);
      add(head, new T.SphereGeometry(0.04, 8, 6), light, 0.18, 0.64, -0.08, false);
      add(head, new T.BoxGeometry(0.2, 0.07, 0.07), trim, 0, 0.3, 0.2, false);
    }
    root.userData = { legL: legL, legR: legR, armL: armL, armR: armR, head: head, rig: rig, parts: parts, female: female };
    root.scale.setScalar(0.92);
    return root;
  }
  function setSuit(av, hex) {
    var p = av.userData.parts; p.suit.color.setHex(hex); p.trim.color.setHex(shade(hex, 0.62));
  }

  /* ---------------- spacecraft (stylised) ---------------- */
  var FOIL = 0xe0b04a, SILVER = 0xc9d0dc, SOLAR = 0x1f3f8f;

  function lander3Leg(g, spread, h, mFoot, mLeg) {
    for (var i = 0; i < 3; i++) {
      var a = i * Math.PI * 2 / 3 + Math.PI / 6;
      var top = new T.Vector3(Math.cos(a) * 0.35, h, Math.sin(a) * 0.35);
      var foot = new T.Vector3(Math.cos(a) * spread, 0.1, Math.sin(a) * spread);
      strut(g, top, foot, 0.05, mLeg);
      add(g, new T.CylinderGeometry(0.22, 0.26, 0.1, 10), mFoot, foot.x, 0.05, foot.z);
    }
  }
  var CRAFTS = {
    mer: function (accent) {                          /* rover: Spirit / Opportunity */
      var g = new T.Group(), body = mat(0xd8dde8, { m: 0.3 }), dk = mat(0x2d3350), sol = mat(SOLAR, { m: 0.5, r: 0.3 });
      add(g, new T.BoxGeometry(1.5, 0.45, 1.1), body, 0, 0.85, 0);
      add(g, new T.BoxGeometry(1.7, 0.06, 1.3), sol, 0, 1.12, 0);
      add(g, new T.BoxGeometry(1.5, 0.05, 0.4), sol, 0, 1.12, 0.85);
      add(g, new T.CylinderGeometry(0.04, 0.04, 0.9, 6), dk, -0.55, 1.6, -0.3);
      add(g, new T.BoxGeometry(0.34, 0.16, 0.16), dk, -0.55, 2.08, -0.3);
      add(g, new T.CylinderGeometry(0.05, 0.05, 0.6, 6), mat(accent, { e: accent, ei: 0.5 }), 0.5, 1.45, 0.4);
      [-0.78, 0.78].forEach(function (x) { [-0.55, 0, 0.55].forEach(function (z) {
        var w = add(g, new T.CylinderGeometry(0.25, 0.25, 0.2, 14), dk, x, 0.27, z); w.rotation.z = Math.PI / 2;
        strut(g, new T.Vector3(x * 0.8, 0.8, z * 0.7), new T.Vector3(x, 0.27, z), 0.03, body);
      }); });
      return g;
    },
    sojourner: function (accent) {                    /* tiny six-wheel rover */
      var g = new T.Group(), body = mat(0xe6e2d6, { m: 0.25 }), dk = mat(0x2d3350);
      add(g, new T.BoxGeometry(0.9, 0.36, 0.65), body, 0, 0.55, 0);
      add(g, new T.BoxGeometry(0.85, 0.05, 0.6), mat(SOLAR, { m: 0.5 }), 0, 0.77, 0);
      add(g, new T.CylinderGeometry(0.025, 0.025, 0.55, 6), dk, 0.3, 1.05, -0.2);
      add(g, new T.SphereGeometry(0.07, 8, 6), mat(accent, { e: accent, ei: 0.6 }), 0.3, 1.35, -0.2);
      [-0.46, 0.46].forEach(function (x) { [-0.28, 0, 0.28].forEach(function (z) {
        add(g, new T.CylinderGeometry(0.16, 0.16, 0.12, 12), dk, x, 0.17, z).rotation.z = Math.PI / 2;
      }); });
      g.scale.setScalar(1.6); return g;
    },
    phoenix: function (accent) {                      /* stationary lander with round arrays */
      var g = new T.Group(), body = mat(0xd9dde6), sol = mat(SOLAR, { m: 0.5, r: 0.3 });
      lander3Leg(g, 1.3, 0.9, mat(0x9aa0ae), mat(0xb7bdca));
      add(g, new T.CylinderGeometry(0.85, 0.7, 0.25, 6), body, 0, 1.0, 0);
      add(g, new T.CylinderGeometry(0.85, 0.85, 0.05, 18), sol, 1.55, 1.15, 0);
      add(g, new T.CylinderGeometry(0.85, 0.85, 0.05, 18), sol, -1.55, 1.15, 0);
      var arm = new T.Vector3(0.3, 1.2, 0.5);
      strut(g, new T.Vector3(0.2, 1.15, 0.4), new T.Vector3(0.9, 0.6, 1.4), 0.04, mat(accent, { e: accent, ei: 0.4 }));
      add(g, new T.CylinderGeometry(0.03, 0.03, 0.8, 6), mat(0x2d3350), -0.3, 1.6, -0.2);
      return g;
    },
    insight: function (accent) {                      /* stationary lander, dome + two round arrays */
      var g = new T.Group(), body = mat(0xe3e6ee), sol = mat(SOLAR, { m: 0.5, r: 0.3 });
      lander3Leg(g, 1.2, 0.8, mat(0x9aa0ae), mat(0xb7bdca));
      add(g, new T.CylinderGeometry(0.9, 0.9, 0.2, 20), body, 0, 0.95, 0);
      add(g, new T.SphereGeometry(0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(accent, { m: 0.4, r: 0.3, e: accent, ei: 0.25 }), 0.45, 1.05, 0.2);
      [-1, 1].forEach(function (s) { var a = add(g, new T.CylinderGeometry(1.0, 1.0, 0.05, 20), sol, s * 1.7, 1.25, 0); a.rotation.z = s * 0.1; });
      return g;
    },
    surveyor: function (accent) {                     /* three-legged Surveyor */
      var g = new T.Group(), alu = mat(SILVER, { m: 0.55, r: 0.35 });
      lander3Leg(g, 1.35, 1.1, mat(0x7d8496), alu);
      add(g, new T.CylinderGeometry(0.08, 0.08, 1.6, 8), alu, 0, 1.75, 0);                      /* mast */
      add(g, new T.BoxGeometry(0.8, 0.5, 0.5), mat(0xe9ecf3), 0, 1.15, 0);
      add(g, new T.BoxGeometry(0.5, 0.04, 0.5), mat(SOLAR, { m: 0.5 }), 0, 2.65, 0);            /* solar panel */
      add(g, new T.BoxGeometry(0.2, 0.2, 0.2), mat(accent, { e: accent, ei: 0.45 }), 0.0, 2.3, 0.2);
      add(g, new T.CylinderGeometry(0.03, 0.03, 0.9, 6), alu, 0.55, 1.6, -0.2).rotation.z = -0.5;
      return g;
    },
    lm: function (accent) {                           /* Apollo Lunar Module descent stage */
      var g = new T.Group(), foil = mat(FOIL, { m: 0.8, r: 0.3 }), alu = mat(SILVER, { m: 0.5 });
      var base = add(g, new T.CylinderGeometry(1.5, 1.5, 0.9, 8), foil, 0, 1.3, 0); base.rotation.y = Math.PI / 8;
      add(g, new T.BoxGeometry(2.4, 0.18, 2.4), mat(0x8b8f9c), 0, 1.78, 0);
      add(g, new T.ConeGeometry(0.45, 0.4, 10), mat(0x5b5f6c), 0, 0.7, 0);                      /* engine bell */
      for (var i = 0; i < 4; i++) {
        var a = i * Math.PI / 2 + Math.PI / 4;
        var top = new T.Vector3(Math.cos(a) * 1.3, 1.5, Math.sin(a) * 1.3), foot = new T.Vector3(Math.cos(a) * 2.5, 0.12, Math.sin(a) * 2.5);
        strut(g, top, foot, 0.07, alu);
        add(g, new T.CylinderGeometry(0.34, 0.4, 0.12, 12), foil, foot.x, 0.06, foot.z);
      }
      add(g, new T.BoxGeometry(0.1, 0.9, 0.5), mat(accent, { e: accent, ei: 0.35 }), 0, 1.0, 1.55);
      return g;
    },
    pioneer: function (accent) {                      /* Pioneer: big dish, hex bus, RTG booms */
      var g = new T.Group(), alu = mat(SILVER, { m: 0.5 }), dk = mat(0x39405a);
      var dish = add(g, new T.SphereGeometry(1.7, 24, 10, 0, Math.PI * 2, 0, 0.62), mat(0xf2f3f7, { m: 0.3, r: 0.4, side: T.DoubleSide }), 0, 0, 0);
      dish.rotation.x = Math.PI / 2; dish.position.z = 0.2;
      add(g, new T.CylinderGeometry(0.55, 0.55, 0.4, 6), mat(0x2b3150), 0, 0, -0.45).rotation.x = Math.PI / 2;
      add(g, new T.CylinderGeometry(0.03, 0.03, 0.9, 6), dk, 0, 0, 0.45).rotation.x = Math.PI / 2;
      [-1, 1].forEach(function (s) {
        strut(g, new T.Vector3(s * 0.4, 0, -0.5), new T.Vector3(s * 2.6, 0, -0.7), 0.04, alu);
        add(g, new T.CylinderGeometry(0.16, 0.16, 0.7, 8), mat(accent, { e: accent, ei: 0.35 }), s * 2.2, 0, -0.7).rotation.z = Math.PI / 2;
      });
      strut(g, new T.Vector3(0, 0.4, -0.5), new T.Vector3(0, 2.4, -1.2), 0.04, alu);
      return g;
    },
    voyager: function (accent) {                      /* Voyager: ten-sided bus, dish, long boom */
      var g = new T.Group(), alu = mat(SILVER, { m: 0.5 }), dk = mat(0x39405a);
      var dish = add(g, new T.SphereGeometry(1.6, 24, 10, 0, Math.PI * 2, 0, 0.6), mat(0xf4f5f9, { m: 0.3, r: 0.4, side: T.DoubleSide }), 0, 0, 0);
      dish.rotation.x = Math.PI / 2; dish.position.z = 0.55;
      add(g, new T.CylinderGeometry(0.62, 0.62, 0.45, 10), mat(0xc8ccd8, { m: 0.4 }), 0, 0, -0.2).rotation.x = Math.PI / 2;
      strut(g, new T.Vector3(0.3, 0, -0.4), new T.Vector3(3.4, -0.2, -0.9), 0.045, alu);
      add(g, new T.CylinderGeometry(0.17, 0.17, 0.75, 8), mat(accent, { e: accent, ei: 0.35 }), 2.4, -0.1, -0.75).rotation.z = Math.PI / 2;
      strut(g, new T.Vector3(-0.3, 0, -0.4), new T.Vector3(-2.6, 0.3, -1.1), 0.04, alu);
      add(g, new T.BoxGeometry(0.3, 0.3, 0.5), dk, -2.7, 0.3, -1.1);
      strut(g, new T.Vector3(0, 0.3, -0.4), new T.Vector3(0, 2.2, -1.3), 0.03, alu);
      add(g, new T.CylinderGeometry(0.2, 0.2, 0.05, 14), mat(0xd8aa3c, { m: 0.8 }), 0, 0, -0.62).rotation.x = Math.PI / 2;  /* golden record disc */
      return g;
    }
  };

  window.SE_MODELS = {
    SUITS: SUITS,
    init: function (three) { T = three; },
    helpers: { mat: mat, add: add, strut: strut, canvasTex: canvasTex, shade: shade },
    astronaut: buildAstronaut,
    setSuit: setSuit,
    craft: function (kind, accent) { return (CRAFTS[kind] || CRAFTS.surveyor)(accent); }
  };
})();
