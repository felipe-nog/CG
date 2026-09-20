import * as THREE from "three";

export function buildGatehouse(grupoCastelo, matPedra) {
  const geomTorreCentro = new THREE.BoxGeometry(10, 28, 12);

  const torrePortaoEsq = new THREE.Mesh(geomTorreCentro, matPedra);
  torrePortaoEsq.position.set(-10, 14, 40);
  grupoCastelo.add(torrePortaoEsq);

  const torrePortaoDir = new THREE.Mesh(geomTorreCentro, matPedra);
  torrePortaoDir.position.set(10, 14, 40);
  grupoCastelo.add(torrePortaoDir);

  buildParapeitos(grupoCastelo, matPedra);
  buildGarfos(grupoCastelo, matPedra);
  buildDentes(grupoCastelo, matPedra);
  buildMiniGuaritaPortao(grupoCastelo, matPedra);
}

// Parapeitos no topo das torres centrais do portão e do muro sobre a porta
function buildParapeitos(grupoCastelo, matPedra) {
  const geomParapeitoTorrePortao = new THREE.BoxGeometry(11.2, 1.5, 13.2);

  const parapeitoPortaoEsq = new THREE.Mesh(geomParapeitoTorrePortao, matPedra);
  parapeitoPortaoEsq.position.set(-10, 28, 40);
  grupoCastelo.add(parapeitoPortaoEsq);

  const parapeitoPortaoDir = new THREE.Mesh(geomParapeitoTorrePortao, matPedra);
  parapeitoPortaoDir.position.set(10, 28, 40);
  grupoCastelo.add(parapeitoPortaoDir);

  const geomParapeitoMuroCentro = new THREE.BoxGeometry(16.4, 1.5, 11.8);
  const parapeitoMuroCentro = new THREE.Mesh(geomParapeitoMuroCentro, matPedra);
  parapeitoMuroCentro.position.set(0, 28, 38);
  grupoCastelo.add(parapeitoMuroCentro);
}

// Garfos (espinhos) nas torres do portão e no muro central sobre a porta
function buildGarfos(grupoCastelo, matPedra) {
  const geomGarfo = new THREE.BoxGeometry(0.5, 1.4, 0.6);
  const yGarfo = 26.8;

  // Garfos na Torre Esquerda do Portão (Frente e Laterais)
  for (let x = -15.2; x <= -4.8; x += 1.5) {
    const garfo = new THREE.Mesh(geomGarfo, matPedra);
    garfo.position.set(x, yGarfo, 46.7);
    grupoCastelo.add(garfo);
  }
  // Face lateral externa
  for (let z = 33.8; z <= 46.2; z += 1.8) {
    const garfo = new THREE.Mesh(geomGarfo, matPedra);
    garfo.position.set(-15.7, yGarfo, z);
    garfo.rotation.y = Math.PI / 2;
    grupoCastelo.add(garfo);
  }

  // Garfos na Torre Direita do Portão (Frente e Laterais)
  for (let x = 4.8; x <= 15.2; x += 1.5) {
    const garfo = new THREE.Mesh(geomGarfo, matPedra);
    garfo.position.set(x, yGarfo, 46.7);
    grupoCastelo.add(garfo);
  }
  // Face lateral externa
  for (let z = 33.8; z <= 46.2; z += 1.8) {
    const garfo = new THREE.Mesh(geomGarfo, matPedra);
    garfo.position.set(15.7, yGarfo, z);
    garfo.rotation.y = Math.PI / 2;
    grupoCastelo.add(garfo);
  }

  // Garfos no muro central sobre a porta
  for (let x = -7; x <= 7; x += 1.5) {
    if (x >= -4.5 && x <= 4.5) {
      const garfo = new THREE.Mesh(geomGarfo, matPedra);
      garfo.position.set(x, yGarfo, 44.0);
      grupoCastelo.add(garfo);
    }
  }

  // Garfos na parte de trás das torres do portão
  for (let x = -15.2; x <= -4.8; x += 1.5) {
    const garfo = new THREE.Mesh(geomGarfo, matPedra);
    garfo.position.set(x, yGarfo, 33.3);
    grupoCastelo.add(garfo);
  }
  for (let x = 4.8; x <= 15.2; x += 1.5) {
    const garfo = new THREE.Mesh(geomGarfo, matPedra);
    garfo.position.set(x, yGarfo, 33.3);
    grupoCastelo.add(garfo);
  }
}

