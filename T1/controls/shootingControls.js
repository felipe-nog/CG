import * as THREE from "three";
import { createGun, getMuzzleWorldPosition } from "../modeling/gun.js";
import { createProjectileSystem } from "./projectiles.js";

export function setupShootingSystem(scene, camera) {
  const { muzzle } = createGun(camera);
  const projectileSystem = createProjectileSystem(scene);

  const origin = new THREE.Vector3();
  const direction = new THREE.Vector3();

  function shoot() {
    getMuzzleWorldPosition(muzzle, origin);
    camera.getWorldDirection(direction);

    projectileSystem.spawnProjectile(origin, direction);
  }

  function update(delta, collisionObjects) {
    projectileSystem.update(delta, collisionObjects);
  }

  return { shoot, update };
}