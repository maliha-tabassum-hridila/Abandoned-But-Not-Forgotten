/* ============================================================
   NASA live data layer
   - NASA Image and Video Library (images-api.nasa.gov, no key)
   - NASA Mars Rover Photos API (api.nasa.gov, key in config.js)
   Every call is cached in localStorage and fails gracefully:
   if the network or an API is unavailable, callers get an empty
   result and the page shows its built-in content instead.
   ============================================================ */
var NasaAPI = (function () {
  "use strict";
  var cfg = window.SITE_CONFIG;
  var TTL = cfg.CACHE_DAYS * 24 * 3600 * 1000;

  function cacheGet(key) {
    try {
      var raw = localStorage.getItem("abnf:" + key);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (Date.now() - obj.t > TTL) return null;
      return obj.v;
    } catch (e) { return null; }
  }
  function cacheSet(key, value) {
    try { localStorage.setItem("abnf:" + key, JSON.stringify({ t: Date.now(), v: value })); } catch (e) {}
  }
  function getJSON(url) {
    var ctl = ("AbortController" in window) ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 9000) : null;
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  /* NASA Image and Video Library search.
     Returns [{id, title, thumb, href, date, center}] */
  function images(mission, limit) {
    limit = limit || 6;
    var key = "img:" + mission.id;
    var cached = cacheGet(key);
    if (cached) return Promise.resolve(cached.slice(0, limit));
    var url = cfg.IMAGES_API + "/search?media_type=image&page_size=40&q=" + encodeURIComponent(mission.query);
    return getJSON(url).then(function (data) {
      var items = (data.collection && data.collection.items) || [];
      var must = (mission.must || []).map(function (s) { return s.toLowerCase(); });
      var out = [];
      items.forEach(function (it) {
        var d = it.data && it.data[0];
        var link = it.links && it.links[0];
        if (!d || !link || !link.href) return;
        var hay = ((d.title || "") + " " + (d.description || "")).toLowerCase();
        var ok = must.length === 0 || must.some(function (w) { return hay.indexOf(w) !== -1; });
        if (!ok) return;
        out.push({
          id: d.nasa_id,
          title: d.title,
          thumb: link.href,
          href: "https://images.nasa.gov/details/" + encodeURIComponent(d.nasa_id),
          date: (d.date_created || "").slice(0, 10),
          center: d.center || "NASA"
        });
      });
      cacheSet(key, out.slice(0, 12));
      return out.slice(0, limit);
    }).catch(function () { return []; });
  }

  /* Mars Rover Photos API: manifest + last-sol photos (Spirit, Opportunity) */
  function roverLast(roverName) {
    var key = "rover:" + roverName;
    var cached = cacheGet(key);
    if (cached) return Promise.resolve(cached);
    var k = encodeURIComponent(cfg.NASA_API_KEY);
    return getJSON(cfg.MARS_PHOTOS_API + "/manifests/" + roverName + "?api_key=" + k).then(function (man) {
      var m = man.photo_manifest;
      return getJSON(cfg.MARS_PHOTOS_API + "/rovers/" + roverName + "/photos?sol=" + m.max_sol + "&api_key=" + k).then(function (ph) {
        var photos = (ph.photos || []).slice(0, 4).map(function (p) {
          return { src: String(p.img_src).replace(/^http:/, "https:"), camera: p.camera && p.camera.full_name, earthDate: p.earth_date, sol: p.sol };
        });
        var result = { maxSol: m.max_sol, maxDate: m.max_date, total: m.total_photos, status: m.status, photos: photos };
        cacheSet(key, result);
        return result;
      });
    }).catch(function () { return null; });
  }

  /* Replace schematic icons on cards with a real NASA image when available */
  function decorateCards(root) {
    root.querySelectorAll(".mission-card[data-id]").forEach(function (card) {
      var m = getMissionById(card.getAttribute("data-id"));
      if (!m) return;
      images(m, 1).then(function (list) {
        if (!list.length) return;
        var box = card.querySelector(".card-visual");
        var img = new Image();
        img.alt = list[0].title;
        img.loading = "lazy";
        img.onload = function () {
          box.innerHTML = "";
          box.classList.add("has-photo");
          box.appendChild(img);
          var c = document.createElement("span");
          c.className = "photo-credit";
          c.textContent = "NASA";
          box.appendChild(c);
        };
        img.src = list[0].thumb;
      });
    });
  }

  return { images: images, roverLast: roverLast, decorateCards: decorateCards };
})();
