/* Map deep-link test: every object in data/objects.geojson must open its own panel via map.html?obj=ID. Run: node tests/map-deeplinks.test.js */
const { chromium } = require(process.env.PW_PATH || "playwright");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".geojson": "application/json", ".md": "text/plain" };
const CDN = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js";
const results = []; let failed = 0;
function ok(name, cond, extra) { results.push((cond ? "PASS " : "FAIL ") + name + (cond ? "" : "  -> " + (extra || ""))); if (!cond) failed++; }

function mockThree() {
  const names = new Set();
  for (const f of ["se-world.js", "se-models.js"]) fs.readFileSync(path.join(ROOT, "js/space-explorer", f), "utf8").replace(/\bT\.([A-Z]\w+)/g, (m, n) => names.add(n));
  return `const mk=()=>{const cache={};const f=function(){};const p=new Proxy(f,{get(t,k){if(k===Symbol.toPrimitive)return()=>0;if(k==='then')return undefined;if(!(k in cache))cache[k]=mk();return cache[k]},set(t,k,v){cache[k]=v;return true},apply(){return p},construct(){return p}});return p};\n` +
    [...names].map(n => `export const ${n}=mk();`).join("\n");
}
function serve() {
  return new Promise(res => { const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html"; const fp = path.join(ROOT, p); if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { r.statusCode = 404; return r.end("nf"); } r.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream"); r.end(fs.readFileSync(fp)); }).listen(0, () => res(s)); });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const server = await serve(), base = "http://localhost:" + server.address().port + "/";
  const browser = await chromium.launch();
  const errorsOf = page => { const e = []; page.on("pageerror", x => e.push(String(x))); page.on("console", m => { if (m.type() === "error" && !/net::ERR|Failed to load resource|fonts\.g/.test(m.text())) e.push("console: " + m.text()); }); return e; };
  const useMock = !process.env.REAL_THREE;

  const fc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/objects.geojson"), "utf8")); let bad = 0;
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); const errs = errorsOf(page);
  for (const f of fc.features) { await page.goto(base + "map.html?obj=" + f.id); await sleep(700); const t = await page.evaluate(() => { const e = document.getElementById("panel-title"); return e ? e.textContent : null; }); const good = t === f.properties.name; if (!good) bad++; console.log((good ? "PASS " : "FAIL ") + "deep link " + f.id + (good ? "" : " -> " + t)); }
  console.log(errs.length ? "FAIL JS errors: " + errs.join("|") : "PASS no JS errors"); await browser.close(); server.close(); process.exit(bad || errs.length ? 1 : 0);
})();
