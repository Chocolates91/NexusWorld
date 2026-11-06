import * as T from "three";
import { FOOTPRINT, FIXED, template } from "./data/source-plan.js";
import { architectureColliders } from "./data/colliders.js";
import { inside, overlapsCircle, furnitureColliders } from "./collision.js";
export function createNavigation(camera, controls, canvas) {
  let walking = false,
    drag = null;
  const keys = new Set(),
    look = new T.Euler(0, 0, 0, "YXZ"),
    velocity = new T.Vector2();
  const furniture = furnitureColliders();
  const blocked = (x, z) =>
    !inside([x, z], FOOTPRINT) ||
    [...architectureColliders, ...furniture].some((poly) =>
      overlapsCircle(x, z, 0.15, poly),
    );
  function rotate(dx, dy) {
    look.y -= dx * 0.003;
    look.x = T.MathUtils.clamp(look.x - dy * 0.003, -1.25, 1.25);
    camera.quaternion.setFromEuler(look);
  }
  canvas.addEventListener("pointerdown", (e) => {
    if (!walking) return;
    drag = [e.clientX, e.clientY];
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!walking) return;
    if (document.pointerLockElement === canvas)
      rotate(e.movementX, e.movementY);
    else if (drag) {
      rotate(e.clientX - drag[0], e.clientY - drag[1]);
      drag = [e.clientX, e.clientY];
    }
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    canvas.addEventListener(event, () => (drag = null));
  canvas.addEventListener("dblclick", () => {
    if (walking) canvas.requestPointerLock?.();
  });
  window.addEventListener("keydown", (e) => {
    if (["INPUT", "SELECT", "BUTTON"].includes(e.target.tagName)) return;
    if (
      walking &&
      [
        "KeyW",
        "KeyS",
        "KeyA",
        "KeyD",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
      ].includes(e.code)
    ) {
      keys.add(e.code);
      e.preventDefault();
    }
  });
  window.addEventListener("keyup", (e) => keys.delete(e.code));
  window.addEventListener("blur", () => {
    keys.clear();
    drag = null;
    velocity.set(0, 0);
  });
  for (const b of document.querySelectorAll("[data-key]")) {
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      b.setPointerCapture(e.pointerId);
      keys.add(b.dataset.key);
    });
    for (const ev of ["pointerup", "pointercancel", "lostpointercapture"])
      b.addEventListener(ev, () => keys.delete(b.dataset.key));
  }
  return {
    blocked,
    get walking() {
      return walking;
    },
    set(on) {
      walking = on;
      controls.enabled = !on;
      velocity.set(0, 0);
      keys.clear();
      if (on) {
        if (blocked(camera.position.x, camera.position.z))
          camera.position.set(8.4, 1.62, 4.8);
        camera.position.y = 1.62;
        look.setFromQuaternion(camera.quaternion, "YXZ");
      } else document.exitPointerLock?.();
      document.getElementById("walkpad").hidden = !on;
    },
    sync() {
      look.setFromQuaternion(camera.quaternion, "YXZ");
    },
    step(dt) {
      if (!walking) return;
      const target = new T.Vector2(
        (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) -
          (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0),
        (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) -
          (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0),
      );
      if (target.lengthSq()) target.normalize().multiplyScalar(1.25);
      velocity.lerp(target, 1 - Math.exp(-dt * 12));
      const dx =
          (Math.cos(look.y) * velocity.x - Math.sin(look.y) * velocity.y) * dt,
        dz =
          (-Math.sin(look.y) * velocity.x - Math.cos(look.y) * velocity.y) * dt; // substeps prevent tunnelling through the 5cm partitions.
      const count = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.035));
      for (let i = 0; i < count; i++) {
        if (!blocked(camera.position.x + dx / count, camera.position.z))
          camera.position.x += dx / count;
        if (!blocked(camera.position.x, camera.position.z + dz / count))
          camera.position.z += dz / count;
      }
      camera.position.y = 1.62;
    },
  };
}
