import * as THREE from "three";

export function buildCornerTowers(grupoCastelo, matPedra) {
  const raioTorre = 6;
  const altTorre = 30;

  const geomTorreBase = new THREE.CylinderGeometry(
    raioTorre,
    raioTorre,
    altTorre,
    32,
  );
  const geomDeckHex = new THREE.CylinderGeometry(3.8, 3.8, 0.6, 6);

  // Parapeito Circular
  const shapeAnel = new THREE.Shape();
  shapeAnel.absarc(0, 0, raioTorre, 0, Math.PI * 2, false);

  const buracoAnel = new THREE.Path();
  buracoAnel.absarc(0, 0, raioTorre - 0.8, 0, Math.PI * 2, true);
  shapeAnel.holes.push(buracoAnel);

  const extrudeSettings = {
    depth: 2.5,
    bevelEnabled: false,
    curveSegments: 32,
  };
  const geomParapeito = new THREE.ExtrudeGeometry(shapeAnel, extrudeSettings);

  // Dentes na muralha
  const numDentes = 12;
  const geomDente = new THREE.BoxGeometry(0.75, 1.2, 1.4);

  // Mini torre pequena
  const geomMiniTorre = new THREE.CylinderGeometry(1.6, 1.6, 5, 16);
  const geomDenteMiniTorre = new THREE.BoxGeometry(0.7, 0.6, 0.7);

  const posTorres = [
    [-40, 15, -40],
    [40, 15, -40],
    [-40, 15, 40],
    [40, 15, 40],
  ];

  posTorres.forEach((pos) => {
    const grupoTorre = new THREE.Group();
    grupoTorre.position.set(pos[0], pos[1], pos[2]);

    const torreBase = new THREE.Mesh(geomTorreBase, matPedra);
    grupoTorre.add(torreBase);

    // Parapeito Circular
    const parapeito = new THREE.Mesh(geomParapeito, matPedra);
    // ExtrudeGeometry é gerado no plano XY, então rotaciona para o plano XZ
    parapeito.rotation.x = -Math.PI / 2;
    parapeito.position.set(0, altTorre / 2, 0);
    grupoTorre.add(parapeito);

    // Distribui os dentes ao redor do parapeito
    for (let i = 0; i < numDentes; i++) {
      // Mini torre lateral
      if (i === 0) continue;

      const angulo = (i * 2 * Math.PI) / numDentes;
      const raioDente = raioTorre - 0.4;
      const dente = new THREE.Mesh(geomDente, matPedra);

      dente.position.x = Math.cos(angulo) * raioDente;
      dente.position.z = Math.sin(angulo) * raioDente;
      // Posição Y do dente: metade da torre + altura do parapeito + metade do dente
      dente.position.y = altTorre / 2 + 2.5 + 0.6;

      dente.rotation.y = -angulo;
      grupoTorre.add(dente);
    }

    // Adiciona Mini Torre lateral
    const miniTorre = new THREE.Mesh(geomMiniTorre, matPedra);
    const raioMiniTorre = raioTorre - 0.4;
    miniTorre.position.set(raioMiniTorre, altTorre / 2 + 2.5, 0);
    grupoTorre.add(miniTorre);

    // Pequenos dentes para a Mini Torre lateral
    for (let j = 0; j < 5; j++) {
      const angGuarita = (j * 2 * Math.PI) / 5;
      const dente = new THREE.Mesh(geomDenteMiniTorre, matPedra);
      // Posição local em relação ao centro da torre, deslocado para a guarita
      dente.position.x = raioMiniTorre + Math.cos(angGuarita) * 1.3;
      dente.position.z = Math.sin(angGuarita) * 1.3;
      dente.position.y = altTorre / 2 + 1.5 + 2.5 + 1.2;

      dente.rotation.y = -angGuarita;
      grupoTorre.add(dente);
    }

    grupoCastelo.add(grupoTorre);
  });
}
