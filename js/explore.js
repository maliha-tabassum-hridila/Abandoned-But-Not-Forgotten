/* ============================================================
   Beyond the Landing — interactive Mars scene
   Uses MISSIONS from data.js. Hotspot positions are illustrative.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LANDING_MS = 7000;

  /* Scene extras only: landing style, hotspot layout, optional NASA photo.
     Facts are copied from the existing mission record, not invented here. */
  var SCENES = {
    spirit: {
      landing: "airbag",
      photo: {
        src: "https://photojournal.jpl.nasa.gov/jpeg/PIA05102.jpg",
        credit: "Optional NASA Photojournal image PIA05102 (Spirit / Gusev). Credit: NASA/JPL/Cornell. Used as atmosphere only — not a map of Spirit's last position.",
        catalog: "https://photojournal.jpl.nasa.gov/catalog/PIA05102"
      },
      hotspots: [
        {
          id: "rover",
          name: "Spirit rover",
          x: 48, y: 68,
          text: "Spirit is a six-wheeled Mars Exploration Rover that landed in Gusev Crater.",
          why: "It was sent to study rocks and soil for clues of a wetter Martian past.",
          status: "NASA describes the rover as marooned in soft soil at its last known location. Current mechanical condition is not documented in detail.",
          note: "Placement in this scene is illustrative.",
          challengeTag: "rover"
        },
        {
          id: "mast",
          name: "Camera mast",
          x: 52, y: 58,
          text: "The pancam sat on a mast so Spirit could look around the landing site and hills.",
          why: "Those views helped scientists choose rocks to study and map Gusev Crater.",
          status: "The cameras are part of the rover hardware NASA accounts as remaining at the last known site. Their present condition is unknown.",
          note: "Mast position on this silhouette is illustrative.",
          challengeTag: "observe"
        },
        {
          id: "wheels",
          name: "Wheels and traces",
          x: 40, y: 76,
          text: "Spirit drove about 4.8 miles (7.73 km). A dragging wheel later uncovered silica-rich soil.",
          why: "The silica find is evidence of past hot springs or steam vents.",
          status: "Tracks and disturbed soil may remain, but this scene does not show a surveyed track map.",
          note: "Track marks here are decorative, not measured paths.",
          challengeTag: "wheels"
        },
        {
          id: "panels",
          name: "Solar panels",
          x: 58, y: 72,
          text: "Spirit ran on solar panels and batteries. After it became stuck, winter sunlight was too weak.",
          why: "Power, not a recall to Earth, ended surface operations.",
          status: "Last communication: March 22, 2010. NASA ended contact attempts on May 25, 2011.",
          note: "Dust and tilt in this drawing are not a measured winter portrait.",
          challengeTag: "power"
        }
      ],
      challenge: {
        prompt: "Find the object that helped the rover observe its surroundings.",
        answer: "mast",
        hint: "Look for the tall mast above the rover body, not the wheels."
      }
    },
    opportunity: {
      landing: "airbag",
      photo: {
        src: "https://photojournal.jpl.nasa.gov/jpeg/PIA05108.jpg",
        credit: "Optional NASA Photojournal image PIA05108 (Opportunity / Meridiani). Credit: NASA/JPL/Cornell. Atmospheric background only — not Perseverance Valley as surveyed today.",
        catalog: "https://photojournal.jpl.nasa.gov/catalog/PIA05108"
      },
      hotspots: [
        {
          id: "rover",
          name: "Opportunity rover",
          x: 50, y: 66,
          text: "Opportunity is Spirit's twin. It landed in Meridiani Planum and later reached Endeavour Crater.",
          why: "It found mineral evidence that Mars may once have been able to sustain microbial life.",
          status: "NASA's mission account places the rover at Perseverance Valley. NASA has not retrieved it.",
          note: "Scene placement is illustrative.",
          challengeTag: "rover"
        },
        {
          id: "mast",
          name: "Camera mast",
          x: 54, y: 56,
          text: "Opportunity's cameras let it inspect layered bedrock, hematite 'blueberries,' and distant crater rims.",
          why: "Seeing the landscape was how the team chose the next drive and science target.",
          status: "The mast is part of the rover that remains at the last known location. Present condition is unknown.",
          note: "Silhouette only.",
          challengeTag: "observe"
        },
        {
          id: "wheels",
          name: "Wheels and odometer",
          x: 38, y: 78,
          text: "When NASA declared the mission complete, Opportunity had driven 28.06 miles (45.16 km).",
          why: "The long traverse sampled many rock layers, not just one crater.",
          status: "Wheel tracks are not mapped in this visualization.",
          note: "Not a current off-Earth distance record as of October 2026 NASA Science wording.",
          challengeTag: "wheels"
        },
        {
          id: "panels",
          name: "Solar panels",
          x: 62, y: 70,
          text: "A Mars-wide dust storm in June 2018 reduced sunlight reaching the panels.",
          why: "That power loss ended communication. Official mission closure came later, on February 13, 2019.",
          status: "Last communication: June 10, 2018. Panel dust in this drawing is illustrative.",
          note: "We do not know the panels' exact current appearance.",
          challengeTag: "power"
        }
      ],
      challenge: {
        prompt: "Find the object that helped the rover observe its surroundings.",
        answer: "mast",
        hint: "Choose the camera mast, not the solar panels."
      }
    },
    phoenix: {
      landing: "powered",
      photo: null,
      hotspots: [
        {
          id: "lander",
          name: "Phoenix lander",
          x: 50, y: 70,
          text: "Phoenix was a stationary polar lander, not a rover. It used retro-rockets, not airbags.",
          why: "It was sent to study icy soil near the Martian arctic.",
          status: "The archive records it at Vastitas Borealis. Polar winters make its present appearance uncertain.",
          note: "This scene is an illustrative polar plain, not a verified site photo.",
          challengeTag: "lander"
        },
        {
          id: "arm",
          name: "Robotic arm",
          x: 38, y: 64,
          text: "The arm dug trenches and delivered samples to onboard labs.",
          why: "It exposed material that NASA confirmed was water ice just beneath the surface.",
          status: "Trenches may still exist, but this drawing does not locate them.",
          note: "Arm pose is illustrative.",
          challengeTag: "observe"
        },
        {
          id: "panels",
          name: "Solar arrays",
          x: 64, y: 68,
          text: "Phoenix was solar-powered. Polar winter darkness was expected to end the mission.",
          why: "The lander was designed for one Martian summer of work.",
          status: "Last communication in this archive: November 2, 2008. Later winters brought no response.",
          note: "Phoenix facts on this page follow the archive record and were not re-checked in the 2026 Spirit/Opportunity pass.",
          challengeTag: "power"
        }
      ],
      challenge: {
        prompt: "Find the object that dug into the icy soil.",
        answer: "arm",
        hint: "Look for the robotic arm reaching toward the ground, not the solar arrays."
      }
    }
  };

  var EX = window.EXPLORE_EXTRA || {};
  Object.keys(EX).forEach(function (k) {
    var sc = EX[k];
    if (!sc.challenge && sc.hotspots.length) sc.challenge = { prompt: "Find the " + sc.hotspots[0].name + ".", answer: sc.hotspots[0].id, hint: "Look for the main spacecraft body first." };
    SCENES[k] = sc;
  });
  window.EXPLORE_SCENES = SCENES; /* shared read-only with the 3D game (game.html) */
  if (!document.getElementById("explore-stage")) return; /* data-only load on game.html */
  function sceneIds() {
    return MISSIONS.map(function (m) { return m.id; }).filter(function (id) { return SCENES[id]; });
  }

  var missionId = "spirit";
  var ready = false;
  var landingTimer = null;
  var challengeOn = false;
  var photoOk = false;
  var lastPanelFocus = null;
  var lastOverlayFocus = null;

  var intro = document.getElementById("explore-intro");
  var stage = document.getElementById("explore-stage");
  var pills = document.getElementById("explore-pills");
  var photo = document.getElementById("explore-photo");
  var hotspotsEl = document.getElementById("explore-hotspots");
  var craftEl = document.getElementById("explore-craft");
  var entryEl = document.getElementById("explore-entry");
  var panel = document.getElementById("explore-panel");
  var overlay = document.getElementById("explore-overlay");
  var statusEl = document.getElementById("explore-challenge-status");
  var touchdown = document.getElementById("explore-touchdown");
  var skipBtn = document.getElementById("explore-skip");
  var replayBtn = document.getElementById("explore-replay");

  function mission() {
    return getMissionById(missionId);
  }

  function scene() {
    return SCENES[missionId];
  }

  function sourceLink(m) {
    var src = typeof missionPrimarySource === "function" ? missionPrimarySource(m) : null;
    if (!src || !src.url) return "";
    return '<a href="' + src.url + '" target="_blank" rel="noopener">' + src.label + "</a>";
  }

  function srcHtml(h) {
    var s = h.src || (scene() && scene().src);
    if (s && s.url) return 'Source: <a href="' + s.url + '" target="_blank" rel="noopener">' + s.label + "</a>";
    return "NASA source: " + sourceLink(mission());
  }

  function roverSVG() {
    return '<svg viewBox="0 0 140 90" class="explore-svg-craft" aria-hidden="true">' +
      '<ellipse cx="70" cy="82" rx="48" ry="6" fill="#1a0c08" opacity="0.45"/>' +
      '<rect x="28" y="28" width="78" height="22" rx="3" fill="#1c1410" stroke="#e8c9a0" stroke-width="1.6"/>' +
      '<rect x="32" y="24" width="34" height="8" fill="#4a6ea8" opacity="0.7"/>' +
      '<rect x="70" y="24" width="32" height="8" fill="#4a6ea8" opacity="0.55"/>' +
      '<rect x="54" y="10" width="18" height="18" fill="#16100c" stroke="#e8c9a0" stroke-width="1.4"/>' +
      '<line x1="63" y1="10" x2="63" y2="-2" stroke="#d7c4a0" stroke-width="1.6"/>' +
      '<circle cx="63" cy="-6" r="4" fill="#c9d7f2" stroke="#f2f4f9" stroke-width="0.8"/>' +
      '<line x1="106" y1="32" x2="128" y2="18" stroke="#d7c4a0" stroke-width="1.5"/>' +
      '<circle cx="130" cy="16" r="3" fill="none" stroke="#d7c4a0"/>' +
      '<g fill="#120c08" stroke="#e8c9a0" stroke-width="1.4">' +
      '<circle cx="38" cy="64" r="10"/><circle cx="62" cy="68" r="8"/><circle cx="86" cy="64" r="10"/>' +
      '<circle cx="38" cy="64" r="4" fill="#3a2418"/><circle cx="86" cy="64" r="4" fill="#3a2418"/>' +
      "</g></svg>";
  }

  function landerSVG() {
    return '<svg viewBox="0 0 140 90" class="explore-svg-craft" aria-hidden="true">' +
      '<ellipse cx="70" cy="82" rx="42" ry="6" fill="#1a0c08" opacity="0.4"/>' +
      '<rect x="14" y="34" width="36" height="10" fill="#3d5f96" opacity="0.75"/>' +
      '<rect x="90" y="34" width="36" height="10" fill="#3d5f96" opacity="0.75"/>' +
      '<polygon points="70,12 96,40 44,40" fill="#1c1410" stroke="#e8c9a0" stroke-width="1.5"/>' +
      '<rect x="48" y="40" width="44" height="14" fill="#16100c" stroke="#e8c9a0"/>' +
      '<line x1="48" y1="54" x2="22" y2="78" stroke="#d7c4a0" stroke-width="2"/>' +
      '<line x1="92" y1="54" x2="118" y2="78" stroke="#d7c4a0" stroke-width="2"/>' +
      '<line x1="70" y1="54" x2="70" y2="80" stroke="#d7c4a0" stroke-width="2"/>' +
      '<circle cx="22" cy="80" r="4" fill="#1c1410" stroke="#e8c9a0"/>' +
      '<circle cx="118" cy="80" r="4" fill="#1c1410" stroke="#e8c9a0"/>' +
      '<path d="M48,46 C28,50 18,62 16,74" fill="none" stroke="#c9d7f2" stroke-width="2"/>' +
      "</svg>";
  }

  function entrySVG(kind) {
    if (kind === "powered") {
      return '<svg viewBox="0 0 80 110" class="explore-svg-entry" aria-hidden="true">' +
        '<path d="M8,28 Q40,-8 72,28 Z" fill="#f2f4f9" opacity="0.2" stroke="#f2f4f9"/>' +
        '<line x1="18" y1="28" x2="32" y2="62" stroke="#f2f4f9"/>' +
        '<line x1="62" y1="28" x2="48" y2="62" stroke="#f2f4f9"/>' +
        '<polygon points="40,58 54,86 26,86" fill="#1c1410" stroke="#e8c9a0"/>' +
        "</svg>";
    }
    return '<svg viewBox="0 0 80 120" class="explore-svg-entry" aria-hidden="true">' +
      '<path d="M6,26 Q40,-12 74,26 Z" fill="#f2f4f9" opacity="0.22" stroke="#f2f4f9"/>' +
      '<line x1="16" y1="26" x2="32" y2="70" stroke="#f2f4f9"/>' +
      '<line x1="64" y1="26" x2="48" y2="70" stroke="#f2f4f9"/>' +
      '<ellipse cx="40" cy="86" rx="16" ry="12" fill="none" stroke="#e8c9a0" stroke-dasharray="4 3"/>' +
      '<rect x="30" y="78" width="20" height="12" fill="#1c1410" stroke="#e8c9a0"/>' +
      "</svg>";
  }

  function buildPills() {
    pills.innerHTML = sceneIds().map(function (id) {
      var m = getMissionById(id);
      if (!m) return "";
      var on = id === missionId;
      return '<button type="button" class="pill" data-id="' + id + '" aria-pressed="' + String(on) + '">' + m.name + "</button>";
    }).join("");
    var sel = document.getElementById("stage-mission");
    if (sel) {
      sel.innerHTML = sceneIds().map(function (id) {
        var m = getMissionById(id);
        return '<option value="' + id + '"' + (id === missionId ? " selected" : "") + ">" + m.name + "</option>";
      }).join("");
    }
  }

  function setMission(id) {
    if (!SCENES[id] || !getMissionById(id)) return;
    missionId = id;
    closePanel();
    closeOverlay();
    challengeOn = false;
    statusEl.textContent = "";
    buildPills();
    renderScene();
    if (!stage.hidden) {
      startLanding(true);
    }
  }

  function renderScene() {
    var m = mission();
    var sc = scene();
    document.getElementById("explore-credit").textContent =
      sc.photo ? "Trying NASA Photojournal background… designed landscape used if the image does not load." : "Designed landscape (no site photograph is bundled). Hotspots are illustrative.";
    photo.hidden = true;
    photo.removeAttribute("src");
    photoOk = false;
    if (sc.photo) {
      photo.alt = "NASA Mars surface photograph used as an atmospheric background, not a verified last-known-position map.";
      photo.onload = function () {
        photoOk = true;
        photo.hidden = false;
        document.getElementById("explore-credit").innerHTML =
          sc.photo.credit + ' <a href="' + sc.photo.catalog + '" target="_blank" rel="noopener">Photojournal catalog</a>.';
      };
      photo.onerror = function () {
        photo.hidden = true;
        photo.removeAttribute("src");
        photo.alt = "";
        photoOk = false;
        document.getElementById("explore-credit").textContent =
          "NASA photograph did not load. The designed landscape is the working scene. Facts still come from the mission archive.";
      };
      photo.src = sc.photo.src;
    }
    var sceneBox = document.getElementById("explore-scene");
    sceneBox.classList.toggle("is-polar", missionId === "phoenix");
    var env = sc.env || "mars";
    sceneBox.setAttribute("data-env", env);
    var envEl = document.getElementById("explore-env");
    if (!envEl) { envEl = document.createElement("div"); envEl.id = "explore-env"; envEl.className = "explore-env"; envEl.setAttribute("aria-hidden", "true"); sceneBox.insertBefore(envEl, sceneBox.firstChild); }
    envEl.innerHTML = env !== "mars" && window.EXPLORE_ENV ? window.EXPLORE_ENV(missionId, sc) : "";
    var customCraft = window.EXPLORE_CRAFT ? window.EXPLORE_CRAFT(sc.craft) : null;
    craftEl.innerHTML = customCraft || ((sc.craft === "rover" || (!sc.craft && sc.landing !== "powered")) ? roverSVG() : landerSVG());
    craftEl.style.width = sc.scale ? Math.round(210 * sc.scale) + "px" : "";
    entryEl.innerHTML = sc.landing === "none" ? "" : entrySVG(sc.landing);
    touchdown.textContent = env === "mars" ? "Touchdown. A new chapter begins." : (env === "moon" ? "Lunar surface scene. Illustrative, not to scale." : "Deep space. This spacecraft is not on a surface.");
    if (sc.credit) document.getElementById("explore-credit").textContent = sc.credit;
    tourEnd();
    entryEl.className = "explore-entry landing-" + sc.landing;
    hotspotsEl.innerHTML = sc.hotspots.map(function (h) {
      return '<button type="button" class="explore-hotspot" data-id="' + h.id + '" style="left:' + h.x + "%;top:" + h.y + '%" aria-label="' + h.name + '">' +
        '<span class="explore-hotspot-dot" aria-hidden="true"></span></button>';
    }).join("");
    document.getElementById("explore-mission-link").href = "mission.html?id=" + m.id;
    document.getElementById("explore-mission-link").textContent = "Read the " + m.name + " mission story";
    setHotspotEnabled(ready);
  }

  function setHotspotEnabled(on) {
    hotspotsEl.querySelectorAll(".explore-hotspot").forEach(function (btn) {
      btn.tabIndex = on ? 0 : -1;
    });
  }

  function markHotspot(id) {
    hotspotsEl.querySelectorAll(".explore-hotspot").forEach(function (btn) {
      var on = btn.getAttribute("data-id") === id;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  function openPanel(hotspot) {
    lastPanelFocus = document.activeElement;
    markHotspot(hotspot.id);
    document.getElementById("explore-panel-title").textContent = hotspot.name;
    document.getElementById("explore-panel-text").textContent = hotspot.text;
    document.getElementById("explore-panel-why").textContent = hotspot.why;
    document.getElementById("explore-panel-status").textContent = hotspot.status;
    document.getElementById("explore-panel-note").textContent = hotspot.note;
    document.getElementById("explore-panel-source").innerHTML = srcHtml(hotspot) + ' &middot; <a href="mission.html?id=' + mission().id + '">Full mission record</a>';
    var lbl = panel.querySelector(".explore-panel-top > :first-child");
    if (lbl && lbl.id !== "explore-panel-close") lbl.textContent = (scene().env || "mars") === "deep" ? "SPACECRAFT FILE" : "SURFACE FILE";
    panel.hidden = false;
    panel.classList.add("is-open");
    document.getElementById("explore-panel-close").focus();
    if (challengeOn) scoreChallenge(hotspot.id);
  }

  function closePanel() {
    if (panel.hidden) return;
    panel.hidden = true;
    panel.classList.remove("is-open");
    markHotspot(null);
    if (lastPanelFocus && typeof lastPanelFocus.focus === "function") lastPanelFocus.focus();
  }

  function scoreChallenge(id) {
    var ch = scene().challenge;
    if (id === ch.answer) {
      statusEl.textContent = "Discovery complete. That object matches the prompt. This is a learning check, not a new NASA finding.";
      challengeOn = false;
      document.getElementById("explore-challenge").textContent = "Find the Evidence";
    } else {
      statusEl.textContent = "Not that object. " + ch.hint;
    }
  }

  function startLanding(fromSwitch) {
    ready = false;
    clearTimeout(landingTimer);
    closePanel();
    closeOverlay();
    stage.classList.remove("is-ready", "is-landing", "is-discovering");
    void stage.offsetWidth;
    stage.classList.add("is-landing");
    skipBtn.hidden = false;
    replayBtn.hidden = true;
    touchdown.hidden = true;
    setHotspotEnabled(false);
    if (reduceMotion || scene().landing === "none") {
      finishLanding();
      return;
    }
    landingTimer = setTimeout(finishLanding, LANDING_MS);
  }

  function finishLanding() {
    clearTimeout(landingTimer);
    ready = true;
    stage.classList.remove("is-landing");
    stage.classList.add("is-ready");
    skipBtn.hidden = true;
    replayBtn.hidden = scene().landing === "none";
    touchdown.hidden = false;
    setHotspotEnabled(true);
  }

  function showStage() {
    intro.hidden = true;
    stage.hidden = false;
    renderScene();
    startLanding(false);
  }

  function showIntro() {
    clearTimeout(landingTimer);
    stage.hidden = true;
    intro.hidden = false;
    closePanel();
    closeOverlay();
    challengeOn = false;
    statusEl.textContent = "";
  }

  function openRemains() {
    var m = mission();
    var r = m.remainsReveal || {};
    var html =
      "<dt>Mission</dt><dd>" + m.name + " — " + m.locationLabel + "</dd>" +
      "<dt>Object or hardware</dt><dd>" + (r.physicalRemains || m.whatRemains) + "</dd>" +
      "<dt>Known status</dt><dd>" + (r.lastKnownStatus || (m.lastComm + " / " + m.missionEnd)) + "</dd>" +
      "<dt>Why it matters</dt><dd>" + (r.scientificLegacy || m.whyMatters) + "</dd>" +
      "<dt>Evidence</dt><dd>" + (r.knownVsUncertain || "See the mission page for sources.") + " " + sourceLink(m) + "</dd>";
    if (!r.verified) {
      html += "<dt>Uncertainty label</dt><dd>Archive summary — not part of the 2026 Spirit/Opportunity/Surveyor 3 NASA Science re-check.</dd>";
    }
    lastOverlayFocus = document.activeElement;
    document.getElementById("explore-remains-dl").innerHTML = html;
    stage.classList.add("is-discovering");
    craftEl.classList.add("is-spotlight");
    var mainId = missionId === "phoenix" ? "lander" : "rover";
    markHotspot(mainId);
    overlay.hidden = false;
    document.getElementById("explore-overlay-close").focus();
  }

  function closeOverlay() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    stage.classList.remove("is-discovering");
    craftEl.classList.remove("is-spotlight");
    if (panel.hidden) markHotspot(null);
    if (lastOverlayFocus && typeof lastOverlayFocus.focus === "function") lastOverlayFocus.focus();
  }

  document.getElementById("explore-start").addEventListener("click", showStage);
  document.getElementById("explore-back").addEventListener("click", showIntro);
  skipBtn.addEventListener("click", finishLanding);
  replayBtn.addEventListener("click", function () { startLanding(false); });
  document.getElementById("explore-remains").addEventListener("click", openRemains);
  document.getElementById("explore-overlay-close").addEventListener("click", closeOverlay);
  document.getElementById("explore-panel-close").addEventListener("click", closePanel);
  document.getElementById("explore-challenge").addEventListener("click", function () {
    challengeOn = true;
    statusEl.textContent = scene().challenge.prompt + " Click a hotspot. Wrong guesses get a hint, not the answer.";
    this.textContent = "Challenge on";
  });

  pills.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-id]");
    if (btn) setMission(btn.getAttribute("data-id"));
  });
  document.getElementById("stage-mission").addEventListener("change", function () {
    setMission(this.value);
  });

  hotspotsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".explore-hotspot");
    if (!btn || !ready) return;
    var hs = scene().hotspots.filter(function (h) { return h.id === btn.getAttribute("data-id"); })[0];
    if (hs) openPanel(hs);
  });

  overlay.addEventListener("keydown", function (e) {
    if (overlay.hidden || e.key !== "Tab") return;
    var nodes = overlay.querySelectorAll("a[href], button:not([disabled])");
    if (!nodes.length) return;
    var first = nodes[0];
    var last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!overlay.hidden) {
      closeOverlay();
      return;
    }
    if (!panel.hidden) closePanel();
  });

  var sceneBox = document.getElementById("explore-scene");
  if (sceneBox && !reduceMotion) {
    sceneBox.addEventListener("mousemove", function (e) {
      var box = sceneBox.getBoundingClientRect();
      var dx = (e.clientX - box.left) / box.width - 0.5;
      var dy = (e.clientY - box.top) / box.height - 0.5;
      sceneBox.querySelectorAll(".explore-layer").forEach(function (layer) {
        var d = Number(layer.getAttribute("data-depth") || 0) / 8;
        layer.style.transform = "translate(" + (dx * d) + "px," + (dy * d * 0.6) + "px)";
      });
    });
  }

  /* Guided tour: steps through the current scene's hotspots. */
  var tourIdx = -1;
  var tourBar = document.getElementById("explore-tour");
  function tourBuild() {
    if (tourBar || !sceneBox) return;
    tourBar = document.createElement("div");
    tourBar.id = "explore-tour"; tourBar.className = "explore-tour wrap"; tourBar.setAttribute("role", "group"); tourBar.setAttribute("aria-label", "Guided exploration");
    tourBar.innerHTML = '<span class="explore-tour-label" id="explore-tour-label" role="status" aria-live="polite">Optional guided tour</span>' +
      '<button type="button" class="btn btn-secondary btn-small" data-t="prev">Previous</button>' +
      '<button type="button" class="btn btn-primary btn-small" data-t="next">Start tour</button>' +
      '<button type="button" class="btn btn-secondary btn-small" data-t="skip">Skip tour</button>' +
      '<button type="button" class="btn btn-secondary btn-small" data-t="restart">Restart</button>';
    sceneBox.parentNode.insertBefore(tourBar, sceneBox.nextSibling);
    tourBar.addEventListener("click", function (e) {
      var t = e.target.getAttribute && e.target.getAttribute("data-t");
      if (!t || !ready) return;
      var n = scene().hotspots.length;
      if (t === "next") tourGo(tourIdx + 1 >= n ? 0 : tourIdx + 1);
      else if (t === "prev") tourGo(Math.max(0, tourIdx - 1));
      else if (t === "restart") tourGo(0);
      else tourEnd(true);
    });
  }
  function tourGo(i) {
    var hs = scene().hotspots, h = hs[i];
    if (!h) return;
    tourIdx = i;
    openPanel(h);
    tourBar.querySelector('[data-t="next"]').textContent = i + 1 >= hs.length ? "Back to start" : "Next";
    document.getElementById("explore-tour-label").textContent = "Step " + (i + 1) + " of " + hs.length + ": " + h.name;
  }
  function tourEnd(close) {
    tourIdx = -1;
    if (!tourBar) return;
    tourBar.querySelector('[data-t="next"]').textContent = "Start tour";
    document.getElementById("explore-tour-label").textContent = close ? "Tour skipped. Explore freely." : "Optional guided tour";
    if (close) closePanel();
  }

  document.addEventListener("DOMContentLoaded", function () {
    tourBuild();
    var q = new URLSearchParams(window.location.search).get("id");
    if (q && SCENES[q]) missionId = q;
    if (q && SCENES[q] && stage.hidden) { /* deep link preselects mission */ }
    buildPills();
  });
})();
