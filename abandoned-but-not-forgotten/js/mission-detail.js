/* ============================================================
   Mission Detail: builds the cinematic mission page from data.js
   ============================================================ */

(function () {
  "use strict";

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function journeyHTML(m) {
    return m.journey.map(function (j) {
      return '<div class="journey-item"><span class="jstage">' + j.stage + '</span><p>' + j.text + '</p></div>';
    }).join("");
  }

  function discoveryHTML(m) {
    return m.discoveries.map(function (d) {
      return '<div class="discovery-card"><h4>' + d.title + '</h4><p>' + d.text + '</p></div>';
    }).join("");
  }

  function sourcesHTML(m) {
    return m.sources.map(function (source) {
      return '<a href="' + source.url + '" target="_blank" rel="noopener noreferrer">' + source.label + '</a>';
    }).join("");
  }

  function remainsListHTML(m) {
    return '<ul class="remains-list">' + m.whatRemainsItems.map(function (item) {
      return '<li>' + item + '</li>';
    }).join("") + '</ul>';
  }

  function nextMission(m) {
    var idx = MISSIONS.findIndex(function (x) { return x.id === m.id; });
    var next = MISSIONS[(idx + 1) % MISSIONS.length];
    return next;
  }

  function render(m) {
    document.title = m.name + " — Abandoned, But Not Forgotten";
    var titleEl = document.getElementById("page-title");
    if (titleEl) titleEl.textContent = m.name + " — Abandoned, But Not Forgotten";

    var next = nextMission(m);
    var iconColor = "color:var(--space-blue-bright);";

    var html = '' +
    '<section class="mdetail-hero">' +
      '<div class="mdetail-hero-bg" aria-hidden="true"></div>' +
      '<div class="grid-overlay" aria-hidden="true"></div>' +
      '<div class="wrap">' +
        '<a href="missions.html" class="mdetail-crumb">&larr; BACK TO THE ARCHIVE</a>' +
        '<div class="mdetail-top">' +
          '<div>' +
            '<span class="mdetail-eyebrow">' + LOCATION_LABELS[m.location] + ' &middot; ' + m.subtitle.toUpperCase() + '</span>' +
            '<h1>' + m.name.toUpperCase() + '</h1>' +
            '<p class="mdetail-sub">' + m.type + ' &middot; ' + m.locationLabel + '</p>' +
            '<p class="mdetail-tagline">' + m.shortStory + '</p>' +
            '<div class="visual-block" style="' + iconColor + '" aria-hidden="true">' + MissionIcons.iconFor(m) + '</div>' +
          '</div>' +
          '<div class="telemetry-panel" role="group" aria-label="Mission telemetry">' +
            '<div class="telemetry-row"><span class="tk">Location</span><span class="tv">' + m.locationLabel + '</span></div>' +
            '<div class="telemetry-row"><span class="tk">Mission Type</span><span class="tv">' + m.type + '</span></div>' +
            '<div class="telemetry-row"><span class="tk">Launch</span><span class="tv">' + m.launch + '</span></div>' +
            '<div class="telemetry-row"><span class="tk">' + m.arrivalLabel + '</span><span class="tv">' + m.arrival + '</span></div>' +
            '<div class="telemetry-row"><span class="tk">Primary Mission</span><span class="tv">' + m.plannedDuration + '</span></div>' +
            '<div class="telemetry-row"><span class="tk">Actual Duration</span><span class="tv">' + m.actualDuration + '</span></div>' +
            '<div class="telemetry-row"><span class="tk">Power Source</span><span class="tv">' + m.powerSource + '</span></div>' +
            '<div class="telemetry-row"><span class="tk">Distance</span><span class="tv">' + m.distance + '</span></div>' +
            '<div class="telemetry-row"><span class="tk">Last Communication</span><span class="tv">' + m.lastComm + '</span></div>' +
            '<div class="telemetry-row status"><span class="tk">Status</span><span class="tv">' + m.statusLabel.toUpperCase() + '</span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">A / WHAT WAS IT BUILT TO DO?</span>' +
        '<h2>The mission it was built for</h2>' +
        '<p class="body-text">' + m.builtFor + '</p>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">B / THE JOURNEY</span>' +
        '<h2>Launch to final signal</h2>' +
        '<div class="journey-list">' + journeyHTML(m) + '</div>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">C / WHAT DID IT DISCOVER?</span>' +
        '<h2>Its scientific legacy</h2>' +
        '<div class="discovery-grid">' + discoveryHTML(m) + '</div>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">D / WHY DID IT STOP?</span>' +
        '<h2>How the mission ended</h2>' +
        '<p class="body-text">' + m.whyStopped + '</p>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">E / MISSION END &amp; LOCATION</span>' +
        '<h2>Its resting place</h2>' +
        '<div class="locate-block">' +
          '<p class="body-text">' + m.whereNow + '</p>' +
          '<div class="locate-visual" aria-hidden="true">' +
            '<div class="grid-overlay"></div>' +
            '<span class="pin" style="top:46%; left:52%;"></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">F / WHAT REMAINS?</span>' +
        '<h2>WHAT REMAINS?</h2>' +
        remainsListHTML(m) +
        '<p class="body-text">' + m.whatRemains + '</p>' +
        '<p class="remains-caption">&ldquo;' + m.remainsCaption + '&rdquo;</p>' +

        '<div class="signal-block" role="group" aria-label="Signal status">' +
          '<div class="signal-bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>' +
          '<span class="signal-caption">LAST KNOWN STATUS: ' + m.statusLabel.toUpperCase() + ' &nbsp;&bull;&nbsp; LAST COMMUNICATION: ' + m.lastComm.toUpperCase() + ' &nbsp;&bull;&nbsp; MISSION END: ' + m.missionEnd.toUpperCase() + '</span>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section" style="border-bottom:none;">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">G / IF THIS MACHINE COULD TALK</span>' +
        '<div class="quote-block">' +
          '<span class="quote-label">CREATIVE INTERPRETATION &mdash; NOT AN ACTUAL TRANSMISSION</span>' +
          '<blockquote>&ldquo;' + m.quote + '&rdquo;</blockquote>' +
        '</div>' +
        '<div class="mission-sources"><span class="mdetail-section-label">H / SOURCES &amp; CREDITS</span><div class="source-links">' + sourcesHTML(m) + '</div><a class="all-sources-link" href="sources.html">View all sources &amp; credits</a></div>' +
      '</div>' +
    '</section>' +

    '<section class="matters-block">' +
      '<div class="wrap">' +
        '<span class="eyebrow">WHY IT MATTERS</span>' +
        '<p class="big" style="margin-top:14px;">' + m.whyMatters.toUpperCase() + '</p>' +
      '</div>' +
    '</section>' +

    '<section class="section" style="padding-top:0;">' +
      '<div class="wrap next-mission">' +
        '<a href="missions.html" class="btn btn-secondary">&larr; Back to the Archive</a>' +
        '<a href="mission.html?id=' + next.id + '" class="btn btn-primary">Next mission: ' + next.name + ' &rarr;</a>' +
      '</div>' +
    '</section>';

    document.getElementById("mission-content").innerHTML = html;

    // Fade the mission page's sections in as the user scrolls
    document.querySelectorAll(".mdetail-section, .matters-block").forEach(function (el) {
      el.classList.add("reveal");
    });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in-view"); });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var id = qs("id");
    var mission = id ? getMissionById(id) : null;
    if (!mission) {
      document.getElementById("mission-content").innerHTML = "";
      document.getElementById("not-found").hidden = false;
      return;
    }
    render(mission);
  });
})();
