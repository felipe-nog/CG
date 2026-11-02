import * as THREE from "three";
import { registerHingeDoor } from "./doors.js";

export function buildInternalBuilding(grupo, offsetX, offsetZ, materials, direcaoPorta) {
  const { matPedra, matMadeira, matTelhado } = materials;
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

  // Porta com dobradiça
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

  const anguloAberto = direcaoPorta > 0 ? -Math.PI / 2 : Math.PI / 2;

  registerHingeDoor({
    hinge: dobradica,
    rotFechada: 0,
    rotAberta: anguloAberto,
    distGatilho: 15,
  });
}