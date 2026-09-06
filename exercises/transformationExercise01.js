import * as THREE from  'three';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
material = setDefaultMaterial(); // create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
scene.add(camera); // Add camera to the scene
orbit = new OrbitControls( camera, renderer.domElement ); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);


const NUMBER_OF_LEGS = 4;

let topDeskGeometry = new THREE.BoxGeometry(11, 0.3, 6);
let topDesk = new THREE.Mesh(topDeskGeometry, material);
topDesk.position.set(0.0, 5.0, 0.0);
scene.add(topDesk);

topDesk.translateY(2.9);

let legDeskGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 22);

let initialX = -5;
let initialZ = -4;
for(let i = 0; i < NUMBER_OF_LEGS; i++) {
    createLegsAndPosition(topDesk, legDeskGeometry, initialX * (i % 2 === 0 ? 1 : -1), 1, initialZ * (i < 2 ? 1 : -0.1));
}


function createLegsAndPosition(topDesk, legDeskGeometry, tx, ty, tz) {
    let legDesk = new THREE.Mesh(legDeskGeometry, material);
    legDesk.position.set(0, -2.5, 2);
    topDesk.add(legDesk);

    legDesk.translateX(tx);
    legDesk.translateY(ty);
    legDesk.translateZ(tz);


}



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
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}