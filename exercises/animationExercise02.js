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
import GUI from '../libs/util/dat.gui.module.js'

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

let sphereGeometry01 = new THREE.SphereGeometry(0.8, 32, 16);
let sphere1 = new THREE.Mesh(sphereGeometry01, material);
sphere1.position.set(-9, 0.8, -4);
scene.add(sphere1);

let sphereGeometry02 = new THREE.SphereGeometry(0.8, 32, 16);
let sphere2 = new THREE.Mesh(sphereGeometry02, material);
sphere2.position.set(-9, 0.8, 4);
scene.add(sphere2);

const lerpConfig = {
    sphere1: false,
    sphere2: false,
    alpha1: 0.05,
    alpha2: 0.01,
    reset: false
}

buildInterface();
render();

function buildInterface() {
    var controls = new function () {
        this.sphere1 = function () {
            lerpConfig.sphere1 = !lerpConfig.sphere1;
        };

        this.sphere2 = function () {
            lerpConfig.sphere2 = !lerpConfig.sphere2;
        };

        this.reset = function () {
            sphere1.position.set(-9, 0.8, -4);
            sphere2.position.set(-9, 0.8, 4);
            lerpConfig.sphere1 = false;
            lerpConfig.sphere2 = false;
        }
    };

    // GUI interface
    var gui = new GUI();
    gui.add(controls, 'sphere1', true).name("Move sphere 1");
    gui.add(controls, 'sphere2', true).name("Move sphere 2");
    gui.add(controls, 'reset', true).name("Reset Positions");
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

function render() {
    requestAnimationFrame(render);
    if (lerpConfig.reset) {
        sphere.position.set(-9, 0.8, -4);
        sphere2.position.set(-9, 0.8, 4);
    }

    if (lerpConfig.sphere1) sphere1.position.lerp(new THREE.Vector3(9, 0.8, -4), lerpConfig.alpha1);
    if (lerpConfig.sphere2) sphere2.position.lerp(new THREE.Vector3(9, 0.8, 4), lerpConfig.alpha2);

    renderer.render(scene, camera) // Render scene
}