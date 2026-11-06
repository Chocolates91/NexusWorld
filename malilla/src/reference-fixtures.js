import * as T from "three";
import { M, material, worldUV } from "./materials.js";
import {
  mesh,
  box,
  rounded,
  cylinder,
  link,
  tube,
  ellipsoid,
} from "./geometry.js";
import { referenceSpec as spec } from "./data/reference-spec.js";
import { furnitureDetailColliders } from "./data/colliders.js";

const porcelain = material("#fffefa", null, {
  roughness: 0.2,
  clearcoat: 0.5,
  clearcoatRoughness: 0.16,
});
const chrome = material("#c2c7ca", null, {
  metalness: 1,
  roughness: 0.14,
  envMapIntensity: 1,
});
const dark = material("#555957", null, { roughness: 0.7 });
const oak = material("#ffffff", "oak-vanity", {
  roughness: 1,
  normalScale: new T.Vector2(0.13, 0.13),
});
const lacquer = material("#f4f3ee", null, { roughness: 0.43, clearcoat: 0.12 });
const lining = material("#b5a896", null, { roughness: 0.82 });
function outline(w, d, r, n = 12) {
  const pts = [];
  const corners = [
    [w / 2 - r, d / 2 - r, 0],
    [-w / 2 + r, d / 2 - r, Math.PI / 2],
    [-w / 2 + r, -d / 2 + r, Math.PI],
    [w / 2 - r, -d / 2 + r, Math.PI * 1.5],
  ];
  for (const [cx, cz, start] of corners)
    for (let i = 0; i <= n; i++) {
      const a = start + ((i / n) * Math.PI) / 2;
      pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
    }
  return pts;
}
function profile(rings, mat) {
  const pos = [],
    uv = [],
    indices = [];
  let count;
  for (const [w, d, y, cz, r] of rings) {
    const points = outline(w, d, Math.min(r, w * 0.48, d * 0.48));
    count = points.length;
    points.forEach(([x, z], i) => {
      pos.push(x, y, z + cz);
      uv.push(i / points.length, y);
    });
  }
  for (let k = 0; k < rings.length - 1; k++)
    for (let i = 0; i < count; i++) {
      const a = k * count + i,
        b = k * count + ((i + 1) % count),
        c = a + count,
        d = b + count;
      indices.push(a, c, b, b, c, d);
    }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return mesh(g, mat);
}
function woodPanel(w, h, d, x, y, z) {
  const o = rounded(w, h, d, oak, x, y, z, 0.004);
  worldUV(o.geometry, 1.2);
  return o;
}

export function referenceSink(g, it) {
  const { w, d, h } = it;
  const top = h - spec.vanity.topThickness,
    front = d / 2;
  // Open carcass: the ceramic bowl penetrates the vanity; no solid box may fill it.
  for (const x of [-w / 2 + 0.012, w / 2 - 0.012])
    g.add(box(0.016, top - 0.1, d - 0.025, lining, x, 0.1, 0));
  g.add(box(w - 0.024, top - 0.1, 0.012, lining, 0, 0.1, -d / 2 + 0.012));
  g.add(box(w - 0.024, 0.018, d - 0.03, lining, 0, 0.1, 0));
  g.add(
    box(
      0.012,
      top - 0.25,
      d - 0.03,
      lining,
      w * (spec.vanity.leftDoorFraction - 0.5),
      0.1,
      0,
    ),
  );
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      g.add(
        rounded(
          0.024,
          0.1,
          0.024,
          chrome,
          sx * (w / 2 - 0.045),
          0,
          sz * (d / 2 - 0.045),
          0.003,
        ),
      );
  // Split fronts: left cupboard, two drawers on the right, full-width top fascia.
  g.add(woodPanel(w - 0.008, 0.105, 0.022, 0, top - 0.105, front));
  const usable = top - 0.105 - 0.105,
    left = w * spec.vanity.leftDoorFraction;
  g.add(
    woodPanel(left - 0.008, usable, 0.022, -w / 2 + left / 2, 0.105, front),
  );
  for (let j = 0; j < 2; j++)
    g.add(
      woodPanel(
        w - left - 0.012,
        usable / 2 - 0.007,
        0.022,
        left / 2,
        0.105 + (j * usable) / 2,
        front,
      ),
    );
  g.add(box(w - 0.012, 0.009, 0.014, dark, 0, top - 0.112, front - 0.004));
  g.add(
    profile(
      [
        [w, d, top, 0, 0.012],
        [w, d, h, 0, 0.012],
        [w - 0.012, d - 0.012, h + 0.001, 0, 0.012],
        [w * 0.7, d * 0.6, h + 0.001, 0.018, 0.024],
        [w * 0.64, d * 0.53, h - 0.019, 0.02, 0.03],
        [w * 0.53, d * 0.4, h - 0.105, 0.035, 0.045],
        [0.075, 0.065, h - 0.119, 0.035, 0.015],
        [0.034, 0.034, h - 0.119, 0.035, 0.017],
        [0.001, 0.001, h - 0.119, 0.035, 0.0004],
      ],
      porcelain,
    ),
  );
  // Basin is one continuous ceramic rim/cavity, not a separate vessel on a slab.
  const drain = cylinder(0.019, 0.002, chrome, 0, h - 0.118, 0.035);
  g.add(drain);
  g.add(rounded(0.032, 0.006, 0.006, chrome, 0, h - 0.04, -d * 0.245, 0.003));
  // Central single-lever basin mixer, matching the visible reference silhouette.
  const z = -d * 0.34;
  g.add(cylinder(0.023, 0.105, chrome, 0, h, z));
  g.add(rounded(0.03, 0.023, 0.105, chrome, 0, h + 0.087, z + 0.037, 0.01));
  g.add(rounded(0.036, 0.008, 0.066, chrome, 0, h + 0.119, z + 0.014, 0.004));
  // A finished mirror is a proposal: the photos show the wall before mirror installation.
  const mirror = mesh(
    new T.PlaneGeometry(w - 0.07, 0.64),
    M.mirror,
    0,
    1.47,
    -d / 2 + 0.018,
  );
  mirror.userData.mirror = true;
  g.add(mirror);
  for (const x of [-(w - 0.06) / 2, (w - 0.06) / 2])
    g.add(box(0.005, 0.65, 0.008, chrome, x, 1.145, -d / 2 + 0.012));
  for (const y of [1.14, 1.79])
    g.add(box(w - 0.06, 0.005, 0.008, chrome, 0, y, -d / 2 + 0.012));
}

