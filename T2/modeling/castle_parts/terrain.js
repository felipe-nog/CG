import * as THREE from "three";
import { CSG } from "../../libs/other/CSGMesh.js";

export function buildTerrain(grupoCastelo, materials) {
  const { matGrama, matTerra } = materials;

  const blocoPiso = new THREE.Mesh(new THREE.BoxGeometry(76, 0.1, 80), matTerra);
  blocoPiso.position.set(0, 0.05, 0);
  blocoPiso.updateMatrix();

  // O paralelepípedo vertical atravessa o piso e abre o vão abaixo da escotilha.
  const cortadorPortal = new THREE.Mesh(new THREE.BoxGeometry(6.3, 1, 6.3));
  cortadorPortal.position.set(0, 0.05, 10);
  cortadorPortal.updateMatrix();

  const csgPiso = CSG.fromMesh(blocoPiso).subtract(CSG.fromMesh(cortadorPortal));
  const chaoTerra = CSG.toMesh(csgPiso, new THREE.Matrix4(), matTerra);
  chaoTerra.userData.collisionType = "walkable";
  chaoTerra.userData.walkableHoles = [
    {
      center: new THREE.Vector3(0, 0.05, 10),
      halfWidth: 3.15,
      halfDepth: 3.15,
    },
  ];
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
