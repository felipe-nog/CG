import * as THREE from "three";
import { setDefaultMaterial } from "../libs/util/util.js";

const GUN_RADIUS_TOP = 0.08;
const GUN_RADIUS_BOTTOM = 0.08;
const GUN_HEIGHT = 0.8;
const GUN_COLOR = "rgb(40, 40, 40)";

const GUN_LOCAL_POSITION = new THREE.Vector3(0, -0.35, -0.7);

export function createGun(camera) {
  const geometry = new THREE.CylinderGeometry(
    GUN_RADIUS_TOP,
    GUN_RADIUS_BOTTOM,
    GUN_HEIGHT,
    16,
  );
  const material = setDefaultMaterial(GUN_COLOR);
  const gun = new THREE.Mesh(geometry, material);

  gun.position.copy(GUN_LOCAL_POSITION);

  // Aponta para a direção da câmera
  gun.rotation.x = -Math.PI / 2;

  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, GUN_HEIGHT / 2, 0);
  gun.add(muzzle);

  camera.add(gun);

  return { gun, muzzle };
}

export function getMuzzleWorldPosition(muzzle, target = new THREE.Vector3()) {
  return muzzle.getWorldPosition(target);
}
