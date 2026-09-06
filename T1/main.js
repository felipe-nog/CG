import * as THREE from "three";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  onWindowResize,
  createGroundPlaneXZ,
} from "../libs/util/util.js";

import { setupFPSCamera } from "./controls/cameraControls.js";
import {
  setupMovementControls,
  updateMovement,
} from "./controls/movementControls.js";
import { OrbitControls } from "../build/jsm/controls/OrbitControls.js";

let scene, renderer, camera, material, light, fpsControls, orbitControls;

scene = new THREE.Scene();
renderer = initRenderer();
material = setDefaultMaterial();
light = initDefaultBasicLight(scene);

camera = initCamera(new THREE.Vector3(0, 2, 10));
fpsControls = setupFPSCamera(camera, renderer.domElement);
orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enabled = false;

const clock = new THREE.Clock();

const cameraSavedPosition = new THREE.Vector3();
const cameraSavedQuaternion = new THREE.Quaternion();
let isOrbital = false;

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "c") {
    isOrbital = !isOrbital;

    if (isOrbital) {
      fpsControls.unlock();

      cameraSavedPosition.copy(camera.position);
      cameraSavedQuaternion.copy(camera.quaternion);

      orbitControls.enabled = true;

      camera.position.set(0, 40, 40);

      orbitControls.target.set(0, 0, 0);
      orbitControls.update();
    } else {
      orbitControls.enabled = false;

      camera.position.copy(cameraSavedPosition);
      camera.quaternion.copy(cameraSavedQuaternion);

      fpsControls.lock();
    }
  }
});

setupMovementControls(() => {
  if (fpsControls.isLocked) {
    console.log("Tiro!");
  }
});

window.addEventListener(
  "resize",
  () => {
    onWindowResize(camera, renderer);
  },
  false,
);

let plane = createGroundPlaneXZ(60, 60);
scene.add(plane);

const boxGeom = new THREE.BoxGeometry(2, 2, 2);
const boxMesh = new THREE.Mesh(boxGeom, material);
boxMesh.position.set(0, 1, 0);
scene.add(boxMesh);

render();

function render() {
  requestAnimationFrame(render);

  const delta = clock.getDelta();
  updateMovement(fpsControls, delta);

  if (isOrbital) {
    orbitControls.update();
  }

  renderer.render(scene, camera);
}
