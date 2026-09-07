import * as THREE from "three";
import {
  initRenderer,
  initCamera,
  initDefaultBasicLight,
  setDefaultMaterial,
  onWindowResize,
  createGroundPlaneXZ,
} from "./libs/util/util.js";

import { setupFPSCamera } from "./controls/cameraControls.js";
import {
  setupMovementControls,
  updateMovement,
} from "./controls/movementControls.js";
import { OrbitControls } from "./build/jsm/controls/OrbitControls.js";

let scene, renderer, camera, material, light, fpsControls, orbitControls;

scene = new THREE.Scene();
renderer = initRenderer();
material = setDefaultMaterial();
light = initDefaultBasicLight(scene);

camera = initCamera(new THREE.Vector3(0, 2, 10));
fpsControls = setupFPSCamera(camera, renderer.domElement);
orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enabled = false;

const clock = new THREE.Clock();

const cameraSavedPosition = new THREE.Vector3();
const cameraSavedQuaternion = new THREE.Quaternion();
let isOrbital = false;

window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "c") {
    isOrbital = !isOrbital;

    if (isOrbital) {
      fpsControls.unlock();

      cameraSavedPosition.copy(camera.position);
      cameraSavedQuaternion.copy(camera.quaternion);

      orbitControls.enabled = true;

      camera.position.set(0, 40, 40);

      orbitControls.target.set(0, 0, 0);
      orbitControls.update();
    } else {
      orbitControls.enabled = false;

      camera.position.copy(cameraSavedPosition);
      camera.quaternion.copy(cameraSavedQuaternion);

      fpsControls.lock();
    }
  }
});

setupMovementControls(() => {
  if (fpsControls.isLocked) {
    console.log("Tiro!");
  }
});

window.addEventListener(
  "resize",
  () => {
    onWindowResize(camera, renderer);
  },
  false,
);

let plano = createGroundPlaneXZ(200, 200, 10, 10, "rgb(60, 100, 120)"); 
scene.add(plano);

const portas = [];

function construirCastelo(scene) {
  // Definindo as cores com base na referência do Castelo de Bodiam
  const matPedra = setDefaultMaterial("rgb(180, 175, 160)");   // Pedra bege/acinzentada
  const matMadeira = setDefaultMaterial("rgb(70, 40, 20)");       // Madeira escura
  const matTelhado = setDefaultMaterial("rgb(110, 110, 105)");    // Telhados
  const matGrama = setDefaultMaterial("rgb(85, 140, 50)");     // Grama interna
  const matTerra = setDefaultMaterial("rgb(150, 130, 100)");    // Terra/areia interna
  
  const grupoCastelo = new THREE.Group();
  grupoCastelo.scale.set(1.5, 1.5, 1.5); 
  scene.add(grupoCastelo);
  

  const chaoTerra = new THREE.Mesh(new THREE.BoxGeometry(76, 0.1, 76), matTerra);
  chaoTerra.position.set(0, 0.05, 0);
  grupoCastelo.add(chaoTerra);
  
  const chaoGrama = new THREE.Mesh(new THREE.BoxGeometry(40, 0.15, 30), matGrama);
  chaoGrama.position.set(0, 0.08, 0);
  grupoCastelo.add(chaoGrama);

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
    distGatilho: 35, // Distância maior para compensar escala
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
  const geomTorre = new THREE.CylinderGeometry(6, 6, 24, 32);
  const posTorres = [
    [-40, 12, -40], [40, 12, -40], [-40, 12, 40], [40, 12, 40]
  ];
  posTorres.forEach(pos => {
    const torre = new THREE.Mesh(geomTorre, matPedra);
    torre.position.set(pos[0], pos[1], pos[2]);
    grupoCastelo.add(torre);
  });
  
  // Guaritas 
  const geomTorreCentro = new THREE.BoxGeometry(10, 22, 10);
  const torreCentroFundo = new THREE.Mesh(geomTorreCentro, matPedra);
  torreCentroFundo.position.set(0, 11, -40);
  grupoCastelo.add(torreCentroFundo);
  
  // Duas torres entre o portão principal
  const torrePortaoEsq = new THREE.Mesh(geomTorreCentro, matPedra);
  torrePortaoEsq.position.set(-10, 11, 40);
  grupoCastelo.add(torrePortaoEsq);
  const torrePortaoDir = new THREE.Mesh(geomTorreCentro, matPedra);
  torrePortaoDir.position.set(10, 11, 40);
  grupoCastelo.add(torrePortaoDir);

  // Edificações Internas
  construirPredioInterno(grupoCastelo, -15, 0, matPedra, matMadeira, matTelhado, 1);
  construirPredioInterno(grupoCastelo, 15, -15, matPedra, matMadeira, matTelhado, -1);
  
  // Escadas de Acesso à Muralha
  construirEscadasMuro(grupoCastelo, matPedra);
}

