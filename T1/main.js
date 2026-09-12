import * as THREE from "three";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  onWindowResize,
  createGroundPlaneXZ,
} from "./libs/util/util.js";
import { setupCameraSystem } from "./controls/cameraControls.js";
import {
  setupMovementControls,
  updateMovement,
} from "./controls/movementControls.js";
import { updateDoors, buildCastle } from "./modeling/castle.js";

let scene, renderer, camera, material, light, cameraSystem;

scene = new THREE.Scene();
renderer = initRenderer();
material = setDefaultMaterial();
light = initDefaultBasicLight(scene);
camera = initCamera(new THREE.Vector3(0, 2, 10));
cameraSystem = setupCameraSystem(camera, renderer.domElement);

const { fpsControls, orbitControls } = cameraSystem;
const clock = new THREE.Clock();

renderer.domElement.addEventListener("click", () => {
  if (!cameraSystem.isOrbital()) {
    fpsControls.lock();
  }
});

setupMovementControls(() => {
  if (fpsControls.isLocked && !cameraSystem.isOrbital()) {
    console.log("Tiro!");
  }
});

window.addEventListener(
  "resize",
  () => onWindowResize(camera, renderer),
  false,
);

let plano = createGroundPlaneXZ(200, 200, 10, 10, "rgb(60, 100, 120)");
scene.add(plano);

buildCastle(scene);

let cameraEstavaColidindo = false;

render();

function render() {
  requestAnimationFrame(render);

  const delta = clock.getDelta();
  const ocorreuColisao = updateMovement(fpsControls, delta, scene.children);

  if (ocorreuColisao && !cameraEstavaColidindo) {
    console.warn("Colisão detectada entre a câmera e um objeto.");
  }
  cameraEstavaColidindo = !!ocorreuColisao;

  if (cameraSystem.isOrbital()) {
    orbitControls.update();
  }

  updateDoors(camera);

  renderer.render(scene, camera);
}
