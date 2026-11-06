import * as T from "three";
import { buildLegacyItem } from "./legacy-furniture.js";
import { M, material } from "./materials.js";
import {
  mesh,
  box,
  rounded,
  cylinder,
  ellipsoid,
  lathe,
  tube,
  link,
  pillow,
  seam,
} from "./geometry.js";
import { H } from "./data/source-plan.js";
export const lightFixtures = [];
const linen = material("#e8dfcd", "fabric"),
  cream = material("#f9f2e6", "fabric"),
  rust = material("#aa664f", "fabric"),
  sage = material("#8b947b", "fabric");
const piping = material("#c9bba5", "fabric");
export function vase(g, x, y, z, scale = 1) {
  g.add(
    lathe(
      [
        [0, 0],
        [0.065, 0],
        [0.08, 0.02],
        [0.09, 0.12],
        [0.055, 0.21],
        [0.035, 0.25],
        [0.032, 0.26],
        [0.026, 0.26],
        [0.028, 0.22],
        [0.047, 0.2],
        [0.065, 0.11],
        [0.055, 0.02],
        [0, 0.02],
      ].map((p) => p.map((v) => v * scale)),
      material("#d9c7af", null, { roughness: 0.8 }),
      x,
      y,
      z,
    ),
  );
  for (let k = 0; k < 3; k++) {
    g.add(
      tube(
        [
          [x, y + 0.2 * scale, z],
          [x + 0.03 * k, y + 0.35 * scale, z - 0.025],
          [x + 0.04 * (k - 1), y + (0.5 + k * 0.06) * scale, z],
        ],
        0.0015,
        M.wood,
      ),
    );
    for (let j = 0; j < 4; j++)
      g.add(
        ellipsoid(
          x + 0.04 * (k - 1) + 0.018 * (j % 2 ? 1 : -1),
          y + (0.32 + j * 0.04 + k * 0.06) * scale,
          z,
          0.024 * scale,
          0.012 * scale,
          0.009 * scale,
          material("#8e9477"),
        ),
      );
  }
}
function books(g, x, y, z) {
  for (let k = 0; k < 3; k++) {
    const o = rounded(
      0.23 - k * 0.018,
      0.022,
      0.17 - k * 0.008,
      material(["#b88760", "#cfc5b4", "#5e6c60"][k]),
      x,
      y + k * 0.024,
      z,
      0.003,
    );
    o.rotation.y = k * 0.17;
    g.add(o);
    g.add(box(0.21, 0.014, 0.164, cream, x, y + k * 0.024 + 0.004, z + 0.003));
  }
}
export function fixture(g, x, y, z, power = 12, range = 5) {
  const l = new T.PointLight("#ffd4a0", power, range, 2);
  l.position.set(x, y, z);
  l.userData.lamp = true;
  l.userData.power = power;
  lightFixtures.push(l);
  g.add(l);
}
function tableLamp(g, x, y, z, s = 1) {
  g.add(
    lathe(
      [
        [0, 0],
        [0.08, 0],
        [0.087, 0.04],
        [0.06, 0.14],
        [0.03, 0.22],
        [0.03, 0.24],
      ],
      material("#b0906c", null, { roughness: 0.65 }),
      x,
      y,
      z,
    ),
  );
  const shade = mesh(
    new T.CylinderGeometry(0.115 * s, 0.15 * s, 0.2 * s, 64, 1, true),
    material("#ede0c8", "fabric", {
      side: T.DoubleSide,
      emissive: "#ffd4a0",
      emissiveIntensity: 0.3,
    }),
    x,
    y + 0.31 * s,
    z,
  );
  g.add(shade);
  for (const yy of [y + 0.21 * s, y + 0.41 * s]) {
    const t = mesh(
      new T.TorusGeometry((yy < y + 0.3 ? 0.15 : 0.115) * s, 0.002, 6, 64),
      M.brass,
      x,
      yy,
      z,
    );
    t.rotation.x = Math.PI / 2;
    g.add(t);
  }
  fixture(g, x, y + 0.28 * s, z, 5, 3.5);
}
function sofa(g, it) {
  const w = it.w,
    d = it.d,
    hw = w / 2,
    hd = d / 2,
    chaise = it.type === "chaise";
  const sd = chaise ? 0.95 : d;
  const arm = 0.18,
    back = 0.23,
    cw = Math.min(0.85, w * 0.36);
  const seatY = 0.3;
  for (const x of [-hw + 0.18, hw - 0.18])
    for (const z of [-hd + 0.16, -hd + sd - 0.13])
      g.add(cylinder(0.025, 0.095, M.black, x, 0, z));
  g.add(
    rounded(w - 0.05, 0.23, sd - 0.03, linEN(), 0, 0.08, -hd + sd / 2, 0.09),
  );
  if (chaise)
    g.add(
      rounded(cw - 0.02, 0.23, d - 0.1, linEN(), hw - cw / 2, 0.08, 0, 0.09),
    );
  g.add(rounded(w, 0.62, back, linen, 0, 0.14, -hd + back / 2, 0.1));
  for (const x of [-hw + arm / 2, ...(chaise ? [] : [hw - arm / 2])])
    g.add(rounded(arm, 0.53, sd, linen, x, 0.1, -hd + sd / 2, 0.085));
  const n = it.type === "armchair" ? 1 : chaise ? 2 : 3;
  const span = w - arm * (chaise ? 1 : 2) - (chaise ? cw : 0);
  for (let i = 0; i < n; i++) {
    const ww = span / n - 0.015,
      x = -hw + arm + (span / n) * (i + 0.5),
      dd = sd - back - 0.025,
      z = -hd + back + dd / 2;
    g.add(
      pillow(ww, 0.19, dd, cream, x, seatY, z, i),
      seam(ww, dd, seatY + 0.105, piping, x, z),
    );
    const backC = pillow(ww, 0.35, 0.17, linen, x, 0.46, -hd + 0.245, i + 6);
    backC.rotation.x = -0.12;
    g.add(backC);
  }
  if (chaise) {
    const dd = d - back - 0.035,
      x = hw - cw / 2,
      z = -hd + back + dd / 2;
    g.add(
      pillow(cw - 0.025, 0.19, dd, cream, x, seatY, z, 4),
      seam(cw - 0.025, dd, 0.405, piping, x, z),
    );
    g.add(pillow(cw - 0.045, 0.35, 0.17, linen, x, 0.46, -hd + 0.245, 9));
  }
  for (let i = 0; i < (w < 1 ? 1 : 3); i++) {
    const x = w < 1 ? 0 : -hw + 0.4 + (i * (w - 0.8)) / 2;
    const p = pillow(
      0.36,
      0.37,
      0.13,
      [sage, cream, rust][i],
      x,
      0.48,
      -hd + 0.4,
      i * 11,
    );
    p.rotation.set(-0.14, 0, (i - 1) * 0.13);
    g.add(p);
  }
  // A cloth throw with a draped edge, rather than a rectangular slab.
  const throwG = new T.PlaneGeometry(0.48, 0.85, 28, 48),
    pos = throwG.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i),
      v = (pos.getY(i) + 0.425) / 0.85;
    const t = v * 0.85;
    const yy =
      t < 0.47
        ? 0.5 + 0.008 * Math.sin(x * 47 + t * 22)
        : 0.5 - (t - 0.47) * 1.05;
    pos.setXYZ(
      i,
      x,
      yy + 0.004 * Math.sin(x * 63),
      -hd + 0.44 + Math.min(t, 0.49) + 0.014 * Math.sin(t * 8 + x * 4),
    );
  }
  throwG.computeVertexNormals();
  const cloth = mesh(
    throwG,
    material("#9b9f88", "fabric", { side: T.DoubleSide }),
    -hw + 0.43,
    0,
    0,
  );
  g.add(cloth);
}
function linEN() {
  return linen;
}
function bed(g, it) {
  const w = it.w,
    d = it.d;
  g.add(rounded(w, 0.22, d, M.wood, 0, 0.09, 0, 0.035));
  for (const x of [-w / 2 + 0.12, w / 2 - 0.12])
    for (const z of [-d / 2 + 0.12, d / 2 - 0.12])
      g.add(cylinder(0.026, 0.09, M.black, x, 0, z));
  g.add(pillow(w - 0.035, 0.24, d - 0.065, cream, 0, 0.3, 0, 2));
  g.add(rounded(w + 0.01, 1.08, 0.085, linen, 0, 0.06, -d / 2 + 0.04, 0.04));
  for (let i = 0; i < 9; i++)
    g.add(
      link(
        [-w / 2 + ((i + 1) * w) / 10, 0.16, -d / 2 + 0.086],
        [-w / 2 + ((i + 1) * w) / 10, 1.03, -d / 2 + 0.086],
        0.0015,
        piping,
      ),
    );
  // Duvet is a triangulated draped cloth, with sagging sides and multi-scale wrinkles.
  const geo = new T.PlaneGeometry(w + 0.16, d * 0.76, 90, 90),
    p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      t = (p.getY(i) + d * 0.38) / (d * 0.76);
    const xx = x;
    const zz = -d * 0.22 + t * d * 0.76;
    const sag = Math.max(0, Math.abs(x) - w / 2 + 0.06) * 2.8;
    const fold =
      0.013 * Math.sin(x * 19 + zz * 14) +
      0.007 * Math.sin(x * 37 - zz * 27) +
      0.009 * Math.sin(zz * 41) * Math.pow(Math.abs(x) / (w / 2 + 0.08), 3);
    p.setXYZ(i, xx, 0.602 - sag + fold, zz);
  }
  geo.computeVertexNormals();
  g.add(mesh(geo, material("#efe7d6", "fabric", { side: T.DoubleSide })));
  for (const x of [-w * 0.245, w * 0.245]) {
    const a = pillow(
      w * 0.42,
      0.15,
      0.38,
      cream,
      x,
      0.57,
      -d / 2 + 0.32,
      8 + x,
    );
    a.rotation.y = x * 0.1;
    g.add(a);
  }
  const p1 = pillow(0.4, 0.25, 0.13, rust, 0, 0.62, -d / 2 + 0.5, 14);
  p1.rotation.x = -0.3;
  g.add(p1);
  const runner = new T.PlaneGeometry(w + 0.13, 0.38, 60, 15),
    a = runner.attributes.position;
  for (let i = 0; i < a.count; i++) {
    let x = a.getX(i),
      z = a.getY(i);
    a.setXYZ(
      i,
      x,
      0.627 -
        Math.max(0, Math.abs(x) - w / 2 + 0.04) * 2.3 +
        0.005 * Math.sin(x * 44),
      d * 0.29 + z,
    );
  }
  runner.computeVertexNormals();
  g.add(mesh(runner, material("#9d765c", "fabric", { side: T.DoubleSide })));
}
function chair(g, it) {
  const h = it.h,
    w = it.w,
    d = it.d,
    seat = it.type === "barstool" ? h - 0.06 : 0.455;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      g.add(
        link(
          [sx * (w / 2 - 0.035), 0, sz * (d / 2 - 0.03)],
          [sx * (w / 2 - 0.075), seat, sz * (d / 2 - 0.08)],
          0.017,
          M.wood,
        ),
      );
  g.add(
    pillow(w, 0.065, d - 0.02, material("#c0a588", "fabric"), 0, seat, 0, 3),
  );
  if (it.type === "barstool") {
    g.add(
      link(
        [-w * 0.35, 0.28, -d * 0.35],
        [w * 0.35, 0.28, -d * 0.35],
        0.01,
        M.black,
      ),
    );
    return;
  }
  // Curved upholstered shell, thickness, and continuous bent-wood rail.
  const pts = [];
  for (let i = 0; i <= 32; i++) {
    const a = Math.PI * 0.12 + (i / 32) * Math.PI * 0.76;
    pts.push([Math.cos(a) * w * 0.53, h - 0.09, -Math.sin(a) * d * 0.49]);
  }
  g.add(tube(pts, 0.033, M.wood, 64));
  for (const sx of [-1, 1])
    g.add(
      link(
        [sx * w * 0.43, seat, -d * 0.3],
        [sx * w * 0.43, h - 0.1, -d * 0.2],
        0.015,
        M.wood,
      ),
    );
  const gg = new T.CylinderGeometry(
    w * 0.5,
    w * 0.5,
    h - seat - 0.15,
    48,
    8,
    true,
    Math.PI * 0.65,
    Math.PI * 0.7,
  );
  gg.scale(1, 1, d / w);
  const back = mesh(
    gg,
    material("#c7b194", "fabric", { side: T.DoubleSide }),
    0,
    (h + seat) / 2 + 0.01,
    0,
  );
  g.add(back);
}
function plant(g, it) {
  const r = Math.min(it.w, it.d) / 2,
    potH = it.h * 0.28;
  const terracotta = material(
    it.type === "olive" ? "#b78565" : "#ccbca4",
    null,
    { roughness: 0.9 },
  );
  g.add(
    lathe(
      [
        [0, 0],
        [r * 0.61, 0],
        [r * 0.67, 0.02],
        [r * 0.8, potH],
        [r * 0.84, potH + 0.018],
        [r * 0.76, potH + 0.018],
        [r * 0.72, potH - 0.015],
        [r * 0.58, 0.035],
        [0, 0.035],
      ],
      terracotta,
    ),
  );
  g.add(cylinder(r * 0.72, 0.012, material("#504638"), 0, potH - 0.025, 0));
  const foliage = [
    material("#566541", null, { roughness: 0.85, side: T.DoubleSide }),
    material("#748058", null, { roughness: 0.9, side: T.DoubleSide }),
    material("#92996a", null, { roughness: 0.85, side: T.DoubleSide }),
  ];
  if (it.type === "olive") {
    g.add(
      tube(
        [
          [0, potH, 0],
          [0.025, it.h * 0.55, 0],
          [-0.02, it.h * 0.82, 0.01],
        ],
        0.019,
        M.wood,
      ),
    );
    for (let k = 0; k < 16; k++) {
      const a = k * 2.399,
        y = potH + (it.h - potH) * (0.18 + k / 22),
        rr = r * (0.45 + 0.4 * Math.sin(k * 2) ** 2),
        tip = [Math.cos(a) * rr, y + 0.16, Math.sin(a) * rr];
      g.add(link([0, y - 0.12, 0], tip, 0.005, M.wood));
      for (let j = 0; j < 11; j++) {
        const t = j / 11,
          leaf = ellipsoid(
            tip[0] * t + Math.cos(j * 2) * 0.035,
            y - 0.1 + t * 0.27,
            tip[2] * t + Math.sin(j * 2) * 0.035,
            0.013,
            0.047,
            0.004,
            foliage[(j + k) % 3],
          );
        leaf.rotation.set(0.5, j * 1.4, 0.5);
        g.add(leaf);
      }
    }
  } else
    for (let k = 0; k < 17; k++) {
      const a = k * 2.399,
        len = (it.h - potH) * (0.5 + 0.5 * Math.sin(k * 7) ** 2),
        end = [Math.cos(a) * r * 0.85, potH + len, Math.sin(a) * r * 0.85];
      g.add(
        tube(
          [[0, potH, 0], [end[0] * 0.6, potH + len * 0.65, end[2] * 0.6], end],
          0.003,
          M.wood,
        ),
      );
      const geo = new T.PlaneGeometry(0.11, len * 0.52, 8, 20),
        p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        let x = p.getX(i),
          y = p.getY(i);
        const taper = Math.sqrt(Math.max(0, 1 - (y / (len * 0.26)) ** 2));
        p.setXYZ(
          i,
          x * taper,
          y,
          0.025 * Math.cos(y * 6) + 0.03 * Math.abs(x / 0.055),
        );
      }
      geo.computeVertexNormals();
      const leaf = mesh(geo, foliage[k % 3], end[0], end[1] - 0.05, end[2]);
      leaf.rotation.set(0.4 + Math.sin(k) * 0.3, a, Math.cos(k) * 0.5);
      g.add(leaf);
    }
}
function basin(g, w, d, y) {
  const ceramic = M.white;
  const outer = [
    [0, 0],
    [0.19, 0],
    [0.215, 0.03],
    [0.25, 0.115],
    [0.252, 0.13],
    [0.235, 0.135],
    [0.21, 0.035],
    [0.07, 0.025],
    [0.018, 0.024],
    [0, 0.024],
  ];
  const o = lathe(outer, ceramic, 0, y, 0);
  o.scale.set(w / 0.54, 1, d / 0.54);
  g.add(o);
  g.add(cylinder(0.016, 0.002, M.metal, 0, y + 0.026, 0));
}
function faucet(g, x, y, z) {
  g.add(
    cylinder(0.019, 0.19, M.metal, x, y, z),
    tube(
      [
        [x, y + 0.13, z],
        [x, y + 0.25, z],
        [x, y + 0.29, z + 0.045],
        [x, y + 0.28, z + 0.13],
        [x, y + 0.25, z + 0.13],
      ],
      0.013,
      M.metal,
    ),
  );
  g.add(
    link(
      [x + 0.04, y + 0.06, z],
      [x + 0.04, y + 0.13, z + 0.02],
      0.008,
      M.metal,
    ),
  );
}
function sink(g, it) {
  g.add(rounded(it.w, 0.44, it.d - 0.015, M.wood, 0, 0.32, 0, 0.008));
  for (const x of [-it.w * 0.24, it.w * 0.24])
    g.add(rounded(it.w * 0.48, 0.42, 0.019, M.wood, x, 0.33, it.d / 2, 0.005));
  g.add(
    rounded(it.w + 0.015, 0.025, it.d + 0.015, M.stone, 0, 0.765, 0, 0.008),
  );
  basin(g, it.w * 0.86, it.d * 0.78, 0.79);
  faucet(g, it.w * 0.27, 0.79, -it.d * 0.3);
  // Planar reflection assigned by main.js; every bathroom mirror reflects the actual scene.
  const mirror = mesh(
    new T.CircleGeometry(0.275, 64),
    M.mirror,
    0,
    1.48,
    -it.d / 2 + 0.016,
  );
  mirror.userData.mirror = true;
  g.add(mirror);
  const frame = mesh(
    new T.TorusGeometry(0.283, 0.008, 12, 64),
    M.brass,
    0,
    1.48,
    -it.d / 2 + 0.01,
  );
  g.add(frame);
  g.add(
    rounded(
      0.07,
      0.12,
      0.07,
      material("#c5b394"),
      -it.w * 0.33,
      0.79,
      0.07,
      0.012,
    ),
  );
}
function wc(g, it) {
  g.add(
    lathe(
      [
        [0, 0],
        [0.11, 0],
        [0.105, 0.22],
        [0.16, 0.3],
        [0.18, 0.36],
        [0.175, 0.39],
        [0.145, 0.39],
        [0.13, 0.34],
        [0.07, 0.3],
        [0, 0.3],
      ],
      M.white,
      0,
      0,
      0.06,
    ),
  );
  const seat = mesh(
    new T.TorusGeometry(0.145, 0.024, 12, 64),
    M.white,
    0,
    0.405,
    0.065,
  );
  seat.rotation.x = Math.PI / 2;
  seat.scale.y = 1.2;
  g.add(seat);
  g.add(rounded(0.32, 0.35, 0.15, M.white, 0, 0.41, -it.d / 2 + 0.08, 0.04));
  g.add(cylinder(0.022, 0.004, M.metal, 0, 0.762, -it.d / 2 + 0.07));
  g.add(
    ellipsoid(
      0,
      0.32,
      0.07,
      0.11,
      0.03,
      0.135,
      material("#d6ddda", null, { roughness: 0.1 }),
    ),
  );
}
function tub(g, it) {
  // Four separate ceramic rims plus a curved inner basin, never a solid white block.
  const w = it.w,
    d = it.d,
    h = it.h;
  g.add(
    rounded(w, h, 0.055, M.white, 0, 0, -d / 2 + 0.025, 0.025),
    rounded(w, h, 0.055, M.white, 0, 0, d / 2 - 0.025, 0.025),
  );
  for (const x of [-w / 2 + 0.03, w / 2 - 0.03])
    g.add(rounded(0.065, h, d - 0.05, M.white, x, 0, 0, 0.025));
  const bowl = lathe(
    [
      [0, 0],
      [0.12, 0],
      [0.2, 0.08],
      [0.265, h - 0.04],
      [0.28, h],
      [0.31, h],
      [0.285, h - 0.08],
      [0.225, 0.06],
      [0.14, -0.02],
      [0, -0.02],
    ],
    M.white,
    0,
    0.04,
    0,
  );
  bowl.scale.set((w - 0.08) / 0.62, 1, (d - 0.08) / 0.62);
  g.add(bowl);
  faucet(g, 0, h, -d / 2 + 0.04);
  g.add(cylinder(0.025, 0.005, M.metal, 0, 0.04, 0));
}
function shower(g, it) {
  g.add(rounded(it.w, 0.04, it.d, M.stone, 0, 0, 0, 0.01));
  g.add(box(0.27, 0.004, 0.012, M.metal, 0, 0.04, -it.d * 0.3));
  const glass = box(0.009, 1.98, it.d - 0.03, M.glass, -it.w / 2, 0.04, 0);
  glass.castShadow = false;
  g.add(glass);
  g.add(
    link(
      [-it.w / 2, 0.05, -it.d / 2],
      [-it.w / 2, 2.05, -it.d / 2],
      0.008,
      M.metal,
    ),
  );
  g.add(
    tube(
      [
        [it.w * 0.35, 0.9, -it.d / 2 + 0.03],
        [it.w * 0.35, 1.95, -it.d / 2 + 0.03],
        [it.w * 0.35, 2.05, -it.d / 2 + 0.18],
      ],
      0.012,
      M.metal,
    ),
  );
  g.add(cylinder(0.09, 0.015, M.metal, it.w * 0.35, 2.02, -it.d / 2 + 0.18));
  g.add(
    link(
      [it.w * 0.2, 1.05, -it.d / 2 + 0.05],
      [it.w * 0.45, 1.05, -it.d / 2 + 0.05],
      0.025,
      M.metal,
    ),
  );
}
function kitchen(g, it) {
  const w = it.w,
    d = it.d;
  const cabinet = material("#a89c85", null, { roughness: 0.56 });
  g.add(box(w, 0.08, d - 0.1, M.black, 0, 0, -0.025));
  const count = 5,
    bw = w / count;
  for (let i = 0; i < count; i++) {
    const x = -w / 2 + (i + 0.5) * bw;
    g.add(rounded(bw - 0.008, 0.76, d - 0.02, cabinet, x, 0.08, 0, 0.004));
    if (i === 1) {
      g.add(
        rounded(bw - 0.025, 0.48, 0.025, M.black, x, 0.16, d / 2, 0.008),
        box(
          bw - 0.09,
          0.31,
          0.008,
          material("#383b37", null, { roughness: 0.1, metalness: 0.25 }),
          x,
          0.21,
          d / 2 + 0.017,
        ),
      );
      g.add(
        link(
          [x - 0.2, 0.61, d / 2 + 0.045],
          [x + 0.2, 0.61, d / 2 + 0.045],
          0.009,
          M.metal,
        ),
      );
      for (const sx of [-0.17, 0.17]) {
        const knob = cylinder(
          0.022,
          0.015,
          M.metal,
          x + sx,
          0.72,
          d / 2 + 0.02,
        );
        knob.rotation.x = Math.PI / 2;
        g.add(knob);
      }
    } else {
      for (let j = 0; j < 3; j++) {
        g.add(
          box(
            bw - 0.018,
            0.012,
            0.012,
            material("#6e675c"),
            x,
            0.12 + j * 0.24,
            d / 2 + 0.006,
          ),
        );
        g.add(
          link(
            [x - 0.12, 0.28 + j * 0.24, d / 2 + 0.028],
            [x + 0.12, 0.28 + j * 0.24, d / 2 + 0.028],
            0.005,
            M.brass,
          ),
        );
      }
    }
    g.add(
      rounded(
        bw - 0.009,
        0.66,
        0.32,
        material("#e6e0d4"),
        x,
        1.53,
        -d / 2 + 0.15,
        0.008,
      ),
    );
    g.add(
      box(
        0.005,
        0.64,
        0.01,
        material("#afa797"),
        x + bw / 2 - 0.01,
        1.54,
        0.015,
      ),
    );
  }
  // Countertop has a real opening cut for the inset sink.
  const sinkX = 0.7,
    sinkW = 0.48,
    sinkD = 0.36,
    shape = new T.Shape([
      new T.Vector2(-w / 2, -d / 2),
      new T.Vector2(w / 2, -d / 2),
      new T.Vector2(w / 2, d / 2),
      new T.Vector2(-w / 2, d / 2),
    ]);
  const hole = new T.Path();
  hole.absellipse(sinkX, 0, sinkW / 2, sinkD / 2, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new T.ExtrudeGeometry(shape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
    steps: 1,
  });
  geo.rotateX(Math.PI / 2);
  const top = mesh(geo, M.stone, 0, 0.89, 0);
  g.add(top);
  const basinMetal = lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.12, 0.02],
      [0.18, 0.17],
      [0.2, 0.18],
      [0.205, 0.18],
      [0.19, 0.16],
      [0.115, 0.012],
      [0.05, -0.01],
      [0, -0.01],
    ],
    M.metal,
    sinkX,
    0.71,
    0,
  );
  basinMetal.scale.set(1.2, 1, 0.9);
  g.add(basinMetal);
  faucet(g, sinkX, 0.89, -d * 0.34);
  const hob = rounded(
    0.58,
    0.009,
    0.49,
    material("#151b1a", null, {
      roughness: 0.14,
      clearcoat: 1,
      clearcoatRoughness: 0.09,
    }),
    -0.72,
    0.898,
    0,
    0.012,
  );
  g.add(hob);
  for (const x of [-0.88, -0.56])
    for (const z of [-0.13, 0.13]) {
      const ring = mesh(
        new T.TorusGeometry(0.09, 0.0015, 6, 48),
        material("#727975"),
        x,
        0.909,
        z,
      );
      ring.rotation.x = Math.PI / 2;
      g.add(ring);
    }
  g.add(box(w, 0.58, 0.012, M.stone, 0, 0.91, -d / 2 + 0.004));
  g.add(
    box(
      w - 0.04,
      0.009,
      0.015,
      material("#fff0ce", null, { emissive: "#ffd6a1", emissiveIntensity: 2 }),
      0,
      1.515,
      -0.01,
    ),
  );
  fixture(g, 0, 1.46, 0.16, 10, 3);
  const board = rounded(0.26, 0.02, 0.35, M.wood, -w / 2 + 0.22, 0.9, 0, 0.035);
  board.rotation.y = 0.12;
  g.add(board);
  g.add(cylinder(0.055, 0.15, material("#e2ded2"), -w / 2 + 0.2, 0.92, 0));
  for (let k = 0; k < 4; k++)
    g.add(
      link(
        [-w / 2 + 0.18 + k * 0.014, 1.02, 0],
        [-w / 2 + 0.16 + k * 0.025, 1.22, 0.012],
        0.004,
        M.wood,
      ),
    );
}
function tv(g, it) {
  const w = it.w,
    h = it.h,
    d = it.d;
  g.add(rounded(w, h - 0.12, d, M.wood, 0, 0.12, 0, 0.015));
  for (const x of [-w * 0.42, w * 0.42])
    g.add(cylinder(0.018, 0.12, M.black, x, 0, 0));
  for (let i = 0; i < 36; i++)
    g.add(
      rounded(
        0.018,
        h - 0.16,
        0.018,
        M.wood,
        -w / 2 + ((i + 0.5) * w) / 36,
        0.14,
        d / 2,
        0.004,
      ),
    );
  g.add(rounded(1.23, 0.705, 0.032, M.black, 0, h + 0.1, -d / 2 + 0.09, 0.008));
  const screen = material("#1a2525", null, {
    roughness: 0.12,
    metalness: 0.35,
    clearcoat: 1,
  });
  g.add(
    rounded(1.205, 0.68, 0.003, screen, 0, h + 0.112, -d / 2 + 0.108, 0.004),
  );
  for (const sx of [-1, 1])
    g.add(
      link(
        [sx * 0.38, h, -d / 2 + 0.18],
        [sx * 0.3, h + 0.13, -d / 2 + 0.09],
        0.01,
        M.black,
      ),
    );
  vase(g, -w * 0.38, h, 0, 0.55);
  books(g, w * 0.36, h, 0);
}
function coffee(g, it) {
  g.add(rounded(it.w, 0.065, it.d, M.wood, 0, it.h - 0.065, 0, 0.026));
  for (const sx of [-1, 1])
    g.add(
      rounded(
        0.095,
        it.h - 0.065,
        it.d * 0.68,
        M.wood,
        sx * it.w * 0.28,
        0,
        0,
        0.022,
      ),
    );
  books(g, -0.24, it.h, 0);
  vase(g, 0.22, it.h, 0.03, 0.55);
  g.add(
    lathe(
      [
        [0, 0],
        [0.075, 0],
        [0.1, 0.045],
        [0.095, 0.055],
        [0.085, 0.05],
        [0.065, 0.01],
        [0, 0.01],
      ],
      M.white,
      -0.03,
      it.h,
      -0.12,
    ),
  );
}
function rug(g, it) {
  const mat = material("#e1d3bb", "jute");
  g.add(rounded(it.w, 0.009, it.d, mat, 0, 0.009, 0, 0.005));
  const border = material("#c4b090", "fabric");
  for (const x of [-it.w / 2 + 0.025, it.w / 2 - 0.025])
    g.add(box(0.015, 0.002, it.d - 0.02, border, x, 0.019, 0));
  for (const z of [-it.d / 2 + 0.025, it.d / 2 - 0.025])
    g.add(box(it.w, 0.002, 0.015, border, 0, 0.019, z));
  for (let k = 0; k < Math.floor(it.w / 0.016); k++)
    for (const sign of [-1, 1])
      g.add(
        link(
          [-it.w / 2 + 0.01 + k * 0.016, 0.013, (sign * it.d) / 2],
          [-it.w / 2 + 0.014 + k * 0.016, 0.008, sign * (it.d / 2 + 0.035)],
          0.0012,
          border,
        ),
      );
}
function fan(g, it) {
  g.add(
    cylinder(0.068, 0.045, M.black, 0, H - 0.045, 0),
    cylinder(0.011, 0.21, M.black, 0, H - 0.25, 0),
  );
  g.add(
    lathe(
      [
        [0, 0],
        [0.08, 0],
        [0.105, 0.025],
        [0.105, 0.07],
        [0.08, 0.1],
        [0, 0.1],
      ],
      M.black,
      0,
      H - 0.35,
      0,
    ),
  );
  for (let k = 0; k < 5; k++) {
    const sh = new T.Shape();
    sh.moveTo(0.08, -0.035);
    sh.bezierCurveTo(0.25, -0.11, 0.5, -0.12, 0.63, -0.04);
    sh.bezierCurveTo(0.68, 0, 0.63, 0.1, 0.54, 0.1);
    sh.bezierCurveTo(0.35, 0.11, 0.2, 0.035, 0.08, 0.035);
    sh.closePath();
    const geo = new T.ExtrudeGeometry(sh, {
      depth: 0.012,
      bevelEnabled: true,
      bevelSize: 0.004,
      bevelThickness: 0.004,
      bevelSegments: 2,
      curveSegments: 24,
    });
    geo.rotateX(-Math.PI / 2);
    const blade = mesh(geo, M.wood, 0, H - 0.29, 0);
    blade.rotation.y = (k / 5) * Math.PI * 2;
    g.add(blade);
  }
  const diffuser = ellipsoid(
    0,
    H - 0.36,
    0,
    0.095,
    0.055,
    0.095,
    material("#f1e7cd", null, {
      roughness: 0.5,
      emissive: "#ffe1a9",
      emissiveIntensity: 0.4,
    }),
  );
  g.add(diffuser);
  fixture(g, 0, H - 0.43, 0, 10, 5);
}
function officeChair(g, it) {
  const dark = material("#353a38", "fabric"),
    frame = material("#242925", null, { roughness: 0.42 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const tip = [Math.cos(a) * 0.29, 0.07, Math.sin(a) * 0.29];
    g.add(link([0, 0.12, 0], tip, 0.021, frame));
    const wheel = cylinder(0.033, 0.045, frame, tip[0], 0.025, tip[2]);
    wheel.rotation.x = Math.PI / 2;
    g.add(wheel);
  }
  g.add(cylinder(0.025, 0.31, M.metal, 0, 0.12, 0));
  g.add(pillow(0.49, 0.075, 0.46, dark, 0, 0.445, 0.02, 19));
  const back = pillow(0.44, 0.49, 0.075, dark, 0, 0.56, -0.22, 18);
  back.rotation.x = -0.1;
  g.add(back);
  g.add(
    tube(
      [
        [0, 0.3, -0.04],
        [0, 0.5, -0.23],
        [0, 0.95, -0.27],
      ],
      0.025,
      frame,
    ),
  );
  for (const sx of [-1, 1]) {
    g.add(
      tube(
        [
          [sx * 0.19, 0.46, -0.08],
          [sx * 0.29, 0.59, -0.06],
          [sx * 0.29, 0.65, 0.07],
        ],
        0.012,
        frame,
      ),
    );
    g.add(rounded(0.055, 0.033, 0.24, frame, sx * 0.29, 0.65, 0.015, 0.016));
  }
  for (let k = 0; k < 17; k++)
    g.add(
      link(
        [-0.19, 0.6 + k * 0.022, -0.172],
        [0.19, 0.6 + k * 0.022, -0.172],
        0.0011,
        material("#5b605c"),
      ),
    );
}
let desktopMaterial;
function desktop() {
  if (desktopMaterial) return desktopMaterial;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const x = c.getContext("2d"),
    gradient = x.createLinearGradient(0, 0, 1024, 640);
  gradient.addColorStop(0, "#66797c");
  gradient.addColorStop(1, "#c1b69e");
  x.fillStyle = gradient;
  x.fillRect(0, 0, 1024, 640);
  x.fillStyle = "#f0ede4";
  x.fillRect(88, 65, 820, 500);
  x.fillStyle = "#dde0d7";
  x.fillRect(88, 65, 820, 32);
  x.fillStyle = "#af7863";
  for (let k = 0; k < 3; k++) {
    x.beginPath();
    x.arc(108 + k * 18, 81, 4, 0, 7);
    x.fill();
  }
  x.fillStyle = "#c3cabb";
  x.fillRect(110, 120, 170, 420);
  x.fillStyle = "#859687";
  x.fillRect(307, 122, 575, 190);
  x.fillStyle = "#b7bba7";
  x.fillRect(330, 147, 210, 140);
  x.fillStyle = "#eee9db";
  x.fillRect(560, 147, 295, 140);
  x.fillStyle = "#a0a998";
  for (let k = 0; k < 11; k++)
    x.fillRect(314, 340 + k * 15, 180 + ((k * 37) % 330), 3);
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  desktopMaterial = new T.MeshPhysicalMaterial({
    map: t,
    emissiveMap: t,
    emissive: "#ffffff",
    emissiveIntensity: 0.18,
    roughness: 0.23,
    clearcoat: 0.8,
  });
  return desktopMaterial;
}
function enrichSecondary(g, it) {
  if (it.type === "deskpc") {
    g.traverse((o) => {
      if (o.isMesh && o.material.emissiveIntensity === 0.7)
        o.material = desktop();
    });
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 14; col++)
        g.add(
          rounded(
            0.023,
            0.004,
            0.019,
            material("#c4c6bd"),
            -0.201 + col * 0.029,
            it.h + 0.022,
            0.015 + row * 0.025,
            0.002,
          ),
        );
    g.add(
      rounded(
        0.12,
        0.004,
        0.017,
        material("#aaaFA6"),
        0,
        it.h + 0.023,
        0.127,
        0.003,
      ),
    );
    g.add(
      tube(
        [
          [0.15, it.h + 0.02, -0.18],
          [0.08, it.h + 0.015, -0.27],
          [0.09, it.h - 0.1, -0.35],
          [0.25, it.h - 0.24, -0.35],
        ],
        0.003,
        M.black,
      ),
    );
  }
  if (["shelf", "stepshelf", "dresser"].includes(it.type)) {
    const books = [];
    g.traverse((o) => {
      const p = o.geometry?.parameters;
      if (
        o.isMesh &&
        p?.width > 0.016 &&
        p.width < 0.05 &&
        p.height > 0.1 &&
        p.height < 0.3 &&
        p.depth > 0.08
      )
        books.push(o);
    });
    for (const o of books) {
      const p = o.geometry.parameters;
      for (const yy of [-p.height * 0.32, p.height * 0.28])
        g.add(
          box(
            p.width * 0.72,
            0.002,
            0.0015,
            M.brass,
            o.position.x,
            o.position.y + yy,
            o.position.z + p.depth / 2 + 0.001,
          ),
        );
    }
  }
  if (it.type === "washer") {
    for (const [r, t, mat] of [
      [0.176, 0.011, M.metal],
      [0.152, 0.008, M.black],
    ]) {
      const ring = mesh(
        new T.TorusGeometry(r, t, 12, 64),
        mat,
        0,
        0.45,
        it.d / 2 + 0.006,
      );
      g.add(ring);
    }
    g.add(
      ellipsoid(
        0,
        0.45,
        it.d / 2 + 0.007,
        0.138,
        0.138,
        0.018,
        material("#344241", null, {
          roughness: 0.13,
          metalness: 0.35,
          clearcoat: 1,
        }),
      ),
    );
    const dial = cylinder(
      0.025,
      0.018,
      M.metal,
      0.16,
      it.h - 0.11,
      it.d / 2 + 0.008,
    );
    dial.rotation.x = Math.PI / 2;
    g.add(dial);
    g.add(
      box(0.16, 0.045, 0.005, M.black, -0.05, it.h - 0.14, it.d / 2 + 0.009),
    );
  }
  return g;
}
export function buildFurniture(it, fixed = false) {
  const g = new T.Group();
  g.name = it.name;
  const fn = {
    officechair: officeChair,
    fan,
    chaise: sofa,
    sofa,
    armchair: sofa,
    sofabed: sofa,
    bed,
    chair,
    bistrochair: chair,
    barstool: chair,
    plant,
    olive: plant,
    sink,
    wc,
    tub,
    shower,
    kitchen,
    tvunit: tv,
    coffee,
    rug,
  }[it.type];
  if (!fn) {
    const o = buildLegacyItem(it, fixed);
    o.name = it.name;
    return enrichSecondary(o, it);
  }
  fn(g, it);
  g.position.set(it.x, it.elev || 0, it.y);
  g.rotation.y = (-it.rot * Math.PI) / 180;
  if (it.flip) g.scale.x = -1;
  return g;
}
export function addDecoration(group) {
  // Bedside lamps supplement the original furnishings; positions respect existing nightstands.

  // Dining table: ceramic serving bowl, linen placemats and glasses kept below sightlines.
  const ceramic = material("#e5dfcf", null, { roughness: 0.38 });
  group.add(
    lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.16, 0.055],
        [0.17, 0.07],
        [0.16, 0.075],
        [0.145, 0.055],
        [0.09, 0.01],
        [0, 0.01],
      ],
      ceramic,
      9.79,
      0.75,
      3.6,
    ),
  );
  for (let k = 0; k < 5; k++)
    group.add(
      ellipsoid(
        9.74 + Math.sin(k * 2) * 0.06,
        0.81,
        3.6 + Math.cos(k * 2) * 0.05,
        0.035,
        0.036,
        0.035,
        material(k % 2 ? "#a4914b" : "#b67948"),
      ),
    );
  for (const x of [9.4, 10.15])
    for (const z of [3.32, 3.88]) {
      group.add(
        rounded(
          0.31,
          0.002,
          0.22,
          material("#d9c4a0", "fabric"),
          x,
          0.751,
          z,
          0.01,
        ),
      );
      const plate = cylinder(0.095, 0.009, ceramic, x, 0.754, z);
      gNoShadow(plate);
      group.add(plate);
      const cup = lathe(
        [
          [0.026, 0],
          [0.029, 0.09],
          [0.027, 0.09],
          [0.024, 0.005],
          [0.026, 0],
        ],
        M.glass,
        x + 0.16,
        0.755,
        z - 0.02,
      );
      cup.castShadow = false;
      group.add(cup);
    }
  // Bath accessories: towels on rails, paper rolls and a linen mat.
  for (const b of [
    { x: 4.75, z: 0.72, rot: 0 },
    { x: 4.7, z: 9.68, rot: Math.PI },
  ]) {
    const g = new T.Group();
    g.position.set(b.x, 0, b.z);
    g.rotation.y = b.rot;
    g.add(link([-0.19, 1.18, 0], [0.19, 1.18, 0], 0.008, M.brass));
    const t = pillow(0.28, 0.4, 0.025, cream, 0, 0.8, 0.025, 11);
    g.add(t);
    group.add(g);
  }
  // Discreet foyer console vignette; no extra architecture.
  const bowl = lathe(
    [
      [0, 0],
      [0.07, 0],
      [0.1, 0.04],
      [0.095, 0.05],
      [0.085, 0.045],
      [0.06, 0.01],
      [0, 0.01],
    ],
    M.white,
    4.96,
    1.8,
    4.15,
  );
  group.add(bowl);
}
function gNoShadow(o) {
  o.castShadow = false;
}
