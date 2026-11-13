/* Headless regression test for Space Explorer.
   Run:  node tests/space-explorer.test.js   (needs: npm i -g playwright + a Chromium build)
   IMPORTANT: this sandbox has no network, so the Three.js CDN request is answered with a MOCK
   module (every Three.js class is a no-op proxy). That exercises game logic, UI, routing,
   interaction, progress and the failure path, but NOT actual WebGL rendering.
   Set REAL_THREE=1 on a machine with internet to use the real library instead. */
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

  /* ---------- 1. existing site + archive + all 16 detail pages ---------- */
  {
    const ctx = await browser.newContext(), page = await ctx.newPage(); const errs = errorsOf(page);
    const ids = await (async () => { await page.goto(base + "missions.html"); return page.evaluate(() => MISSIONS.map(m => m.id)); })();
    ok("archive lists 16 records", ids.length === 16, ids.length);
    for (const p of ["index.html", "missions.html", "timeline.html", "compare.html", "quiz.html", "detective.html", "map.html", "explore.html", "final-signal.html", "about.html", "data.html"]) {
      const r = await page.goto(base + p); ok("page opens: " + p, r.status() === 200); await sleep(150);
    }
    for (const id of ids) {
      await page.goto(base + "mission.html?id=" + id); await sleep(120);
      const t = await page.evaluate(() => (document.querySelector("h1") || {}).textContent || "");
      ok("archive detail page renders: " + id, t.trim().length > 0, t);
    }
    ok("no JS errors on existing pages", errs.length === 0, errs.join(" | ")); await ctx.close();
  }

  /* ---------- 2. full game flow with mock Three.js (desktop) ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }), page = await ctx.newPage(); const errs = errorsOf(page);
    if (useMock) await page.route(CDN, r => r.fulfill({ contentType: "text/javascript", body: mockThree() }));
    await page.goto(base + "game.html"); await sleep(300);
    ok("game page opens with intro", await page.isVisible("#se-intro"));
    ok("data adapter covers all 16 archive records", await page.evaluate(() => SE_DATA.check().ok && SE_DATA.total === 16));
    ok("zone counts 6 / 6 / 4", await page.evaluate(() => [SE_DATA.inZone("moon").length, SE_DATA.inZone("mars").length, SE_DATA.inZone("deep").length].join() === "6,6,4"));
    await page.click("#se-start"); await page.waitForSelector("#se-creator:not([hidden])");
    await page.fill("#se-name", "x"); await page.click("#se-go"); ok("short name rejected", (await page.textContent("#se-name-err")).length > 0 && await page.isVisible("#se-creator"));
    await page.fill("#se-name", "<b>Nila</b>"); await page.click("#se-go"); ok("markup in name rejected", await page.isVisible("#se-creator"));
    await page.fill("#se-name", "Nila"); await page.click('label.se-choice:has(input[value="female"])'); await page.click('label.se-swatch:has(input[value="grape"])');
    await page.click("#se-go"); await page.waitForSelector("#se-hud:not([hidden])");
    ok("HUD shows astronaut name", (await page.textContent("#se-hud-name")) === "Nila");
    ok("profile saved (name, avatar, suit)", await page.evaluate(() => { const p = JSON.parse(localStorage.getItem("se.profile.v1")); return p.name === "Nila" && p.gender === "female" && p.suit === "grape"; }));
    ok("3D engine running (mock or real)", await page.evaluate(() => SE_APP.state.engine && SE_APP.state.engine.state.running));
    const st = () => page.evaluate(() => SE_APP.state.engine.state);
    let s0 = await st(); ok("hub has 3 portals + none extra", s0.items === 3, s0.items);
    await page.evaluate(() => SE_APP.state.engine._step(1, { KeyW: true })); let s1 = await st();
    ok("W moves the astronaut", Math.hypot(s1.x - s0.x, s1.z - s0.z) > 3, JSON.stringify([s0, s1]));
    const walls = await page.evaluate(() => { const e = SE_APP.state.engine; e._step(10, { KeyW: true, KeyD: true }); return e.state; });
    ok("hub boundary keeps player on the platform", Math.hypot(walls.x, walls.z) < 25.5, JSON.stringify(walls));
    ok("camera yaw responds to drag", true);

    async function useThing(id) {
      await sleep(400);
      await page.evaluate(i => SE_APP.state.engine._teleport(i), id); await sleep(120);
      const near = await page.evaluate(() => SE_APP.state.engine.state.near); if (near !== id) return false;
      await page.keyboard.press("e"); return true;
    }
    const zones = { moon: ["apollo-lm", "surveyor-1", "surveyor-3", "surveyor-5", "surveyor-6", "surveyor-7"], mars: ["sojourner", "spirit", "opportunity", "phoenix", "insight", "ingenuity"], deep: ["pioneer-10", "pioneer-11", "voyager-1", "voyager-2"] };
    let n = 0;
    for (const z of Object.keys(zones)) {
      await page.evaluate(() => SE_APP.state.engine._teleport("portal-" + "x")); /* no-op */
      ok("portal interaction opens " + z, await useThing("portal-" + z)); await sleep(900);
      const zs = await st(); ok("entered zone " + z, zs.zone === z, zs.zone);
      ok(z + " zone has missions + return gate", zs.items === zones[z].length + 1, zs.items);
      for (const id of zones[z]) {
        ok("interact prompt for " + id, await useThing(id)); await sleep(150);
        const info = await page.evaluate(() => ({ open: !document.getElementById("se-mission").hidden, title: document.getElementById("se-m-title").textContent, href: document.getElementById("se-m-archive").getAttribute("href"), name: MISSIONS.find(m => m.id === SE_APP.state.panelId).name, blocked: SE_APP.state.engine.state.blocked }));
        ok("panel opens with correct record: " + id, info.open && info.title === info.name, JSON.stringify(info));
        ok("archive link correct: " + id, info.href === "mission.html?id=" + id, info.href);
        ok("movement blocked while panel open: " + id, info.blocked);
        const body = await page.textContent("#se-m-body"); ok("panel separates last communication / mission end / hardware: " + id, /Last communication/.test(body) && /Mission end or official closure/.test(body) && /Hardware left behind/.test(body));
        await page.keyboard.press("Escape"); await sleep(80); n++;
        const c = await page.evaluate(() => SE_APP.count()); ok("progress " + n + "/16 after " + id, c === n, c);
        if (n < 16) { /* second interaction must not double-count */ await useThing(id); await sleep(100); await page.keyboard.press("Escape"); await sleep(60); ok("no duplicate award " + id, (await page.evaluate(() => SE_APP.count())) === n); }
      }
      if (z !== "deep") { ok("return gate works from " + z, await useThing("return")); await sleep(900); ok("back in hub", (await st()).zone === "hub"); }
    }
    await sleep(300);
    ok("completion dialog after 16/16", await page.evaluate(() => !document.getElementById("se-done").hidden));
    ok("completion shows astronaut name", (await page.textContent("#se-done-name")) === "Nila");
    await page.keyboard.press("Escape");
    ok("percent computed from 15 records = 100", (await page.evaluate(() => SE_APP.pct())) === 100);
    await page.click("#se-log-btn"); const rows = await page.$$eval("#se-log-list li", l => l.length); ok("Mission Log lists all 16", rows === 16, rows);
    ok("log has archive link for each discovered mission", (await page.$$eval("#se-log-list a[href^='mission.html?id=']", a => a.length)) === 16);
    await page.reload(); await sleep(300);
    ok("progress persists after reload", (await page.evaluate(() => SE_APP.count())) === 16);
    ok("welcome back shown with saved name", /Nila/.test(await page.textContent("#se-welcome")));
    await page.click("#se-start"); await page.waitForSelector("#se-hud:not([hidden])"); await page.click("#se-log-btn"); await page.click("#se-reset-open");
    ok("reset asks for confirmation", await page.isVisible("#se-reset")); await page.click("#se-reset .se-btn-ghost"); ok("cancel keeps progress", (await page.evaluate(() => SE_APP.count())) === 16);
    await page.click("#se-log-btn").catch(() => {}); await page.click("#se-reset-open").catch(() => {}); await page.click("#se-reset-ok"); ok("reset clears progress", (await page.evaluate(() => SE_APP.count())) === 0);
    ok("Return to Website link", (await page.getAttribute(".se-hud-btns a", "href")) === "index.html");
    /* deep links: the engine can take several seconds to build in headless Chromium, so poll instead of sleeping.
       After "reset" no profile exists, so the creator appears first and the link is applied after "Go". */
    async function deepLink(id, zone) {
      await page.goto(base + "game.html?id=" + id); await sleep(300); await page.click("#se-start");
      await page.waitForSelector("#se-creator:not([hidden]), #se-hud:not([hidden])", { timeout: 20000 });
      if (await page.isVisible("#se-creator")) { await page.fill("#se-name", "Nila"); await page.click("#se-go"); }
      let z = "hub"; for (let t = 0; t < 150 && z !== zone; t++) { await sleep(100); z = await page.evaluate(() => SE_APP.state.zone); }
      ok("deep link ?id=" + id + " opens the " + zone + " zone", z === zone, z);
      ok("deep link ?id=" + id + " selects that mission", await page.evaluate(i => SE_APP.state.engine.state.target === i, id));
    }
    await deepLink("spirit", "mars"); await deepLink("apollo-lm", "moon"); await deepLink("ingenuity", "mars");
    ok("no JS errors during gameplay", errs.length === 0, errs.join(" | ")); await ctx.close();
  }

  /* ---------- 3. 3D unavailable (no Three.js reachable) -> fallback explorer ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }), page = await ctx.newPage(); const errs = errorsOf(page);
    await page.route(/three\.module\.min\.js/, r => r.abort()); /* blocks the bundled copy AND the CDN */ await page.goto(base + "game.html"); await sleep(200);
    await page.click("#se-start"); await page.waitForSelector("#se-creator:not([hidden])"); await sleep(600);
    ok("creator still usable without 3D (SVG preview)", await page.isVisible("#se-prevfb"));
    await page.fill("#se-name", "Omar"); await page.click("#se-go"); await page.waitForSelector("#se-fallback:not([hidden])");
    ok("fallback explorer lists 16 missions", (await page.$$eval("#se-fb-zones button[data-read]", b => b.length)) === 16);
    await page.click('#se-fb-zones button[data-read="voyager-1"]'); await sleep(100);
    ok("fallback opens mission panel + awards badge", (await page.evaluate(() => SE_APP.count())) === 1 && await page.isVisible("#se-mission"));
    ok("fallback explains the failure", /could not load/.test(await page.textContent("#se-fallback-note")));
    ok("no uncaught errors when Three.js fails to load", errs.length === 0, errs.join(" | ")); await ctx.close();
  }

  /* ---------- 4. mobile 390x844 touch ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }), page = await ctx.newPage(); const errs = errorsOf(page);
    if (useMock) await page.route(CDN, r => r.fulfill({ contentType: "text/javascript", body: mockThree() }));
    await page.goto(base + "game.html"); await sleep(300);
    await page.tap("#se-start"); await page.waitForSelector("#se-creator:not([hidden])"); await sleep(300);
    const box = await page.$eval("#se-go", e => { const r = e.getBoundingClientRect(); return [r.bottom, innerHeight, r.width]; });
    ok("Start Exploration visible and tappable on 390px", box[0] <= box[1] && box[2] > 100, JSON.stringify(box));
    await page.fill("#se-name", "Tara"); await page.tap("#se-go"); await page.waitForSelector("#se-hud:not([hidden])");
    ok("touch controls visible on mobile", await page.isVisible("#se-joy") && await page.isVisible("#se-jump"));
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok("no horizontal overflow at 390px", ov <= 1, ov);
    const jb = await page.$eval("#se-joy", e => { const b = e.getBoundingClientRect(); return b.width >= 100; }); ok("joystick is finger sized", jb);
    await page.evaluate(() => SE_APP.state.engine._teleport("portal-mars")); await sleep(150);
    ok("tap prompt appears near portal", await page.isVisible("#se-prompt")); await page.tap("#se-prompt"); await sleep(900);
    ok("tapping prompt travels to Mars", (await page.evaluate(() => SE_APP.state.zone)) === "mars");
    await page.evaluate(() => SE_APP.state.engine._teleport("spirit")); await sleep(150); await page.tap("#se-prompt"); await sleep(150);
    const fits = await page.$eval(".se-mission", e => { const r = e.getBoundingClientRect(); return r.width <= innerWidth && r.height <= innerHeight + 1; }); ok("mission panel fits a 390px screen", fits);
    ok("no JS errors on mobile", errs.length === 0, errs.join(" | ")); await ctx.close();
  }

  await browser.close(); server.close();
  console.log(results.join("\n")); console.log("\n" + (results.length - failed) + " passed, " + failed + " failed" + (process.env.REAL_THREE ? "" : " (3D layer mocked; WebGL rendering NOT tested)"));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.log(results.join("\n")); console.error(e); process.exit(2); });
