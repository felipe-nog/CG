import * as THREE from "three";
import { setDefaultMaterial } from "../../libs/util/util.js";

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
  const objectBounds = new THREE.Box3();

  function spawnProjectile(origin, direction) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(origin);
    mesh.userData.isProjectile = true;

    scene.add(mesh);

    const normalizedDirection = direction.clone().normalize();
    // Ponto final do trajeto: o mais longe que o projétil pode chegar,
    // na direção do disparo. O movimento é a interpolação (lerp) entre
    // a origem e esse ponto, conforme o "progress" avança com o tempo.
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

  function collidesWithEnvironment(mesh, collisionObjects) {
    projectileBounds.setFromCenterAndSize(mesh.position, PROJECTILE_SIZE);

    return collisionObjects.some((object) => {
      if (!object.isMesh || !object.visible || object.userData.isProjectile) {
        return false;
      }

      objectBounds.setFromObject(object);
      return projectileBounds.intersectsBox(objectBounds);
    });
  }

  function removeProjectile(index) {
    const [projectile] = projectiles.splice(index, 1);
    scene.remove(projectile.mesh);
  }

  function update(delta, collisionObjects = []) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const projectile = projectiles[i];

      projectile.progress +=
        (PROJECTILE_SPEED * delta) / PROJECTILE_MAX_DISTANCE;
      projectile.mesh.position.lerpVectors(
        projectile.origin,
        projectile.target,
        projectile.progress,
      );

      if (collidesWithEnvironment(projectile.mesh, collisionObjects)) {
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