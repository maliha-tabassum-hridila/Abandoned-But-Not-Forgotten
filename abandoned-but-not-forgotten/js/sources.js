document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("sources-list");
  if (!root) return;
  root.innerHTML = MISSIONS.map(function (mission) {
    return '<article class="source-entry"><div><span class="source-meta">' + LOCATION_LABELS[mission.location] + ' / ' + mission.era + '</span><h2><a href="mission.html?id=' + mission.id + '">' + mission.name + '</a></h2></div><ul>' + mission.sources.map(function (source) {
      return '<li><a href="' + source.url + '" target="_blank" rel="noopener noreferrer">' + source.label + '<span aria-hidden="true"> &#8599;</span></a></li>';
    }).join("") + '</ul></article>';
  }).join("");
});
