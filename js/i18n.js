/* English interface strings live in data/strings.json. */
var I18N = (function () {
  "use strict";
  var S = window.STRINGS || { en: {} };
  var NAV = { "index.html": "nav.home", "missions.html": "nav.archive", "map.html": "nav.map", "timeline.html": "nav.timeline",
    "compare.html": "nav.compare", "quiz.html": "nav.quiz", "detective.html": "nav.detective", "explore.html": "nav.explore", "inspect.html": "nav.inspect",
    "game.html": "nav.game", "final-signal.html": "nav.final", "data.html": "nav.data", "about.html": "nav.about" };

  function t(key, vars) {
    var s = (S.en && S.en[key]) || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }
  function apply(root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    root.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria"))); });
    root.querySelectorAll("[data-i18n-title]").forEach(function (el) { el.setAttribute("title", t(el.getAttribute("data-i18n-title"))); });
    document.querySelectorAll(".nav-links a").forEach(function (a) {
      var k = NAV[(a.getAttribute("href") || "").split("?")[0]]; if (k) a.textContent = t(k);
    });
    document.documentElement.lang = "en";
  }
  function init() { apply(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  return { t: t, apply: apply };
})();
