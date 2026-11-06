import * as T from "three";
import {
  WALLS,
  H,
  DOOR_H,
  DOORS,
  WINDOWS,
  FOOTPRINT,
  FLOORS,
  P_WINBAND,
  CURVED_GLASS,
  RAILING,
  rectPoly,
} from "./data/source-plan.js";
import { M, material, worldUV } from "./materials.js";
import { box, rounded, link, tube, mesh } from "./geometry.js";
export function prism(poly, y0, y1, mat) {
  const s = new T.Shape(poly.map((p) => new T.Vector2(...p)));
  const g = new T.ExtrudeGeometry(s, { depth: y1 - y0, bevelEnabled: false });
  g.rotateX(Math.PI / 2);
  g.translate(0, y1, 0);
  worldUV(g, 1.2);
  return mesh(g, mat);
}
function floor(poly, y, mat, scale) {
  const s = new T.Shape(poly.map((p) => new T.Vector2(p[0], -p[1])));
  const g = new T.ShapeGeometry(s);
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  worldUV(g, scale);
  const o = mesh(g, mat);
  o.castShadow = false;
  return o;
}
import { architectureColliders } from "./data/colliders.js";
export const doorLeaves = [];
export function buildArchitecture() {
  const group = new T.Group();
  group.name = "Exact source architecture";
  group.add(prism(FOOTPRINT, -0.14, -0.012, M.wall));
  group.add(floor(FOOTPRINT, 0, M.floor, 2.4));
  FLOORS.forEach((f) =>
    group.add(
      floor(
        f.poly,
        0.007,
        f.name === "ext"
          ? M.terrace
          : f.poly.every((p) => p[1] > 8)
            ? M.bathroomFloor
            : M.stone,
        1.2,
      ),
    ),
  );
  for (const w of WALLS) {
    group.add(prism(w.poly, 0, w.h, M.wall));
    // Each visible boundary gets a painted skirting and a narrow ceiling reveal.
    for (let i = 0; i < w.poly.length; i++) {
      const a = w.poly[i],
        b = w.poly[(i + 1) % w.poly.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 0.24) continue;
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      for (const [y, hh, dd] of [
        [0.005, 0.075, 0.018],
        [H - 0.045, 0.018, 0.018],
      ]) {
        const o = box(len, hh, dd, M.frame, mid[0], y, mid[1]);
        o.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
        group.add(o);
      }
    }
  }
  group.add(prism(P_WINBAND, 0, 0.9, M.wall), prism(P_WINBAND, 2.2, H, M.wall));
  for (const w of WINDOWS) {
    if (w.sill > 0) group.add(prism(rectPoly(w.r), 0, w.sill, M.wall));
    group.add(prism(rectPoly(w.r), w.head, H, M.wall));
    const [x0, z0, x1, z1] = w.r,
      horizontal = x1 - x0 > z1 - z0;
    const a = horizontal ? [x0, (z0 + z1) / 2] : [(x0 + x1) / 2, z0],
      b = horizontal ? [x1, (z0 + z1) / 2] : [(x0 + x1) / 2, z1];
    group.add(windowFrame(a, b, w.sill, w.head, w.door, w.sill === 1.15));
    if (!w.door) architectureColliders.push(rectPoly(w.r));
    else {
      // half of each terrace slider is parked/open; collision matches glass panel.
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      architectureColliders.push(
        rectPoly([
          Math.min(a[0], mid[0]) - 0.025,
          Math.min(a[1], mid[1]) - 0.025,
          Math.max(a[0], mid[0]) + 0.025,
          Math.max(a[1], mid[1]) + 0.025,
        ]),
      );
    }
    if (w.sill === 0.9) group.add(curtain(a, b, w.sill));
  }
  for (const [a, b] of CURVED_GLASS) group.add(windowFrame(a, b, 0.9, 2.2));
  // Honed ceramic wall panels sit 4mm inside the existing bathroom faces.
  for (const [x, z, w, d] of [
    [5, 0.646, 2.98, 0.004],
    [6.486, 1.415, 0.004, 1.55],
    [3.516, 1.415, 0.004, 1.55],
    [5.475, 2.184, 2.03, 0.004],
    [4.603, 9.734, 2.074, 0.004],
    [3.566, 8.916, 0.004, 1.64],
    [5.634, 8.47, 0.004, 0.73],
    [5.634, 9.55, 0.004, 0.37],
    [5.05, 8.096, 1.18, 0.004],
  ]) {
    const panel = box(
      w,
      H - 0.016,
      d,
      z > 8 ? M.bathroomTile : M.stone,
      x,
      0.008,
      z,
    );
    panel.geometry.translate(x, 0, z);
    worldUV(panel.geometry, 1.2);
    panel.geometry.translate(-x, 0, -z);
    group.add(panel);
  }
  // Reference: vertical wood-effect ceramic strip on the shower's south wall.
  const feature = box(0.676, H - 0.018, 0.005, M.showerWood, 5.3, 0.008, 9.729);
  feature.geometry.translate(5.3, 0, 9.729);
  worldUV(feature.geometry, 1.2);
  feature.geometry.translate(-5.3, 0, -9.729);
  group.add(feature);
  // Sliding glass to terrace; light linen stacks stay outside the walkable aperture.
  group.add(curtain([7.87, 8.19], [10.42, 8.19], 0, true));
  for (const d of DOORS) {
    group.add(prism(rectPoly(d.r), DOOR_H, H, M.wall));
    const [x0, z0, x1, z1] = d.r;
    const horizontal = x1 - x0 > z1 - z0;
    const width = horizontal ? x1 - x0 : z1 - z0;
    const frame = new T.Group();
    frame.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
    frame.rotation.y = horizontal ? 0 : -Math.PI / 2;
    for (const x of [-width / 2, width / 2])
      frame.add(rounded(0.055, DOOR_H + 0.025, 0.14, M.frame, x, 0, 0, 0.008));
    frame.add(rounded(width + 0.07, 0.055, 0.14, M.frame, 0, DOOR_H, 0, 0.006));
    group.add(frame);
    if (d.slide) {
      // pocket door retracted fully; a slim leading edge remains in the jamb.
      frame.add(
        box(0.025, DOOR_H - 0.04, 0.035, M.frame, -width / 2 + 0.014, 0, 0),
      );
      continue;
    }
    if (d.swing2) {
      for (let k = 0; k < 2; k++) {
        const leaf = box(
          0.037,
          DOOR_H - 0.035,
          width / 2 - 0.012,
          M.frame,
          7.49,
          0.01,
          z0 + (width * (k + 0.5)) / 2,
        );
        group.add(leaf);
      }
      architectureColliders.push(rectPoly(d.r));
      continue;
    }
    const leaf = new T.Group();
    const closed = d.name === "Entrada";
    const actualWidth = width - 0.07;
    leaf.position.set(-width / 2 + 0.035, 0, 0);
    leaf.rotation.y = closed ? 0 : -Math.PI * 0.49;
    leaf.add(
      rounded(
        actualWidth,
        DOOR_H - 0.04,
        0.038,
        M.frame,
        actualWidth / 2,
        0.012,
        0,
        0.006,
      ),
    );
    for (const sign of [-1, 1]) {
      leaf.add(
        link(
          [actualWidth - 0.09, 0.99, sign * 0.025],
          [actualWidth - 0.09, 0.99, sign * 0.06],
          0.009,
          M.brass,
        ),
        link(
          [actualWidth - 0.09, 0.99, sign * 0.06],
          [actualWidth - 0.19, 0.99, sign * 0.06],
          0.009,
          M.brass,
        ),
      );
    }
    for (const y of [0.2, 1, 1.85])
      leaf.add(box(0.014, 0.065, 0.055, M.metal, 0.005, y, 0));
    frame.add(leaf);
    group.updateMatrixWorld(true);
    const pts = [
      [-0.01, -0.03],
      [actualWidth + 0.01, -0.03],
      [actualWidth + 0.01, 0.03],
      [-0.01, 0.03],
    ].map((p) => {
      const v = leaf.localToWorld(new T.Vector3(p[0], 0, p[1]));
      return [v.x, v.z];
    });
    architectureColliders.push(pts);
    doorLeaves.push(leaf);
  }
  // Preserve the original solid 1m parapet, adding only a slim metal coping.
  group.add(
    prism(RAILING.poly, 0, 1, M.wall),
    box(4.22, 0.025, 0.13, M.metal, 8.325, 1, 9.99),
  );
  // Lightweight sky only; no building/urban geometry.
  const roofPoly = [
    [0, 0.35],
    [10.71, 0.35],
    [10.71, 8.23],
    [5.83, 8.23],
    [5.83, 10.04],
    [3.46, 10.04],
    ...FOOTPRINT.slice(4),
  ];
  const ceiling = new T.Group();
  ceiling.name = "Ceiling";
  ceiling.add(prism(roofPoly, H, H + 0.12, M.wall));
  return { group, ceiling };
}
function windowFrame(a, b, sill, head, slider = false, casement = false) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const g = new T.Group();
  g.position.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2);
  g.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
  for (const yy of [sill, head])
    g.add(box(len, 0.045, 0.07, M.frame, 0, yy, 0));
  for (const xx of casement ? [-len / 2, len / 2] : [-len / 2, len / 2, 0])
    g.add(box(0.045, head - sill, 0.07, M.frame, xx, sill, 0));
  const glass = box(
    slider ? len / 2 - 0.05 : len - 0.05,
    head - sill - 0.065,
    0.008,
    casement ? M.bathGlass : M.glass,
    slider ? -len / 4 : 0,
    sill + 0.04,
    0,
  );
  glass.castShadow = false;
  g.add(glass);
  if (!slider) g.add(box(len + 0.04, 0.025, 0.21, M.stone, 0, sill - 0.025, 0));
  if (!casement)
    g.add(
      link(
        [len / 2 - 0.08, sill + 0.5, 0.06],
        [len / 2 - 0.08, sill + 0.62, 0.06],
        0.007,
        M.metal,
      ),
    );
  if (casement) {
    const wide = 0.06;
    for (const x of [-len / 2 + wide / 2, len / 2 - wide / 2])
      g.add(rounded(wide, head - sill, 0.055, M.frame, x, sill, -0.018, 0.004));
    for (const y of [sill, head - wide])
      g.add(rounded(len - wide * 2, wide, 0.055, M.frame, 0, y, -0.018, 0.004));
    const gasket = material("#828b85", null, { roughness: 0.75 });
    for (const x of [-len / 2 + wide, len / 2 - wide])
      g.add(
        box(
          0.006,
          head - sill - wide * 2,
          0.006,
          gasket,
          x,
          sill + wide,
          0.022,
        ),
      );
    for (const y of [sill + wide, head - wide])
      g.add(box(len - wide * 2, 0.006, 0.006, gasket, 0, y, 0.022));
    for (const y of [sill + 0.18, head - 0.22])
      g.add(
        rounded(0.018, 0.08, 0.028, M.frame, len / 2 - 0.01, y, 0.025, 0.006),
      );
    g.add(
      rounded(
        0.018,
        0.115,
        0.032,
        M.frame,
        -len / 2 + 0.047,
        (sill + head) / 2 - 0.05,
        0.045,
        0.007,
      ),
    );
  }
  return g;
}
function curtain(a, b, sill, stacks = false) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]),
    g = new T.Group();
  g.position.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2);
  g.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
  g.add(
    link(
      [-len / 2 - 0.13, 2.38, 0.13],
      [len / 2 + 0.13, 2.38, 0.13],
      0.012,
      M.brass,
    ),
  );
  const mat = material("#f6efdf", "fabric", {
    side: T.DoubleSide,
    transparent: true,
    opacity: 0.83,
    roughness: 1,
    normalScale: new T.Vector2(0.1, 0.1),
  });
  const widths = stacks ? [0.3, 0.3] : [len * 0.32, len * 0.25];
  for (let k = 0; k < 2; k++) {
    const width = widths[k],
      start = k === 0 ? -len / 2 - 0.1 : len / 2 - width + 0.1;
    const geo = new T.PlaneGeometry(width, 2.25, 80, 30);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i);
      p.setXYZ(
        i,
        x,
        y + Math.cos(x * 40) * 0.009,
        p.getZ(i) +
          Math.cos((x / width) * Math.PI * 14) * 0.042 +
          0.012 * Math.sin(y * 5 + x * 7),
      );
    }
    geo.computeVertexNormals();
    const c = mesh(geo, mat, start + width / 2, 1.23, 0.15);
    c.castShadow = false;
    g.add(c);
  }
  return g;
}
