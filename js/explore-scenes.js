/* Extra Explore scenes for the 12 missions beyond Spirit, Opportunity and Phoenix.
   Scene art is illustrative. Mission facts come from MISSIONS in data.js; the
   hotspot text below is general description only. Sources use each mission's
   existing primary source link. Positions are NOT real map positions. */
(function () {
  "use strict";
  var ILLUS = "Illustrative scene, not a NASA photograph. Hotspot positions are artistic, not measured.";
  function H(id, name, x, y, text, why, status, note) {
    return { id: id, name: name, x: x, y: y, text: text, why: why, status: status, note: note };
  }
  var NOTE_S = "Placement in this scene is illustrative. No surveyed layout is shown.";
  var GAP = "The present physical condition has not been confirmed by a source in this project.";
  var X = {};

  X.sojourner = { env: "mars", craft: "rover", scale: 0.62, landing: "none", credit: ILLUS, hotspots: [
    H("rover", "Sojourner rover", 50, 70, "Sojourner was the small six-wheeled rover carried by the Mars Pathfinder lander, landing in Ares Vallis in 1997.", "It showed that a small, low-cost rover could drive on Mars and do real science.", "NASA's record gives September 27, 1997 as the last full data session. " + GAP, NOTE_S),
    H("apxs", "APXS instrument", 56, 64, "The alpha proton X-ray spectrometer was pressed against rocks and soil to read their chemical makeup.", "Chemistry of rocks and soil helps scientists judge how they formed.", "Part of the rover hardware. " + GAP, "Where the instrument sits on this drawing is approximate."),
    H("lander", "Pathfinder lander", 28, 62, "The Pathfinder lander acted as the base station that relayed the rover's data to Earth.", "Without the lander relay, the rover could not have reported its results.", "Lander and rover were left on Mars. " + GAP, "The distance between lander and rover here is not to scale.")
  ] };

  X.insight = { env: "mars", craft: "lander", landing: "none", credit: ILLUS, hotspots: [
    H("lander", "InSight lander", 50, 66, "InSight was a stationary lander that studied the deep interior of Mars from Elysium Planitia.", "Its goal was the planet's inner structure, not roaming the surface.", "NASA declared the mission over on December 21, 2022. " + GAP, NOTE_S),
    H("seis", "SEIS seismometer", 36, 74, "SEIS was placed on the ground to listen for marsquakes.", "Quake waves reveal what lies beneath the surface, such as crust, mantle and core.", "Left on the surface. " + GAP, "The exact placement relative to the lander is not shown here."),
    H("mole", "HP3 heat probe", 64, 74, "HP3 carried a self-hammering probe, the mole, meant to burrow down and measure heat flow.", "Heat flow would show how warm the planet's interior is.", "NASA reported that the mole could not burrow as planned. " + GAP, "Why the soil resisted is described in NASA reports; this scene does not model it."),
    H("panels", "Solar panels", 50, 54, "InSight ran on two round solar arrays.", "Dust building up on the panels reduced power over time.", "Dust and power loss are given as the reason operations ended. " + GAP, "Dust levels shown are not measured.")
  ] };

  function surv(id, siteName, items) { X[id] = { env: "moon", craft: "lander", landing: "none", site: siteName, credit: ILLUS, hotspots: items }; }
  var SN = "Placement in this scene is illustrative. The lander is not drawn at a measured scale.";
  surv("surveyor-1", "Oceanus Procellarum", [
    H("lander", "Surveyor 1 lander", 50, 68, "Surveyor 1 was the first US spacecraft to soft-land on the Moon, in Oceanus Procellarum in 1966.", "It proved a spacecraft could land gently and that the surface could bear its weight.", "It stayed at the landing site after final contact on January 7, 1967. " + GAP, SN),
    H("camera", "Television camera", 50, 56, "A television camera sent back images of the surrounding terrain and of the spacecraft itself.", "The images gave engineers and scientists their first close look at a landing site before crewed missions.", "Part of the lander. " + GAP, "Camera position here is approximate."),
    H("feet", "Landing legs and footpads", 38, 77, "Three legs with footpads cushioned the landing.", "How the legs settled helped engineers judge how firm the soil was.", "Left at the site. " + GAP, "Soil conclusions come from NASA analyses, not from this drawing.")
  ]);
  surv("surveyor-3", "Oceanus Procellarum", [
    H("lander", "Surveyor 3 lander", 50, 68, "Surveyor 3 landed on April 20, 1967 after bouncing twice, then dug trenches and ran bearing tests in the soil.", "NASA concluded the soil could support an Apollo lunar module.", "Last contact was May 4, 1967. Apollo 12 landed about 180 m away in November 1969, and the astronauts removed parts, including the scoop and camera system. The rest of the spacecraft was left at the site. Its present condition is not confirmed.", "This drawing shows the lander as it was in 1967, before parts were removed in 1969."),
    H("scoop", "Surface scoop (returned to Earth)", 62, 64, "A scoop on an extendable arm dug four trenches and made four bearing tests and thirteen impact tests, according to NASA.", "The tests showed the soil behaved like wet sand and was strong enough for a lunar module.", "NASA says the Apollo 12 astronauts recovered the soil scoop in November 1969, so it is no longer at the landing site.", "Arm position in this drawing is approximate and shows the 1967 configuration."),
    H("camera", "Television camera (returned to Earth)", 50, 56, "NASA says the camera sent back 6,326 pictures of the surroundings.", "Images helped engineers plan landings and showed the scoop at work.", "NASA says the Apollo 12 astronauts recovered the camera system, so it is no longer at the landing site.", "This scene does not show the site as it looks today.")
  ]);
  surv("surveyor-5", "Mare Tranquillitatis", [
    H("lander", "Surveyor 5 lander", 50, 68, "Surveyor 5 landed in 1967 in Mare Tranquillitatis.", "It gathered soil data near where Apollo 11 would later land.", "It stayed at the site after final contact on December 17, 1967. " + GAP, SN),
    H("alpha", "Alpha-scattering instrument", 56, 74, "An instrument lowered to the soil measured its chemical makeup.", "It showed the soil was basalt-like, a clue to the Moon's volcanic history.", "Left at the site. " + GAP, "Its position on this drawing is approximate."),
    H("camera", "Television camera", 50, 56, "A camera returned images of the surrounding terrain.", "Images supported landing-site planning.", "Part of the lander. " + GAP, "Camera position is approximate.")
  ]);
  surv("surveyor-6", "Sinus Medii", [
    H("lander", "Surveyor 6 lander", 50, 68, "Surveyor 6 landed in Sinus Medii on November 10, 1967.", "It studied soil and made the first liftoff from the Moon's surface.", "Operations stopped as lunar night began on November 24, 1967. Contact was regained briefly on December 14, 1967, but no useful data came back. NASA gives no later closure date here. It sits about 2.5 m from its first landing spot. " + GAP, SN),
    H("engines", "Landing thrusters", 44, 74, "On November 17, 1967 NASA fired the thrusters for 2.5 seconds. The lander rose about 3 m (10 ft) and set down about 2.5 m (8 ft) west.", "It was the first spacecraft launched from the Moon's surface, and cameras could study its first footprints from a new angle.", "The lander stayed at its second spot. " + GAP, "This scene shows one position; the real craft moved about 2.5 m."),
    H("camera", "Television camera", 50, 56, "The camera imaged the terrain before and after the hop.", "Images of the first landing spot, taken after the hop, helped show the soil's mechanical properties.", "Part of the lander. " + GAP, "Camera position is approximate.")
  ]);
  surv("surveyor-7", "Tycho crater region", [
    H("lander", "Surveyor 7 lander", 50, 68, "Surveyor 7 landed in 1968 near Tycho crater, in lunar highlands.", "It was the last Surveyor and sampled highland material, not mare.", "NASA lists February 21, 1968 as the end of the mission. Operations paused on January 26 for lunar night and resumed on February 12. " + GAP, SN),
    H("arm", "Surface sampler arm", 62, 66, "A scoop arm dug and pushed soil and a rock.", "It showed how the soil differs from the mare sites.", "Left at the site. " + GAP, "Arm shape is simplified."),
    H("camera", "Camera and Earth lasers", 50, 56, "The camera also recorded laser beams aimed at the Moon from Earth.", "It tested pointing a light at a distant spacecraft.", "Part of the lander. " + GAP, "Laser detection is described in secondary sources and has not been checked against a NASA page here. The scene does not show beams.")
  ]);

  X["apollo-lm"] = { env: "moon", craft: "apollo", landing: "none", site: "Six Apollo landing sites", credit: ILLUS + " It shows a generic descent stage, not any single Apollo site.", hotspots: [
    H("descent", "Descent stage", 50, 68, "Each lunar module's lower half carried it to the surface and was left behind when the ascent stage lifted off.", "It acted as the launch platform for the ascent stage.", "Descent stages from the six landings (1969-1972) were left on the Moon. LRO camera images released by NASA and Arizona State University show them at the sites. Their present close-up condition has not been documented here.", "This is a generic drawing, not one specific mission's module."),
    H("legs", "Landing legs", 40, 76, "Four legs supported the module on the surface.", "They kept the vehicle upright on uneven ground.", "Left at each site. " + GAP, "Leg count and shape are simplified."),
    H("alsep", "Experiment packages", 66, 72, "Several Apollo missions left instruments near the module for later study.", "They sent data from the Moon after the astronauts left.", "Some missions left packages and some retroreflectors; the specifics differ by mission. " + GAP, "Distance from the module is not to scale.")
  ] };

  function deep(id, accent, items) { X[id] = { env: "deep", craft: "probe", landing: "none", accent: accent, credit: ILLUS + " The spacecraft is not on any planet's surface.", hotspots: items }; }
  var DN = "Marker positions are artistic, not astronomical charts.";
  function body(n, text, why, status) { return H("body", n + " spacecraft", 50, 55, text, why, status, "Drawing is a simplified silhouette, not an engineering model."); }
  deep("pioneer-10", "#d8a948", [
    body("Pioneer 10", "Pioneer 10 was the first spacecraft to cross the asteroid belt and reach Jupiter.", "It showed a spacecraft could survive the trip and Jupiter's radiation.", "Last telemetry was received April 27, 2002. A last, very faint signal came on January 23, 2003, with no telemetry. Routine contact ended March 31, 1997 and a contact attempt on February 7, 2003 detected nothing. NASA says its power source decayed; the spacecraft is not tracked, but it is expected to keep travelling."),
    H("dish", "High-gain antenna", 50, 47, "The dish pointed at Earth to send data home.", "Its long-range signal was the mission's lifeline.", "Whether the dish still points toward Earth is not confirmed. No signals are being received.", "Not a measurement."),
    H("plaque", "Pioneer plaque", 44, 62, "A plaque shows humans and the position of the Sun in the galaxy.", "It is a message for anyone who might find the spacecraft.", "It is attached to the spacecraft; the spacecraft is no longer being tracked.", "This scene does not reproduce the plaque artwork."),
    H("jupiter", "Jupiter flyby marker", 22, 34, "Pioneer 10 flew past Jupiter in December 1973.", "It gave the first close-up data from the outer Solar System.", "The flyby is a documented event.", DN)
  ]);
  deep("pioneer-11", "#c98a4a", [
    body("Pioneer 11", "Pioneer 11 followed Pioneer 10 to Jupiter and then became the first spacecraft to visit Saturn.", "It sent early data on Jupiter's and Saturn's magnetic fields and rings.", "NASA says the mission ended on September 30, 1995, when the last transmission was received; Earth's motion had carried it out of view of the spacecraft antenna. There have been no communications since. Its present position is not tracked here."),
    H("dish", "High-gain antenna", 50, 47, "The dish pointed at Earth to send data home.", "Without a signal, mission operations ended.", "Its current pointing is not confirmed.", "Not a measurement."),
    H("plaque", "Pioneer plaque", 44, 62, "Like Pioneer 10, it carries a plaque for any finder.", "It is humanity's message in a bottle.", "Attached to the spacecraft; no tracking now.", "This scene does not reproduce the plaque artwork."),
    H("saturn", "Saturn flyby marker", 30, 30, "Pioneer 11 passed Saturn on September 1, 1979.", "It was the first visit to Saturn and showed risks for later missions.", "The flyby is a documented event.", DN)
  ]);
  deep("voyager-1", "#6fa2f2", [
    body("Voyager 1", "Voyager 1 flew past Jupiter and Saturn and is now in interstellar space.", "It is the most distant human-made object NASA tracks and measures space beyond the Sun's influence.", "NASA says Voyager 1 has reached interstellar space and continues its journey. NASA has been switching instruments off to save power, so which ones still work changes. Check NASA for the latest instrument status."),
    H("dish", "High-gain antenna", 50, 47, "A large dish links the spacecraft to Earth.", "Its signal takes many hours to arrive.", "The antenna is how the spacecraft still communicates. Operational status can change; see NASA's status page.", "Not a measurement."),
    H("record", "Golden Record", 57, 62, "A phonograph record carries sounds and images of Earth.", "It is a cultural time capsule.", "Carried on board; its condition in space is unknown.", "The scene does not show the record's contents."),
    H("instr", "Instrument boom", 42, 58, "A boom held a magnetometer and other sensors away from the spacecraft body.", "Instruments like these measured the field and particles of interstellar space.", "Which instruments still work is a matter for NASA's current reports.", "Instrument layout is simplified."),
    H("interstellar", "Interstellar space marker", 82, 30, "NASA says Voyager 1 entered interstellar space in August 2012.", "It marks where the Sun's wind no longer dominates.", "A documented event, not a visible boundary.", DN)
  ]);
  deep("voyager-2", "#8fd0c8", [
    body("Voyager 2", "Voyager 2 visited Jupiter, Saturn, Uranus and Neptune, the only spacecraft to visit Uranus and Neptune.", "Its flybys produced much of what we know of those worlds.", "NASA says Voyager 2 has reached interstellar space and continues its journey. NASA has been switching instruments off to save power, so which ones still work changes. Check NASA for the latest instrument status."),
    H("dish", "High-gain antenna", 50, 47, "A large dish links the spacecraft to Earth.", "Its signal takes many hours to arrive.", "The antenna is how the spacecraft still communicates. Operational status can change; see NASA's status page.", "Not a measurement."),
    H("record", "Golden Record", 57, 62, "A phonograph record carries sounds and images of Earth.", "It is a cultural time capsule.", "Carried on board; its condition in space is unknown.", "The scene does not show the record's contents."),
    H("neptune", "Neptune flyby marker", 22, 34, "Voyager 2 passed Neptune in August 1989.", "It is the only close-up visit ever made there.", "A documented event.", DN),
    H("interstellar", "Interstellar space marker", 82, 30, "NASA says Voyager 2 entered interstellar space in November 2018.", "It marks where the Sun's wind no longer dominates.", "A documented event, not a visible boundary.", DN)
  ]);

  function SRC(id, url, label, perHotspot) {
    X[id].src = { url: url, label: label };
    (perHotspot || []).forEach(function (p) { X[id].hotspots.forEach(function (h) { if (h.id === p[0]) h.src = { url: p[1], label: p[2] }; }); });
  }
  var VOY = "https://science.nasa.gov/mission/voyager/where-are-voyager-1-and-voyager-2-now";
  var PNS = "https://science.nasa.gov/missions/pioneer/pioneer-10-sends-last-signal/";
  SRC("surveyor-3", "https://science.nasa.gov/mission/surveyor-3", "NASA Science: Surveyor 3");
  SRC("surveyor-6", "https://science.nasa.gov/mission/surveyor-6/", "NASA Science: Surveyor 6");
  SRC("surveyor-7", "https://science.nasa.gov/mission/surveyor-7", "NASA Science: Surveyor 7");
  SRC("apollo-lm", "https://www.lroc.asu.edu/images/157", "LROC (Arizona State University): first look at the Apollo landing sites", [["legs", "https://science.nasa.gov/resource/apollo-11-landing-site", "NASA Science: Apollo 11 landing site (LRO image)"]]);
  SRC("pioneer-10", "https://science.nasa.gov/mission/pioneer-10", "NASA Science: Pioneer 10", [["body", PNS, "NASA: Pioneer 10 sends last signal"]]);
  SRC("pioneer-11", PNS, "NASA: Pioneer 10 sends last signal (also states Pioneer 11's end)");
  SRC("voyager-1", VOY, "NASA Science: Where are Voyager 1 and 2 now?");
  SRC("voyager-2", VOY, "NASA Science: Where are Voyager 1 and 2 now?");

  function rnd(seed) { var s = 0; for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  function stars(id, n) { var r = rnd(id), o = ""; for (var i = 0; i < n; i++) o += '<circle cx="' + (r() * 1200).toFixed(0) + '" cy="' + (r() * 420).toFixed(0) + '" r="' + (0.5 + r() * 1.3).toFixed(1) + '" fill="#f2f4f9" opacity="' + (0.3 + r() * 0.6).toFixed(2) + '"/>'; return o; }

  window.EXPLORE_ENV = function (id, sc) {
    var h = '<svg viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice" class="explore-envsvg" aria-hidden="true">';
    if (sc.env === "moon") {
      var tint = id === "surveyor-7" ? "#8d8f98" : (id === "apollo-lm" ? "#74767e" : "#5f6068");
      h += '<rect width="1200" height="720" fill="#04050a"/><g class="explore-layer" data-depth="4">' + stars(id, 90) + '</g>' +
        '<g class="explore-layer" data-depth="6"><circle cx="930" cy="130" r="34" fill="#3f7ce0" opacity="0.75"/><circle cx="944" cy="122" r="34" fill="#04050a" opacity="0.35"/></g>' +
        '<path class="explore-layer" data-depth="12" d="M0,360 C160,330 260,350 420,326 C560,306 700,350 860,322 C1000,300 1100,330 1200,312 L1200,720 L0,720Z" fill="#2c2d34"/>' +
        '<path class="explore-layer" data-depth="20" d="M0,420 C140,396 300,432 460,404 C640,376 780,430 960,400 C1060,386 1140,404 1200,396 L1200,720 L0,720Z" fill="#40414a"/>' +
        '<path class="explore-layer" data-depth="28" d="M0,480 C180,456 320,500 520,470 C720,440 900,500 1200,462 L1200,720 L0,720Z" fill="' + tint + '"/>' +
        '<g class="explore-layer" data-depth="34" fill="#25262c" opacity="0.6"><ellipse cx="220" cy="600" rx="120" ry="18"/><ellipse cx="880" cy="640" rx="170" ry="22"/><ellipse cx="560" cy="676" rx="90" ry="12"/></g>';
    } else {
      h += '<defs><radialGradient id="dsglow" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="' + sc.accent + '" stop-opacity="0.14"/><stop offset="1" stop-color="#02030a" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="1200" height="720" fill="#02030a"/><rect width="1200" height="720" fill="url(#dsglow)"/>' +
        '<g class="explore-layer" data-depth="4">' + stars(id, 140).replace(/cy="(\d+)"/g, function (m, y) { return 'cy="' + (Number(y) * 1.7).toFixed(0) + '"'; }) + '</g>' +
        '<g class="explore-layer" data-depth="14" fill="none" stroke="' + sc.accent + '" stroke-width="1.6" stroke-dasharray="6 8" opacity="0.5"><path d="M130,260 C380,160 640,170 880,230 S1100,230 1180,190"/></g>' +
        '<g class="explore-layer" data-depth="10"><circle cx="150" cy="260" r="5" fill="' + sc.accent + '"/><circle cx="1000" cy="215" r="5" fill="' + sc.accent + '"/></g>' +
        '<g class="explore-layer" data-depth="22"><circle cx="150" cy="560" r="26" fill="#ffd27a" opacity="0.85"/></g>';
    }
    return h + "</svg>";
  };

  window.EXPLORE_CRAFT = function (kind) {
    var s = '<svg viewBox="0 0 140 90" class="explore-svg-craft" aria-hidden="true">', st = ' fill="#16100c" stroke="#e8c9a0" stroke-width="1.5"';
    if (kind === "apollo") return s + '<polygon points="40,34 100,34 112,56 28,56"' + st + '/><rect x="34" y="56" width="72" height="8"' + st + '/><g stroke="#d7c4a0" stroke-width="2"><line x1="40" y1="64" x2="14" y2="82"/><line x1="100" y1="64" x2="126" y2="82"/><line x1="58" y1="64" x2="46" y2="84"/><line x1="82" y1="64" x2="94" y2="84"/></g><g fill="#1c1410" stroke="#e8c9a0"><circle cx="14" cy="83" r="4"/><circle cx="126" cy="83" r="4"/></g></svg>';
    if (kind === "probe") return s + '<ellipse cx="70" cy="22" rx="36" ry="12"' + st + '/><polygon points="58,32 82,32 88,56 52,56"' + st + '/><line x1="88" y1="44" x2="128" y2="38" stroke="#d7c4a0" stroke-width="2"/><circle cx="130" cy="38" r="3" fill="#c9d7f2"/><line x1="52" y1="48" x2="14" y2="56" stroke="#d7c4a0" stroke-width="2"/><rect x="40" y="52" width="14" height="8" fill="#3d5f96" opacity="0.8"/><circle cx="70" cy="44" r="4" fill="#f2f4f9" opacity="0.7"/></svg>';
    return null;
  };
  window.EXPLORE_EXTRA = X;
})();
