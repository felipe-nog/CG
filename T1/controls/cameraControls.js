import * as THREE from "three";
import { PointerLockControls } from "../../build/jsm/controls/PointerLockControls.js";
import { OrbitControls } from "../../build/jsm/controls/OrbitControls.js";
import { createCrosshair } from "./crosshairControls.js";

export function setupCameraSystem(camera, domElement) {
  const crosshair = createCrosshair();
  crosshair.style.display = "none";

  // ---------- First Person ----------
  const fpsControls = new PointerLockControls(camera, domElement);

  fpsControls.addEventListener("lock", () => {
    crosshair.style.display = "block";
  });

  fpsControls.addEventListener("unlock", () => {
    crosshair.style.display = "none";
  });

  // ---------- Orbital Camera ----------
  const orbitControls = new OrbitControls(camera, domElement);
  orbitControls.enabled = false;
  orbitControls.enableRotate = true;
  orbitControls.enableZoom = true;
  orbitControls.enablePan = false;

  const cameraSavedPosition = new THREE.Vector3();
  const cameraSavedQuaternion = new THREE.Quaternion();
  let isOrbital = false;

  function enterOrbitalMode() {
    isOrbital = true;

    fpsControls.unlock();

    cameraSavedPosition.copy(camera.position);
    cameraSavedQuaternion.copy(camera.quaternion);

    crosshair.style.display = "none";

    orbitControls.target.set(0, 0, 0);
    camera.position.set(0, 40, 40);
    orbitControls.enabled = true;
    orbitControls.update();
  }

  function exitOrbitalMode() {
    isOrbital = false;

    orbitControls.enabled = false;

    camera.position.copy(cameraSavedPosition);
    camera.quaternion.copy(cameraSavedQuaternion);

    fpsControls.lock();
  }

  function toggleOrbitalMode() {
    isOrbital ? exitOrbitalMode() : enterOrbitalMode();
  }

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "c") {
      toggleOrbitalMode();
    }
  });

  return {
    fpsControls,
    orbitControls,
    toggleOrbitalMode,
    isOrbital: () => isOrbital,
  };
}