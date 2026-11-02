import * as THREE from "three";

const SHAFT_LENGTH = 0.9;
const SHAFT_RADIUS = 0.018;

const matMadeira = new THREE.MeshLambertMaterial({ color: "rgb(120, 78, 40)" });
const matFerro = new THREE.MeshLambertMaterial({ color: "rgb(150, 155, 165)" });
const matPena = new THREE.MeshLambertMaterial({
  color: "rgb(190, 40, 35)",
  side: THREE.DoubleSide,
});

let dartTemplate = null;

/**
 * Registra o virote importado junto com a besta para que os projéteis em voo
 * tenham a mesma aparência do dardo carregado. `template` deve apontar para -Z,
 * estar centralizado na origem e trazer `userData.tipOffset` em unidades de mundo.
 */
export function setDartTemplate(template) {
  dartTemplate = template;
}

/**
 * Dardo de besta modelado ao longo do eixo -Z (a ponta aponta para "frente"),
 * com a origem no centro da haste. `tipOffset` é a distância origem → ponta.
 */
export function createDart() {
  if (dartTemplate) {
    const clone = dartTemplate.clone();
    clone.userData.tipOffset = dartTemplate.userData.tipOffset;
    return clone;
  }

  const dart = new THREE.Group();

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(SHAFT_RADIUS, SHAFT_RADIUS, SHAFT_LENGTH, 8),
    matMadeira,
  );
  shaft.rotation.x = Math.PI / 2;
  dart.add(shaft);

  // Ponta de ferro em losango alongado (cone + base cônica curta)
  const tipLength = 0.14;
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(SHAFT_RADIUS * 2.2, tipLength, 4),
    matFerro,
  );
  tip.rotation.x = -Math.PI / 2;
  tip.position.z = -(SHAFT_LENGTH / 2 + tipLength / 2);
  dart.add(tip);

  // Três penas (pares de planos em cruz) na extremidade traseira
  const featherGeometry = new THREE.PlaneGeometry(0.2, 0.07);
  for (let i = 0; i < 3; i++) {
    const holder = new THREE.Group();
    holder.position.z = SHAFT_LENGTH / 2 - 0.12;
    holder.rotation.z = (i * Math.PI * 2) / 3;

    const feather = new THREE.Mesh(featherGeometry, matPena);
    feather.rotation.y = Math.PI / 2;
    feather.position.y = 0.04;
    holder.add(feather);
    dart.add(holder);
  }

  dart.userData.tipOffset = SHAFT_LENGTH / 2 + tipLength;
  return dart;
}
