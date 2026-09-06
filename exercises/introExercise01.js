import * as THREE from 'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  InfoBox,
  onWindowResize,
  createGroundPlaneXZ
} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit;; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

let angle = THREE.MathUtils.degToRad(45);
let angle2 = THREE.MathUtils.degToRad(30);

// Listen window size changes
window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// create cube 1
let cubeGeometry1 = new THREE.BoxGeometry(4, 4, 4);
let cube1 = new THREE.Mesh(cubeGeometry1, material);
// position the cube
cube1.position.set(0.0, 2.0, 0.0);
// add the cube to the scene
scene.add(cube1);

// Mudar a posição: Método 1
// cube1.position.x = 3
// cube1.position.y = 5

// Mudar a posição: Método 2
// cube1.position.set(-5.0, 5.0, 0.0)


// Mudar a escala: Método 1
// cube1.scale.x = 2;
// cube1.scale.y = 3;

// Mudar a escala: Método 2
// cube1.scale.set(2, 5, 1);



// Mudar a rotação: Método 1
// cube1.rotateX(angle);
// cube1.rotateY(angle2);

// Mudar a rotação: Método 2
// let axis = new THREE.Vector3(0, 1, 0.5);
// cube1.rotateOnAxis(axis, Math.PI/4);

console.log("Posição: ", cube1.position)

// create cube 2
let cubeGeometry2 = new THREE.BoxGeometry(2, 2, 2);
let cube2 = new THREE.Mesh(cubeGeometry2, material);
// position the cube
cube2.position.set(5.0, 1.0, 0.0);
// add the cube to the scene
scene.add(cube2);


// create cube 3
let cubeGeometry3 = new THREE.BoxGeometry(1, 1, 1);
let cube3 = new THREE.Mesh(cubeGeometry3, material);
// position the cube
cube3.position.set(0.0, 0.5, 6.0);
// add the cube to the scene
scene.add(cube3);


// Use this to show information onscreen
let controls = new InfoBox();
controls.add("Basic Scene");
controls.addParagraph();
controls.add("Use mouse to interact:");
controls.add("* Left button to rotate");
controls.add("* Right button to translate (pan)");
controls.add("* Scroll to zoom in/out.");
controls.show();

render();
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}