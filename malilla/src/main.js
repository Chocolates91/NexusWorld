import "./style.css";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { SSAOPass } from "three/addons/postprocessing/SSAOPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import { buildArchitecture } from "./architecture.js";
import { FIXED, template, ROOMS, WALLS } from "./data/source-plan.js";
import { buildFurniture, addDecoration } from "./furniture.js";
import { batchStatic } from "./geometry.js";
import { views } from "./cameras.js";
import { lighting } from "./lighting.js";
import { waitForTextures } from "./materials.js";
import { createNavigation } from "./navigation.js";
const $ = (id) => document.getElementById(id);
let timer;
function status(text) {
  $("status").textContent = text;
  $("status").classList.add("visible");
  clearTimeout(timer);
  timer = setTimeout(() => $("status").classList.remove("visible"), 7000);
}
window.addEventListener("error", (e) =>
  status(`No se pudo completar la escena: ${e.message}`),
);
const scene = new T.Scene();
const renderer = new T.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
  preserveDrawingBuffer: false,
});
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.info.autoReset = false;
$("viewport").appendChild(renderer.domElement);
const camera = new T.PerspectiveCamera(62, innerWidth / innerHeight, 0.035, 80);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.09;
controls.minDistance = 0.2;
controls.maxDistance = 25;
controls.maxPolarAngle = Math.PI * 0.96;
controls.target.set(9, 1, 7);
const { group: architecture, ceiling } = buildArchitecture();
scene.add(architecture, ceiling);
const furniture = new T.Group();
scene.add(furniture);
const sourceItems = template("A");
for (const it of [...FIXED, ...sourceItems])
  furniture.add(buildFurniture(it, FIXED.includes(it)));
addDecoration(furniture);
const reflectors = [];
const mirrors = [];
furniture.traverse((o) => {
  if (o.userData.mirror) mirrors.push(o);
});
for (const m of mirrors) {
  const r = new Reflector(m.geometry.clone(), {
    textureWidth: 768,
    textureHeight: 768,
    color: 0xb9b8b4,
    clipBias: 0.003,
    multisample: 2,
  });
  r.position.copy(m.position);
  r.quaternion.copy(m.quaternion);
  r.userData.keep = true;
  reflectors.push(r);
  m.parent.add(r);
  m.removeFromParent();
}
const fixtures = [];
scene.traverse((o) => {
  if (o.isPointLight) {
    o.userData.power = o.userData.power || o.intensity * 5;
    fixtures.push(o);
  }
});
scene.updateMatrixWorld(true);
// Resolve local fixture coordinates before detaching them for the pooled lighting rig.
for (const f of fixtures) {
  const p = f.getWorldPosition(new T.Vector3());
  f.removeFromParent();
  f.position.copy(p);
}
const light = lighting(scene, renderer, fixtures);
light.set("day");
batchStatic(architecture);
batchStatic(furniture);
const navigation = createNavigation(camera, controls, renderer.domElement);
const target = new T.WebGLRenderTarget(1, 1, { type: T.HalfFloatType });
target.samples = 4;
const composer = new EffectComposer(renderer, target);
composer.addPass(new RenderPass(scene, camera));
const ao = new SSAOPass(scene, camera, innerWidth, innerHeight, 16);
ao.kernelRadius = 0.19;
ao.minDistance = 0.002;
ao.maxDistance = 0.21;
composer.addPass(ao);
composer.addPass(new OutputPass());
const aa = new SMAAPass();
composer.addPass(aa);
let quality = "high",
  captureBusy = false,
  currentView = "living",
  tween = null,
  frameMs = 0;
