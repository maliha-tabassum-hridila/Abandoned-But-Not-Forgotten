/* ============================================================
   Mission Archive: filtering + rendering
   ============================================================ */

(function () {
  "use strict";

  var state = { location: "all", status: "all", era: "all" };

  var grid = document.getElementById("mission-grid");
  var empty = document.getElementById("empty-state");
  var count = document.getElementById("results-count");

  function cardHTML(m) {
    return '' +
      '<a class="mission-card reveal in-view" href="mission.html?id=' + m.id + '">' +
        '<span class="card-scanline" aria-hidden="true"></span>' +
        '<div class="card-visual" style="color:var(--space-blue-bright);">' + MissionIcons.iconFor(m) + '</div>' +
        '<div class="card-meta"><span>' + LOCATION_LABELS[m.location] + ' &middot; ' + m.era + '</span><span class="status-dot ' + m.status + '">' + m.statusLabel + '</span></div>' +
        '<h3>' + m.name + '</h3>' +
        '<span class="card-sub">' + m.subtitle + '</span>' +
        '<p class="card-story">' + m.shortStory + '</p>' +
        '<span class="card-cta">VIEW MISSION ' + MissionIcons.arrowIcon() + '</span>' +
      '</a>';
  }

  function matches(m) {
    if (state.location !== "all" && m.location !== state.location) return false;
    if (state.status !== "all" && m.status !== state.status) return false;
    if (state.era !== "all" && m.era !== state.era) return false;
    return true;
  }

  function render() {
    var results = MISSIONS.filter(matches);
    if (results.length === 0) {
      grid.innerHTML = "";
      empty.hidden = false;
    } else {
      empty.hidden = true;
      grid.innerHTML = results.map(cardHTML).join("");
    }
    count.textContent = results.length + (results.length === 1 ? " MISSION FOUND" : " MISSIONS FOUND");
  }

  function initFilters() {
    var groups = document.querySelectorAll(".filter-pills");
    groups.forEach(function (group) {
      var key = group.getAttribute("data-filter");
      var pills = group.querySelectorAll(".pill");
      pills.forEach(function (pill) {
        pill.addEventListener("click", function () {
          pills.forEach(function (p) { p.setAttribute("aria-pressed", "false"); });
          pill.setAttribute("aria-pressed", "true");
          state[key] = pill.getAttribute("data-value");
          render();
        });
      });
    });
  }

  // Support deep-linking, e.g. missions.html?location=moon
  function applyQueryParams() {
    var params = new URLSearchParams(window.location.search);
    ["location", "status", "era"].forEach(function (key) {
      var val = params.get(key);
      if (val) {
        state[key] = val;
        var group = document.querySelector('.filter-pills[data-filter="' + key + '"]');
        if (group) {
          var target = group.querySelector('[data-value="' + val + '"]');
          if (target) {
            group.querySelectorAll(".pill").forEach(function (p) { p.setAttribute("aria-pressed", "false"); });
            target.setAttribute("aria-pressed", "true");
          }
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyQueryParams();
    initFilters();
    render();
  });
})();
