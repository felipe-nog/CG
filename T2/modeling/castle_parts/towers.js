import * as THREE from "three";
import { CSG } from "../../libs/other/CSGMesh.js";


export function buildCornerTowers(grupoCastelo, matPedra) {
  const raioTorre = 6.0;
  const raioInterno = 4.9;
  const altTorre = 30.0;
  const yAndar = 20.05;
  const yDeck = 26.5;
  const auxMat = new THREE.Matrix4();
  const matInvisivel = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

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

  function createDoorCutter(largura = 2.6, alturaRet = 3.4, profundidade = 6.0) {
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

    // Cilindro Externo contínuo de altura 30
    const geomOuter = new THREE.CylinderGeometry(raioTorre, raioTorre, altTorre, 24);
    const outerMesh = new THREE.Mesh(geomOuter);
    outerMesh.position.set(0, altTorre / 2, 0);
    outerMesh.updateMatrix();

    // Cavidade Interna escavada via CSG na parte superior
    const altCavidade = altTorre - yAndar + 0.5;
    const geomInner = new THREE.CylinderGeometry(raioInterno, raioInterno, altCavidade, 24);
    const innerMesh = new THREE.Mesh(geomInner);
    innerMesh.position.set(0, yAndar + altCavidade / 2, 0);
    innerMesh.updateMatrix();

    let csgTorre = CSG.fromMesh(outerMesh).subtract(CSG.fromMesh(innerMesh));

    // Porta em arco recortada na altura da passarela voltada para o caminho de ronda
    const doorCutter = createDoorCutter(2.6, 3.4, 6.0);
    const doorMesh = CSG.toMesh(doorCutter, auxMat);
    doorMesh.position.set(
      Math.cos(torre.doorAng) * 5.0,
      yAndar + 0.05,
      Math.sin(torre.doorAng) * 5.0,
    );
    doorMesh.rotation.y = -torre.doorAng + Math.PI / 2;
    doorMesh.updateMatrix();
    csgTorre = csgTorre.subtract(CSG.fromMesh(doorMesh));

    // Seteiras CSG
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

    // 5. Colisor da Base sólida (y = 0 a 18.0): impede atravessar a torre no chão do pátio
    // Termina em y = 18.0 para nunca colidir com o jogador andando na passarela (y = 20.05)
    const altBaseColisor = 18.0;
    const baseCollider = new THREE.Mesh(
      new THREE.CylinderGeometry(raioTorre - 0.1, raioTorre - 0.1, altBaseColisor, 16),
      matInvisivel,
    );
    baseCollider.position.set(0, altBaseColisor / 2, 0);
    grupoTorre.add(baseCollider);

    // 6. Piso transitável da câmara interna da torre (y = 20.05, topo em 20.10)
    const pisoTorre = new THREE.Mesh(
      new THREE.CylinderGeometry(raioInterno - 0.02, raioInterno - 0.02, 0.1, 24),
      matPedra,
    );
    pisoTorre.position.set(0, yAndar, 0);
    pisoTorre.castShadow = true;
    pisoTorre.receiveShadow = true;
    pisoTorre.userData.collisionType = "walkable";
    grupoTorre.add(pisoTorre);

    // Soleira transitável que atravessa o vão da porta (r = 4.7 a 6.9)
    // Garante chão sólido contínuo de pedra sob o arco da porta, eliminando qualquer vão/buraco
    const soleiraPorta = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.1, 2.2),
      matPedra,
    );
    soleiraPorta.position.set(
      Math.cos(torre.doorAng) * 5.8,
      yAndar,
      Math.sin(torre.doorAng) * 5.8,
    );
    soleiraPorta.rotation.y = -torre.doorAng + Math.PI / 2;
    soleiraPorta.castShadow = true;
    soleiraPorta.receiveShadow = true;
    soleiraPorta.userData.collisionType = "walkable";
    grupoTorre.add(soleiraPorta);



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

    // 10. Colisores das paredes perimetrais da torre (y = 20 a 32.5)
    // Impede o jogador de atravessar as paredes tanto no nível do piso quanto no deck
    const numSegs = 24;
    const rMid = 5.5;
    const segW = ((2 * Math.PI * rMid) / numSegs) * 1.05;
    const segT = 0.6;
    const hColisor = 12.5;

    for (let k = 0; k < numSegs; k++) {
      const ang = (k * 2 * Math.PI) / numSegs;
      let diffAng = Math.abs(ang - torre.doorAng) % (Math.PI * 2);
      if (diffAng > Math.PI) diffAng = 2 * Math.PI - diffAng;
      // Não bloqueia a passagem da porta
      if (diffAng < 0.35) continue;

      const colisorParede = new THREE.Mesh(
        new THREE.BoxGeometry(segW, hColisor, segT),
        matInvisivel,
      );
      colisorParede.position.set(
        Math.cos(ang) * rMid,
        yAndar + hColisor / 2,
        Math.sin(ang) * rMid,
      );
      colisorParede.rotation.y = -ang + Math.PI / 2;
      grupoTorre.add(colisorParede);
    }

    grupoCastelo.add(grupoTorre);
  });
}
