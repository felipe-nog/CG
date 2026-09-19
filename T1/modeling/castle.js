import * as THREE from "three";
import { setDefaultMaterial } from "../libs/util/util.js";

const portas = [];

export function buildCastle(scene) {
  const matPedra = setDefaultMaterial("rgb(180, 175, 160)");
  const matMadeira = setDefaultMaterial("rgb(70, 40, 20)");
  const matTelhado = setDefaultMaterial("rgb(110, 110, 105)");
  const matGrama = setDefaultMaterial("rgb(85, 140, 50)");
  const matTerra = setDefaultMaterial("rgb(150, 130, 100)");

  const grupoCastelo = new THREE.Group();
  grupoCastelo.scale.set(1.5, 1.5, 1.5);
  scene.add(grupoCastelo);

  const chaoTerra = new THREE.Mesh(new THREE.BoxGeometry(76, 0.1, 80), matTerra);
  chaoTerra.position.set(0, 0.05, 0);
  chaoTerra.userData.collisionType = "walkable";
  grupoCastelo.add(chaoTerra);

  const chaoGramaEsq = new THREE.Mesh(new THREE.BoxGeometry(20, 0.15, 50), matGrama);
  chaoGramaEsq.position.set(-15, 0.08, 0);
  chaoGramaEsq.userData.collisionType = "walkable";
  grupoCastelo.add(chaoGramaEsq);

  const chaoGramaDir = new THREE.Mesh(new THREE.BoxGeometry(20, 0.15, 50), matGrama);
  chaoGramaDir.position.set(15, 0.08, 0);
  chaoGramaDir.userData.collisionType = "walkable";
  grupoCastelo.add(chaoGramaDir);

  // Muralhas Externas
  const geomMuroHoriz = new THREE.BoxGeometry(80, 20, 4);
  const geomMuroVert = new THREE.BoxGeometry(4, 20, 76);

  const muroFundo = new THREE.Mesh(geomMuroHoriz, matPedra);
  muroFundo.position.set(0, 10, -40);
  grupoCastelo.add(muroFundo);

  const muroEsq = new THREE.Mesh(geomMuroVert, matPedra);
  muroEsq.position.set(-38, 10, 0);
  grupoCastelo.add(muroEsq);

  const muroDir = new THREE.Mesh(geomMuroVert, matPedra);
  muroDir.position.set(38, 10, 0);
  grupoCastelo.add(muroDir);

  const geomMuroFrenteEsq = new THREE.BoxGeometry(32, 20, 4);

  const muroFrenteEsq = new THREE.Mesh(geomMuroFrenteEsq, matPedra);
  muroFrenteEsq.position.set(-30, 10, 40);
  grupoCastelo.add(muroFrenteEsq);

  const geomMuroFrenteDir = new THREE.BoxGeometry(32, 20, 4);
  const muroFrenteDir = new THREE.Mesh(geomMuroFrenteDir, matPedra);
  muroFrenteDir.position.set(30, 10, 40);
  grupoCastelo.add(muroFrenteDir);

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

  // Portão Principal
  const geomPortaPrincipal = new THREE.BoxGeometry(16, 16, 2);
  const portaPrincipal = new THREE.Mesh(geomPortaPrincipal, matMadeira);
  portaPrincipal.position.set(0, 8, 40);
  grupoCastelo.add(portaPrincipal);

  const topoPortaPrincipal = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.1, 2),
    matMadeira,
  );
  topoPortaPrincipal.position.set(0, 16.05, 40);
  topoPortaPrincipal.userData.collisionType = "walkable";
  grupoCastelo.add(topoPortaPrincipal);

  const posMundoPortaPrincipal = new THREE.Vector3();

  portas.push({
    mesh: portaPrincipal,
    yFechado: 8,
    yAberto: 22,
    distGatilho: 35,
    update: function (camera) {
      this.mesh.getWorldPosition(posMundoPortaPrincipal);
      const dist = posMundoPortaPrincipal.distanceTo(camera.position);
      if (dist < this.distGatilho) {
        this.mesh.position.y = THREE.MathUtils.lerp(this.mesh.position.y, this.yAberto, 0.05);
      } else {
        this.mesh.position.y = THREE.MathUtils.lerp(this.mesh.position.y, this.yFechado, 0.05);
      }
    }
  });

  // ==========================================
  // Torres dos Cantos
  // ==========================================

  const raioTorre = 6;
  const altTorre = 30;
  const geomTorreBase = new THREE.CylinderGeometry(raioTorre, raioTorre, altTorre, 32);

  // Torres dos cantos
  const geomDeckHex = new THREE.CylinderGeometry(3.8, 3.8, 0.6, 6);

  // Parapeito Circular
  const shapeAnel = new THREE.Shape();
  shapeAnel.absarc(0, 0, raioTorre, 0, Math.PI * 2, false);

  const buracoAnel = new THREE.Path();
  buracoAnel.absarc(0, 0, raioTorre - 0.8, 0, Math.PI * 2, true);
  shapeAnel.holes.push(buracoAnel);

  const extrudeSettings = { depth: 2.5, bevelEnabled: false, curveSegments: 32 };
  const geomParapeito = new THREE.ExtrudeGeometry(shapeAnel, extrudeSettings);

  // Dentes na muralha
  const numDentes = 12;
  const geomDente = new THREE.BoxGeometry(0.75, 1.2, 1.4);

  // Mini torre pequena
  const geomMiniTorre = new THREE.CylinderGeometry(1.6, 1.6, 5, 16);
  const geomDenteMiniTorre = new THREE.BoxGeometry(0.7, 0.6, 0.7);

  const posTorres = [
    [-40, 15, -40], [40, 15, -40], [-40, 15, 40], [40, 15, 40]
  ];

  posTorres.forEach(pos => {
    const grupoTorre = new THREE.Group();
    grupoTorre.position.set(pos[0], pos[1], pos[2]);

    const torreBase = new THREE.Mesh(geomTorreBase, matPedra);
    grupoTorre.add(torreBase);

    // Parapeito Circular
    const parapeito = new THREE.Mesh(geomParapeito, matPedra);
    // ExtrudeGeometry é gerado no plano XY, então rotaciona para o plano XZ
    parapeito.rotation.x = -Math.PI / 2;
    parapeito.position.set(0, (altTorre / 2), 0);
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
      dente.position.y = (altTorre / 2) + 2.5 + 0.6;

      dente.rotation.y = -angulo;
      grupoTorre.add(dente);
    }

    // Adiciona Mini Torre lateral
    const miniTorre = new THREE.Mesh(geomMiniTorre, matPedra);
    const raioMiniTorre = raioTorre - 0.4;
    miniTorre.position.set(raioMiniTorre, (altTorre / 2) + 2.5, 0);
    grupoTorre.add(miniTorre);

    // Pequenos dentes para a Mini Torre lateral
    for (let j = 0; j < 5; j++) {
      const angGuarita = (j * 2 * Math.PI) / 5;
      const dente = new THREE.Mesh(geomDenteMiniTorre, matPedra);
      // Posição local em relação ao centro da torre, deslocado para a guarita
      dente.position.x = raioMiniTorre + (Math.cos(angGuarita) * 1.3);
      dente.position.z = Math.sin(angGuarita) * 1.3;
      dente.position.y = (altTorre / 2) + 1.5 + 2.5 + 1.2;

      dente.rotation.y = -angGuarita;
      grupoTorre.add(dente);
    }

    grupoCastelo.add(grupoTorre);
  });

  // Guaritas
  const geomTorreCentro = new THREE.BoxGeometry(10, 28, 12);

  const torreCentroFundo = new THREE.Mesh(geomTorreCentro, matPedra);
  torreCentroFundo.position.set(0, 14, -40);
  grupoCastelo.add(torreCentroFundo);

  const torrePortaoEsq = new THREE.Mesh(geomTorreCentro, matPedra);
  torrePortaoEsq.position.set(-10, 14, 40);
  grupoCastelo.add(torrePortaoEsq);

  const torrePortaoDir = new THREE.Mesh(geomTorreCentro, matPedra);
  torrePortaoDir.position.set(10, 14, 40);
  grupoCastelo.add(torrePortaoDir);

  // Detalhes da Portaria 

  // Parapeitos no topo das torres centrais e muro sobre a porta
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

  // Garfos 
  const geomGarfo = new THREE.BoxGeometry(0.5, 1.4, 0.6);
  const yGarfo = 26.8;

  // Garfos na Torre Esquerda do Portão (Frente e Laterais)
  for (let x = -15.2; x <= -4.8; x += 1.5) {
    const garfo = new THREE.Mesh(geomGarfo, matPedra);
    garfo.position.set(x, yGarfo, 46.7);
    grupoCastelo.add(garfo);
  }
  // Face lateral externa (X = -15.7)
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

  // Garfos na parte de trás das torres do portão (Z traseiro ~ 33.3)
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

  // Dentes no topo do parapeito
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

  // Mini Cilindros Guaritas nas torres da portaria
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

  // Edificações Internas
  construirPredioInterno(grupoCastelo, -15, 0, matPedra, matMadeira, matTelhado, 1);
  construirPredioInterno(grupoCastelo, 15, -15, matPedra, matMadeira, matTelhado, -1);

  // Escadas
  construirEscadasMuro(grupoCastelo, matPedra);

  return grupoCastelo;
}

