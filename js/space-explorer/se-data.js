/* ============================================================
   Space Explorer: Their Legacy - data adapter (classic script)
   The archive in js/data.js (+ data-extra.js) is the single source
   of truth. This file only decides WHICH ZONE and WHICH 3D MODEL
   each existing record uses. It stores no mission facts of its own.
   Every record in MISSIONS is guaranteed to appear in exactly one
   zone: ids not listed below are appended to the zone matching
   their archive "location", so nothing can silently disappear.
   ============================================================ */
(function () {
  "use strict";
  var MS = typeof MISSIONS !== "undefined" ? MISSIONS : [];

  var ZONES = {
    moon: {
      id: "moon", name: "Moon Exploration", short: "Moon", color: "#b9c4ff", hex: 0xb9c4ff,
      intro: "Grey dust, deep craters and Earth hanging in the sky. Find the hardware left on the lunar surface.",
      order: ["apollo-lm", "surveyor-1", "surveyor-3", "surveyor-5", "surveyor-6", "surveyor-7"]
    },
    mars: {
      id: "mars", name: "Mars Exploration", short: "Mars", color: "#ff8f5a", hex: 0xff8f5a,
      intro: "Rust-red plains, rocky ridges and a dusty pink sky. Follow the trail of rovers and landers.",
      order: ["sojourner", "spirit", "opportunity", "phoenix", "insight"]
    },
    deep: {
      id: "deep", name: "Deep Space Exploration", short: "Deep Space", color: "#b784ff", hex: 0xb784ff,
      intro: "A stylised route through the dark, past giant planets. These probes are not on any surface.",
      order: ["pioneer-10", "pioneer-11", "voyager-1", "voyager-2"]
    }
  };
  var LOC2ZONE = { moon: "moon", mars: "mars", deepspace: "deep" };

  /* which stylised model to draw (a representation, not an exact replica) */
  var CRAFT = {
    spirit: "mer", opportunity: "mer", sojourner: "sojourner",
    phoenix: "phoenix", insight: "insight", ingenuity: "phoenix", /* placeholder: no helicopter model yet */
    "surveyor-1": "surveyor", "surveyor-3": "surveyor", "surveyor-5": "surveyor", "surveyor-6": "surveyor", "surveyor-7": "surveyor",
    "apollo-lm": "lm",
    "pioneer-10": "pioneer", "pioneer-11": "pioneer", "voyager-1": "voyager", "voyager-2": "voyager"
  };
  var ACCENT = {
    "apollo-lm": 0xffc94a, "surveyor-1": 0x7cc7ff, "surveyor-3": 0xff7bb0, "surveyor-5": 0x7bffb3, "surveyor-6": 0xffa04a, "surveyor-7": 0xc29bff,
    sojourner: 0xffe066, spirit: 0xff6f61, opportunity: 0x4fe0ff, phoenix: 0xb8f2ff, insight: 0x9affc4, ingenuity: 0xffb347,
    "pioneer-10": 0xffd27a, "pioneer-11": 0xff9ad5, "voyager-1": 0x7cf2ff, "voyager-2": 0x9fb3ff
  };

  function byId(id) { for (var i = 0; i < MS.length; i++) if (MS[i].id === id) return MS[i]; return null; }

  function build() {
    var assigned = {}, zoneLists = { moon: [], mars: [], deep: [] };
    Object.keys(ZONES).forEach(function (z) {
      ZONES[z].order.forEach(function (id) {
        var m = byId(id);
        if (m && !assigned[id]) { assigned[id] = z; zoneLists[z].push(id); }
      });
    });
    MS.forEach(function (m) {            /* anything the lists missed still appears */
      if (assigned[m.id]) return;
      var z = LOC2ZONE[m.location] || "deep";
      assigned[m.id] = z; zoneLists[z].push(m.id);
    });
    var out = [], n = 0;
    ["moon", "mars", "deep"].forEach(function (z) {
      zoneLists[z].forEach(function (id, i) {
        var m = byId(id);
        out.push({ id: id, zone: z, index: i, n: ++n, record: m, craft: CRAFT[id] || (z === "deep" ? "pioneer" : "surveyor"), accent: ACCENT[id] || 0xffffff });
      });
    });
    return out;
  }

  var list = build();
  window.SE_DATA = {
    zones: ZONES,
    zoneIds: ["moon", "mars", "deep"],
    missions: list,
    total: list.length,
    get: function (id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; },
    inZone: function (z) { return list.filter(function (x) { return x.zone === z; }); },
    archiveUrl: function (id) { return "mission.html?id=" + encodeURIComponent(id); },
    /* integrity check used by the in-page test and the QA script */
    check: function () {
      var ids = {}, problems = [];
      MS.forEach(function (m) { ids[m.id] = 0; });
      list.forEach(function (x) { if (ids[x.id] === undefined) problems.push("unknown id " + x.id); else ids[x.id]++; });
      Object.keys(ids).forEach(function (id) { if (ids[id] !== 1) problems.push(id + " appears " + ids[id] + " times"); });
      return { ok: problems.length === 0, problems: problems, archive: MS.length, game: list.length };
    }
  };
})();
