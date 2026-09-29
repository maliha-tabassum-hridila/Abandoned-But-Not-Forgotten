/* ============================================================
   Timeline page: decade tabs
   ============================================================ */

(function () {
  "use strict";

  var ERA_INTROS = {
    "1960s": "NASA begins landing hardware on other worlds. The Surveyor program tests whether the Moon's surface can support a crewed spacecraft, laying the groundwork for Apollo.",
    "1970s": "Six crewed Apollo Lunar Modules land on the Moon, each leaving its descent stage behind. Meanwhile, Pioneer 10 and 11, then Voyager 1 and 2, launch on trajectories that will eventually carry them out of the solar system.",
    "1990s": "Sojourner becomes the first wheeled rover to operate on another planet, a small technology test that proves rovers can survive on Mars.",
    "2000s": "NASA sends a wave of new Mars hardware: the twin rovers Spirit and Opportunity, and the polar lander Phoenix, all searching for evidence of water.",
    "2010s": "InSight lands on Mars to study the planet's deep interior, while Voyager 1 and then Voyager 2 both cross the boundary into interstellar space.",
    "2020s": "The Voyager probes continue transmitting from interstellar space, decades past their original five-year mission plan."
  };

  var ERAS = ["1960s", "1970s", "1990s", "2000s", "2010s", "2020s"];

  var tabsWrap = document.getElementById("era-tabs");
  var introWrap = document.getElementById("era-intro");
  var trackWrap = document.getElementById("timeline-track");

  function missionsForEra(era) {
    if (era === "2020s") {
      // Voyagers are 1970s launches but still relevant to the present decade
      return MISSIONS.filter(function (m) { return m.status === "traveling"; });
    }
    return MISSIONS.filter(function (m) { return m.era === era; });
  }

  function entryHTML(m) {
    return '' +
      '<div class="timeline-entry">' +
        '<h4>' + m.name + '</h4>' +
        '<span class="te-meta">' + LOCATION_LABELS[m.location] + ' &middot; Launched ' + m.launch + ' &middot; ' + m.statusLabel + '</span>' +
        '<p>' + m.shortStory + '</p>' +
        '<a href="mission.html?id=' + m.id + '">VIEW FULL RECORD &rarr;</a>' +
      '</div>';
  }

  function renderEra(era) {
    introWrap.innerHTML = '<h3>' + era + '</h3><p>' + ERA_INTROS[era] + '</p>';
    var list = missionsForEra(era);
    if (list.length === 0) {
      trackWrap.innerHTML = '<p>No archived hardware from this decade yet.</p>';
      return;
    }
    trackWrap.innerHTML = list.map(entryHTML).join("");
    trackWrap.querySelectorAll(".timeline-entry").forEach(function (el, i) {
      el.classList.add("reveal");
      requestAnimationFrame(function () {
        setTimeout(function () { el.classList.add("in-view"); }, i * 60);
      });
    });
  }

  function buildTabs() {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("era") && ERAS.indexOf(params.get("era")) !== -1 ? params.get("era") : "1960s";

    tabsWrap.innerHTML = ERAS.map(function (era) {
      return '<button type="button" role="tab" aria-selected="' + (era === initial ? "true" : "false") + '" data-era="' + era + '">' + era + '</button>';
    }).join("");

    tabsWrap.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabsWrap.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-selected", "false"); });
        btn.setAttribute("aria-selected", "true");
        renderEra(btn.getAttribute("data-era"));
      });
    });

    renderEra(initial);
  }

  document.addEventListener("DOMContentLoaded", buildTabs);
})();
