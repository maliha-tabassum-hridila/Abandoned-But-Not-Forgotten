/* ============================================================
   Mission Detail: builds the cinematic mission page from data.js
   ============================================================ */

/* Link to the hardware map when this mission has mapped objects (Moon/Mars only). */
function mapLink(m) {
  var feats = (window.OBJECTS_GEOJSON && window.OBJECTS_GEOJSON.features) || [];
  var hit = feats.filter(function (f) { return f.properties.mission_id === m.id; })[0];
  if (!hit) return "";
  return '<a href="map.html?obj=' + encodeURIComponent(hit.properties.id) + '" class="btn btn-secondary">Show on the map</a>';
}
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
    return missionSourceItems(m).map(function (s) {
      if (s.url) {
        return '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.label + "</a>";
      }
      return s.label;
    }).join(" &nbsp;&bull;&nbsp; ");
  }

  function remainsHTML(m) {
    var reveal = m.remainsReveal;
    if (!reveal) {
      return "" +
        '<p class="body-text">' + m.whatRemains + "</p>" +
        '<p class="map-note">A verified interactive reveal is not yet available for this mission. The paragraph above is the archive summary.</p>';
    }
    var choices = reveal.choices.map(function (label, i) {
      return '<button type="button" class="remains-choice" data-index="' + i + '" aria-pressed="false">' +
        "<span>" + label + "</span></button>";
    }).join("");
    var badge = reveal.verified
      ? '<span class="badge fact">VERIFIED NASA MISSION INFORMATION</span>'
      : '<span class="badge story">ARCHIVE SUMMARY \u2014 SEE LIMITS</span>';
    var incomplete = reveal.verified
      ? ""
      : '<p class="map-note">More verified information is still needed for this mission. The evidence below is the archive record, not a fresh 2026 NASA-page check.</p>';
    return "" +
      '<p class="body-text">Every mission leaves a different legacy. Explore the physical remains, the mission\'s last known status, and the evidence behind its story.</p>' +
      '<div class="remains-file" data-mission="' + m.id + '">' +
        '<div class="remains-file-head"><span class="eyebrow">MISSION FILE</span>' + badge + "</div>" +
        "<h3>Make your prediction</h3>" +
        "<p>" + reveal.prompt + "</p>" +
        '<div class="remains-choices" role="group" aria-label="What remains from this mission">' + choices + "</div>" +
        '<div class="remains-actions">' +
          '<button type="button" class="btn btn-primary" id="remains-reveal" disabled>Reveal the Evidence</button>' +
          '<button type="button" class="btn btn-secondary" id="remains-reset" hidden>Hide Evidence</button>' +
        "</div>" +
        '<div class="remains-evidence" id="remains-evidence" hidden role="region" aria-live="polite" aria-label="Mission evidence">' +
          incomplete +
          '<article class="remains-panel">' +
            "<h4>Physical remains</h4><p>" + reveal.physicalRemains + "</p>" +
            "<h4>Last known status</h4><p>" + reveal.lastKnownStatus + "</p>" +
            "<h4>Scientific legacy</h4><p>" + reveal.scientificLegacy + "</p>" +
            "<h4>What we know and what remains uncertain</h4><p>" + reveal.knownVsUncertain + "</p>" +
            '<p class="detective-source">NASA source: <a href="' + (reveal.sourceUrl || m.sourceUrl) + '" target="_blank" rel="noopener">' +
              (reveal.sourceLabel || m.sourceLabel || "Mission source") + "</a></p>" +
            '<p class="body-text" style="margin-bottom:0;">Archive summary: ' + m.whatRemains + "</p>" +
          "</article>" +
        "</div>" +
      "</div>";
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
            '<div class="telemetry-row"><span class="tk">Distance</span><span class="tv">' + m.distance + '</span></div>' +
            '<div class="telemetry-row"><span class="tk">Last Communication</span><span class="tv">' + m.lastComm + '</span></div>' +
            '<div class="telemetry-row"><span class="tk">Official Closure</span><span class="tv">' + m.missionEnd + '</span></div>' +
            '<div class="telemetry-row status"><span class="tk">Status</span><span class="tv">' + m.statusLabel.toUpperCase() + '</span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section" id="nasa-archive-section" hidden>' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">NASA IMAGE LIBRARY <span class="badge live">LIVE FROM NASA</span></span>' +
        '<h2>From NASA\u2019s own archive</h2>' +
        '<div class="nasa-gallery" id="nasa-gallery"></div>' +
        '<p class="map-note">Images are loaded live from the NASA Image and Video Library. Credit: NASA. Click an image to open its NASA record.</p>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">A / WHAT WAS IT BUILT TO DO? <span class="badge fact">CONFIRMED FACTS</span></span>' +
        '<h2>The mission it was built for</h2>' +
        '<p class="body-text">' + m.builtFor + '</p>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">B / THE JOURNEY <span class="badge fact">CONFIRMED FACTS</span></span>' +
        '<h2>Launch to final signal</h2>' +
        '<div class="journey-list">' + journeyHTML(m) + '</div>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">C / WHAT DID IT DISCOVER? <span class="badge fact">CONFIRMED FACTS</span></span>' +
        '<h2>Its scientific legacy</h2>' +
        '<div class="discovery-grid">' + discoveryHTML(m) + '</div>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">D / WHY DID IT STOP? <span class="badge fact">CONFIRMED FACTS</span></span>' +
        '<h2>How the mission ended</h2>' +
        '<p class="body-text">' + m.whyStopped + '</p>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">E / WHERE IS IT NOW? <span class="badge fact">CONFIRMED FACTS</span></span>' +
        '<h2>Its resting place</h2>' +
        '<div class="locate-block">' +
          '<p class="body-text">' + m.whereNow + '</p>' +
          '<div class="locate-visual-map">' + MissionMaps.render(m) + '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section" id="what-remains">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">F / WHAT REMAINS?</span>' +
        '<h2>What Remains?</h2>' +
        remainsHTML(m) +

        '<div class="signal-block" role="group" aria-label="Signal status">' +
          '<div class="signal-bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>' +
          '<div id="rover-last"></div>' +
          '<span class="signal-caption">LAST KNOWN STATUS: ' + m.statusLabel.toUpperCase() + ' &nbsp;&bull;&nbsp; LAST COMMUNICATION: ' + m.lastComm.toUpperCase() + ' &nbsp;&bull;&nbsp; MISSION END: ' + m.missionEnd.toUpperCase() + '</span>' +
        '</div>' +
      '</div>' +
    '</section>' +

    '<section class="mdetail-section" style="border-bottom:none;">' +
      '<div class="wrap">' +
        '<span class="mdetail-section-label">G / IF THIS MACHINE COULD TALK <span class="badge story">STORYTELLING</span></span>' +
        '<div class="quote-block">' +
          '<span class="quote-label">CREATIVE INTERPRETATION &mdash; NOT AN ACTUAL TRANSMISSION</span>' +
          '<blockquote>&ldquo;' + m.quote + '&rdquo;</blockquote>' +
        '</div>' +
        '<p class="sources-line">SOURCES: ' + sourcesHTML(m) + '</p>' +
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
        '<a href="explore.html?id=' + m.id + '" class="btn btn-secondary">Explore ' + m.name + '</a>' +
        (m.id === "ingenuity" ? '' : '<a href="inspect.html?craft=' + m.id + '" class="btn btn-secondary">Inspect ' + m.name + ' in 3D</a>') +
        mapLink(m) +
        '<a href="mission.html?id=' + next.id + '" class="btn btn-primary">Next mission: ' + next.name + ' &rarr;</a>' +
      '</div>' +
    '</section>';

    document.getElementById("mission-content").innerHTML = html;

    bindRemains();
    loadNasaData(m);

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

  function bindRemains() {
    var file = document.querySelector(".remains-file");
    if (!file) return;
    var revealBtn = document.getElementById("remains-reveal");
    var resetBtn = document.getElementById("remains-reset");
    var evidence = document.getElementById("remains-evidence");
    var selected = null;

    file.querySelectorAll(".remains-choice").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selected = btn.getAttribute("data-index");
        file.querySelectorAll(".remains-choice").forEach(function (other) {
          var on = other === btn;
          other.setAttribute("aria-pressed", String(on));
          other.classList.toggle("is-selected", on);
        });
        if (revealBtn) revealBtn.disabled = false;
      });
    });

    if (revealBtn) {
      revealBtn.addEventListener("click", function () {
        if (selected == null) return;
        evidence.hidden = false;
        evidence.classList.add("is-open");
        resetBtn.hidden = false;
        evidence.setAttribute("tabindex", "-1");
        evidence.focus();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        evidence.hidden = true;
        evidence.classList.remove("is-open");
        resetBtn.hidden = true;
        selected = null;
        file.querySelectorAll(".remains-choice").forEach(function (btn) {
          btn.setAttribute("aria-pressed", "false");
          btn.classList.remove("is-selected");
        });
        revealBtn.disabled = true;
        var firstChoice = file.querySelector(".remains-choice");
        if (firstChoice) firstChoice.focus();
        else revealBtn.focus();
      });
    }
  }

  function loadNasaData(m) {
    NasaAPI.images(m, 6).then(function (list) {
      if (!list.length) return;
      var html = list.map(function (im) {
        return '<figure class="nasa-fig"><a href="' + im.href + '" target="_blank" rel="noopener">' +
          '<img src="' + im.thumb + '" alt="' + SiteUtils.esc(im.title) + '" loading="lazy"></a>' +
          '<figcaption>' + SiteUtils.esc(im.title) + '<span>' + SiteUtils.esc(im.center) + (im.date ? ' &middot; ' + im.date : '') + '</span></figcaption></figure>';
      }).join("");
      document.getElementById("nasa-gallery").innerHTML = html;
      document.getElementById("nasa-archive-section").hidden = false;
    });
    if (m.rover) {
      NasaAPI.roverLast(m.rover).then(function (r) {
        var box = document.getElementById("rover-last");
        if (!r || !box) return;
        var imgs = r.photos.map(function (p) {
          return '<figure class="nasa-fig"><img src="' + p.src + '" alt="Photo taken by ' + SiteUtils.esc(m.name) + ' on sol ' + p.sol + '" loading="lazy">' +
            '<figcaption>' + SiteUtils.esc(p.camera || "Camera") + '<span>Sol ' + p.sol + ' &middot; ' + p.earthDate + '</span></figcaption></figure>';
        }).join("");
        box.innerHTML = '<div class="rover-last">' +
          '<span class="badge live">LIVE: NASA MARS ROVER PHOTOS API</span>' +
          '<p>NASA\u2019s photo database holds <strong>' + Number(r.total).toLocaleString() + '</strong> images from ' + SiteUtils.esc(m.name) + '. The most recent ones were taken on <strong>sol ' + r.maxSol + '</strong> (' + r.maxDate + ').</p>' +
          '<div class="nasa-gallery small">' + imgs + '</div></div>';
      });
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
