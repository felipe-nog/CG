import * as THREE from "three";

export const KEY_RADIUS = 0.4;
// Intensidade base do brilho; o pulso em keyControls.js oscila em torno dela.
export const KEY_EMISSIVE_INTENSITY = 1.6;

// Amarelo fluorescente: usado na esfera e na luz ao redor dela.
export const KEY_COLOR = 0xe6ff00;

// O material pode ser compartilhado entre as chaves (um único programa de shader).
export function createKeyMaterial() {
  return new THREE.MeshPhongMaterial({
    color: KEY_COLOR,
    emissive: KEY_COLOR,
    emissiveIntensity: KEY_EMISSIVE_INTENSITY,
    specular: 0xffffff,
    shininess: 120,
  });
}

export function createKeyMesh(material = createKeyMaterial()) {
  const key = new THREE.Mesh(new THREE.SphereGeometry(KEY_RADIUS, 24, 24), material);
  key.castShadow = true;
  key.userData.isKey = true;

  return key;
}
