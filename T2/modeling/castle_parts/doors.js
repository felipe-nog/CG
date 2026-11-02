import * as THREE from "three";

const portas = [];

// PORTÃO PRINCIPAL
// Abre/fecha por translação vertical.
export function registerSlideDoor({ mesh, yFechado, yAberto, distGatilho }) {
  const posMundo = new THREE.Vector3();

  portas.push({
    mesh,
    yFechado,
    yAberto,
    distGatilho,
    update(camera) {
      mesh.getWorldPosition(posMundo);
      const dist = posMundo.distanceTo(camera.position);
      if (dist < distGatilho) {
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, yAberto, 0.05);
      } else {
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, yFechado, 0.05);
      }
    },
  });
}

// PORTAS DOS PRÉDIOS INTERNOS
// Abre/fecha por rotação em torno de uma dobradiça.
export function registerHingeDoor({ hinge, rotFechada, rotAberta, distGatilho }) {
  const posMundo = new THREE.Vector3();

  portas.push({
    hinge,
    rotFechada,
    rotAberta,
    distGatilho,
    update(camera) {
      hinge.getWorldPosition(posMundo);
      const dist = posMundo.distanceTo(camera.position);
      if (dist < distGatilho) {
        hinge.rotation.y = THREE.MathUtils.lerp(hinge.rotation.y, rotAberta, 0.05);
      } else {
        hinge.rotation.y = THREE.MathUtils.lerp(hinge.rotation.y, rotFechada, 0.05);
      }
    },
  });
}

export function updateDoors(camera) {
  for (let i = 0; i < portas.length; i++) {
    portas[i].update(camera);
  }
}