function construirPredioInterno(grupo, offsetX, offsetZ, matPedra, matMadeira, matTelhado, direcaoPorta) {
  const grupoPredio = new THREE.Group();
  
  // Parede dos fundos
  const fundo = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 2), matPedra);
  fundo.position.set(0, 6, -7);
  grupoPredio.add(fundo);
  
  // Paredes laterais
  const geomLado = new THREE.BoxGeometry(2, 12, 12);
  const esq = new THREE.Mesh(geomLado, matPedra);
  esq.position.set(-7, 6, 0);
  grupoPredio.add(esq);
  const dir = new THREE.Mesh(geomLado, matPedra);
  dir.position.set(7, 6, 0);
  grupoPredio.add(dir);
  
  // Paredes da frente 
  const geomFrente = new THREE.BoxGeometry(4.5, 12, 2);
  const frenteEsq = new THREE.Mesh(geomFrente, matPedra);
  frenteEsq.position.set(-5.75, 6, 7);
  grupoPredio.add(frenteEsq);
  const frenteDir = new THREE.Mesh(geomFrente, matPedra);
  frenteDir.position.set(5.75, 6, 7);
  grupoPredio.add(frenteDir);

  const telhadoPorta = new THREE.Mesh(new THREE.BoxGeometry(7, 4, 2), matTelhado);
  telhadoPorta.position.set(0, 10, 7);
  grupoPredio.add(telhadoPorta);
  
  // Telhado Principal
  const telhado = new THREE.Mesh(new THREE.BoxGeometry(16, 1, 16), matTelhado);
  telhado.position.set(0, 12.5, 0);
  grupoPredio.add(telhado);
  
  // Escadas para o telhado
  for(let i=0; i<6; i++) {
    const degrau = new THREE.Mesh(new THREE.BoxGeometry(4, (i+1)*2, 4), matPedra);
    degrau.position.set(10, (i+1), -4 + (i*4));
    grupoPredio.add(degrau);
  }
  
  // Porta com Dobradiça
  const dobradica = new THREE.Group();
  dobradica.position.set(-3.5, 4, 7);
  const geomPorta = new THREE.BoxGeometry(7, 8, 1);
  const porta = new THREE.Mesh(geomPorta, matMadeira);
  porta.position.set(3.5, 0, 0); 
  dobradica.add(porta);
  grupoPredio.add(dobradica);
  
  grupoPredio.position.set(offsetX, 0, offsetZ);
  grupo.add(grupoPredio);
  
  // Animar a porta interna
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
  for(let i=0; i<10; i++) {
    const alturaDegrau = (i+1)*2; 
    const degrau = new THREE.Mesh(new THREE.BoxGeometry(6, alturaDegrau, 6), matPedra);
    // Posiciona as escadas encostadas no muro esquerdo
    degrau.position.set(-33, alturaDegrau/2, 20 - (i*6));
    grupoEscada.add(degrau);
  }
  grupo.add(grupoEscada);
}

construirCastelo(scene);

const caixaContornoCamera = new THREE.Box3();
let cameraEstavaColidindo = false;

render();

function render() {
  requestAnimationFrame(render);

  const delta = clock.getDelta();
  const ocorreuColisao = updateMovement(fpsControls, delta, scene.children);

  caixaContornoCamera.setFromCenterAndSize(
    camera.position,
    new THREE.Vector3(1, 2, 1),
  );

  for (let i = 0; i < portas.length; i++) {
    portas[i].update(camera);
  }

  const cameraEstaColidindo = ocorreuColisao;
  if (cameraEstaColidindo && !cameraEstavaColidindo) {
    console.warn("Colisão detectada entre a câmera e um objeto.");
  }
  cameraEstavaColidindo = cameraEstaColidindo;

  if (isOrbital) {
    orbitControls.update();
  }

  renderer.render(scene, camera);
}
