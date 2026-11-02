import * as THREE from "three";

export function buildWalls(grupoCastelo, materials) {
  const { matPedra } = materials;

  // Geometrias dos muros
  const geomMuroHoriz = new THREE.BoxGeometry(80, 20, 4);
  const geomMuroVertEsq = new THREE.BoxGeometry(4, 20, 40);
  const geomMuroVertDir = new THREE.BoxGeometry(4, 20, 70);

  const geomMuroFrenteEsq = new THREE.BoxGeometry(30, 20, 4);
  const geomMuroFrenteDir = new THREE.BoxGeometry(30, 20, 4);
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
  muroEsq.position.set(-38, 10, -20);
  grupoCastelo.add(muroEsq);

  const muroDir = new THREE.Mesh(geomMuroVertDir, matPedra);
  muroDir.position.set(38, 10, 0);
  grupoCastelo.add(muroDir);

  const muroFrenteEsq = new THREE.Mesh(geomMuroFrenteEsq, matPedra);
  muroFrenteEsq.position.set(-30, 10, 40);
  grupoCastelo.add(muroFrenteEsq);

  const muroFrenteDir = new THREE.Mesh(geomMuroFrenteDir, matPedra);
  muroFrenteDir.position.set(30, 10, 40);
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
    new THREE.BoxGeometry(80, alturaTopoMuro, 4),
    matPedra,
  );
  topoMuroFundo.position.set(0, 20.05, -40);
  topoMuroFundo.userData.collisionType = "walkable";
  grupoCastelo.add(topoMuroFundo);

  const topoMuroEsq = new THREE.Mesh(
    new THREE.BoxGeometry(4, alturaTopoMuro, 76),
    matPedra,
  );
  topoMuroEsq.position.set(-38, 20.05, 0);
  topoMuroEsq.userData.collisionType = "walkable";
  grupoCastelo.add(topoMuroEsq);

  const topoMuroDir = topoMuroEsq.clone();
  topoMuroDir.position.x = 38;
  grupoCastelo.add(topoMuroDir);

  const topoMuroFrenteEsq = new THREE.Mesh(
    new THREE.BoxGeometry(32, alturaTopoMuro, 4),
    matPedra,
  );
  topoMuroFrenteEsq.position.set(-24, 20.05, 40);
  topoMuroFrenteEsq.userData.collisionType = "walkable";
  grupoCastelo.add(topoMuroFrenteEsq);

  const topoMuroFrenteDir = topoMuroFrenteEsq.clone();
  topoMuroFrenteDir.position.x = 24;
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
