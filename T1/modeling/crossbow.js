import * as THREE from "three";
import { setDartTemplate } from "./dart.js";
import { OBJLoader } from "../build/jsm/loaders/OBJLoader.js";

const ASSET_PATH = "./assets/crossbow/";

export const CROSSBOW_LOCAL_POSITION = new THREE.Vector3(0.17, -0.15, -0.5);
const CROSSBOW_SCALE = 0.6;
// O virote do asset é pequeno demais para ser percebido em primeira pessoa.
const BOLT_SCALE = 2.5;

// O modelo original aponta para +Z e traz o virote deslocado ao lado do corpo;
// aqui ele é centralizado sobre o trilho.
const BOLT_REST_POSITION = new THREE.Vector3(0, 0.055, -0.3);

const textureLoader = new THREE.TextureLoader();

function loadMaterial(colorFile) {
  const map = textureLoader.load(ASSET_PATH + colorFile);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return new THREE.MeshLambertMaterial({ map });
}

function loadObj(file) {
  return new Promise((resolve, reject) => {
    const loader = new OBJLoader();
    loader.setPath(ASSET_PATH);
    loader.load(file, resolve, undefined, reject);
  });
}

// Cada objeto do .obj usa uma textura de cor; os mapas PBR do asset são
// ignorados porque a cena inteira usa MeshLambertMaterial.
const PART_TEXTURES = {
  body: "medieval_crossbow_static_parts_color.png",
  bolt: "bolt_color.png",
};
const DYNAMIC_TEXTURE = "medieval_crossbow_dynamic_parts_color.png";

/**
 * Besta medieval importada (OBJ), anexada à câmera e apontando para -Z.
 * Retorna imediatamente o grupo, o dardo carregado e o ponto de saída
 * (ponta do dardo); a geometria é preenchida quando o modelo termina de
 * carregar. `dart` e `muzzle` ficam no referencial da besta.
 */
export function createCrossbow(camera) {
  const crossbow = new THREE.Group();
  const dart = new THREE.Group();
  const muzzle = new THREE.Object3D();
  crossbow.add(dart, muzzle);

  const materials = new Map();
  const materialFor = (file) => {
    if (!materials.has(file)) materials.set(file, loadMaterial(file));
    return materials.get(file);
  };

  loadObj("medieval_crossbow.obj")
    .then((model) => {
      const bolt = model.getObjectByName("bolt");

      model.traverse((object) => {
        if (!object.isMesh) return;
        object.material = materialFor(
          PART_TEXTURES[object.name] ?? DYNAMIC_TEXTURE,
        );
      });

      // Separa o virote para que ele possa deslizar/sumir de forma independente.
      model.remove(bolt);
      const box = new THREE.Box3().setFromObject(bolt);
      const center = box.getCenter(new THREE.Vector3());
      bolt.position.sub(center);
      dart.add(bolt);

      // Cópia em escala de mundo para os projéteis em voo (aponta para -Z).
      const flying = new THREE.Group();
      const flyingBolt = bolt.clone();
      flyingBolt.rotation.y = Math.PI;
      flying.add(flyingBolt);
      flying.scale.setScalar(CROSSBOW_SCALE * BOLT_SCALE);
      const holder = new THREE.Group();
      holder.add(flying);
      holder.userData.tipOffset =
        ((box.max.z - box.min.z) / 2) * CROSSBOW_SCALE * BOLT_SCALE;
      setDartTemplate(holder);
      dart.scale.setScalar(BOLT_SCALE);
      dart.userData.tipOffset = ((box.max.z - box.min.z) / 2) * BOLT_SCALE;

      model.rotation.y = Math.PI; // frente do modelo (+Z) → -Z
      crossbow.add(model);

      // O pivô do dardo vive no referencial da besta (já virada para -Z).
      dart.rotation.y = Math.PI;
      dart.position.copy(BOLT_REST_POSITION);
      muzzle.position.copy(dart.position);
      muzzle.position.z -= dart.userData.tipOffset;
      dart.userData.restZ = dart.position.z;
      dart.userData.ready = true;
    })
    .catch((error) => console.error("Falha ao carregar a besta:", error));

  crossbow.position.copy(CROSSBOW_LOCAL_POSITION);
  crossbow.rotation.x = 0.03;
  crossbow.rotation.y = 0.08;
  crossbow.scale.setScalar(CROSSBOW_SCALE);
  camera.add(crossbow);

  return { crossbow, muzzle, dart };
}

export function getMuzzleWorldPosition(muzzle, target = new THREE.Vector3()) {
  return muzzle.getWorldPosition(target);
}
