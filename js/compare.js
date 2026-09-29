/* ============================================================
   Compare page: pick 2-3 missions, render comparison table
   ============================================================ */

(function () {
  "use strict";

  var MAX_PICKS = 3;
  var selected = [];

  var picker = document.getElementById("compare-picker");
  var output = document.getElementById("compare-output");
  var hint = document.getElementById("compare-hint");

  function pickerItemHTML(m) {
    return '' +
      '<button type="button" class="compare-pick-item" data-id="' + m.id + '" aria-pressed="false">' +
        '<span class="cbox" aria-hidden="true"></span>' +
        '<span>' +
          '<span class="cname">' + m.name + '</span>' +
          '<span class="cmeta">' + LOCATION_LABELS[m.location] + ' &middot; ' + m.era + '</span>' +
        '</span>' +
      '</button>';
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

  var ROWS = [
    { label: "Destination", key: function (m) { return LOCATION_LABELS[m.location]; } },
    { label: "Launch Year", key: function (m) { return m.launch; } },
    { label: "Landing / Arrival", key: function (m) { return m.arrivalLabel + ": " + m.arrival; } },
    { label: "Mission Duration", key: function (m) { return "Planned " + m.plannedDuration + "; actual " + m.actualDuration; } },
    { label: "Primary Goal", key: function (m) { return m.builtFor.split(".")[0] + "."; } },
    { label: "Major Contribution", key: function (m) { return m.discoveries[0].text; } },
    { label: "Final Status", key: function (m) { return m.statusLabel + " \u2014 " + m.missionEnd; } }
  ];

  function tableHTML(missions) {
    var thead = '<tr><th scope="col">Comparing</th>' + missions.map(function (m) {
      return '<th scope="col">' + m.name + '</th>';
    }).join("") + '</tr>';

    var rows = ROWS.map(function (row) {
      return '<tr><th scope="row">' + row.label + '</th>' + missions.map(function (m) {
        return '<td data-col-name="' + m.name + '">' + row.key(m) + '</td>';
      }).join("") + '</tr>';
    }).join("");

    return '' +
      '<div class="compare-table-wrap">' +
        '<table class="compare-table">' +
          '<thead>' + thead + '</thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>' +
      '<p style="margin-top:20px; font-size:0.85rem;">Every mission here was built to answer a different question, in a different place, at a different point in NASA history \u2014 the table above is for comparison, not ranking.</p>';
  }

  function renderTable() {
    if (selected.length < 2) {
      output.innerHTML = '<div class="compare-empty"><p>Select at least two missions above to see them compared side by side.</p></div>';
      return;
    }
    var missions = selected.map(getMissionById);
    output.innerHTML = tableHTML(missions);
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
