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
  grupoCastelo.add(chaoTerra);
  
  const chaoGramaEsq = new THREE.Mesh(new THREE.BoxGeometry(20, 0.15, 50), matGrama);
  chaoGramaEsq.position.set(-15, 0.08, 0);
  grupoCastelo.add(chaoGramaEsq);

  const chaoGramaDir = new THREE.Mesh(new THREE.BoxGeometry(20, 0.15, 50), matGrama);
  chaoGramaDir.position.set(15, 0.08, 0);
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
  muroFrenteEsq.position.set(-24, 10, 40);
  grupoCastelo.add(muroFrenteEsq);
  
  const geomMuroFrenteDir = new THREE.BoxGeometry(32, 20, 4);
  const muroFrenteDir = new THREE.Mesh(geomMuroFrenteDir, matPedra);
  muroFrenteDir.position.set(24, 10, 40);
  grupoCastelo.add(muroFrenteDir);
  
  // Portão Principal
  const geomPortaPrincipal = new THREE.BoxGeometry(16, 16, 2);
  const portaPrincipal = new THREE.Mesh(geomPortaPrincipal, matMadeira);
  portaPrincipal.position.set(0, 8, 40);
  grupoCastelo.add(portaPrincipal);
  
  const posMundoPortaPrincipal = new THREE.Vector3();
  
  portas.push({
    mesh: portaPrincipal,
    yFechado: 8,
    yAberto: 22,
    distGatilho: 35,
    update: function(camera) {
      this.mesh.getWorldPosition(posMundoPortaPrincipal);
      const dist = posMundoPortaPrincipal.distanceTo(camera.position);
      if (dist < this.distGatilho) {
        this.mesh.position.y = THREE.MathUtils.lerp(this.mesh.position.y, this.yAberto, 0.05);
      } else {
        this.mesh.position.y = THREE.MathUtils.lerp(this.mesh.position.y, this.yFechado, 0.05);
      }
    }
  });

  // Torres dos Cantos
  const geomTorre = new THREE.CylinderGeometry(6, 6, 30, 32);
  const posTorres = [
    [-40, 15, -40], [40, 15, -40], [-40, 15, 40], [40, 15, 40]
  ];
  posTorres.forEach(pos => {
    const torre = new THREE.Mesh(geomTorre, matPedra);
    torre.position.set(pos[0], pos[1], pos[2]);
    grupoCastelo.add(torre);
  });
  
  // Guaritas 
  const geomTorreCentro = new THREE.BoxGeometry(10, 28, 10);
  const torreCentroFundo = new THREE.Mesh(geomTorreCentro, matPedra);
  torreCentroFundo.position.set(0, 14, -40);
  grupoCastelo.add(torreCentroFundo);
  
  const torrePortaoEsq = new THREE.Mesh(geomTorreCentro, matPedra);
  torrePortaoEsq.position.set(-10, 14, 40);
  grupoCastelo.add(torrePortaoEsq);
  
  const torrePortaoDir = new THREE.Mesh(geomTorreCentro, matPedra);
  torrePortaoDir.position.set(10, 14, 40);
  grupoCastelo.add(torrePortaoDir);

  // Edificações Internas
  construirPredioInterno(grupoCastelo, -15, 0, matPedra, matMadeira, matTelhado, 1);
  construirPredioInterno(grupoCastelo, 15, -15, matPedra, matMadeira, matTelhado, -1);
  
  // Escadas
  construirEscadasMuro(grupoCastelo, matPedra);
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
  grupoPredio.add(telhado);
  
  // Escadas para o telhado
  for(let i=0; i<21; i++) {
    const alturaDegrau = (i+1) * 0.5; 
    const profundidade = 0.8;
    const degrau = new THREE.Mesh(new THREE.BoxGeometry(3.5, alturaDegrau, profundidade), matPedra);
    degrau.position.set(9.75, alturaDegrau/2, -8 + (i*profundidade));
    grupoPredio.add(degrau);
  }
  
  const posZ_Topo = 9.75; 
  const patamar = new THREE.Mesh(new THREE.BoxGeometry(3.5, 10.5, 3.5), matPedra);
  patamar.position.set(9.75, 10.5/2, posZ_Topo);
  grupoPredio.add(patamar);

  // Acesso lateral 
  for(let j=1; j<=5; j++) { 
    const altDegrau = 10.5 + (j * 0.4); 
    const largX = 1.0;
    const stepSide = new THREE.Mesh(new THREE.BoxGeometry(largX, altDegrau, 3.5), matPedra);
    stepSide.position.set(9.75 - 1.75 - (j * largX) + 0.5, altDegrau/2, posZ_Topo);
    grupoPredio.add(stepSide);
  }
  
  const dobradica = new THREE.Group();
  dobradica.position.set(-3.5, 6, 7);
  const geomPorta = new THREE.BoxGeometry(7, 12, 1);
  const porta = new THREE.Mesh(geomPorta, matMadeira);
  porta.position.set(3.5, 0, 0); 
  dobradica.add(porta);
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
    update: function(camera) {
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
  for(let i=0; i<40; i++) {
    const alturaDegrau = (i+1) * 0.5; 
    const degrau = new THREE.Mesh(new THREE.BoxGeometry(6, alturaDegrau, profundidade), matPedra);
    degrau.position.set(-33, alturaDegrau/2, 20 - (i * profundidade));
    grupoEscada.add(degrau);
  }
  const profPonte = 26.4;
  const posZ_Ponte = -11.6 - (profPonte / 2); 
  const ponteAcesso = new THREE.BoxGeometry(6, 1, profPonte);
  const ponte = new THREE.Mesh(ponteAcesso, matPedra);

  ponte.position.set(-33, 19.5, posZ_Ponte); 
  grupoEscada.add(ponte);
  
  grupo.add(grupoEscada);
}

// Exportar a atualização das portas
export function updateDoors(camera) {
  for (let i = 0; i < portas.length; i++) {
    portas[i].update(camera);
  }
}