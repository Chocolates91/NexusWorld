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
try {
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
  await fs.mkdir("artifacts/entry", { recursive: true });
  await page.goto(process.env.APP_URL || "http://127.0.0.1:5173");
  await page.waitForFunction(() => window.__MALILLA__?.ready);
  await page.waitForFunction(
    () => getComputedStyle(document.getElementById("loading")).opacity === "0",
  );
  async function choose(id, mood) {
    const before = await page.evaluate(
      ({ id, mood }) => {
        const m = window.__MALILLA__;
        const f = m.stats().frames;
        m.setView(id);
        if (mood) m.setMood(mood);
        return f;
      },
      { id, mood },
    );
    await page.waitForFunction(
      ({ id, before }) =>
        window.__MALILLA__.stats().view === id &&
        window.__MALILLA__.stats().frames > before,
      { id, before },
    );
  }
  const checks = await page.evaluate(() => ({
    entranceBlocked: window.__MALILLA__.navigation.blocked(9.44, 0.6),
    terracePassage: window.__MALILLA__.navigation.blocked(9.0, 8.355),
    fixedPane: window.__MALILLA__.navigation.blocked(8.2, 8.355),
    background: window.__MALILLA__.scene.background.isDataTexture,
  }));
  assert.equal(checks.entranceBlocked, true);
  assert.equal(checks.terracePassage, false);
  assert.equal(checks.fixedPane, true);
  assert.equal(checks.background, true);
  console.log("Checks", checks);
  const results = [];
  for (const id of [
    "entry-detail",
    "entrance",
    "living",
    "dining",
    "terrace",
    "bath1",
  ]) {
    await choose(id);
    await page.screenshot({
      path: `artifacts/entry/${id}.png`,
      timeout: 240000,
    });
    results.push(await page.evaluate(() => window.__MALILLA__.stats()));
    console.log("Captured", id);
  }
  await choose("living", "sunset");
  await page.screenshot({
    path: "artifacts/entry/living-sunset.png",
    timeout: 240000,
  });
  await choose("entry-detail", "night");
  await page.screenshot({
    path: "artifacts/entry/entry-night.png",
    timeout: 240000,
  });
  await choose("living", "day");
  let capture = null;
  if (process.env.CAPTURE_4K === "1") {
    const promise = page.waitForEvent("download", { timeout: 300000 });
    await page.click("#capture");
    const dl = await promise;
    await dl.saveAs("artifacts/entry/Malilla-living-3840x2160.png");
    const png = await fs.readFile(
      "artifacts/entry/Malilla-living-3840x2160.png",
    );
    capture = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
    assert.deepEqual(capture, { width: 3840, height: 2160 });
    console.log("Verified 4K PNG");
  }
  await fs.writeFile(
    "artifacts/entry/qa.json",
    JSON.stringify({ errors, checks, results, capture }, null, 2),
  );
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
