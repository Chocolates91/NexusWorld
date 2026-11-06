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
  viewport: { width: 960, height: 640 },
  deviceScaleFactor: 1,
});
page.setDefaultTimeout(240000);
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.APP_URL || "http://127.0.0.1:5173");
await page.waitForFunction(() => window.__MALILLA__?.ready);
await page.setViewportSize({ width: 1200, height: 850 });
for (const mood of ["day", "night"]) {
  await page.evaluate((m) => {
    window.__MALILLA__.setView("living");
    window.__MALILLA__.setMood(m);
  }, mood);
  await page.screenshot({
    path: `artifacts/living-final-${mood}.png`,
    timeout: 240000,
  });
}
await page.evaluate(() => {
  window.__MALILLA__.setMood("day");
  window.__MALILLA__.ao.enabled = false;
  window.__MALILLA__.setView("living");
});
await page.screenshot({ path: "artifacts/living-no-ao.png", timeout: 240000 });
await page.evaluate(() => {
  window.__MALILLA__.ao.enabled = true;
  window.__MALILLA__.setView("living");
});
await page.setViewportSize({ width: 960, height: 640 });
// Geometric collision checks include real wall/leaf colliders initialized by the app.
const collision = await page.evaluate(() => {
  const n = window.__MALILLA__.navigation;
  return {
    outside: n.blocked(11.3, 5),
    wall: n.blocked(3.46, 3.5),
    openDoor: n.blocked(3.46, 2.79),
    living: n.blocked(8.4, 4.6),
  };
});
assert.equal(collision.outside, true);
assert.equal(collision.wall, true);
assert.equal(collision.openDoor, false);
assert.equal(collision.living, false);
await page.selectOption("#mode", "walk");
const before = await page.evaluate(() =>
  window.__MALILLA__.camera.position.toArray(),
);
// Deterministic simulation of elapsed time avoids equating software-GPU frames with real time.
await page.keyboard.down("KeyW");
await page.evaluate(() => {
  for (let i = 0; i < 60; i++) window.__MALILLA__.navigation.step(1 / 60);
});
await page.keyboard.up("KeyW");
const after = await page.evaluate(() =>
  window.__MALILLA__.camera.position.toArray(),
);
assert.ok(Math.hypot(after[0] - before[0], after[2] - before[2]) > 0.25);
assert.equal(after[1], 1.62);
await page.selectOption("#mode", "orbit");
await page.evaluate(() => window.__MALILLA__.setView("living"));
const high = await page.evaluate(() => window.__MALILLA__.stats().buffer);
await page.selectOption("#quality", "ultra");
const ultra = await page.evaluate(() => ({
  shadow: window.__MALILLA__.scene.children.find((o) => o.isDirectionalLight)
    .shadow.mapSize.x,
  quality: window.__MALILLA__.stats().quality,
}));
assert.equal(ultra.shadow, 4096);
assert.equal(ultra.quality, "ultra");
await page.selectOption("#quality", "high");
await page.click("#roof");
assert.equal(await page.getAttribute("#roof", "aria-pressed"), "false");
await page.click("#roof");
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
await page.screenshot({ path: "artifacts/mobile.png", timeout: 240000 });
assert.ok(await page.locator("#capture").isVisible());
await page.setViewportSize({ width: 1280, height: 800 });
const downloadEvent = page.waitForEvent("download", { timeout: 300000 });
await page.click("#capture");
const download = await downloadEvent;
await download.saveAs("artifacts/Malilla-living-3840x2160.png");
const png = await fs.readFile("artifacts/Malilla-living-3840x2160.png");
const actual = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
assert.deepEqual(actual, { width: 3840, height: 2160 });
const report = {
  collision,
  movement: { before, after },
  ultra,
  capture: actual,
  errors,
  stats: await page.evaluate(() => window.__MALILLA__.stats()),
};
await fs.writeFile(
  "artifacts/interaction.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
await browser.close();
assert.equal(errors.length, 0);