export function referenceToilet(g, it) {
  const w = it.w,
    d = it.d,
    h = it.h;
  g.add(
    profile(
      [
        [w * 0.68, d * 0.74, 0.008, -0.015, 0.075],
        [w * 0.76, d * 0.8, 0.055, 0.0, 0.08],
        [w * 0.82, d * 0.81, 0.25, 0.005, 0.095],
        [w * 0.96, d * 0.86, 0.35, 0.025, 0.115],
        [w * 0.95, d * 0.84, 0.385, 0.025, 0.115],
      ],
      porcelain,
    ),
  );
  // Closed soft-close lid and its thin seat seam; a skirt conceals the waste trap.
  g.add(
    rounded(
      w * 0.96,
      0.018,
      d * 0.72,
      material("#c9cdca", null, { roughness: 0.45 }),
      0,
      0.39,
      0.055,
      0.008,
    ),
  );
  g.add(rounded(w, 0.032, d * 0.74, porcelain, 0, 0.41, 0.055, 0.015));
  g.add(
    rounded(
      w * 0.93,
      h - 0.435,
      0.165,
      porcelain,
      0,
      0.435,
      -d / 2 + 0.087,
      0.025,
    ),
  );
  const tankLid = rounded(
    w * 0.97,
    0.023,
    0.178,
    porcelain,
    0,
    h - 0.023,
    -d / 2 + 0.087,
    0.01,
  );
  g.add(tankLid);
  const flush = cylinder(0.02, 0.002, chrome, 0, h + 0.001, -d / 2 + 0.087);
  flush.scale.z = 0.76;
  g.add(flush);
  g.add(
    link(
      [-0.014, h + 0.003, -d / 2 + 0.087],
      [0.014, h + 0.003, -d / 2 + 0.087],
      0.0008,
      dark,
    ),
  );
  g.add(
    tube(
      [
        [w * 0.45, 0.55, -d / 2 + 0.06],
        [w * 0.52, 0.32, -d / 2 + 0.09],
        [w * 0.52, 0.25, -d / 2 + 0.03],
      ],
      0.006,
      chrome,
    ),
  );
  g.add(cylinder(0.014, 0.025, chrome, w * 0.52, 0.24, -d / 2 + 0.03));
}

