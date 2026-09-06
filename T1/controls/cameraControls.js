import { PointerLockControls } from '../../build/jsm/controls/PointerLockControls.js';
import { createCrosshair } from './crosshairControls.js';

export function setupFPSCamera(camera, domElement) {
  const controls = new PointerLockControls(camera, domElement);
  const crosshair = createCrosshair();

  crosshair.style.display = 'none'; 

  domElement.addEventListener('click', () => {
    controls.lock();
  });

  controls.addEventListener('lock', function () {
    crosshair.style.display = 'block'; 
  });

  controls.addEventListener('unlock', function () {
    crosshair.style.display = 'none'; 
  });

  return controls;
}