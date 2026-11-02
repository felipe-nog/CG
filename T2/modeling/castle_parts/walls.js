import * as THREE from "three";
import { CSG } from "../../libs/other/CSGMesh.js";

export function buildWalls(grupoCastelo, materials) {
  const { matPedra } = materials;
  const auxMat = new THREE.Matrix4();

  function createSlitCutter(width = 1.1, straightHeight = 3.2, depth = 6) {
    const stem = new THREE.Mesh(new THREE.BoxGeometry(width, straightHeight, depth));
    stem.position.y = straightHeight / 2;
    stem.updateMatrix();

    const arch = new THREE.Mesh(
      new THREE.CylinderGeometry(width / 2, width / 2, depth, 16),
    );
    arch.rotation.x = Math.PI / 2;
    arch.position.y = straightHeight;
    arch.updateMatrix();

    return CSG.fromMesh(stem).union(CSG.fromMesh(arch));
  }

  // Geometrias dos muros perimetrais
  const geomMuroHoriz = new THREE.BoxGeometry(70, 20, 4);
  const geomMuroVertEsq = new THREE.BoxGeometry(4, 20, 35);
  const geomMuroVertDir = new THREE.BoxGeometry(4, 20, 70);

  const geomMuroFrenteEsq = new THREE.BoxGeometry(26, 20, 4);
  const geomMuroFrenteDir = new THREE.BoxGeometry(26, 20, 4);
  const geomMuroSobrePorta = new THREE.BoxGeometry(10, 12, 2);

  // Geometrias dos muros em L na esquerda do castelo
  const geomMuroEsqPequeno = new THREE.BoxGeometry(1, 20, 20);
  const geomMuroEmL = new THREE.BoxGeometry(8, 20, 1);
  const geomComplementoMuroEmL = new THREE.BoxGeometry(1, 20, 19);

  // Construção dos muros
  const muroFundo = new THREE.Mesh(geomMuroHoriz, matPedra);
  muroFundo.position.set(0, 10, -40);
  grupoCastelo.add(muroFundo);

  const muroEsq = new THREE.Mesh(geomMuroVertEsq, matPedra);
  muroEsq.position.set(-38, 10, -17.5);
  grupoCastelo.add(muroEsq);

  const muroDir = new THREE.Mesh(geomMuroVertDir, matPedra);
  muroDir.position.set(38, 10, 0);
  grupoCastelo.add(muroDir);

  const muroFrenteEsqBase = new THREE.Mesh(geomMuroFrenteEsq, matPedra);
  muroFrenteEsqBase.position.set(-21.5, 10, 40);
  muroFrenteEsqBase.updateMatrix();
  let muroFrenteEsqCSG = CSG.fromMesh(muroFrenteEsqBase);
  [-28, -20].forEach((x) => {
    const cutter = CSG.toMesh(createSlitCutter(), auxMat);
    cutter.position.set(x, 8, 40);
    cutter.updateMatrix();
    muroFrenteEsqCSG = muroFrenteEsqCSG.subtract(CSG.fromMesh(cutter));
  });
  const muroFrenteEsq = CSG.toMesh(muroFrenteEsqCSG, auxMat, matPedra);
  muroFrenteEsq.castShadow = true;
  muroFrenteEsq.receiveShadow = true;
  grupoCastelo.add(muroFrenteEsq);

  const muroFrenteDirBase = new THREE.Mesh(geomMuroFrenteDir, matPedra);
  muroFrenteDirBase.position.set(21.5, 10, 40);
  muroFrenteDirBase.updateMatrix();
  let muroFrenteDirCSG = CSG.fromMesh(muroFrenteDirBase);
  [20, 28].forEach((x) => {
    const cutter = CSG.toMesh(createSlitCutter(), auxMat);
    cutter.position.set(x, 8, 40);
    cutter.updateMatrix();
    muroFrenteDirCSG = muroFrenteDirCSG.subtract(CSG.fromMesh(cutter));
  });
  const muroFrenteDir = CSG.toMesh(muroFrenteDirCSG, auxMat, matPedra);
  muroFrenteDir.castShadow = true;
  muroFrenteDir.receiveShadow = true;
  grupoCastelo.add(muroFrenteDir);

  // Construção dos muros em L na esquerda
  const muroEsqPequeno = new THREE.Mesh(geomMuroEsqPequeno, matPedra);
  muroEsqPequeno.position.set(-45, 10, 10);
  grupoCastelo.add(muroEsqPequeno);

  const muroEmL = new THREE.Mesh(geomMuroEmL, matPedra);
  muroEmL.position.set(-41.5, 10, 20);
  grupoCastelo.add(muroEmL);

  const complementoMuroEmL = new THREE.Mesh(geomComplementoMuroEmL, matPedra);
  complementoMuroEmL.position.set(-38, 10, 29);
  grupoCastelo.add(complementoMuroEmL);

  // Construção do muro sobre a porta
  const muroSobrePorta = new THREE.Mesh(geomMuroSobrePorta, matPedra);
  muroSobrePorta.position.set(0, 22, 40);
  grupoCastelo.add(muroSobrePorta);

  // Topos dos muros (caminháveis)
  const alturaTopoMuro = 0.1;

  const topoMuroFundo = new THREE.Mesh(
    new THREE.BoxGeometry(70, alturaTopoMuro, 4),
    matPedra,
  );
  topoMuroFundo.position.set(0, 20.05, -40);
  topoMuroFundo.userData.collisionType = "walkable";
  grupoCastelo.add(topoMuroFundo);

  const topoMuroEsq = new THREE.Mesh(
    new THREE.BoxGeometry(4, alturaTopoMuro, 70),
    matPedra,
  );
  topoMuroEsq.position.set(-38, 20.05, 0);
  topoMuroEsq.userData.collisionType = "walkable";
  grupoCastelo.add(topoMuroEsq);

  const topoMuroDir = topoMuroEsq.clone();
  topoMuroDir.position.x = 38;
  grupoCastelo.add(topoMuroDir);

  const topoMuroFrenteEsq = new THREE.Mesh(
    new THREE.BoxGeometry(26, alturaTopoMuro, 4),
    matPedra,
  );
  topoMuroFrenteEsq.position.set(-21.5, 20.05, 40);
  topoMuroFrenteEsq.userData.collisionType = "walkable";
  grupoCastelo.add(topoMuroFrenteEsq);

  const topoMuroFrenteDir = topoMuroFrenteEsq.clone();
  topoMuroFrenteDir.position.x = 21.5;
  grupoCastelo.add(topoMuroFrenteDir);

  const topoMuroEsqPequeno = new THREE.Mesh(
    new THREE.BoxGeometry(1, alturaTopoMuro, 20),
    matPedra,
  );
  topoMuroEsqPequeno.position.set(-45, 20.05, 10);
  topoMuroEsqPequeno.userData.collisionType = "walkable";
  grupoCastelo.add(topoMuroEsqPequeno);

  const topoMuroEmL = new THREE.Mesh(
    new THREE.BoxGeometry(8, alturaTopoMuro, 1),
    matPedra,
  );
  topoMuroEmL.position.set(-41.5, 20.05, 20);
  topoMuroEmL.userData.collisionType = "walkable";
  grupoCastelo.add(topoMuroEmL);

  const topoComplementoMuroEmL = new THREE.Mesh(
    new THREE.BoxGeometry(1, alturaTopoMuro, 19),
    matPedra,
  );
  topoComplementoMuroEmL.position.set(-38, 20.05, 29);
  topoComplementoMuroEmL.userData.collisionType = "walkable";
  grupoCastelo.add(topoComplementoMuroEmL);
}
