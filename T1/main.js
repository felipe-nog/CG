import * as THREE from "three";
import {
  initRenderer,
  initCamera,
  onWindowResize,
  createGroundPlaneXZ,
} from "./libs/util/util.js";
import { setupCameraSystem } from "./controls/cameraControls.js";
import {
  setupMovementControls,
  updateMovement,
} from "./controls/movementControls.js";
import { buildCastle, updateDoors } from "./modeling/castle.js";
import { setupDayNightLighting } from "./lighting/dayNightLighting.js";
import {
  mountShootingSystem,
  setupShootingSystem,
  unMountShootingSystem,
} from "./controls/shootingControls.js";

let scene, renderer, camera, cameraSystem;

scene = new THREE.Scene();
renderer = initRenderer();
camera = initCamera(new THREE.Vector3(0, 4, 10));
cameraSystem = setupCameraSystem(camera, renderer.domElement);

const { fpsControls, orbitControls } = cameraSystem;

scene.add(camera);

const shootingSystem = setupShootingSystem(scene, camera);

const clock = new THREE.Clock();

renderer.domElement.addEventListener("click", () => {
  if (!cameraSystem.isOrbital()) {
    fpsControls.lock();
  }
});

setupMovementControls(() => {
  if (fpsControls.isLocked && !cameraSystem.isOrbital()) {
    shootingSystem.shoot();
  }
});

window.addEventListener(
  "resize",
  () => onWindowResize(camera, renderer),
  false,
);

let plano = createGroundPlaneXZ(600, 600, 40, 40, "rgb(35, 75, 115)");
plano.position.y = -0.5;
plano.userData.collisionType = "walkable";
scene.add(plano);

const castelo = buildCastle(scene);
setupDayNightLighting(scene, renderer, [castelo, plano]);

render();

function render() {
  requestAnimationFrame(render);

  const delta = clock.getDelta();
  const ocorreuColisao = updateMovement(fpsControls, delta, [castelo, plano]);

  if (cameraSystem.isOrbital()) {
    orbitControls.update();
    unMountShootingSystem(scene, camera);
  } else {
    mountShootingSystem(scene, camera);
  }

  shootingSystem.update(delta, [castelo, plano]);

  updateDoors(camera);

  renderer.render(scene, camera);
}
