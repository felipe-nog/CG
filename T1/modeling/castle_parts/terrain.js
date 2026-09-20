import * as THREE from "three";

export function buildTerrain(grupoCastelo, materials) {
  const { matGrama, matTerra } = materials;

  const chaoTerra = new THREE.Mesh(new THREE.BoxGeometry(76, 0.1, 80), matTerra);
  chaoTerra.position.set(0, 0.05, 0);
  chaoTerra.userData.collisionType = "walkable";
  grupoCastelo.add(chaoTerra);

  const chaoTerraEsqExt = new THREE.Mesh(new THREE.BoxGeometry(10, 0.1, 20), matTerra);
  chaoTerraEsqExt.position.set(-40, 0.05, 10);
  chaoTerraEsqExt.userData.collisionType = "walkable";
  grupoCastelo.add(chaoTerraEsqExt);

  const chaoGramaEsq = new THREE.Mesh(new THREE.BoxGeometry(20, 0.15, 50), matGrama);
  chaoGramaEsq.position.set(-15, 0.08, 0);
  chaoGramaEsq.userData.collisionType = "walkable";
  grupoCastelo.add(chaoGramaEsq);

  const chaoGramaDir = new THREE.Mesh(new THREE.BoxGeometry(20, 0.15, 50), matGrama);
  chaoGramaDir.position.set(15, 0.08, 0);
  chaoGramaDir.userData.collisionType = "walkable";
  grupoCastelo.add(chaoGramaDir);
}