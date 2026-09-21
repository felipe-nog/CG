import * as THREE from 'three';

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

export function getSolidBounds(collisionObjects) {
  const { colliders, walkableBounds } = collectCollisionData(collisionObjects);
  const colliderBounds = colliders.map((object) => new THREE.Box3().setFromObject(object));
  return [...colliderBounds, ...walkableBounds];
}