export function referenceShower(g, it) {
  const { w, d, h } = it;
  const z = d / 2 - 0.035;
  const resin = material("#eeeae0", "plaster", {
    roughness: 0.82,
    normalScale: new T.Vector2(0.04, 0.04),
  });
  g.add(rounded(w, h - 0.008, d, resin, 0, 0, 0, 0.006));
  const drainSize = spec.shower.drainWidth,
    drainZ = 0.04;
  const s = new T.Shape(
      outline(w - 0.006, d - 0.006, 0.006).map(
        (p) => new T.Vector2(p[0], -p[1]),
      ),
    ),
    hole = new T.Path();
  hole.moveTo(-drainSize / 2, -drainZ - drainSize / 2);
  hole.lineTo(-drainSize / 2, -drainZ + drainSize / 2);
  hole.lineTo(drainSize / 2, -drainZ + drainSize / 2);
  hole.lineTo(drainSize / 2, -drainZ - drainSize / 2);
  hole.closePath();
  s.holes.push(hole);
  const geo = new T.ShapeGeometry(s);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      zz = p.getZ(i);
    const edge = Math.max(Math.abs(x) / (w / 2), Math.abs(zz) / (d / 2));
    p.setY(i, h - 0.007 * (1 - Math.min(1, edge)));
  }
  geo.computeVertexNormals();
  worldUV(geo, 0.6);
  g.add(mesh(geo, resin));
  g.add(box(drainSize, 0.002, drainSize, dark, 0, h - 0.013, drainZ));
  const grate = new T.Shape();
  const rr = drainSize / 2;
  grate.moveTo(-rr, -rr);
  grate.lineTo(rr, -rr);
  grate.lineTo(rr, rr);
  grate.lineTo(-rr, rr);
  grate.closePath();
  for (let a = 0; a < 7; a++)
    for (let b = 0; b < 7; b++) {
      const cut = new T.Path();
      cut.absarc(
        (a - 3) * 0.009,
        (b - 3) * 0.009,
        0.0021,
        0,
        Math.PI * 2,
        true,
      );
      grate.holes.push(cut);
    }
  const grateGeo = new T.ExtrudeGeometry(grate, {
    depth: 0.0018,
    bevelEnabled: false,
  });
  grateGeo.rotateX(-Math.PI / 2);
  g.add(mesh(grateGeo, chrome, 0, h - 0.006, drainZ));
  // Thermostatic column is mounted on the feature wall, not on the free tray edge.
  const mixer = spec.shower.mixerHeight,
    head = spec.shower.headHeight;
  g.add(
    link([-0.125, mixer, z - 0.012], [0.125, mixer, z - 0.012], 0.023, chrome),
  );
  for (const x of [-0.135, 0.135]) {
    const cuff = link(
      [x - 0.014, mixer, z - 0.012],
      [x + 0.014, mixer, z - 0.012],
      0.026,
      chrome,
    );
    g.add(cuff);
  }
  for (const y of [mixer + 0.08, head - 0.24]) {
    g.add(link([0, y, d / 2 - 0.012], [0, y, z - 0.014], 0.025, chrome));
  }
  g.add(
    tube(
      [
        [0, mixer + 0.02, z - 0.012],
        [0, head - 0.18, z - 0.012],
        [0, head + 0.035, z - 0.018],
        [0, head + 0.1, z - 0.1],
        [0, head + 0.1, z - 0.27],
        [0, head + 0.045, z - 0.3],
      ],
      0.011,
      chrome,
      56,
    ),
  );
  const headRadius = spec.shower.headDiameter / 2;
  g.add(cylinder(headRadius, 0.008, chrome, 0, head, z - 0.3));
  g.add(
    cylinder(
      headRadius - 0.006,
      0.0015,
      material("#939b98", null, { metalness: 0.8, roughness: 0.25 }),
      0,
      head - 0.002,
      z - 0.3,
    ),
  );
  for (let ring = 1; ring < 6; ring++)
    for (let k = 0; k < ring * 10; k++) {
      const a = (k / (ring * 10)) * Math.PI * 2;
      g.add(
        cylinder(
          0.0016,
          0.002,
          material("#b9c0b9", null, { roughness: 0.6 }),
          (Math.cos(a) * ring * headRadius) / 6,
          head - 0.0035,
          z - 0.3 + (Math.sin(a) * ring * headRadius) / 6,
        ),
      );
    }
  const hand = new T.Group();
  hand.position.set(-0.065, 1.54, z - 0.025);
  hand.rotation.x = 0.35;
  const disc = cylinder(0.038, 0.012, chrome, 0, 0, 0);
  disc.rotation.x = Math.PI / 2;
  hand.add(disc);
  hand.add(link([0, -0.12, 0], [0, -0.02, 0], 0.01, chrome));
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    hand.add(
      ellipsoid(
        Math.cos(a) * 0.025,
        Math.sin(a) * 0.025,
        0.009,
        0.0018,
        0.0018,
        0.001,
        material("#8b9592"),
      ),
    );
  }
  g.add(hand);
  const hosePoints = [
    [-0.055, mixer - 0.02, z - 0.012],
    [-0.12, 0.71, z - 0.035],
    [-0.07, 0.63, z - 0.055],
    [0.01, 0.7, z - 0.06],
    [-0.065, 1.42, z - 0.025],
  ];
  g.add(tube(hosePoints, 0.006, chrome, 70));
  const curve = new T.CatmullRomCurve3(
    hosePoints.map((p) => new T.Vector3(...p)),
  );
  for (let k = 0; k < 75; k++) {
    const t = k / 74,
      pos = curve.getPoint(t),
      tangent = curve.getTangent(t);
    const rib = mesh(new T.TorusGeometry(0.0063, 0.0009, 4, 8), chrome);
    rib.position.copy(pos);
    rib.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), tangent);
    g.add(rib);
  }
  // The supplied construction photos show no screen. No unobserved glass panel is added here.
}