function construirPredioInterno(grupo, offsetX, offsetZ, matPedra, matMadeira, matTelhado, direcaoPorta) {
  const grupoPredio = new THREE.Group();

  const fundo = new THREE.Mesh(new THREE.BoxGeometry(16, 17, 2), matPedra);
  fundo.position.set(0, 9, -7);
  grupoPredio.add(fundo);

  const geomLado = new THREE.BoxGeometry(2, 17, 16);
  const esq = new THREE.Mesh(geomLado, matPedra);
  esq.position.set(-7, 9, 0);
  grupoPredio.add(esq);
  const dir = new THREE.Mesh(geomLado, matPedra);
  dir.position.set(7, 9, 0);
  grupoPredio.add(dir);

  const geomFrente = new THREE.BoxGeometry(4.5, 12, 2);
  const frenteEsq = new THREE.Mesh(geomFrente, matPedra);
  frenteEsq.position.set(-5.75, 6, 7);
  grupoPredio.add(frenteEsq);
  const frenteDir = new THREE.Mesh(geomFrente, matPedra);
  frenteDir.position.set(5.75, 6, 7);
  grupoPredio.add(frenteDir);

  const telhado = new THREE.Mesh(new THREE.BoxGeometry(12, 1, 16), matTelhado);
  telhado.position.set(0, 12.5, 0);
  telhado.userData.collisionType = "walkable";
  telhado.userData.isRoof = true;
  grupoPredio.add(telhado);

  // Escadas para o telhado
  const quantidadeDegrausPredio = 26;
  const profundidadeDegrauPredio = 0.65;
  const zTopoEscadaPredio = 8.25;
  const zBaseEscadaPredio = zTopoEscadaPredio +
    (quantidadeDegrausPredio - 1) * profundidadeDegrauPredio;

  for (let i = 0; i < quantidadeDegrausPredio; i++) {
    const alturaDegrau = (i + 1) * 0.5;
    const degrau = new THREE.Mesh(
      new THREE.BoxGeometry(2, alturaDegrau, profundidadeDegrauPredio),
      matPedra,
    );
    degrau.position.set(
      5,
      alturaDegrau / 2,
      zBaseEscadaPredio - (i * profundidadeDegrauPredio),
    );
    degrau.userData.collisionType = "walkable";
    degrau.userData.isStairStep = true;
    grupoPredio.add(degrau);
  }

  const rampaPredio = new THREE.Mesh(
    new THREE.BoxGeometry(
      2,
      0.1,
      zBaseEscadaPredio - zTopoEscadaPredio + profundidadeDegrauPredio,
    ),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  rampaPredio.position.set(
    5,
    0.25,
    (zBaseEscadaPredio + zTopoEscadaPredio) / 2,
  );
  rampaPredio.userData.collisionType = "ramp";
  rampaPredio.userData.ramp = {
    bottom: new THREE.Vector3(0, 0.5, zBaseEscadaPredio + profundidadeDegrauPredio / 2),
    top: new THREE.Vector3(0, quantidadeDegrausPredio * 0.5, zTopoEscadaPredio),
  };
  grupoPredio.add(rampaPredio);

  const dobradica = new THREE.Group();
  dobradica.position.set(-3.5, 6, 7);
  const geomPorta = new THREE.BoxGeometry(7, 12, 1);
  const porta = new THREE.Mesh(geomPorta, matMadeira);
  porta.position.set(3.5, 0, 0);
  dobradica.add(porta);

  const topoPorta = new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.1, 1),
    matMadeira,
  );
  topoPorta.position.set(3.5, 6.05, 0);
  topoPorta.userData.collisionType = "walkable";
  dobradica.add(topoPorta);
  grupoPredio.add(dobradica);

  grupoPredio.position.set(offsetX, 0, offsetZ);
  grupoPredio.scale.set(0.8, 0.8, 0.8);
  grupo.add(grupoPredio);

  const posMundoDobradica = new THREE.Vector3();
  const anguloAberto = direcaoPorta > 0 ? -Math.PI / 2 : Math.PI / 2;

  portas.push({
    hinge: dobradica,
    rotFechada: 0,
    rotAberta: anguloAberto,
    distGatilho: 15,
    update: function (camera) {
      this.hinge.getWorldPosition(posMundoDobradica);
      const dist = posMundoDobradica.distanceTo(camera.position);
      if (dist < this.distGatilho) {
        this.hinge.rotation.y = THREE.MathUtils.lerp(this.hinge.rotation.y, this.rotAberta, 0.05);
      } else {
        this.hinge.rotation.y = THREE.MathUtils.lerp(this.hinge.rotation.y, this.rotFechada, 0.05);
      }
    }
  });
}

