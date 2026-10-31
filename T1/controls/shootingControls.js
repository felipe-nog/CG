import * as THREE from "three";
import {
  CROSSBOW_LOCAL_POSITION,
  createCrossbow,
  getMuzzleWorldPosition,
} from "../modeling/crossbow.js";
import { createProjectileSystem } from "./projectiles.js";

// Tempo de recarga (s) entre dois disparos
export const RELOAD_TIME = 0.9;

let crossbowMesh = null;
let shootingEnabled = true;

export function setupShootingSystem(scene, camera) {
  const { crossbow, muzzle, dart } = createCrossbow(camera);
  crossbowMesh = crossbow;
  shootingEnabled = true;

  const projectileSystem = createProjectileSystem(scene);

  const origin = new THREE.Vector3();
  const direction = new THREE.Vector3();

  let cooldown = 0;

  function shoot() {
    if (!shootingEnabled || cooldown > 0 || !dart.userData.ready) return;

    getMuzzleWorldPosition(muzzle, origin);
    camera.getWorldDirection(direction);

    projectileSystem.spawnProjectile(origin, direction);

    // O dardo sai da besta e só reaparece sobre o trilho quando recarregada
    cooldown = RELOAD_TIME;
    dart.visible = false;
  }

  function update(delta, collisionObjects) {
    projectileSystem.update(delta, collisionObjects);
    if (!dart.userData.ready) return;
    const restingDartZ = dart.userData.restZ;

    if (cooldown > 0) {
      cooldown = Math.max(0, cooldown - delta);

      // Recarga: o novo dardo desliza para o trilho no último terço do tempo
      const reloadProgress = 1 - cooldown / RELOAD_TIME;
      const slide = THREE.MathUtils.clamp((reloadProgress - 0.6) / 0.4, 0, 1);
      dart.visible = slide > 0;
      dart.position.z = restingDartZ + 0.25 * (1 - slide);
      // Coice leve da besta logo após o disparo
      crossbow.position.z = CROSSBOW_LOCAL_POSITION.z + 0.06 * Math.max(0, 1 - reloadProgress * 6);
    } else {
      dart.visible = true;
      dart.position.z = restingDartZ;
      crossbow.position.z = CROSSBOW_LOCAL_POSITION.z;
    }
  }

  return { shoot, update };
}

export function unMountShootingSystem() {
  shootingEnabled = false;
  if (crossbowMesh) crossbowMesh.visible = false;
}

export function mountShootingSystem() {
  shootingEnabled = true;
  if (crossbowMesh) crossbowMesh.visible = true;
}