// Dentes no topo do parapeito das torres do portão e do muro central
function buildDentes(grupoCastelo, matPedra) {
  const geomDentePortao = new THREE.BoxGeometry(0.8, 1.2, 0.8);
  const yDente = 29.35;

  // Dentes na Torre Esquerda (Frente, Lateral Externa e Trás)
  for (let x = -15.2; x <= -4.8; x += 1.8) {
    const denteFrente = new THREE.Mesh(geomDentePortao, matPedra);
    denteFrente.position.set(x, yDente, 46.4);
    grupoCastelo.add(denteFrente);

    const denteTras = new THREE.Mesh(geomDentePortao, matPedra);
    denteTras.position.set(x, yDente, 33.6);
    grupoCastelo.add(denteTras);
  }
  for (let z = 34.0; z <= 45.0; z += 2.0) {
    const dente = new THREE.Mesh(geomDentePortao, matPedra);
    dente.position.set(-15.4, yDente, z);
    grupoCastelo.add(dente);
  }

  // Dentes na Torre Direita (Frente, Lateral Externa e Trás)
  for (let x = 4.8; x <= 15.2; x += 1.8) {
    const denteFrente = new THREE.Mesh(geomDentePortao, matPedra);
    denteFrente.position.set(x, yDente, 46.4);
    grupoCastelo.add(denteFrente);

    const denteTras = new THREE.Mesh(geomDentePortao, matPedra);
    denteTras.position.set(x, yDente, 33.6);
    grupoCastelo.add(denteTras);
  }
  for (let z = 34.0; z <= 45.0; z += 2.0) {
    const dente = new THREE.Mesh(geomDentePortao, matPedra);
    dente.position.set(15.4, yDente, z);
    grupoCastelo.add(dente);
  }

  // Dentes no Muro Central (Frente e Trás)
  for (let x = -4.5; x <= 4.5; x += 1.8) {
    const denteFrente = new THREE.Mesh(geomDentePortao, matPedra);
    denteFrente.position.set(x, yDente, 43.7);
    grupoCastelo.add(denteFrente);

    const denteTras = new THREE.Mesh(geomDentePortao, matPedra);
    denteTras.position.set(x, yDente, 32.3);
    grupoCastelo.add(denteTras);
  }
}

// Mini cilindro guarita decorativa sobre o muro central do portão
function buildMiniGuaritaPortao(grupoCastelo, matPedra) {
  const geomMiniTorre = new THREE.CylinderGeometry(1.6, 1.6, 5, 16);
  const geomDenteMiniTorre = new THREE.BoxGeometry(0.7, 0.6, 0.7);

  const posMiniGuaritas = [
    [-6, 33.0],
  ];

  posMiniGuaritas.forEach(pos => {
    const miniTorrePortao = new THREE.Mesh(geomMiniTorre, matPedra);
    miniTorrePortao.position.set(pos[0], 30, pos[1]);
    grupoCastelo.add(miniTorrePortao);

    // Dentes ao redor do topo do mini cilindro
    for (let j = 0; j < 5; j++) {
      const angGuarita = (j * 2 * Math.PI) / 5;
      const dente = new THREE.Mesh(geomDenteMiniTorre, matPedra);
      dente.position.x = pos[0] + (Math.cos(angGuarita) * 1.3);
      dente.position.z = pos[1] + (Math.sin(angGuarita) * 1.3);
      dente.position.y = 32.7;
      dente.rotation.y = -angGuarita;
      grupoCastelo.add(dente);
    }
  });
}