function construirEscadasMuro(grupo, matPedra) {
  const grupoEscada = new THREE.Group();

  const profundidade = 0.8;
  for (let i = 0; i < 40; i++) {
    const alturaDegrau = (i + 1) * 0.5;
    const degrau = new THREE.Mesh(new THREE.BoxGeometry(6, alturaDegrau, profundidade), matPedra);
    degrau.position.set(-33, alturaDegrau / 2, 20 - (i * profundidade));
    degrau.userData.collisionType = "walkable";
    degrau.userData.isStairStep = true;

    grupoEscada.add(degrau);
  }

  const rampaMuro = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.1, 32),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  rampaMuro.position.set(-33, 0.25, 4.4);
  rampaMuro.userData.collisionType = "ramp";
  rampaMuro.userData.ramp = {
    bottom: new THREE.Vector3(-33, 0.5, 20),
    top: new THREE.Vector3(-33, 20, -11.2),
  };
  grupoEscada.add(rampaMuro);
  const profPonte = 26.4;
  const posZ_Ponte = -11.6 - (profPonte / 2);
  const ponteAcesso = new THREE.BoxGeometry(6, 1, profPonte);
  const ponte = new THREE.Mesh(ponteAcesso, matPedra);

  ponte.position.set(-33, 19.5, posZ_Ponte);
  ponte.userData.collisionType = "walkable";
  grupoEscada.add(ponte);

  grupo.add(grupoEscada);
}

// Exportar a atualização das portas
export function updateDoors(camera) {
  for (let i = 0; i < portas.length; i++) {
    portas[i].update(camera);
  }
}