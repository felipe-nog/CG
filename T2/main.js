import * as THREE from "three";
import { CSG } from "./libs/other/CSGMesh.js";
import {
  initRenderer,
  initCamera,
  onWindowResize,
} from "./libs/util/util.js";
import { setupCameraSystem } from "./controls/cameraControls.js";
import {
  setupMovementControls,
  updateMovement,
} from "./controls/movementControls.js";
import { buildCastle, updateDoors } from "./modeling/castle.js";
import { setupDayNightLighting } from "./lighting/dayNightLighting.js";
import { setupEnemySystem } from "./controls/enemyControls.js";
import { setupKeySystem } from "./controls/keyControls.js";
import {
  mountShootingSystem,
  setupShootingSystem,
  unMountShootingSystem,
} from "./controls/shootingControls.js";

let scene, renderer, camera, cameraSystem;

function createWaterFloorWithPortalOpening(castleScale) {
  const halfOpening = 3.15 * castleScale;
  const centerZ = 10 * castleScale;
  const materialAgua = new THREE.MeshLambertMaterial({
    color: "rgb(35, 75, 115)",
    side: THREE.DoubleSide,
  });
  const pisoBase = new THREE.Mesh(
    new THREE.BoxGeometry(600, 0.1, 600),
    materialAgua,
  );
  pisoBase.position.set(0, -0.55, 0);
  pisoBase.updateMatrix();

  const cortadorPortal = new THREE.Mesh(
    new THREE.BoxGeometry(halfOpening * 2, 1, halfOpening * 2),
  );
  cortadorPortal.position.set(0, -0.55, centerZ);
  cortadorPortal.updateMatrix();

  const aguaComAbertura = CSG.toMesh(
    CSG.fromMesh(pisoBase).subtract(CSG.fromMesh(cortadorPortal)),
    new THREE.Matrix4(),
    materialAgua,
  );
  aguaComAbertura.userData.collisionType = "walkable";
  aguaComAbertura.userData.walkableHoles = [
    {
      center: new THREE.Vector3(0, -0.55, centerZ),
      halfWidth: halfOpening,
      halfDepth: halfOpening,
    },
  ];
  return aguaComAbertura;
}

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

const castelo = buildCastle(scene);
const plano = createWaterFloorWithPortalOpening(castelo.scale.x);
plano.userData.collisionType = "walkable";
scene.add(plano);
const lighting = setupDayNightLighting(scene, renderer, [castelo, plano]);
const portalWorldCenter = castelo.localToWorld(new THREE.Vector3(0, 0, 10));
const portalHalfSize = 3.15 * castelo.scale.x;
let reiniciandoAposQueda = false;

const keySystem = setupKeySystem(scene, camera, castelo.userData.portalInterior);
const enemySystem = setupEnemySystem(scene, castelo, camera, (position) =>
  keySystem.dropKey(position),
);

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

  enemySystem.update(delta, lighting.isNight());
  keySystem.update(delta);
  shootingSystem.update(delta, [castelo, plano], enemySystem.targets);

  updateDoors(camera);

  const dentroDoPortalX = Math.abs(camera.position.x - portalWorldCenter.x) < portalHalfSize;
  const dentroDoPortalZ = Math.abs(camera.position.z - portalWorldCenter.z) < portalHalfSize;
  const caiuNoPortal =
    keySystem.isHatchOpen() &&
    !cameraSystem.isOrbital() &&
    fpsControls.isLocked &&
    dentroDoPortalX &&
    dentroDoPortalZ &&
    camera.position.y < -1;
  if (caiuNoPortal && !reiniciandoAposQueda) {
    reiniciandoAposQueda = true;
    window.location.reload();
  }

  renderer.render(scene, camera);
}
