(function () {
  "use strict";
  var sel = document.getElementById("fs-select"), out = document.getElementById("fs-out");
  if (!sel || !out || typeof MISSIONS === "undefined") { if (out) out.textContent = "Mission data could not be loaded."; return; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function ev(label, value, note) {
    return '<li style="margin:0 0 1rem;padding-left:1rem;border-left:2px solid var(--space-blue)"><strong>' + esc(label) + '</strong><br>' + esc(value || "Not recorded in this project") + (note ? '<br><small>' + esc(note) + '</small>' : "") + "</li>";
  }
  function render(id) {
    var m = MISSIONS.filter(function (x) { return x.id === id; })[0] || MISSIONS[0];
    var travelling = m.status === "traveling";
    var h = "<h2>" + esc(m.name) + " <small>" + esc(m.locationLabel) + "</small></h2><ol style=\"list-style:none;padding:0\">";
    h += ev("Launch", m.launch + (m.launchSite ? " — " + m.launchSite : ""));
    h += ev(m.arrivalLabel || "Arrival", m.arrival);
    (m.journey || []).forEach(function (j) { if (!/^(launch|landing|arrival)$/i.test(j.stage)) h += ev(j.stage, j.text); });
    h += ev("Last communication", m.lastComm, "Last contact is not the same as official closure.");
    h += ev("Official closure", m.missionEnd, travelling ? "This spacecraft is still travelling; communication status can change." : "");
    h += ev(travelling ? "Where it is" : "Why operations stopped", travelling ? m.whereNow : m.whyStopped);
    h += ev("What remains", m.whatRemains, m.location === "deep-space" || travelling || /pioneer|voyager/.test(m.id) ? "Deep-space probes are not on the Moon or Mars; this is about the spacecraft itself." : "Current physical condition has not been confirmed unless a source says so.");
    h += ev("Legacy", m.whyMatters);
    h += "</ol><p>";
    (m.sources || []).slice(0, 3).forEach(function (s) { h += '<a href="' + esc(s.url) + '" rel="noopener" target="_blank">' + esc(s.label) + "</a> &bull; "; });
    h += '<a href="mission.html?id=' + encodeURIComponent(m.id) + '">Full mission record</a></p>';
    out.innerHTML = h;
  }
  sel.innerHTML = MISSIONS.map(function (m) { return '<option value="' + esc(m.id) + '">' + esc(m.name) + "</option>"; }).join("");
  var q = new URLSearchParams(location.search).get("id");
  if (q && MISSIONS.some(function (m) { return m.id === q; })) sel.value = q;
  sel.addEventListener("change", function () { render(sel.value); });
  render(sel.value);
})();