function closetLeaf(w, h) {
  const g = new T.Group();
  g.add(box(w, h, 0.015, lacquer, w / 2, 0, 0));
  const border = 0.038;
  g.add(
    box(
      w - border * 2,
      h - border * 2,
      0.004,
      material("#eeeee8", null, { roughness: 0.5 }),
      w / 2,
      border,
      0.01,
    ),
  );
  for (const x of [border / 2, w - border / 2])
    g.add(rounded(border, h, 0.01, lacquer, x, 0, 0.01, 0.003));
  for (const y of [0, h - border])
    g.add(
      rounded(w - border * 2, border, 0.01, lacquer, w / 2, y, 0.01, 0.003),
    );
  return g;
}
function hinge(g, x, y, z, side) {
  g.add(
    rounded(0.027, 0.04, 0.005, chrome, x, y, z, 0.003),
    rounded(
      0.018,
      0.028,
      0.022,
      chrome,
      x + side * 0.019,
      y + 0.006,
      z - 0.009,
      0.003,
    ),
  );
  g.add(
    link(
      [x, y + 0.014, z - 0.01],
      [x + side * 0.028, y + 0.014, z - 0.022],
      0.004,
      chrome,
    ),
  );
}
export function referenceWardrobe(g, it) {
  const { w, h, d } = it,
    t = 0.019,
    base = 0.075;
  const bays = Math.max(1, Math.round(w / 0.85)),
    bw = w / bays;
  g.add(
    box(w, h, 0.014, lining, 0, 0, -d / 2 + 0.007),
    box(w, base, d, lacquer, 0, 0, 0),
    box(w, 0.025, d, lacquer, 0, h - 0.025, 0),
  );
  for (let k = 0; k <= bays; k++)
    g.add(box(t, h - base, d, lining, -w / 2 + k * bw, base, 0));
  g.add(box(w - 0.02, 0.018, d - 0.03, lining, 0, base, 0));
  const doorHeight = h - base - 0.01;
  for (let bay = 0; bay < bays; bay++) {
    const cx = -w / 2 + (bay + 0.5) * bw;
    const shelf = h * spec.wardrobe.shelfFraction;
    g.add(box(bw - t, 0.022, d - 0.03, lining, cx, shelf, -0.008));
    g.add(
      link(
        [cx - bw / 2 + 0.025, shelf - 0.085, 0],
        [cx + bw / 2 - 0.025, shelf - 0.085, 0],
        0.011,
        chrome,
      ),
    );
    const open = it.id === spec.wardrobe.openId && bay === 0;
    for (const side of [-1, 1]) {
      const leaf = closetLeaf(bw / 2 - 0.004, doorHeight);
      leaf.position.set(cx + side * (bw / 2 - 0.009), base, d / 2 + 0.003);
      if (side === 1) leaf.rotation.y = Math.PI;
      if (open)
        leaf.rotation.y +=
          side === -1
            ? (-spec.wardrobe.openAngle * Math.PI) / 180
            : (spec.wardrobe.openAngle * Math.PI) / 180;
      // Right-hand leaf geometry is mirrored around its hinge to keep both faces outwards.
      if (side === 1) {
        leaf.rotation.y -= Math.PI;
        leaf.scale.x = -1;
      }
      if (open) {
        leaf.userData.closetLeaf = true;
        leaf.userData.leafWidth = bw / 2 - 0.004;
        for (const y of [0.18, 0.75, 1.4, doorHeight - 0.2])
          hinge(leaf, 0.01, y, -0.014, 1);
      }
      g.add(leaf);
    }
  }
  g.userData.registerDoorColliders = () => {
    g.updateWorldMatrix(true, true);
    g.traverse((o) => {
      if (!o.userData.closetLeaf) return;
      const w = o.userData.leafWidth;
      furnitureDetailColliders.push(
        [
          [0, -0.018],
          [w, -0.018],
          [w, 0.022],
          [0, 0.022],
        ].map(([x, z]) => {
          const p = o.localToWorld(new T.Vector3(x, 0, z));
          return [p.x, p.z];
        }),
      );
    });
  };
}
