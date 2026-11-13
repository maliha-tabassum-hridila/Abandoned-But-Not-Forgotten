/* ============================================================
   Compare page: pick 2-3 missions, render comparison table
   Uses the shared mission records from data.js / data-extra.js.
   ============================================================ */

(function () {
  "use strict";

  var MAX_PICKS = 3;
  var selected = [];

  var picker = document.getElementById("compare-picker");
  var output = document.getElementById("compare-output");
  var hint = document.getElementById("compare-hint");

  function pickerItemHTML(m) {
    return "" +
      '<button type="button" class="compare-pick-item" data-id="' + m.id + '" aria-pressed="false">' +
        '<span class="cbox" aria-hidden="true"></span>' +
        '<span>' +
          '<span class="cname">' + m.name + "</span>" +
          '<span class="cmeta">' + LOCATION_LABELS[m.location] + " &middot; " + m.era + "</span>" +
        "</span>" +
      "</button>";
  }

  function buildPicker() {
    picker.innerHTML = MISSIONS.map(pickerItemHTML).join("");
    picker.querySelectorAll(".compare-pick-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var idx = selected.indexOf(id);
        if (idx !== -1) {
          selected.splice(idx, 1);
        } else {
          if (selected.length >= MAX_PICKS) return;
          selected.push(id);
        }
        syncPickerState();
        renderTable();
      });
    });
  }

  function syncPickerState() {
    picker.querySelectorAll(".compare-pick-item").forEach(function (btn) {
      var id = btn.getAttribute("data-id");
      var isSelected = selected.indexOf(id) !== -1;
      btn.setAttribute("aria-pressed", String(isSelected));
      btn.disabled = !isSelected && selected.length >= MAX_PICKS;
    });
    hint.textContent = selected.length === 0
      ? "SELECT 2\u20133 MISSIONS"
      : selected.length + " OF " + MAX_PICKS + " SELECTED" + (selected.length < 2 ? " \u2014 PICK AT LEAST ONE MORE" : "");
  }

  function na(text) {
    return '<span class="compare-na">' + text + "</span>";
  }

  function sourceCell(m) {
    var src = missionPrimarySource(m);
    if (!src || !src.url) return na("Not available");
    return '<a class="compare-source" href="' + src.url + '" target="_blank" rel="noopener">' + src.label + "</a>";
  }

  function distanceCell(m) {
    if (m.surfaceTravel === "rover") return m.distance;
    if (m.surfaceTravel === "hop") return m.distance + " \u2014 a brief hop, not a rover traverse";
    if (m.surfaceTravel === "stationary") return na("Not applicable \u2014 stationary lander");
    if (m.surfaceTravel === "flyby") return na("Not applicable \u2014 not a surface vehicle");
    if (m.surfaceTravel === "crew-sites") return na("Not applicable as a single odometer \u2014 six crewed sites");
    return m.distance || na("Not available");
  }

  function durationComparable(m) {
    return typeof m.plannedDays === "number" && typeof m.actualDays === "number";
  }

  var ROWS = [
    { label: "Destination", key: function (m) { return LOCATION_LABELS[m.location]; } },
    { label: "Spacecraft type", key: function (m) { return m.type; } },
    { label: "Launch", key: function (m) { return m.launch; } },
    { label: "Landing / arrival", key: function (m) { return m.arrivalLabel + ": " + m.arrival; } },
    { label: "Planned duration", key: function (m) { return m.plannedDuration; } },
    {
      label: "Actual operational lifetime",
      key: function (m) {
        var note = m.actualDurationDefinition ? '<span class="compare-def">' + m.actualDurationDefinition + "</span>" : "";
        return m.actualDuration + note;
      }
    },
    { label: "Distance travelled", key: distanceCell },
    { label: "Last communication", key: function (m) { return m.lastComm; } },
    { label: "Official mission closure", key: function (m) { return m.missionEnd; } },
    { label: "Known physical status", key: function (m) { return m.statusLabel + " \u2014 " + m.whereNow; } },
    { label: "Primary objective", key: function (m) { return m.builtFor.split(".")[0] + "."; } },
    { label: "Scientific contribution", key: function (m) { return m.discoveries[0].text; } },
    { label: "NASA source", key: sourceCell }
  ];

  function tableHTML(missions) {
    var thead = '<tr><th scope="col">Comparing</th>' + missions.map(function (m) {
      return '<th scope="col">' + m.name + "</th>";
    }).join("") + "</tr>";

    var rows = ROWS.map(function (row) {
      return '<tr><th scope="row">' + row.label + "</th>" + missions.map(function (m) {
        return '<td data-col-name="' + m.name + '">' + row.key(m) + "</td>";
      }).join("") + "</tr>";
    }).join("");

    return "" +
      '<div class="compare-table-wrap">' +
        '<table class="compare-table">' +
          "<thead>" + thead + "</thead>" +
          "<tbody>" + rows + "</tbody>" +
        "</table>" +
      "</div>" +
      '<p class="compare-footnote">A Martian sol is not an Earth day. Last communication is not the same event as official mission closure. Distance is shown only for documented surface travel. Zero is never used as a stand-in for missing data.</p>';
  }

  function fmtChartDays(d) {
    if (d >= 730) return (d / 365.25).toFixed(1) + " Earth years";
    return Math.round(d) + " Earth days";
  }

  function barsHTML(missions) {
    var comparable = missions.filter(durationComparable);
    var lenBlock;
    if (!comparable.length) {
      lenBlock = '<p class="map-note">Planned versus actual lifetime is not charted here because the selected missions are not meaningfully comparable on one timescale.</p>';
    } else {
      var maxLog = Math.log(20000);
      var lenRows = missions.map(function (m) {
        if (!durationComparable(m)) {
          return '<div class="bar-group"><div class="bar-name">' + m.name + "</div>" +
            '<p class="map-note">Not comparable on this chart. See the table for the labelled duration.</p></div>';
        }
        var pa = Math.max(2, (Math.log(m.plannedDays + 1) / maxLog) * 100);
        var aa = Math.max(2, (Math.log(m.actualDays + 1) / maxLog) * 100);
        var actualLabel = m.status === "traveling" ? "So far (to last update in this archive)" : "To last communication";
        return '<div class="bar-group"><div class="bar-name">' + m.name + "</div>" +
          '<div class="bar-line"><span class="bar-key">Planned</span><span class="bar-track"><span class="bar planned" style="width:' + pa + '%"></span></span><span class="bar-val">' + fmtChartDays(m.plannedDays) + "</span></div>" +
          '<div class="bar-line"><span class="bar-key">' + actualLabel + '</span><span class="bar-track"><span class="bar actual" style="width:' + aa + '%"></span></span><span class="bar-val">' + fmtChartDays(m.actualDays) + "</span></div>" +
          (m.durationChartNote ? '<p class="map-note">' + m.durationChartNote + "</p>" : "") +
          "</div>";
      }).join("");
      lenBlock = '<p class="map-note">Logarithmic scale in Earth-day equivalents so a two-week lander and a decades-long probe can share one chart. Read the table for sols, lunar days, and official closure dates.</p>' + lenRows;
    }

    var roverMissions = missions.filter(function (m) { return m.surfaceTravel === "rover" && typeof m.distanceKm === "number"; });
    var distRows = missions.map(function (m) {
      if (m.surfaceTravel === "rover" && typeof m.distanceKm === "number") {
        var maxKm = Math.max.apply(null, roverMissions.map(function (x) { return x.distanceKm; }));
        var w = maxKm > 0 ? Math.max(1.5, (m.distanceKm / maxKm) * 100) : 0;
        var val = m.distanceKm < 0.5 ? Math.round(m.distanceKm * 1000) + " m" : m.distanceKm + " km";
        return '<div class="bar-group"><div class="bar-name">' + m.name + "</div>" +
          '<div class="bar-line"><span class="bar-key">Odometer</span><span class="bar-track"><span class="bar actual" style="width:' + w + '%"></span></span><span class="bar-val">' + val + "</span></div></div>";
      }
      if (m.surfaceTravel === "hop" && typeof m.distanceKm === "number") {
        return '<div class="bar-group"><div class="bar-name">' + m.name + "</div>" +
          '<p class="map-note">Documented hop of about 2.5 meters \u2014 not plotted against rover odometers.</p></div>';
      }
      return '<div class="bar-group"><div class="bar-name">' + m.name + "</div>" +
        '<p class="map-note">Not applicable \u2014 no comparable surface-travel distance is recorded.</p></div>';
    }).join("");

    var traits = missions.map(function (m) {
      return '<div class="trait-card"><h4>' + m.name + "</h4><dl>" +
        "<dt>Size</dt><dd>" + m.sizeNote + "</dd><dt>Power</dt><dd>" + m.power + "</dd><dt>Mobility</dt><dd>" + m.mobility + "</dd></dl></div>";
    }).join("");

    return '<div class="compare-visuals">' +
      '<div class="viz"><span class="eyebrow">MISSION LENGTH</span>' + lenBlock + "</div>" +
      '<div class="viz"><span class="eyebrow">DISTANCE ON THE SURFACE</span>' +
        '<p class="map-note">Only documented rover odometers are drawn as bars. Stationary landers and flyby probes are labelled Not applicable.</p>' +
        distRows + "</div>" +
      '<div class="viz"><span class="eyebrow">DESIGN</span><div class="trait-grid">' + traits + "</div></div>" +
      "</div>";
  }

  function renderTable() {
    if (selected.length < 2) {
      output.innerHTML = '<div class="compare-empty"><p>Select at least two missions above to see them compared side by side.</p></div>';
      return;
    }
    var missions = selected.map(getMissionById);
    output.innerHTML = tableHTML(missions) + barsHTML(missions);
  }

  function applyQueryParams() {
    var params = new URLSearchParams(window.location.search);
    var ids = params.get("ids");
    if (ids) {
      selected = ids.split(",").filter(function (id) { return !!getMissionById(id); }).slice(0, MAX_PICKS);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyQueryParams();
    buildPicker();
    syncPickerState();
    renderTable();
  });
})();
