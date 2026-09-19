import * as THREE from "three";
import { setDefaultMaterial } from "../../libs/util/util.js";
import { getSolidBounds } from "../collisionUtils.js";

const PROJECTILE_RADIUS = 0.12;
const PROJECTILE_COLOR = "rgb(255, 200, 0)";
const PROJECTILE_SPEED = 60;
const PROJECTILE_MAX_DISTANCE = 100;
const PROJECTILE_SIZE = new THREE.Vector3(
  PROJECTILE_RADIUS * 2,
  PROJECTILE_RADIUS * 2,
  PROJECTILE_RADIUS * 2,
);

export function createProjectileSystem(scene) {
  const geometry = new THREE.SphereGeometry(PROJECTILE_RADIUS, 12, 12);
  const material = setDefaultMaterial(PROJECTILE_COLOR);

  const projectiles = [];
  const projectileBounds = new THREE.Box3();

  function spawnProjectile(origin, direction) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(origin);
    mesh.userData.isProjectile = true;

    scene.add(mesh);

    const normalizedDirection = direction.clone().normalize();
    const target = origin
      .clone()
      .addScaledVector(normalizedDirection, PROJECTILE_MAX_DISTANCE);

    projectiles.push({
      mesh,
      origin: origin.clone(),
      target,
      progress: 0,
    });
  }

  function collidesWithEnvironment(mesh, solidBounds) {
    projectileBounds.setFromCenterAndSize(mesh.position, PROJECTILE_SIZE);
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

      projectile.progress +=
        (PROJECTILE_SPEED * delta) / PROJECTILE_MAX_DISTANCE;
      projectile.mesh.position.lerpVectors(
        projectile.origin,
        projectile.target,
        projectile.progress,
      );

      if (collidesWithEnvironment(projectile.mesh, solidBounds)) {
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