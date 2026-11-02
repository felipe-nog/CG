import * as THREE from "three";
import { createCastleMaterials } from "./materials.js";
import { buildTerrain } from "./castle_parts/terrain.js";
import { buildWalls } from "./castle_parts/walls.js";
import { buildGate } from "./castle_parts/gate.js";
import { buildGatehouse } from "./castle_parts/gateHouse.js";
import { buildCornerTowers } from "./castle_parts/towers.js";
import { buildGuardTowers } from "./castle_parts/guardTowers.js";
import { buildInternalBuilding } from "./castle_parts/buildings.js";
import { buildWallStairs } from "./castle_parts/stairs.js";

export { updateDoors } from "./castle_parts/doors.js";

export function buildCastle(scene) {
  const materials = createCastleMaterials();

  const grupoCastelo = new THREE.Group();
  grupoCastelo.scale.set(1.5, 1.5, 1.5);
  scene.add(grupoCastelo);

  // Modelagem do terreno e dos muros
  buildTerrain(grupoCastelo, materials);
  buildWalls(grupoCastelo, materials);
  
  // Modelagem do portão e da porta
  buildGate(grupoCastelo, materials);
  buildGatehouse(grupoCastelo, materials.matPedra);
  
  // Modelagem das torres
  buildCornerTowers(grupoCastelo, materials.matPedra);
  buildGuardTowers(grupoCastelo, materials.matPedra);

  // Edificações Internas
  buildInternalBuilding(grupoCastelo, -15, 0, materials, 1);
  buildInternalBuilding(grupoCastelo, 15, -15, materials, -1);

  // Escadas do muro
  buildWallStairs(grupoCastelo, materials.matPedra);

  return grupoCastelo;
}