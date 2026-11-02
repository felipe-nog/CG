import * as THREE from "three";
import { OBJLoader } from "../build/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "../build/jsm/loaders/MTLLoader.js";
import { GLTFLoader } from "../build/jsm/loaders/GLTFLoader.js";

const ASSET_PATH = "./assets/enemies/";

export const ENEMY_TYPES = {
  beholder: {
    file: "/beholder.glb",
    height: 4.0,
    hp: 3,
    flying: false,
    speed: 2.5,
    yawOffset: 0,
    lightColor: '#c24b4b',
  },
  ghost: {
    file: "/squeak_ghost_win.glb",
    height: 3.4,
    hp: 5,
    flying: true,
    speed: 3.0,
    yawOffset: 0,
    lightColor: '#8e62ff',
  },
};

function loadGlb(file) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(ASSET_PATH + file, resolve, undefined, reject);
  });
}

function loadObj(file) {
  return new Promise((resolve, reject) => {
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(ASSET_PATH);
    mtlLoader.load(
      `${file}.mtl`,
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(ASSET_PATH);
        objLoader.load(`${file}.obj`, resolve, undefined, reject);
      },
      undefined,
      reject,
    );
  });
}

// Todos os objetos da cena (exceto as chaves) usam MeshLambertMaterial.
function toLambert(model) {
  model.traverse((object) => {
    if (!object.isMesh) return;
    const original = object.material;
    object.material = new THREE.MeshLambertMaterial({
      map: original.map ?? null,
      color: original.map ? 0xffffff : original.color,
      transparent: original.transparent,
      opacity: original.opacity,
      side: original.side,
    });
    if (object.material.map) {
      object.material.map.colorSpace = THREE.SRGBColorSpace;
    }
  });
}

// Centraliza o modelo em XZ, apoia a base em y = 0 e ajusta a altura.
function normalize(model, height) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const pivot = new THREE.Group();
  model.position.set(-center.x, -box.min.y, -center.z);
  pivot.add(model);

  const scale = height / size.y;
  pivot.scale.setScalar(scale);

  const wrapper = new THREE.Group();
  wrapper.add(pivot);
  wrapper.userData.size = size.clone().multiplyScalar(scale);
  return wrapper;
}

/** Carrega e normaliza os modelos de todos os tipos de inimigo. */
export async function loadEnemyModels() {
  const entries = await Promise.all(
    Object.entries(ENEMY_TYPES).map(async ([type, config]) => {
      let model;
      let animations = [];
      if (config.file.endsWith(".glb")) {
        const gltf = await loadGlb(config.file);
        model = gltf.scene;
        animations = gltf.animations;
      } else {
        model = await loadObj(config.file);
      }
      toLambert(model);
      const template = normalize(model, config.height);
      template.animations = animations;
      return [type, template];
    }),
  );
  return Object.fromEntries(entries);
}
