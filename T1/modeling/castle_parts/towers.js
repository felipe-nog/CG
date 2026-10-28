import * as THREE from "three";
import { CSG } from "../../libs/other/CSGMesh.js";


export function buildCornerTowers(grupoCastelo, matPedra) {
  const raioTorre = 6.0;
  const raioInterno = 4.9;
  const altTorre = 30.0;
  const yAndar = 20.05;
  const yDeck = 26.5;
  const auxMat = new THREE.Matrix4();

  function createSlitCutter(largura = 0.9, alturaRet = 2.2, profundidade = 4.0) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(largura, alturaRet, profundidade));
    box.position.set(0, alturaRet / 2, 0);
    box.updateMatrix();

    const raioArco = largura / 2;
    const arco = new THREE.Mesh(new THREE.CylinderGeometry(raioArco, raioArco, profundidade, 16));
    arco.rotation.x = Math.PI / 2;
    arco.position.set(0, alturaRet, 0);
    arco.updateMatrix();

    return CSG.fromMesh(box).union(CSG.fromMesh(arco));
  }

  function createDoorCutter(largura = 2.6, alturaRet = 3.4, profundidade = 4.5) {
    const box = new THREE.Mesh(new THREE.BoxGeometry(largura, alturaRet, profundidade));
    box.position.set(0, alturaRet / 2, 0);
    box.updateMatrix();

    const raioArco = largura / 2;
    const arco = new THREE.Mesh(new THREE.CylinderGeometry(raioArco, raioArco, profundidade, 16));
    arco.rotation.x = Math.PI / 2;
    arco.position.set(0, alturaRet, 0);
    arco.updateMatrix();

    return CSG.fromMesh(box).union(CSG.fromMesh(arco));
  }

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

  const numDentes = 12;
  const geomDente = new THREE.BoxGeometry(0.75, 1.2, 1.4);

  const geomMiniTorre = new THREE.CylinderGeometry(1.6, 1.6, 5, 16);
  const geomDenteMiniTorre = new THREE.BoxGeometry(0.7, 0.6, 0.7);
  const posTorres = [
    {
      x: -40,
      z: -40,
      doorAng: Math.PI / 4,
      stairX: 1.8,
      zStart: 2.8,
      zEnd: -2.8,
      slitAngs: [-Math.PI / 2, -3 * Math.PI / 4, Math.PI],
    },
    {
      x: 40,
      z: -40,
      doorAng: (3 * Math.PI) / 4,
      stairX: -1.8,
      zStart: 2.8,
      zEnd: -2.8,
      slitAngs: [-Math.PI / 2, -Math.PI / 4, 0],
    },
    {
      x: 40,
      z: 40,
      doorAng: (5 * Math.PI) / 4,
      stairX: -1.8,
      zStart: -2.8,
      zEnd: 2.8,
      slitAngs: [0, Math.PI / 4, Math.PI / 2],
    },
    {
      x: -40,
      z: 40,
      doorAng: (7 * Math.PI) / 4,
      stairX: 1.8,
      zStart: -2.8,
      zEnd: 2.8,
      slitAngs: [Math.PI / 2, (3 * Math.PI) / 4, Math.PI],
    },
  ];

  posTorres.forEach((torre) => {
    const grupoTorre = new THREE.Group();
    grupoTorre.position.set(torre.x, 0, torre.z);

    // 1. Cilindro Externo contínuo de altura 30 (y = 0 a 30)
    const geomOuter = new THREE.CylinderGeometry(raioTorre, raioTorre, altTorre, 24);
    const outerMesh = new THREE.Mesh(geomOuter);
    outerMesh.position.set(0, altTorre / 2, 0);
    outerMesh.updateMatrix();

    // 2. Cavidade Interna escavada via CSG na parte superior (y = 20 a 30.5)
    const altCavidade = altTorre - yAndar + 0.5;
    const geomInner = new THREE.CylinderGeometry(raioInterno, raioInterno, altCavidade, 24);
    const innerMesh = new THREE.Mesh(geomInner);
    innerMesh.position.set(0, yAndar + altCavidade / 2, 0);
    innerMesh.updateMatrix();

    let csgTorre = CSG.fromMesh(outerMesh).subtract(CSG.fromMesh(innerMesh));

    // 3. Porta em arco recortada na altura da passarela (y = 20.05) voltada para o caminho de ronda
    const doorCutter = createDoorCutter(2.6, 3.4, 4.5);
    const doorMesh = CSG.toMesh(doorCutter, auxMat);
    doorMesh.position.set(
      Math.cos(torre.doorAng) * 5.0,
      yAndar,
      Math.sin(torre.doorAng) * 5.0,
    );
    doorMesh.rotation.y = -torre.doorAng + Math.PI / 2;
    doorMesh.updateMatrix();
    csgTorre = csgTorre.subtract(CSG.fromMesh(doorMesh));

    // 4. Seteiras CSG (base reta + topo curvo) voltadas para o lado externo no nível do deck
    torre.slitAngs.forEach((ang) => {
      const slitCutter = createSlitCutter(0.9, 2.2, 4.0);
      const slitMesh = CSG.toMesh(slitCutter, auxMat);
      slitMesh.position.set(
        Math.cos(ang) * 5.2,
        yDeck + 0.6,
        Math.sin(ang) * 5.2,
      );
      slitMesh.rotation.y = -ang + Math.PI / 2;
      slitMesh.updateMatrix();
      csgTorre = csgTorre.subtract(CSG.fromMesh(slitMesh));
    });

    // Malha visual CSG da torre completa
    const meshTorre = CSG.toMesh(csgTorre, auxMat, matPedra);
    meshTorre.castShadow = true;
    meshTorre.receiveShadow = true;
    meshTorre.userData.collisionType = "none";
    grupoTorre.add(meshTorre);

    // 5. Colisor da Base sólida (y = 0 a 20): impede atravessar a torre no chão do pátio
    const baseCollider = new THREE.Mesh(
      new THREE.CylinderGeometry(raioTorre - 0.1, raioTorre - 0.1, yAndar, 16),
    );
    baseCollider.position.set(0, yAndar / 2, 0);
    baseCollider.visible = false;
    grupoTorre.add(baseCollider);

    // 6. Piso transitável da câmara interna da torre (y = 20.05)
    const pisoTorre = new THREE.Mesh(
      new THREE.CylinderGeometry(raioInterno - 0.05, raioInterno - 0.05, 0.2, 24),
      matPedra,
    );
    pisoTorre.position.set(0, yAndar, 0);
    pisoTorre.userData.collisionType = "walkable";
    grupoTorre.add(pisoTorre);

    // 7. Escadaria reta alinhada ao eixo Z ligando o piso da passarela (y = 20.05) ao deck superior (y = 26.5)
    const numDegraus = 12;
    const deltaZ = torre.zEnd - torre.zStart;
    const deltaY = yDeck - yAndar;
    const compDegrau = Math.abs(deltaZ) / numDegraus;

    for (let i = 0; i < numDegraus; i++) {
      const frac = (i + 1) / numDegraus;
      const zStep = torre.zStart + (i + 0.5) * (deltaZ / numDegraus);
      const stepH = yAndar + frac * deltaY;

      const degrau = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, stepH - yAndar, compDegrau * 0.98),
        matPedra,
      );
      degrau.position.set(torre.stairX, yAndar + (stepH - yAndar) / 2, zStep);
      degrau.userData.collisionType = "none";
      grupoTorre.add(degrau);
    }

    // Rampa suave de colisão estritamente alinhada ao eixo Z para subida e descida 100% fluidas
    const rampa = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.1, Math.abs(deltaZ)),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    rampa.position.set(torre.stairX, (yAndar + yDeck) / 2, (torre.zStart + torre.zEnd) / 2);
    rampa.userData.collisionType = "ramp";
    rampa.userData.ramp = {
      bottom: new THREE.Vector3(torre.stairX, yAndar, torre.zStart),
      top: new THREE.Vector3(torre.stairX, yDeck, torre.zEnd),
    };
    grupoTorre.add(rampa);

    // 8. Deck superior de observação transitável (y = 26.5)
    const deckTopo = new THREE.Mesh(
      new THREE.CylinderGeometry(raioInterno - 0.05, raioInterno - 0.05, 0.3, 24),
      matPedra,
    );
    deckTopo.position.set(0, yDeck, 0);
    deckTopo.userData.collisionType = "walkable";
    grupoTorre.add(deckTopo);

    // 9. Parapeito Circular no topo (y = 30)
    const parapeito = new THREE.Mesh(geomParapeito, matPedra);
    parapeito.rotation.x = -Math.PI / 2;
    parapeito.position.set(0, altTorre, 0);
    parapeito.userData.collisionType = "none";
    grupoTorre.add(parapeito);

    // Dentes / ameias ao redor do parapeito
    for (let i = 0; i < numDentes; i++) {
      if (i === 0) continue;

      const angulo = (i * 2 * Math.PI) / numDentes;
      const raioDente = raioTorre - 0.4;
      const dente = new THREE.Mesh(geomDente, matPedra);

      dente.position.x = Math.cos(angulo) * raioDente;
      dente.position.z = Math.sin(angulo) * raioDente;
      dente.position.y = altTorre + 2.5 + 0.6;
      dente.rotation.y = -angulo;
      dente.userData.collisionType = "none";
      grupoTorre.add(dente);
    }

    // Mini Torre lateral de vigia
    const miniTorre = new THREE.Mesh(geomMiniTorre, matPedra);
    const raioMiniTorre = raioTorre - 0.4;
    miniTorre.position.set(raioMiniTorre, altTorre + 2.5, 0);
    miniTorre.userData.collisionType = "none";
    grupoTorre.add(miniTorre);

    for (let j = 0; j < 5; j++) {
      const angGuarita = (j * 2 * Math.PI) / 5;
      const dente = new THREE.Mesh(geomDenteMiniTorre, matPedra);
      dente.position.x = raioMiniTorre + Math.cos(angGuarita) * 1.3;
      dente.position.z = Math.sin(angGuarita) * 1.3;
      dente.position.y = altTorre + 1.5 + 2.5 + 1.2;
      dente.rotation.y = -angGuarita;
      dente.userData.collisionType = "none";
      grupoTorre.add(dente);
    }

    // 10. Paredes de proteção perimetral do deck superior (y = 26.5 a 30) para evitar queda no vazio
    for (let k = 0; k < 8; k++) {
      const angP = (k * 2 * Math.PI) / 8;
      // Não bloqueia a entrada da porta no ângulo da passarela
      const diffAng = Math.abs(angP - torre.doorAng);
      if (diffAng < 0.45 || Math.abs(diffAng - Math.PI * 2) < 0.45) continue;

      const colisorBorda = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 3.5, 0.4),
      );
      colisorBorda.position.set(
        Math.cos(angP) * 5.1,
        yDeck + 1.75,
        Math.sin(angP) * 5.1,
      );
      colisorBorda.rotation.y = -angP + Math.PI / 2;
      colisorBorda.visible = false;
      grupoTorre.add(colisorBorda);
    }

    grupoCastelo.add(grupoTorre);
  });
}
