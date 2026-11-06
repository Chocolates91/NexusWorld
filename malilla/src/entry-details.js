import * as T from "three";
import { M, material } from "./materials.js";
import { mesh, box, rounded, cylinder, tube, link } from "./geometry.js";
import { entrySpec, terraceLeafPlan } from "./data/entry-spec.js";
import { architectureColliders } from "./data/colliders.js";
const paint = material("#f5f4ef", null, { roughness: 0.43 });
const steel = material("#bec3c4", null, { metalness: 1, roughness: 0.27 });
const gasket = material("#555d57", null, { roughness: 0.8 });
function disc(r, depth, x, y, z, mat = steel) {
  const o = mesh(new T.CylinderGeometry(r, r, depth, 40), mat, x, y, z);
  o.rotation.x = Math.PI / 2;
  return o;
}
export function entryDoor() {
  const g = new T.Group(),
    [x0, , x1, z1] = entrySpec.entrance.rect,
    w = x1 - x0,
    h = entrySpec.entrance.height;
  g.name = "Reference entrance door";
  g.position.set((x0 + x1) / 2, 0, z1 - 0.022);
  const leafW = w - 0.075;
  g.add(rounded(leafW, h - 0.036, 0.06, paint, 0, 0.014, -0.014, 0.004));
  for (const x of [-w / 2 + 0.01, w / 2 - 0.01])
    g.add(rounded(0.066, h + 0.02, 0.025, paint, x, 0, 0.037, 0.003));
  g.add(rounded(w + 0.08, 0.065, 0.025, paint, 0, h - 0.005, 0.037, 0.003));
  for (const x of [-leafW / 2 - 0.004, leafW / 2 + 0.004])
    g.add(box(0.004, h - 0.025, 0.004, gasket, x, 0.008, 0.018));
  const hx = -leafW / 2 + 0.08;
  g.add(
    disc(0.03, 0.011, hx, 0.99, 0.026),
    link([hx, 0.99, 0.034], [hx, 0.99, 0.077], 0.009, steel),
    link([hx, 0.99, 0.077], [hx + 0.115, 0.99, 0.077], 0.009, steel),
  );
  g.add(
    disc(0.027, 0.009, hx, 0.845, 0.026),
    disc(0.006, 0.01, hx, 0.845, 0.032, gasket),
  );
  g.add(
    disc(0.008, 0.006, 0, 1.49, 0.02),
    disc(0.004, 0.008, 0, 1.49, 0.024, gasket),
    disc(0.008, 0.005, 0, 0.795, 0.02),
  );
  for (const y of [0.16, 0.68, 1.25, 1.84]) {
    g.add(cylinder(0.011, 0.11, steel, leafW / 2 + 0.009, y, 0.014));
    for (const yy of [y + 0.031, y + 0.074])
      g.add(cylinder(0.0115, 0.002, gasket, leafW / 2 + 0.009, yy, 0.014));
  }
  architectureColliders.push([
    [x0 + 0.025, z1 - 0.068],
    [x1 - 0.025, z1 - 0.068],
    [x1 - 0.025, z1 + 0.016],
    [x0 + 0.025, z1 + 0.016],
  ]);
  return g;
}
function intercom() {
  const g = new T.Group();
  g.name = "Reference intercom";
  g.add(rounded(0.15, 0.23, 0.026, paint, 0, 0, 0, 0.01));
  g.add(rounded(0.041, 0.218, 0.033, paint, -0.048, 0.006, 0.026, 0.013));
  // Receiver vents and small unbranded controls; the construction packaging is omitted.
  for (let k = 0; k < 6; k++)
    g.add(box(0.025, 0.0015, 0.001, gasket, -0.048, 0.178 + k * 0.004, 0.045));
  for (let k = 0; k < 3; k++)
    g.add(
      rounded(
        0.017,
        0.011,
        0.005,
        paint,
        0.026,
        0.025 + k * 0.025,
        0.017,
        0.003,
      ),
    );
  const points = [];
  for (let k = 0; k <= 160; k++) {
    const t = k / 160;
    points.push([
      -0.039 + 0.007 * Math.cos(t * Math.PI * 40),
      -0.005 - 0.14 * t,
      0.014 + 0.007 * Math.sin(t * Math.PI * 40),
    ]);
  }
  g.add(tube(points, 0.0022, paint, 180));
  g.add(
    tube(
      [
        [-0.039, -0.145, 0.014],
        [-0.015, -0.158, 0.014],
        [0.002, -0.13, 0.014],
        [0.002, 0.006, 0.014],
      ],
      0.0022,
      paint,
    ),
  );
  return g;
}
function powerPoint(g, x, y, z, kind = "socket") {
  g.add(rounded(0.075, 0.075, 0.009, paint, x, y, z, 0.004));
  if (kind === "switch")
    g.add(rounded(0.054, 0.048, 0.003, paint, x, y + 0.013, z + 0.006, 0.002));
  else {
    g.add(disc(0.022, 0.002, x, y + 0.037, z + 0.006, paint));
    for (const xx of [-0.009, 0.009])
      g.add(disc(0.003, 0.002, x + xx, y + 0.037, z + 0.008, gasket));
  }
}
function servicePanel(w, h, vents) {
  const g = new T.Group();
  g.add(rounded(w + 0.018, h + 0.018, 0.008, paint, 0, 0, 0, 0.005));
  if (!vents)
    g.add(
      rounded(
        w,
        h,
        0.012,
        material("#eceeeb", null, { roughness: 0.5 }),
        0,
        0.009,
        0.004,
        0.004,
      ),
    );
  else {
    // Slatted openings have backing and actual gaps, rather than dark painted lines.
    g.add(box(w - 0.012, h - 0.014, 0.004, gasket, 0, 0.014, 0.003));
    const slitHeight = 0.032,
      margin = 0.028;
    g.add(
      box(
        w,
        h - 0.018 - 2 * slitHeight - 2 * margin,
        0.012,
        paint,
        0,
        margin + slitHeight + 0.009,
        0.008,
      ),
    );
    for (const y of [0.009, h - 0.009 - margin])
      g.add(box(w, margin, 0.012, paint, 0, y, 0.008));
    for (const y of [margin + 0.009, h - 0.009 - margin - slitHeight])
      for (let k = 0; k < 25; k++)
        g.add(
          box(
            w / 25 - 0.0015,
            slitHeight,
            0.012,
            paint,
            -w / 2 + ((k + 0.5) * w) / 25,
            y,
            0.008,
          ),
        );
  }
  g.add(
    rounded(
      0.018,
      0.055,
      0.014,
      paint,
      w / 2 - 0.023,
      h / 2 - 0.025,
      0.02,
      0.006,
    ),
  );
  return g;
}
export function entranceDetails() {
  const g = new T.Group();
  g.name = "Reference entrance fittings";
  const phone = intercom();
  phone.position.set(8.61, 1.38, 0.617);
  g.add(phone);
  powerPoint(g, 8.61, 0.92, 0.614, "switch");
  powerPoint(g, 8.61, 0.23, 0.614);
  const stack = new T.Group();
  stack.name = "Three technical access doors";
  stack.position.set(10.443, 0, 1.02);
  stack.rotation.y = -Math.PI / 2;
  let y = entrySpec.services.bottom;
  for (const h of [...entrySpec.services.heights].reverse()) {
    const panel = servicePanel(entrySpec.services.width, h, y < 1.05);
    panel.position.y = y;
    stack.add(panel);
    y += h + entrySpec.services.gap;
  }
  g.add(stack);
  g.add(rounded(0.06, 0.044, 0.024, paint, 10.13, 2.32, 0.616, 0.008));
  // Shallow ceiling drop and supply grille remain entirely inside the living/entry zone.
  const beam = box(
    3.05,
    0.28,
    0.25,
    M.wall,
    9.065,
    entrySpec.beam.bottom,
    1.55,
  );
  g.add(beam);
  const vent = new T.Group();
  vent.position.set(10.584, 2.17, 2.65);
  vent.rotation.y = -Math.PI / 2;
  vent.add(
    rounded(0.38, 0.115, 0.008, paint, 0, 0, 0, 0.003),
    box(0.35, 0.084, 0.006, gasket, 0, 0.015, 0.005),
  );
  for (let k = 0; k < 7; k++)
    vent.add(box(0.35, 0.006, 0.012, paint, 0, 0.017 + k * 0.012, 0.011));
  g.add(vent);
  const tv = new T.Group();
  tv.position.set(10.456, 0, 6.6);
  tv.rotation.y = -Math.PI / 2;
  powerPoint(tv, -0.11, 0.24, 0);
  powerPoint(tv, 0, 0.24, 0);
  powerPoint(tv, 0.11, 0.24, 0);
  g.add(tv);
  return g;
}
export function terraceGlazing() {
  const g = new T.Group(),
    [x0, , x1] = entrySpec.glazing.rect,
    h = entrySpec.glazing.height,
    { z, pane, width, hinge, angle, poly } = terraceLeafPlan();
  g.name = "Three-pane terrace joinery";
  for (const y of [0.005, h - 0.036])
    g.add(rounded(x1 - x0, 0.036, 0.095, paint, (x0 + x1) / 2, y, z, 0.004));
  for (let k = 0; k <= 3; k++)
    g.add(rounded(0.042, h, 0.08, paint, x0 + k * pane, 0, z, 0.004));
  for (const index of [0, 2]) {
    const cx = x0 + (index + 0.5) * pane;
    const paneGlass = box(pane - 0.058, h - 0.09, 0.008, M.glass, cx, 0.044, z);
    paneGlass.castShadow = false;
    g.add(paneGlass);
    for (const x of [cx - (pane - 0.051) / 2, cx + (pane - 0.051) / 2])
      g.add(box(0.004, h - 0.08, 0.01, gasket, x, 0.04, z));
    architectureColliders.push([
      [cx - pane / 2, z - 0.035],
      [cx + pane / 2, z - 0.035],
      [cx + pane / 2, z + 0.035],
      [cx - pane / 2, z + 0.035],
    ]);
  }
  const leaf = new T.Group();
  leaf.position.set(hinge, 0.015, z);
  leaf.rotation.y = angle;
  for (const x of [-width, 0])
    leaf.add(rounded(0.039, h - 0.035, 0.055, paint, x, 0, 0, 0.004));
  for (const y of [0, h - 0.073])
    leaf.add(rounded(width, 0.038, 0.055, paint, -width / 2, y, 0, 0.004));
  const glass = box(
    width - 0.045,
    h - 0.12,
    0.007,
    M.glass,
    -width / 2,
    0.047,
    0,
  );
  glass.castShadow = false;
  leaf.add(glass);
  leaf.add(
    disc(0.015, 0.005, -width + 0.065, 1.0, -0.033),
    link(
      [-width + 0.065, 1, -0.036],
      [-width + 0.065, 1.11, -0.036],
      0.007,
      paint,
    ),
  );
  for (const y of [0.2, h - 0.32])
    leaf.add(cylinder(0.007, 0.075, paint, 0, y, 0));
  g.add(leaf);
  architectureColliders.push(poly);
  return g;
}
