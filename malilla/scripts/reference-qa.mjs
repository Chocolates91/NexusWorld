import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: [
    "--no-sandbox",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--disable-dev-shm-usage",
  ],
});
const page = await browser.newPage({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});
page.setDefaultTimeout(240000);
const errors = [];
page.on("pageerror", (e) => {
  errors.push(e.message);
  console.log(e.message);
});
page.on("console", (m) => {
  if (m.type() === "error") {
    errors.push(m.text());
    console.log(m.text().slice(0, 600));
  }
});
await fs.mkdir("artifacts/references", { recursive: true });
await page.goto(process.env.APP_URL || "http://127.0.0.1:5173");
await page.waitForFunction(() => window.__MALILLA__?.ready);
const detailChecks = await page.evaluate(async () => {
  const { Raycaster, Vector3 } = await import(
    "/node_modules/three/build/three.module.js"
  );
  const furnitureDetailColliders =
    window.__MALILLA__.navigation.getDetailColliders();
  const scene = window.__MALILLA__.scene;
  scene.updateMatrixWorld(true);
  const ray = new Raycaster(
    new Vector3(4.09, 1.1, 9.465),
    new Vector3(0, -1, 0),
  );
  const hit = ray
    .intersectObjects(scene.children, true)
    .find((h) => h.object.isMesh);
  return {
    basinHit: hit
      ? {
          point: hit.point.toArray(),
          color: hit.object.material.color?.getHexString(),
        }
      : null,
    leafCount: furnitureDetailColliders.length,
    leafBlocked: furnitureDetailColliders.map((p) => {
      const c = p.reduce(
        (s, v) => [s[0] + v[0] / p.length, s[1] + v[1] / p.length],
        [0, 0],
      );
      return window.__MALILLA__.navigation.blocked(...c);
    }),
  };
});
console.log("Detail checks", JSON.stringify(detailChecks));
assert.equal(detailChecks.leafCount, 2);
assert.ok(detailChecks.leafBlocked.every(Boolean));
assert.equal(detailChecks.basinHit.color, "fffefa");
assert.ok(detailChecks.basinHit.point[1] > 0.72);
const results = [];
for (const id of ["bath1", "wardrobe", "primary", "bath2", "living"]) {
  await page.evaluate((id) => window.__MALILLA__.setView(id), id);
  await page.screenshot({
    path: `artifacts/references/${id}.png`,
    timeout: 240000,
  });
  results.push(await page.evaluate(() => window.__MALILLA__.stats()));
  console.log("Captured", id);
}
await page.evaluate(() => {
  window.__MALILLA__.setView("bath1");
  window.__MALILLA__.setMood("night");
});
await page.screenshot({
  path: "artifacts/references/bath1-night.png",
  timeout: 240000,
});
await page.evaluate(() => {
  window.__MALILLA__.setView("bath1");
  window.__MALILLA__.setMood("day");
});
if (process.env.CAPTURE_4K === "1") {
  const promise = page.waitForEvent("download", { timeout: 300000 });
  await page.click("#capture");
  const download = await promise;
  await download.saveAs("artifacts/references/Malilla-bathroom-3840x2160.png");
  const png = await fs.readFile(
    "artifacts/references/Malilla-bathroom-3840x2160.png",
  );
  assert.equal(png.readUInt32BE(16), 3840);
  assert.equal(png.readUInt32BE(20), 2160);
  console.log("Verified 4K bathroom PNG");
}
await fs.writeFile(
  "artifacts/references/qa.json",
  JSON.stringify({ errors, detailChecks, results }, null, 2),
);
await browser.close();
assert.deepEqual(errors, []);
