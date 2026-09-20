import * as THREE from "three";
import { registerSlideDoor } from "./doors.js";

export function buildGate(grupoCastelo, materials) {
  const { matMadeira } = materials;

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

  registerSlideDoor({
    mesh: portaPrincipal,
    yFechado: 8,
    yAberto: 22,
    distGatilho: 35,
  });
}