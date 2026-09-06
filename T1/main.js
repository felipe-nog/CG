import * as THREE from 'three';
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  onWindowResize,
  createGroundPlaneXZ
} from "../libs/util/util.js";

import { setupFPSCamera } from './controls/cameraControls.js';

let scene, renderer, camera, material, light, fpsControls;

scene = new THREE.Scene();   
renderer = initRenderer();   
material = setDefaultMaterial(); 
light = initDefaultBasicLight(scene);

camera = initCamera(new THREE.Vector3(0, 2, 10)); 
fpsControls = setupFPSCamera(camera, renderer.domElement);

window.addEventListener('resize', () => { 
  onWindowResize(camera, renderer); 
}, false);

let plane = createGroundPlaneXZ(60, 60);
scene.add(plane);

render();

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}