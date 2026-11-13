/* ============================================================
   "Where is it now?" maps (SVG, no libraries)
   - Mars: full equirectangular grid, all Mars sites, current lit
   - Moon: near-side window, all Moon sites, current lit
   - Deep space: log-distance ruler with planet orbits
   Positions are plotted from approximate landing-region
   coordinates and are labelled as approximate.
   ============================================================ */
var MissionMaps = (function () {
  "use strict";

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  function gridMap(mission) {
    var body = mission.body;
    var W = 640, H = body === "mars" ? 320 : 400;
    var lonMin = body === "mars" ? 0 : -90, lonMax = body === "mars" ? 360 : 90;
    var latMin = -90, latMax = 90;
    function x(lon) { return ((lon - lonMin) / (lonMax - lonMin)) * W; }
    function y(lat) { return ((latMax - lat) / (latMax - latMin)) * H; }
    var step = 30, out = "";
    for (var lo = lonMin; lo <= lonMax; lo += step) {
      out += '<line x1="' + x(lo) + '" y1="0" x2="' + x(lo) + '" y2="' + H + '" class="mg"/>';
      out += '<text x="' + (x(lo) + 3) + '" y="' + (H - 4) + '" class="mt">' + (body === "mars" ? lo + "\u00B0E" : (lo < 0 ? Math.abs(lo) + "\u00B0W" : lo + "\u00B0E")) + '</text>';
    }
    for (var la = latMin; la <= latMax; la += step) {
      out += '<line x1="0" y1="' + y(la) + '" x2="' + W + '" y2="' + y(la) + '" class="mg' + (la === 0 ? " eq" : "") + '"/>';
      out += '<text x="4" y="' + (y(la) - 3) + '" class="mt">' + (la < 0 ? Math.abs(la) + "\u00B0S" : la + "\u00B0N") + '</text>';
    }
    MISSIONS.forEach(function (m) {
      if (m.body !== body || !m.sites) return;
      var current = m.id === mission.id;
      m.sites.forEach(function (s) {
        var cx = x(s.lon), cy = y(s.lat);
        var label = m.id === "apollo-lm" ? s.label : m.name;
        if (current) {
          out += '<circle cx="' + cx + '" cy="' + cy + '" r="14" class="ring"/>';
        }
        out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (current ? 5 : 3) + '" class="' + (current ? "pin-now" : "pin-other") + '"/>';
        var left = cx > W - 110;
        out += '<text x="' + (left ? cx - 8 : cx + 8) + '" y="' + (cy - 7) + '"' + (left ? ' text-anchor="end"' : '') + ' class="' + (current ? "lbl-now" : "lbl-other") + '">' + esc(label) + '</text>';
      });
    });
    var title = body === "mars" ? "Mars" : "Moon (near side)";
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Map of ' + title + ' showing the approximate location of ' + esc(mission.name) + '" class="locmap">' + out + '</svg>';
  }

  var PLANETS = [
    { n: "Jupiter", au: 5.2 }, { n: "Saturn", au: 9.6 }, { n: "Uranus", au: 19.2 },
    { n: "Neptune", au: 30.1 }, { n: "Pluto", au: 39.5 }
  ];
  /* Documented reference distances (AU) */
  var HELIOPAUSE = { v1: 121.6, v2: 119 };

  function deepMap(mission) {
    var W = 640, H = 170, max = 200, pad = 24;
    function x(au) { return pad + (Math.log(au) / Math.log(max)) * (W - pad * 2); }
    var out = '<line x1="' + pad + '" y1="90" x2="' + (W - pad) + '" y2="90" class="mg eq"/>';
    out += '<circle cx="' + x(1) + '" cy="90" r="5" class="pin-other"/><text x="' + x(1) + '" y="112" class="lbl-other" text-anchor="middle">Earth</text>';
    PLANETS.forEach(function (p, i) {
      out += '<circle cx="' + x(p.au) + '" cy="90" r="3" class="pin-other"/>';
      out += '<text x="' + x(p.au) + '" y="' + (i % 2 ? 62 : 112) + '" class="lbl-other" text-anchor="middle">' + p.n + '</text>';
    });
    [1, 10, 100].forEach(function (t) {
      out += '<text x="' + x(t) + '" y="150" class="mt" text-anchor="middle">' + t + ' AU</text><line x1="' + x(t) + '" y1="84" x2="' + x(t) + '" y2="96" class="mg"/>';
    });
    var marks = [];
    if (mission.id === "pioneer-10") marks.push({ au: 80, t: "Last signal (2003)" });
    if (mission.id === "pioneer-11") marks.push({ au: 44, t: "Last signal (1995)" });
    if (mission.id === "voyager-1") marks.push({ au: HELIOPAUSE.v1, t: "Interstellar space (2012)" });
    if (mission.id === "voyager-2") marks.push({ au: HELIOPAUSE.v2, t: "Interstellar space (2018)" });
    marks.forEach(function (m) {
      out += '<circle cx="' + x(m.au) + '" cy="90" r="6" class="pin-now"/><circle cx="' + x(m.au) + '" cy="90" r="14" class="ring"/>';
      out += '<text x="' + x(m.au) + '" y="42" class="lbl-now" text-anchor="middle">' + m.t + '</text><line x1="' + x(m.au) + '" y1="48" x2="' + x(m.au) + '" y2="80" class="mg"/>';
    });
    if (mission.status === "traveling") out += '<text x="' + (W - pad) + '" y="30" class="lbl-now" text-anchor="end">Still traveling \u2192</text>';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Distance ruler from the Sun on a logarithmic scale, showing planet orbits and a key milestone for ' + esc(mission.name) + '" class="locmap">' + out + '</svg>';
  }

  function render(mission) {
    if (mission.body === "deep") {
      return deepMap(mission) + '<p class="map-note">Distance from the Sun on a logarithmic scale (1 AU = Earth\u2019s distance). Planet orbit distances are averages.</p>';
    }
    if (mission.sites) {
      return gridMap(mission) + '<p class="map-note">Approximate landing region (about \u00B10.5\u00B0). Other archived ' + (mission.body === "mars" ? "Mars" : "Moon") + ' hardware is shown dimmed.</p>';
    }
    return "";
  }
  return { render: render };
})();
