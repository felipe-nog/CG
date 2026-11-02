import * as THREE from "three";
import { createGun, getMuzzleWorldPosition } from "../modeling/gun.js";
import { createProjectileSystem } from "./projectiles.js";

let gunMesh = null;
let shootingEnabled = true;

export function setupShootingSystem(scene, camera) {
  const { gun, muzzle } = createGun(camera);
  gunMesh = gun;
  shootingEnabled = true;

  const projectileSystem = createProjectileSystem(scene);

  const origin = new THREE.Vector3();
  const direction = new THREE.Vector3();

  function shoot() {
    if (!shootingEnabled) return;

    getMuzzleWorldPosition(muzzle, origin);
    camera.getWorldDirection(direction);

    projectileSystem.spawnProjectile(origin, direction);
  }

  function update(delta, collisionObjects) {
    projectileSystem.update(delta, collisionObjects);
  }

  return { shoot, update };
}

export function unMountShootingSystem() {
  shootingEnabled = false;
  if (gunMesh) gunMesh.visible = false;
}

export function mountShootingSystem() {
  shootingEnabled = true;
  if (gunMesh) gunMesh.visible = true;
}