function resize() {
  if (captureBusy) return;
  const dpr = Math.min(devicePixelRatio, quality === "ultra" ? 2 : 1.5);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  composer.setPixelRatio(dpr);
  composer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", () => {
  resize();
  invalidate();
});
resize();
let dirty = true;
function invalidate() {
  dirty = true;
}
controls.addEventListener("change", invalidate);
function setQuality(value) {
  dirty = true;
  quality = value;
  const size = value === "ultra" ? 4096 : 2048;
  light.sun.shadow.mapSize.set(size, size);
  light.sun.shadow.map?.dispose();
  light.sun.shadow.map = null;
  renderer.shadowMap.needsUpdate = true;
  target.samples = value === "ultra" ? 8 : 4;
  resize();
  status(
    value === "ultra"
      ? "Ultra · sombras 4096 · escala máxima 2×"
      : "Alta · sombras 2048 · escala máxima 1,5×",
  );
}
function setRoof(on) {
  dirty = true;
  if (ceiling.visible !== on) renderer.shadowMap.needsUpdate = true;
  ceiling.visible = on;
  $("roof").setAttribute("aria-pressed", String(on));
}
function setView(id, instant = false) {
  dirty = true;
  const v = views.find((v) => v.id === id) || views[0];
  camera.fov = v.fov || 62;
  camera.updateProjectionMatrix();
  currentView = v.id;
  $("room").value = v.id;
  $("room-title").textContent = v.name;
  $("room-note").textContent = v.note;
  $("room-index").textContent =
    `${String(views.indexOf(v) + 1).padStart(2, "0")} / ${views.length}   —   ${v.area}`;
  if (v.id === "plan") {
    if (navigation.walking) {
      navigation.set(false);
      $("mode").value = "orbit";
    }
    setRoof(false);
  } else setRoof(true);
  const p = new T.Vector3(...v.position),
    t = new T.Vector3(...v.target);
  if (instant) {
    camera.position.copy(p);
    controls.target.copy(t);
    camera.lookAt(t);
    controls.update();
    navigation.sync();
  } else
    tween = {
      start: performance.now(),
      from: camera.position.clone(),
      targetFrom: controls.target.clone(),
      to: p,
      targetTo: t,
    };
}
for (const v of views) {
  const o = document.createElement("option");
  o.value = v.id;
  o.textContent = v.name;
  $("room").appendChild(o);
}
setView(new URLSearchParams(location.search).get("view") || "living", true);
$("room").onchange = (e) => setView(e.target.value);
$("quality").onchange = (e) => setQuality(e.target.value);
$("mood").onchange = (e) => {
  light.set(e.target.value);
  invalidate();
};
$("exposure").oninput = (e) => {
  renderer.toneMappingExposure = Number(e.target.value);
  invalidate();
};
$("roof").onclick = () => setRoof(!ceiling.visible);
$("mode").onchange = (e) => {
  dirty = true;
  if (tween) {
    tween = null;
  }
  navigation.set(e.target.value === "walk");
  $("hint").textContent = navigation.walking
    ? "WASD / flechas para caminar · arrastra para mirar · doble clic: ratón libre · Esc: soltar"
    : "Arrastra para girar · rueda para acercarte · botón derecho para desplazar";
};
$("fullscreen").onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else
    document.documentElement
      .requestFullscreen()
      .catch(() =>
        status("Pantalla completa no disponible en este navegador."),
      );
};
export async function capture(width = 3840, height = 2160, download = true) {
  if (captureBusy) throw new Error("Ya hay una captura en curso");
  const gl = renderer.getContext(),
    limit = Math.min(
      gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
      gl.getParameter(gl.MAX_TEXTURE_SIZE),
    );
  if (width > limit || height > limit)
    throw new Error(
      `El equipo limita el renderizado a ${limit}px; no se ha generado una falsa captura 4K.`,
    );
  const old = {
    aspect: camera.aspect,
    dpr: renderer.getPixelRatio(),
    w: innerWidth,
    h: innerHeight,
  };
  captureBusy = true;
  $("capture").disabled = true;
  status(`Renderizando ${width} × ${height} píxeles…`);
  try {
    await new Promise((r) => requestAnimationFrame(r));
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(1);
    composer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    updateReflections();
    light.update(camera);
    composer.render();
    const size = renderer.getDrawingBufferSize(new T.Vector2());
    if (size.x !== width || size.y !== height)
      throw new Error("El búfer no alcanza la resolución solicitada");
    const blob = await new Promise((resolve, reject) =>
      renderer.domElement.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error("La GPU no pudo crear el PNG")),
        "image/png",
      ),
    );
    if (download) {
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `Malilla-${currentView}-${$("mood").value}-${width}x${height}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 20000);
    }
    status(`PNG generado: ${size.x} × ${size.y} píxeles reales.`);
    return { blob, width: size.x, height: size.y };
  } finally {
    camera.aspect = old.aspect;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(old.dpr);
    renderer.setSize(old.w, old.h, false);
    composer.setPixelRatio(old.dpr);
    composer.setSize(old.w, old.h);
    captureBusy = false;
    dirty = true;
    $("capture").disabled = false;
  }
}
$("capture").onclick = () => capture().catch((e) => status(e.message));
renderer.domElement.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  status("Se ha perdido el contexto gráfico. Recarga con el perfil Alta.");
});
function updateReflections() {
  for (const r of reflectors) {
    r.updateWorldMatrix(true, false);
    r.visible =
      r.getWorldPosition(new T.Vector3()).distanceTo(camera.position) < 3.5;
  }
}
let last = performance.now(),
  frames = 0;
function loop(now) {
  requestAnimationFrame(loop);
  if (captureBusy || document.hidden) return;
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (tween) {
    dirty = true;
    const t = Math.min(1, (now - tween.start) / 1100),
      k = t * t * (3 - 2 * t);
    camera.position.lerpVectors(tween.from, tween.to, k);
    controls.target.lerpVectors(tween.targetFrom, tween.targetTo, k);
    camera.lookAt(controls.target);
    if (t === 1) {
      tween = null;
      navigation.sync();
    }
  } else if (navigation.walking) navigation.step(dt);
  else controls.update();
  if (!dirty && !tween && !navigation.walking) return;
  dirty = false;
  updateReflections();
  light.update(camera);
  renderer.info.reset();
  const renderStart = performance.now();
  composer.render();
  frameMs = performance.now() - renderStart;
  frames++;
}
requestAnimationFrame(loop);
const manager = T.DefaultLoadingManager;
manager.onLoad = () => {
  $("loading").classList.add("done");
};
manager.onError = (url) => {
  status(`No se pudo cargar ${url}`);
};
// All assets are same-origin; wait for actual image loads before reporting readiness.
async function ready() {
  await light.ready;
  await waitForTextures();
  $("loading").classList.add("done");
  window.__MALILLA__.ready = true;
  invalidate();
}

window.__MALILLA__ = {
  ready: false,
  views: views.map((v) => v.id),
  setView: (id) => setView(id, true),
  setMood: (id) => {
    $("mood").value = id;
    light.set(id);
    invalidate();
  },
  setQuality,
  roof: setRoof,
  capture,
  navigation,
  scene,
  camera,
  renderer,
  controls,
  ao,
  stats: () => ({
    frames,
    cpuRenderSubmitMs: frameMs,
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    buffer: renderer.getDrawingBufferSize(new T.Vector2()).toArray(),
    walls: WALLS.length,
    rooms: ROOMS.length,
    furniture: sourceItems.length,
    fixed: FIXED.length,
    quality,
    view: currentView,
    renderer: renderer
      .getContext()
      .getParameter(
        renderer.getContext().getExtension("WEBGL_debug_renderer_info")
          ?.UNMASKED_RENDERER_WEBGL || renderer.getContext().RENDERER,
      ),
  }),
};
ready().catch((e) => status(e.message));
