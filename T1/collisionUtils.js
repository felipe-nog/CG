import * as THREE from 'three';

/**
 * Percorre uma lista de objetos da cena e os separa por tipo de colisão,
 * usando o mesmo critério (userData.collisionType) definido ao montar o
 * cenário (ex.: castle.js). Reutilizado por movementControls.js e por
 * projectiles.js, para que jogador e projétil colidam com a mesma geometria.
 */
export function collectCollisionData(collisionObjects) {
  const colliders = [];
  const walkableBounds = [];
  const roofBounds = [];
  const stairBounds = [];
  const ramps = [];

  const visit = (object) => {
    if (!object.visible) return;
    if (object.isMesh) {
      const bounds = new THREE.Box3().setFromObject(object);
      if (object.userData.collisionType === "ramp") {
        ramps.push({
          bounds,
          bottom: object.parent.localToWorld(object.userData.ramp.bottom.clone()),
          top: object.parent.localToWorld(object.userData.ramp.top.clone()),
        });
      } else if (object.userData.collisionType === "walkable") {
        walkableBounds.push(bounds);
        if (object.userData.isRoof) roofBounds.push(bounds);
        if (object.userData.isStairStep) stairBounds.push(bounds);
      } else {
        colliders.push(object);
      }
    }
    object.children.forEach(visit);
  };

  collisionObjects.forEach(visit);

  return { colliders, walkableBounds, roofBounds, stairBounds, ramps };
}

/**
 * Todos os Box3 que representam geometria sólida "real" da cena (paredes +
 * superfícies caminháveis — chão, telhados, degraus). As rampas ficam de
 * fora de propósito: são volumes invisíveis finos usados só para calcular
 * a altura do piso ao caminhar, não representam a superfície inclinada em
 * si — incluí-las bloquearia o projétil em pontos onde ele deveria passar
 * livremente por cima da rampa.
 */
export function getSolidBounds(collisionObjects) {
  const { colliders, walkableBounds } = collectCollisionData(collisionObjects);
  const colliderBounds = colliders.map((object) => new THREE.Box3().setFromObject(object));
  return [...colliderBounds, ...walkableBounds];
}