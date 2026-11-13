/* ============================================================
   Space Explorer: Their Legacy - game UI and flow (classic script)
   Owns: profile, creator, HUD, mission panel, badges, Mission Log,
   progress (localStorage only, no account), audio, 2D fallback.
   Mission facts come ONLY from the archive records (MISSIONS).
   ============================================================ */
(function () {
  "use strict";
  var D = window.SE_DATA, MD = window.SE_MODELS, $ = function (id) { return document.getElementById(id); };
  var KEY_PROFILE = "se.profile.v1", KEY_PROGRESS = "se.progress.v1", KEY_SOUND = "se.sound.v1";
  var NAME_RE = /^[A-Za-z0-9\u00C0-\u024F\u0980-\u09FF][A-Za-z0-9\u00C0-\u024F\u0980-\u09FF '\-]{1,15}$/;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var profile = load(KEY_PROFILE, null);
  var progress = load(KEY_PROGRESS, { found: {}, doneShown: false });
  function validId(id) { return !!D.get(id); }
  function foundMap() { var m = {}; Object.keys(progress.found || {}).forEach(function (k) { if (validId(k)) m[k] = progress.found[k]; }); return m; }
  function count() { return Object.keys(foundMap()).length; }
  function pct() { return D.total ? Math.round(count() / D.total * 100) : 0; }
  function cleanName(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  function validProfile(p) { return p && NAME_RE.test(cleanName(p.name)) && (p.gender === "male" || p.gender === "female") && MD.SUITS.some(function (s) { return s.id === p.suit; }); }
  if (!validProfile(profile)) profile = null;
  function suitHex(id) { for (var i = 0; i < MD.SUITS.length; i++) if (MD.SUITS[i].id === id) return MD.SUITS[i].hex; return MD.SUITS[0].hex; }

  var A = { engine: null, engineP: null, mode: "intro", zone: "hub", fallback: false, dlg: null, dlgTrigger: null, draft: null, panelId: null, travelBusy: false, sound: load(KEY_SOUND, false), engineFailed: null };

  /* ---------------- audio: synthesised, optional, off by default ---------------- */
  var Au = { ctx: null, amb: null };
  function audioOn() {
    if (!A.sound) return false;
    if (!Au.ctx) { try { Au.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; } }
    if (Au.ctx.state === "suspended") Au.ctx.resume();
    if (!Au.amb) {
      var c = Au.ctx, g = c.createGain(); g.gain.value = 0.025; g.connect(c.destination);
      [55, 82.5, 110.4].forEach(function (f) { var o = c.createOscillator(); o.type = "sine"; o.frequency.value = f; o.connect(g); o.start(); });
      Au.amb = g;
    }
    Au.amb.gain.value = 0.025; return true;
  }
  function blip(f1, f2, dur) {
    if (!A.sound || !Au.ctx) return; var c = Au.ctx, o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = "triangle"; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  function setSound(on) {
    A.sound = !!on; save(KEY_SOUND, A.sound);
    if (A.sound) { audioOn(); blip(440, 880, 0.2); } else if (Au.amb) Au.amb.gain.value = 0;
    var b = $("se-sound"); b.setAttribute("aria-pressed", String(A.sound)); b.querySelector(".se-btn-label").textContent = A.sound ? "Sound on" : "Sound off";
  }

  /* ---------------- badges ---------------- */
  function hexStr(n) { return "#" + ("000000" + n.toString(16)).slice(-6); }
  var GLYPH = {
    mer: '<rect x="14" y="22" width="24" height="9" rx="2"/><circle cx="18" cy="35" r="4"/><circle cx="34" cy="35" r="4"/><path d="M26 22v-8"/>',
    sojourner: '<rect x="16" y="24" width="20" height="7" rx="2"/><circle cx="19" cy="35" r="3"/><circle cx="33" cy="35" r="3"/><path d="M30 24v-7"/>',
    phoenix: '<ellipse cx="26" cy="24" rx="9" ry="3"/><ellipse cx="11" cy="22" rx="6" ry="2"/><ellipse cx="41" cy="22" rx="6" ry="2"/><path d="M19 26l-5 11M33 26l5 11M26 27v10"/>',
    insight: '<ellipse cx="26" cy="25" rx="8" ry="3"/><ellipse cx="10" cy="22" rx="6" ry="6"/><ellipse cx="42" cy="22" rx="6" ry="6"/><path d="M20 28l-5 9M32 28l5 9"/>',
    surveyor: '<path d="M26 12v14M20 14h12"/><rect x="21" y="24" width="10" height="6"/><path d="M22 30l-8 8M30 30l8 8M26 30v8"/>',
    lm: '<path d="M18 22h16l4 6-4 6H18l-4-6z"/><path d="M18 34l-6 6M34 34l6 6"/>',
    pioneer: '<path d="M12 26a14 14 0 0 1 28 0z"/><path d="M26 26v10M18 36h16"/>',
    voyager: '<path d="M12 24a14 14 0 0 1 28 0z"/><path d="M26 24v9l11 4M26 33l-10 4"/>'
  };
  function badge(m, earned, size) {
    var c = hexStr(m.accent), s = size || 56;
    return '<svg class="se-badge' + (earned ? " is-on" : "") + '" width="' + s + '" height="' + s + '" viewBox="0 0 52 52" role="img" aria-label="' + esc(m.record.name) + (earned ? " discovery badge, earned" : " discovery badge, locked") + '">' +
      '<defs><radialGradient id="bg' + m.n + '" cx="50%" cy="35%"><stop offset="0" stop-color="' + (earned ? c : "#4a4670") + '"/><stop offset="1" stop-color="' + (earned ? "#2a2166" : "#25223f") + '"/></radialGradient></defs>' +
      '<circle cx="26" cy="26" r="24" fill="url(#bg' + m.n + ')" stroke="' + (earned ? "#ffe27a" : "#5a557f") + '" stroke-width="2.5"/>' +
      (earned ? '<g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (GLYPH[m.craft] || GLYPH.surveyor) + "</g>" :
        '<text x="26" y="34" text-anchor="middle" font-size="22" font-weight="700" fill="#8a85b5" font-family="Space Grotesk,Arial,sans-serif">?</text>') + "</svg>";
  }

  /* ---------------- dialogs (focus trap, Esc, focus return) ---------------- */
  var DLGS = ["se-mission", "se-log", "se-help", "se-reset", "se-done"];
  function focusables(root) { return Array.prototype.slice.call(root.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"]),summary')).filter(function (e) { return e.offsetParent !== null; }); }
  function openDlg(id, trigger) {
    if (A.dlg && A.dlg !== id) closeDlg(true);
    A.dlg = id; A.dlgTrigger = trigger || document.activeElement;
    var el = $(id); el.hidden = false; document.body.classList.add("se-dlg-open"); syncBlock();
    var f = focusables(el); (el.querySelector("[data-autofocus]") || f[0] || el).focus();
  }
  function closeDlg(silent) {
    if (!A.dlg) return; var el = $(A.dlg); el.hidden = true; var back = A.dlgTrigger; A.dlg = null; A.dlgTrigger = null;
    document.body.classList.remove("se-dlg-open"); syncBlock();
    if (!silent) { var target = (back && document.contains(back) && back.offsetParent !== null && !A.engine) ? back : ($("se-canvas").offsetParent && A.mode === "play" && !A.fallback ? $("se-canvas") : back); if (target && target.focus) target.focus(); }
  }
  function syncBlock() { if (A.engine) A.engine.setBlocked(!!A.dlg || A.mode !== "play" || A.travelBusy); }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && A.dlg) { e.preventDefault(); if (A.dlg === "se-done") { closeDlg(); } else closeDlg(); return; }
    if (e.key === "Escape" && A.mode === "play" && !A.fallback) { e.preventDefault(); openDlg("se-help", $("se-help-btn")); return; }
    if (e.key === "Tab" && A.dlg) {
      var f = focusables($(A.dlg)); if (!f.length) return; var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-close]"), function (b) { b.addEventListener("click", function () { closeDlg(); }); });
  Array.prototype.forEach.call(document.querySelectorAll(".se-overlay"), function (o) { o.addEventListener("pointerdown", function (e) { if (e.target === o) closeDlg(); }); });

  function say(t) { var l = $("se-live"); l.textContent = ""; setTimeout(function () { l.textContent = t; }, 40); }
  var toastT = 0;
  function toast(html) { var t = $("se-toast"); t.innerHTML = html; t.hidden = false; t.classList.add("is-in"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("is-in"); t.hidden = true; }, 4200); }

  /* ---------------- screens ---------------- */
  function showScreen(name) {
    ["se-intro", "se-creator", "se-hud", "se-fallback"].forEach(function (id) { $(id).hidden = true; });
    if (name) $(name).hidden = false;
    $("se-touch").hidden = !(name === "se-hud");
  }
  function setLoading(on, text) { var l = $("se-loading"); l.hidden = !on; if (text) $("se-loading-text").textContent = text; }

  /* ---------------- engine (3D) ---------------- */
  function ensureEngine() {
    if (A.engineP) return A.engineP;
    setLoading(true, "Loading the 3D world\u2026");
    A.engineP = window.SE_WORLD.create({
      canvas: $("se-canvas"),
      hooks: { onNear: onNear, onInteract: onInteract, onCompass: onCompass, onZone: function () {}, onLost: function () { failEngine("The 3D display was interrupted by the browser."); } }
    }).then(function (eng) { A.engine = eng; setLoading(false); eng.setFound(foundMap()); $("se-prevfb").hidden = true; return eng; })
      .catch(function (err) { A.engineP = null; failEngine(err && err.message ? err.message : "3D could not start", true); return null; });
    return A.engineP;
  }
  function failEngine(msg, quiet) {
    setLoading(false); A.engineFailed = msg; A.fallback = true; $("se-prevfb").hidden = false;
    $("se-canvas").classList.add("is-off");
    if (A.mode === "play") { startFallbackPlay(); }
    var n = $("se-fallback-note"); n.textContent = "The 3D world could not load (" + msg + "). You can still explore every mission in this simpler view. If you are offline, reconnect and press Try 3D again.";
  }

  /* ---------------- creator ---------------- */
  function renderCreator() {
    var d = A.draft = A.draft || { name: profile ? profile.name : "", gender: profile ? profile.gender : "male", suit: profile ? profile.suit : MD.SUITS[0].id };
    $("se-name").value = d.name;
    var g = $("se-gender"); g.innerHTML = ["male", "female"].map(function (x) {
      return '<label class="se-choice"><input type="radio" name="se-g" value="' + x + '"' + (d.gender === x ? " checked" : "") + '><span><b>' + (x === "male" ? "Astronaut Max" : "Astronaut Maya") + "</b><small>" + (x === "male" ? "Male avatar" : "Female avatar") + "</small></span></label>";
    }).join("");
    var s = $("se-suits"); s.innerHTML = MD.SUITS.map(function (x) {
      return '<label class="se-swatch" title="' + esc(x.name) + '"><input type="radio" name="se-s" value="' + x.id + '"' + (d.suit === x.id ? " checked" : "") + '><span style="--sw:' + hexStr(x.hex) + '"></span><i class="visually-hidden">' + esc(x.name) + "</i></label>";
    }).join("");
    paintPreviewFallback(); applyDraft();
  }
  function paintPreviewFallback() {
    var d = A.draft, c = hexStr(suitHex(d.suit)), f = d.gender === "female";
    $("se-prevfb").innerHTML = '<svg viewBox="0 0 120 150" role="img" aria-label="Preview of the ' + (f ? "female" : "male") + ' astronaut"><ellipse cx="60" cy="142" rx="36" ry="6" fill="#0003"/>' +
      '<rect x="38" y="62" width="44" height="52" rx="18" fill="' + c + '"/><rect x="44" y="110" width="14" height="26" rx="6" fill="' + c + '"/><rect x="62" y="110" width="14" height="26" rx="6" fill="' + c + '"/>' +
      '<rect x="40" y="132" width="20" height="9" rx="4" fill="#f4f6ff"/><rect x="60" y="132" width="20" height="9" rx="4" fill="#f4f6ff"/>' +
      '<rect x="22" y="66" width="14" height="38" rx="7" fill="' + c + '"/><rect x="84" y="66" width="14" height="38" rx="7" fill="' + c + '"/>' +
      (f ? '<circle cx="36" cy="26" r="9" fill="#4a2a1a"/><circle cx="84" cy="26" r="9" fill="#4a2a1a"/>' : '<rect x="76" y="6" width="3" height="20" fill="#2a2f4a"/><circle cx="77.5" cy="6" r="4" fill="#ffe066"/>') +
      '<circle cx="60" cy="38" r="26" fill="#f4f6ff"/><ellipse cx="60" cy="40" rx="18" ry="' + (f ? 13 : 11) + '" fill="' + (f ? "#5fe8ff" : "#ffb347") + '"/></svg>';
  }
  function applyDraft() {
    var d = A.draft; paintPreviewFallback();
    if (A.engine) { A.engine.setAvatar(d.gender, suitHex(d.suit)); }
  }
  function validateName() {
    var v = cleanName($("se-name").value), err = $("se-name-err"), ok = NAME_RE.test(v);
    err.textContent = ok ? "" : "Use 2 to 16 letters or numbers (spaces, - and ' are fine).";
    $("se-name").setAttribute("aria-invalid", String(!ok)); return ok ? v : null;
  }

  /* ---------------- play flow ---------------- */
  function startGame() {
    var v = validateName(); if (!v) { $("se-name").focus(); return; }
    profile = { name: v, gender: A.draft.gender, suit: A.draft.suit }; save(KEY_PROFILE, profile);
    $("se-hud-name").textContent = profile.name;
    A.mode = "play"; refreshProgressUI();
    if (A.fallback || !A.engine) { startFallbackPlay(); return; }
    A.engine.setAvatar(profile.gender, suitHex(profile.suit)); A.engine.setMode("hub"); A.engine.enter("hub"); A.engine.setFound(foundMap());
    A.zone = "hub"; showScreen("se-hud"); updateHudZone(); syncBlock(); $("se-canvas").focus(); A.engine.start();
    say("Welcome to the Space Hub, " + profile.name + ". Three portals lead to the Moon, Mars and Deep Space.");
    var q = new URLSearchParams(location.search).get("id"); if (q && validId(q)) { A.target = q; var m = D.get(q); setTimeout(function () { travel(m.zone, q); }, 400); }
  }
  function travel(zone, target) {
    if (A.travelBusy || !A.engine) return; A.travelBusy = true; syncBlock();
    var f = $("se-fade"); f.classList.add("is-on");
    setTimeout(function () {
      A.engine.enter(zone); A.zone = zone; A.engine.setMode(zone === "hub" ? "hub" : "zone"); A.engine.setTarget(target || null); A.engine.setFound(foundMap()); updateHudZone();
      setTimeout(function () { f.classList.remove("is-on"); A.travelBusy = false; syncBlock(); blip(300, 700, 0.25); say(zone === "hub" ? "Back in the Space Hub." : "Entering " + D.zones[zone].name + "."); }, 260);
    }, 300);
  }
  function updateHudZone() {
    var z = A.zone, tag = $("se-zone-tag");
    tag.textContent = z === "hub" ? "Space Hub" : D.zones[z].name; tag.style.setProperty("--zc", z === "hub" ? "#3df2c4" : D.zones[z].color);
    $("se-hub-btn").hidden = z === "hub";
    $("se-zone-note").hidden = z === "hub";
    $("se-zone-note").textContent = z === "deep" ? "Stylised route, not to scale. These spacecraft are not on any surface." : (z === "hub" ? "" : "Missions are grouped here for learning; they did not all happen in one place.");
    $("se-hint").textContent = z === "hub" ? "Walk to a glowing portal and press E (or tap the button) to travel." : "Follow the arrow to the nearest undiscovered mission.";
    $("se-compass").hidden = z === "hub";
  }
  function onNear(it) {
    var b = $("se-prompt");
    if (!it) { b.hidden = true; b.removeAttribute("data-id"); return; }
    var txt = it.kind === "mission" ? "Examine " + it.label : it.label;
    b.querySelector(".se-prompt-text").textContent = txt; b.hidden = false; b.setAttribute("data-id", it.id); say(txt + ". Press E to interact.");
  }
  var lastComp = "";
  function onCompass(c) {
    var el = $("se-compass"); if (!c) { el.hidden = true; return; }
    el.hidden = false; var s = Math.round(c.dist) + " m";
    el.querySelector(".se-compass-arrow").style.transform = "rotate(" + (-c.rel * 180 / Math.PI) + "deg)";
    var t = c.label + " \u00B7 " + s; if (t !== lastComp) { el.querySelector(".se-compass-text").textContent = t; lastComp = t; }
  }
  function onInteract(it) {
    blip(520, 760, 0.12);
    if (it.kind === "portal") travel(it.zone);
    else if (it.kind === "return") travel("hub");
    else if (it.kind === "mission") openMission(it.id, $("se-canvas"));
  }

  /* ---------------- mission panel ---------------- */
  function row(label, html, cls) { return '<section class="se-fact ' + (cls || "") + '"><h3>' + esc(label) + "</h3>" + html + "</section>"; }
  function para(t) { return t ? "<p>" + esc(t) + "</p>" : '<p class="se-unk">Not recorded in the archive.</p>'; }
  function openMission(id, trigger, opts) {
    var m = D.get(id); if (!m) return; var r = m.record; opts = opts || {};
    A.panelId = id; var first = !progress.found[id];
    var disc = (r.discoveries || []).map(function (x) { return "<li><b>" + esc(x.title) + ".</b> " + esc(x.text) + "</li>"; }).join("");
    var srcs = (r.sources && r.sources.length ? r.sources : (r.sourceUrl ? [{ label: r.sourceLabel || "NASA source", url: r.sourceUrl }] : []))
      .filter(function (s) { return /^https:\/\//.test(s.url); }).map(function (s) { return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + "</a></li>"; }).join("");
    var left = (r.whereNow ? "<p>" + esc(r.whereNow) + "</p>" : "") + (r.whatRemains ? "<p>" + esc(r.whatRemains) + "</p>" : "");
    $("se-m-badge").innerHTML = badge(m, true, 72);
    $("se-m-zone").textContent = D.zones[m.zone].short;
    $("se-m-zone").style.setProperty("--zc", D.zones[m.zone].color);
    $("se-m-title").textContent = r.name; $("se-m-sub").textContent = r.subtitle || "";
    $("se-m-body").innerHTML =
      '<div class="se-m-quick"><div><span>Type</span>' + esc(r.type || "Not recorded") + "</div><div><span>Destination</span>" + esc(r.locationLabel || "Not recorded") + "</div><div><span>Launch</span>" + esc(r.launch || "Not recorded") + "</div><div><span>" + esc(r.arrivalLabel || "Arrival") + "</span>" + esc(r.arrival || "Not recorded") + "</div></div>" +
      row("What it was built to do", para(r.builtFor)) +
      row("What it discovered or enabled", disc ? "<ul>" + disc + "</ul>" : para("")) +
      row("Hardware left behind and where it is now", left || para(""), "se-f-left") +
      row("Last communication", para(r.lastComm), "se-f-comm") +
      row("Mission end or official closure", para(r.missionEnd), "se-f-end") +
      (r.whyStopped ? '<details class="se-fact"><summary>Why did it stop?</summary><p>' + esc(r.whyStopped) + "</p></details>" : "") +
      '<p class="se-note">The four sections above are different facts: hardware left behind, the last signal received, how the mission ended, and any official closure. ' + (m.zone === "deep" ? "This spacecraft is not on the Moon or Mars. " : "") + 'The 3D model is a stylised representation, not an exact replica.</p>' +
      '<section class="se-fact"><h3>Sources</h3><ul class="se-src">' + (srcs || "<li>No source link recorded.</li>") + "</ul></section>";
    $("se-m-archive").href = D.archiveUrl(id);
    var img = $("se-m-img"); img.innerHTML = '<div class="se-img-fb">' + (window.MissionIcons ? MissionIcons.iconFor(r) : "") + "</div>"; $("se-m-credit").textContent = "Schematic icon (no photo loaded). Illustration by this project.";
    if (window.NasaAPI && r.query) {
      NasaAPI.images(r, 1).then(function (l) {
        if (A.panelId !== id || !l || !l[0] || !/^https:\/\//.test(l[0].thumb)) return;
        img.innerHTML = '<img alt="' + esc(l[0].title || r.name) + '" src="' + esc(l[0].thumb) + '" loading="lazy">';
        $("se-m-credit").innerHTML = 'Image: NASA, via the <a href="' + esc(l[0].href) + '" target="_blank" rel="noopener noreferrer">NASA Image and Video Library</a>. Not an endorsement of this game.';
      }).catch(function () {});
    }
    var wasFirst = first; openDlg("se-mission", trigger);
    $("se-mission").querySelector(".se-dlg-body").scrollTop = 0;
    if (first && !opts.noAward) discover(id, wasFirst);
  }
  function discover(id) {
    progress.found[id] = Date.now(); save(KEY_PROGRESS, progress); if (A.engine) A.engine.markFound(id);
    refreshProgressUI(); var m = D.get(id); blip(660, 1320, 0.35);
    toast('<span class="se-toast-badge">' + badge(m, true, 40) + "</span><span><b>Badge earned</b><br>" + esc(m.record.name) + " \u00B7 " + count() + " of " + D.total + " found</span>");
    say("Badge earned: " + m.record.name + ". " + count() + " of " + D.total + " missions found.");
    if (count() === D.total && !progress.doneShown) { progress.doneShown = true; save(KEY_PROGRESS, progress); A.pendingDone = true; }
  }
  $("se-m-close").addEventListener("click", function () { closeDlg(); });
  var _close = closeDlg;
  function afterCloseCheck() { if (A.pendingDone && !A.dlg) { A.pendingDone = false; showDone(); } }
  new MutationObserver(afterCloseCheck).observe($("se-mission"), { attributes: true, attributeFilter: ["hidden"] });

  /* ---------------- progress UI, log, done, reset ---------------- */
  function refreshProgressUI() {
    var c = count(), p = pct();
    $("se-prog-fill").style.width = p + "%"; $("se-prog-text").textContent = c + " of " + D.total + " missions \u00B7 " + p + "%";
    $("se-prog-bar").setAttribute("aria-valuenow", String(c)); $("se-prog-bar").setAttribute("aria-valuemax", String(D.total));
    if (!$("se-log").hidden) renderLog(); if (A.fallback && A.mode === "play") renderFallback();
  }
  function renderLog() {
    var f = foundMap(), html = "";
    D.zoneIds.forEach(function (z) {
      var list = D.inZone(z), n = list.filter(function (m) { return f[m.id]; }).length;
      html += '<section class="se-log-zone" style="--zc:' + D.zones[z].color + '"><h3>' + esc(D.zones[z].name) + " <small>" + n + " of " + list.length + "</small></h3><ul>";
      list.forEach(function (m) {
        var on = !!f[m.id];
        html += '<li class="' + (on ? "is-on" : "") + '">' + badge(m, on, 44) + '<div class="se-log-main"><b>' + esc(m.record.name) + "</b><span>" + (on ? "Discovered" : "Not discovered yet") + "</span></div><div class=\"se-log-act\">" +
          (on ? '<button type="button" class="se-btn se-btn-sm" data-read="' + m.id + '">Read again</button><a class="se-btn se-btn-sm se-btn-ghost" href="' + D.archiveUrl(m.id) + '">Archive page</a>' :
            (A.fallback ? '<button type="button" class="se-btn se-btn-sm" data-read="' + m.id + '">Open</button>' : '<button type="button" class="se-btn se-btn-sm" data-go="' + m.id + '">Go to ' + esc(D.zones[z].short) + "</button>")) + "</div></li>";
      });
      html += "</ul></section>";
    });
    $("se-log-list").innerHTML = html;
    $("se-log-sum").textContent = (profile ? profile.name + ": " : "") + count() + " of " + D.total + " missions discovered (" + pct() + "%)";
  }
  $("se-log-list").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.read) { openMission(b.dataset.read, b, { noAward: false }); }
    else if (b.dataset.go) { var m = D.get(b.dataset.go); closeDlg(true); document.body.classList.remove("se-dlg-open"); if (A.zone !== m.zone) travel(m.zone, m.id); else { A.engine.setTarget(m.id); } syncBlock(); $("se-canvas").focus(); }
  });
  function showDone() {
    $("se-done-name").textContent = profile ? profile.name : "Explorer";
    $("se-done-badges").innerHTML = D.missions.map(function (m) { return badge(m, true, 44); }).join("");
    openDlg("se-done", $("se-canvas"));
  }
  function doReset() {
    progress = { found: {}, doneShown: false }; save(KEY_PROGRESS, progress); A.pendingDone = false;
    if (A.engine) A.engine.setFound({}); refreshProgressUI(); closeDlg(true); say("Progress reset. 0 of " + D.total + " missions found."); toast("<span><b>Progress reset</b><br>0 of " + D.total + " missions found</span>");
    if (A.mode === "play" && !A.fallback) { syncBlock(); $("se-canvas").focus(); }
  }

  /* ---------------- 2D fallback explorer ---------------- */
  function startFallbackPlay() {
    A.mode = "play"; A.fallback = true; if (A.engine) A.engine.stop();
    $("se-hud-name").textContent = profile ? profile.name : "Explorer"; showScreen("se-fallback"); renderFallback(); syncBlock();
  }
  function renderFallback() {
    var f = foundMap();
    $("se-fb-name").textContent = profile ? profile.name : "Explorer"; $("se-fb-prog").textContent = count() + " of " + D.total + " missions \u00B7 " + pct() + "%";
    $("se-fb-zones").innerHTML = D.zoneIds.map(function (z) {
      var zn = D.zones[z], list = D.inZone(z);
      return '<section class="se-fb-zone" style="--zc:' + zn.color + '"><h3>' + esc(zn.name) + "</h3><p>" + esc(zn.intro) + "</p><ul>" + list.map(function (m) {
        return '<li><button type="button" data-read="' + m.id + '">' + badge(m, !!f[m.id], 36) + "<span><b>" + esc(m.record.name) + "</b><small>" + (f[m.id] ? "Discovered" : "Tap to explore") + "</small></span></button></li>";
      }).join("") + "</ul></section>";
    }).join("");
  }
  $("se-fb-zones").addEventListener("click", function (e) { var b = e.target.closest("button[data-read]"); if (b) openMission(b.dataset.read, b); });

  /* ---------------- joystick + buttons ---------------- */
  (function () {
    var base = $("se-joy"), thumb = $("se-joy-thumb"), id = null, R = 48;
    function set(e) {
      var r = base.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy, l = Math.hypot(dx, dy);
      if (l > R) { dx = dx / l * R; dy = dy / l * R; } thumb.style.transform = "translate(" + dx + "px," + dy + "px)";
      if (A.engine) A.engine.setJoystick(dx / R, -dy / R);
    }
    base.addEventListener("pointerdown", function (e) { id = e.pointerId; try { base.setPointerCapture(id); } catch (x) {} set(e); e.preventDefault(); });
    base.addEventListener("pointermove", function (e) { if (e.pointerId === id) set(e); });
    function end(e) { if (e.pointerId !== id) return; id = null; thumb.style.transform = ""; if (A.engine) A.engine.setJoystick(0, 0); }
    base.addEventListener("pointerup", end); base.addEventListener("pointercancel", end);
    $("se-jump").addEventListener("pointerdown", function (e) { e.preventDefault(); if (A.engine && !A.dlg) A.engine.jump(); });
    $("se-canvas").addEventListener("pointerdown", function (e) { if (e.pointerType === "touch") document.body.classList.add("se-has-touch"); });
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) document.body.classList.add("se-has-touch");
  })();
  $("se-prompt").addEventListener("click", function () { if (A.engine) A.engine.interact(); });

  /* ---------------- wiring ---------------- */
  function enterCreator() {
    A.mode = "creator"; showScreen("se-creator"); renderCreator(); syncBlock();
    ensureEngine().then(function (eng) { if (!eng || A.mode !== "creator") return; eng.setMode("creator"); eng.setAvatar(A.draft.gender, suitHex(A.draft.suit)); eng.setBlocked(true); eng.start(); applyDraft(); });
    $("se-name").focus();
  }
  $("se-start").addEventListener("click", function () {
    if (profile) { A.draft = { name: profile.name, gender: profile.gender, suit: profile.suit }; $("se-name").value = profile.name; }
    ensureEngine().then(function () {
      if (profile && validProfile(profile)) { A.mode = "play"; startGame2(); } else enterCreator();
    });
  });
  function startGame2() { A.draft = A.draft || { name: profile.name, gender: profile.gender, suit: profile.suit }; $("se-name").value = profile.name; startGame(); }
  $("se-new").addEventListener("click", function () { A.draft = null; profile = null; enterCreator(); });
  $("se-go").addEventListener("click", startGame);
  $("se-name").addEventListener("input", function () { A.draft.name = $("se-name").value; $("se-name-err").textContent = ""; });
  $("se-name").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); startGame(); } });
  $("se-gender").addEventListener("change", function (e) { A.draft.gender = e.target.value; applyDraft(); });
  $("se-suits").addEventListener("change", function (e) { A.draft.suit = e.target.value; applyDraft(); });
  $("se-creator-back").addEventListener("click", function () { if (A.engine) A.engine.stop(); A.mode = "intro"; showScreen("se-intro"); });
  $("se-log-btn").addEventListener("click", function (e) { renderLog(); openDlg("se-log", e.currentTarget); });
  $("se-fb-log").addEventListener("click", function (e) { renderLog(); openDlg("se-log", e.currentTarget); });
  $("se-help-btn").addEventListener("click", function (e) { openDlg("se-help", e.currentTarget); });
  $("se-hub-btn").addEventListener("click", function () { travel("hub"); });
  $("se-sound").addEventListener("click", function () { setSound(!A.sound); });
  $("se-fb-sound").addEventListener("click", function () { setSound(!A.sound); });
  $("se-reset-open").addEventListener("click", function (e) { openDlg("se-reset", e.currentTarget); });
  $("se-reset-ok").addEventListener("click", doReset);
  $("se-done-log").addEventListener("click", function (e) { closeDlg(true); renderLog(); openDlg("se-log", e.currentTarget); });
  $("se-retry3d").addEventListener("click", function () {
    A.fallback = false; A.engineFailed = null; $("se-canvas").classList.remove("is-off");
    ensureEngine().then(function (eng) { if (eng) { startGame(); } });
  });
  document.addEventListener("visibilitychange", function () { if (!A.engine) return; if (document.hidden) A.engine.stop(); else if (A.mode === "play" || A.mode === "creator") { if (!A.fallback) A.engine.start(); } });
  window.addEventListener("pagehide", function () { if (A.engine) { A.engine.dispose(); A.engine = null; } });

  function fit() { var h = document.querySelector(".site-header"), top = h ? h.getBoundingClientRect().height : 70; $("se-root").style.height = Math.max(520, window.innerHeight - top) + "px"; if (A.engine) A.engine.resize(); }
  window.addEventListener("resize", fit); window.addEventListener("orientationchange", fit); fit();

  /* ---------------- boot ---------------- */
  (function boot() {
    var chk = D.check(); if (!chk.ok) { console.warn("Space Explorer data check:", chk.problems); }
    $("se-total").textContent = String(D.total);
    D.zoneIds.forEach(function (z) { var el = $("se-intro-" + z); if (el) el.textContent = D.inZone(z).length + " missions"; });
    setSound(A.sound && false);                                     /* never autoplay: audio starts only after a click */
    if (profile) { $("se-welcome").hidden = false; $("se-welcome").textContent = "Welcome back, " + profile.name + ". " + count() + " of " + D.total + " missions found."; $("se-start").textContent = "Continue exploring"; $("se-new").hidden = false; }
    showScreen("se-intro"); refreshProgressUI(); $("se-start").focus();
    window.SE_APP = { state: A, count: count, pct: pct, openMission: openMission, foundMap: foundMap, _fallback: function () { failEngine("test", true); } };
  })();
})();
