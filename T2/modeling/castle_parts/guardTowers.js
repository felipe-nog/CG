import * as THREE from "three";

export function buildGuardTowers(grupoCastelo, matPedra) {

  // Geometrias das torres
  const geomTorreCentro = new THREE.BoxGeometry(10, 28, 12);
  const geomTorreComplementar = new THREE.BoxGeometry(10, 28, 12);
  const geomMiniTorre = new THREE.CylinderGeometry(1.6, 1.6, 5, 16);
  const geomDenteMiniTorre = new THREE.BoxGeometry(0.7, 0.6, 0.7);

  const torreCentroFundo = new THREE.Mesh(geomTorreCentro, matPedra);
  torreCentroFundo.position.set(0, 14, -40);
  grupoCastelo.add(torreCentroFundo);

  const torreMuroEmL = new THREE.Mesh(geomTorreComplementar, matPedra);
  torreMuroEmL.position.set(-45, 14, 5);
  grupoCastelo.add(torreMuroEmL);

  // Mini torre em cima da torreMuroEmL
  const miniTorreMuroEmL = new THREE.Mesh(geomMiniTorre, matPedra);
  miniTorreMuroEmL.position.set(-41.5, 29, 1);
  grupoCastelo.add(miniTorreMuroEmL);

  for (let j = 0; j < 5; j++) {
    const angGuarita = (j * 2 * Math.PI) / 5;
    const dente = new THREE.Mesh(geomDenteMiniTorre, matPedra);
    dente.position.x = -41.5 + Math.cos(angGuarita) * 1.3;
    dente.position.z = 1 + Math.sin(angGuarita) * 1.3;
    dente.position.y = 31.5;
    dente.rotation.y = -angGuarita;
    grupoCastelo.add(dente);
  }

  buildParapeitoMuroEmL(grupoCastelo, matPedra);
}

// Parapeito e dentes no topo da torreMuroEmL
function buildParapeitoMuroEmL(grupoCastelo, matPedra) {
  const geomParapeitoTorrePortao = new THREE.BoxGeometry(11.2, 1.5, 13.2);
  const parapeitoMuroEmL = new THREE.Mesh(geomParapeitoTorrePortao, matPedra);
  parapeitoMuroEmL.position.set(-45, 28, 5);
  grupoCastelo.add(parapeitoMuroEmL);

  const geomDentePortao = new THREE.BoxGeometry(0.8, 1.2, 0.8);
  const yDente = 29.35;

  // Dentes no topo da torreMuroEmL (Frente, Trás, Lateral Esquerda e Lateral Direita)
  for (let x = -49.8; x <= -40.2; x += 1.8) {
    const denteFrente = new THREE.Mesh(geomDentePortao, matPedra);
    denteFrente.position.set(x, yDente, 11.4);
    grupoCastelo.add(denteFrente);

    const denteTras = new THREE.Mesh(geomDentePortao, matPedra);
    denteTras.position.set(x, yDente, -1.4);
    grupoCastelo.add(denteTras);
  }
  for (let z = -0.6; z <= 10.6; z += 1.8) {
    const denteEsq = new THREE.Mesh(geomDentePortao, matPedra);
    denteEsq.position.set(-50.4, yDente, z);
    grupoCastelo.add(denteEsq);

    const denteDir = new THREE.Mesh(geomDentePortao, matPedra);
    denteDir.position.set(-39.6, yDente, z);
    grupoCastelo.add(denteDir);
  }
}
