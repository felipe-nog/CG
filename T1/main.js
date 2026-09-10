import * as THREE from "three";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  onWindowResize,
  createGroundPlaneXZ,
} from "./libs/util/util.js";
import { setupFPSCamera } from "./controls/cameraControls.js";
import {
  setupMovementControls,
  updateMovement,
} from "./controls/movementControls.js";
import { OrbitControls } from "./build/jsm/controls/OrbitControls.js";
import { construirCastelo, atualizarPortas } from "./modeling/castle.js";

let scene, renderer, camera, material, light, fpsControls, orbitControls;

scene = new THREE.Scene();
renderer = initRenderer();
material = setDefaultMaterial();
light = initDefaultBasicLight(scene);

camera = initCamera(new THREE.Vector3(0, 2, 10));
fpsControls = setupFPSCamera(camera, renderer.domElement);
orbitControls = new OrbitControls(camera, renderer.domElement);

orbitControls.enableRotate = false;
orbitControls.enableZoom = false;
orbitControls.enablePan = false;
orbitControls.enabled = false;

const clock = new THREE.Clock();
const cameraSavedPosition = new THREE.Vector3();
const cameraSavedQuaternion = new THREE.Quaternion();
let isOrbital = false;

renderer.domElement.addEventListener("click", () => {
  if (!isOrbital) {
    fpsControls.lock();
  }
});

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
  if (fpsControls.isLocked && !isOrbital) {
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

construirCastelo(scene);

const caixaContornoCamera = new THREE.Box3();
let cameraEstavaColidindo = false;

render();

function render() {
  requestAnimationFrame(render);
  const delta = clock.getDelta();
  const ocorreuColisao = updateMovement(fpsControls, delta, scene.children);
  
  if (!isOrbital) {
    const cameraEstaColidindo = ocorreuColisao;
    if (cameraEstaColidindo && !cameraEstavaColidindo) {
      console.warn("Colisão detectada entre a câmera e um objeto.");
    }
    cameraEstavaColidindo = cameraEstaColidindo;
  }

  atualizarPortas(camera);

  if (isOrbital) {
    orbitControls.update();
  }

  renderer.render(scene, camera);
}