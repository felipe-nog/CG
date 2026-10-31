import * as THREE from "three";
import { getSolidBounds } from "../collisionUtils.js";
import { createDart } from "../modeling/dart.js";

const PROJECTILE_RADIUS = 0.06;
const FORWARD = new THREE.Vector3(0, 0, -1);
const PROJECTILE_SPEED = 90;
const PROJECTILE_MAX_DISTANCE = 100;
const PROJECTILE_SIZE = new THREE.Vector3(
  PROJECTILE_RADIUS * 2,
  PROJECTILE_RADIUS * 2,
  PROJECTILE_RADIUS * 2,
);

export function createProjectileSystem(scene) {
  const projectiles = [];
  const projectileBounds = new THREE.Box3();
  const tipPosition = new THREE.Vector3();

  // `origin` é a posição da ponta do dardo ao sair da besta.
  function spawnProjectile(origin, direction) {
    const normalizedDirection = direction.clone().normalize();

    const mesh = createDart();
    mesh.userData.isProjectile = true;
    mesh.quaternion.setFromUnitVectors(FORWARD, normalizedDirection);
    // O mesh é posicionado pelo centro da haste; `origin` marca a ponta.
    mesh.position
      .copy(origin)
      .addScaledVector(normalizedDirection, -mesh.userData.tipOffset);

    scene.add(mesh);

    const target = origin
      .clone()
      .addScaledVector(normalizedDirection, PROJECTILE_MAX_DISTANCE);

    projectiles.push({
      mesh,
      tipOffset: mesh.userData.tipOffset,
      direction: normalizedDirection,
      origin: mesh.position.clone(),
      target: target.addScaledVector(normalizedDirection, -mesh.userData.tipOffset),
      progress: 0,
    });
  }

  function collidesWithEnvironment(tip, solidBounds) {
    projectileBounds.setFromCenterAndSize(tip, PROJECTILE_SIZE);
    return solidBounds.some((bounds) => projectileBounds.intersectsBox(bounds));
  }

  function removeProjectile(index) {
    const [projectile] = projectiles.splice(index, 1);
    scene.remove(projectile.mesh);
  }

  function update(delta, collisionObjects = []) {
    if (projectiles.length === 0) return;

    // Calculado uma vez por frame (não por projétil) — a geometria estática
    // não muda entre os disparos ativos.
    const solidBounds = getSolidBounds(collisionObjects);

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];
      const { mesh, direction, tipOffset } = projectile;

      projectile.progress +=
        (PROJECTILE_SPEED * delta) / PROJECTILE_MAX_DISTANCE;
      mesh.position.lerpVectors(
        projectile.origin,
        projectile.target,
        projectile.progress,
      );
      tipPosition.copy(mesh.position).addScaledVector(direction, tipOffset);

      if (collidesWithEnvironment(tipPosition, solidBounds)) {
        removeProjectile(i);
        continue;
      }

      if (projectile.progress >= 1) {
        removeProjectile(i);
      }
    }
  }

  return { spawnProjectile, update };
}