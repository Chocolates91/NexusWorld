import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import { referenceSpec } from "../src/data/reference-spec.js";
import * as plan from "../src/data/source-plan.js";
import { inside, overlapsCircle, itemPolygon } from "../src/collision.js";
const original = fs.readFileSync(
  new URL("../legacy/Piso Malilla (3).html", import.meta.url),
  "utf8",
);
const a = original.indexOf("const H ="),
  b = original.indexOf("/* ───────────────────────── Utilidades geométricas");
const context = vm.createContext({});
const names = [
  "H",
  "DOOR_H",
  "WALLS",
  "DOORS",
  "WINDOWS",
  "CURVED_GLASS",
  "FOOTPRINT",
  "FLOORS",
  "ROOMS",
  "FIXED",
  "TPL_COMMON",
  "TPL_SEP",
];
vm.runInContext(
  original.slice(a, b) +
    '\nfunction uid(){return "test"};globalThis.plan={' +
    names.join(",") +
    ',items:template("A")};',
  context,
);
test("all architectural coordinates, openings, heights, fixed elements and source furniture match the untouched HTML", () => {
  for (const name of names)
    assert.deepEqual(
      JSON.parse(JSON.stringify(plan[name])),
      JSON.parse(JSON.stringify(context.plan[name])),
      name,
    );
  assert.deepEqual(
    plan.template("A").map(({ id, ...rest }) => rest),
    JSON.parse(JSON.stringify(context.plan.items)).map(
      ({ id, ...rest }) => rest,
    ),
  );
});
test("all three original furnishing variants remain available", () => {
  assert.equal(plan.template("A").length, 55);
  assert.ok(plan.template("B").some((i) => i.type === "aquarium"));
  assert.ok(plan.template("C").some((i) => i.type === "slats"));
  assert.ok(plan.template("C").some((i) => i.type === "headboard"));
});
test("source room labels are preserved, including the documented area discrepancy", () => {
  assert.equal(plan.ROOMS.length, 11);
  assert.equal(
    Math.round(
      plan.ROOMS.reduce((s, r) => s + Number(r.a.replace(",", ".")), 0) * 100,
    ),
    8685,
  );
});
test("collision detects narrow walls, rejects outside and leaves door aperture open", () => {
  const wall = [
    [3.41, 3.24],
    [3.51, 3.24],
    [3.51, 4],
    [3.41, 4],
  ];
  assert.ok(overlapsCircle(3.35, 3.5, 0.15, wall));
  assert.ok(!overlapsCircle(3.46, 2.79, 0.15, wall));
  assert.ok(inside([8.5, 7], plan.FOOTPRINT));
  assert.ok(!inside([12, 7], plan.FOOTPRINT));
});
test("chaise collision follows its L shape and preserves source rotations", () => {
  const it = { type: "chaise", w: 2.7, d: 1.6, x: 0, y: 0, rot: 0 };
  const poly = itemPolygon(it);
  assert.ok(!inside([-0.5, 0.5], poly));
  assert.ok(inside([1, 0.5], poly));
  assert.equal(poly.length, 6);
});
test("every original PBR texture exists with a 2048px WebP image header", () => {
  for (const name of ["oak", "timber", "linen", "stone", "plaster", "rug"])
    for (const suffix of ["color", "normal", "rough"]) {
      const file = fs.readFileSync(
        new URL(`../public/textures/${name}-${suffix}.webp`, import.meta.url),
      );
      assert.equal(file.subarray(0, 4).toString(), "RIFF");
      assert.ok(file.length > 1000);
      assert.equal(file.subarray(12, 16).toString(), "VP8 ");
      assert.equal(file.readUInt16LE(26) & 16383, 2048);
      assert.equal(file.readUInt16LE(28) & 16383, 2048);
    }
});
console.log(
  "Original SHA256",
  crypto.createHash("sha256").update(original).digest("hex"),
);

test("reference finishes retain source fixture IDs and label all inferred dimensions", () => {
  for (const id of Object.values(referenceSpec.fixtureIds))
    assert.ok(plan.FIXED.some((f) => f.id === id));
  assert.equal(referenceSpec.wardrobe.estimated, true);
  assert.equal(referenceSpec.shower.estimated, true);
  assert.equal(referenceSpec.wallTile.estimated, true);
  assert.equal(referenceSpec.shower.screen, false);
});
test("reference finish maps have real 2K/4K dimensions and lower resolution supporting maps", () => {
  for (const [name, colorSize] of Object.entries(referenceSpec.mapSizes))
    for (const suffix of ["color", "normal", "rough"]) {
      const file = fs.readFileSync(
        new URL(`../public/textures/${name}-${suffix}.webp`, import.meta.url),
      );
      assert.equal(file.subarray(0, 4).toString(), "RIFF");
      assert.equal(file.subarray(12, 16).toString(), "VP8 ");
      const size = suffix === "color" ? colorSize : 2048;
      assert.equal(file.readUInt16LE(26) & 16383, size);
      assert.equal(file.readUInt16LE(28) & 16383, size);
    }
});
