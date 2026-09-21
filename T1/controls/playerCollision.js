import * as THREE from "three";
import { collectCollisionData } from "../collisionUtils.js";

// Física do Jogador
export const playerRadius = 0.5;
export const playerHeight = 2.0;
export const eyeHeight = 2.0;
export const maxStepHeight = 0.75;
export const gravity = 28.0;
export const maxFallSpeed = 35.0;

// Contexto de Colisão do Frame
export function createCollisionContext(collisionObjects = []) {
  const { colliders, walkableBounds, roofBounds, stairBounds, ramps } =
    collectCollisionData(collisionObjects);

  const playerBounds = new THREE.Box3();
  const playerSize = new THREE.Vector3(
    playerRadius * 2,
    playerHeight,
    playerRadius * 2,
  );

  const floorAt = (position) => {
    const feet = position.y - eyeHeight;
    let floor = -Infinity;
    ramps.forEach((ramp) => {
      const inside =
        position.x >= ramp.bounds.min.x - playerRadius &&
        position.x <= ramp.bounds.max.x + playerRadius &&
        position.z >= ramp.bounds.min.z - playerRadius &&
        position.z <= ramp.bounds.max.z + playerRadius;
      if (!inside) return;
      const progress = THREE.MathUtils.clamp(
        (position.z - ramp.bottom.z) / (ramp.top.z - ramp.bottom.z),
        0,
        1,
      );
      const rampFloor = THREE.MathUtils.lerp(
        ramp.bottom.y,
        ramp.top.y,
        progress,
      );
      if (rampFloor <= feet + maxStepHeight && rampFloor > floor)
        floor = rampFloor;
    });

    if (floor > -Infinity) return floor;

    walkableBounds.forEach((bounds) => {
      const inside =
        position.x >= bounds.min.x - playerRadius &&
        position.x <= bounds.max.x + playerRadius &&
        position.z >= bounds.min.z - playerRadius &&
        position.z <= bounds.max.z + playerRadius;
      if (
        inside &&
        bounds.max.y <= feet + maxStepHeight &&
        bounds.max.y > floor
      ) {
        floor = bounds.max.y;
      }
    });
    return floor;
  };

  const floorCrossedDuringFall = (position, previousFeet, nextFeet) => {
    let landingFloor = -Infinity;
    walkableBounds.forEach((bounds) => {
      const inside = position.x >= bounds.min.x - playerRadius &&
        position.x <= bounds.max.x + playerRadius &&
        position.z >= bounds.min.z - playerRadius &&
        position.z <= bounds.max.z + playerRadius;
      const crossed = bounds.max.y <= previousFeet && bounds.max.y >= nextFeet;
      if (inside && crossed && bounds.max.y > landingFloor) {
        landingFloor = bounds.max.y;
      }
    });
    return landingFloor;
  };

  const rampAt = (position) => ramps.find((ramp) => {
    return position.x >= ramp.bounds.min.x - playerRadius &&
      position.x <= ramp.bounds.max.x + playerRadius &&
      position.z >= ramp.bounds.min.z - playerRadius &&
      position.z <= ramp.bounds.max.z + playerRadius;
  });

  const isRampTraversal = (start, candidate) => {
    const ramp = rampAt(candidate);
    if (!ramp) return false;
    const rampDirection = new THREE.Vector3(
      ramp.top.x - ramp.bottom.x,
      0,
      ramp.top.z - ramp.bottom.z,
    ).normalize();
    return candidate.clone().sub(start).dot(rampDirection) > 0.01 ||
      candidate.clone().sub(start).dot(rampDirection) < -0.01;
  };

  const collidesAt = (position, canClimb) => {
    playerBounds.setFromCenterAndSize(
      new THREE.Vector3(position.x, position.y - playerHeight / 2, position.z),
      playerSize,
    );
    if (
      colliders.some((object) => {
        const objectBounds = new THREE.Box3().setFromObject(object);
        return playerBounds.intersectsBox(objectBounds);
      })
    )
      return true;

    const feet = position.y - eyeHeight;
    const intersectsRoofFromBelow = roofBounds.some((bounds) => {
      return feet < bounds.max.y - 0.05 && playerBounds.intersectsBox(bounds);
    });
    if (intersectsRoofFromBelow && !canClimb) return true;

    const climbWindowTop = feet + maxStepHeight;
    return stairBounds.some((bounds) => {
      if (bounds.max.y <= climbWindowTop + 0.001) return false;
      return playerBounds.intersectsBox(bounds);
    });
  };

  return {
    colliders,
    walkableBounds,
    roofBounds,
    stairBounds,
    ramps,
    floorAt,
    floorCrossedDuringFall,
    rampAt,
    isRampTraversal,
    collidesAt,
  };
}

// Resolução Vertical (gravidade e queda)
export function resolveVerticalMovement(controlsObject, delta, verticalVelocity, collisionContext) {
  const { floorAt, floorCrossedDuringFall } = collisionContext;

  const floor = floorAt(controlsObject.position);
  const feet = controlsObject.position.y - eyeHeight;
  const targetFeet = floor + 0.03;

  if (floor > -Infinity && Math.abs(targetFeet - feet) <= maxStepHeight) {
    controlsObject.position.y += THREE.MathUtils.clamp(
      targetFeet - feet,
      -6 * delta,
      6 * delta,
    );
    return 0;
  }

  const previousFeet = feet;
  let nextVerticalVelocity = Math.max(
    verticalVelocity - gravity * delta,
    -maxFallSpeed,
  );
  controlsObject.position.y += nextVerticalVelocity * delta;
  const nextFeet = controlsObject.position.y - eyeHeight;
  const crossedFloor = floorCrossedDuringFall(
    controlsObject.position,
    previousFeet,
    nextFeet,
  );
  if (crossedFloor > -Infinity && nextFeet <= crossedFloor) {
    controlsObject.position.y = crossedFloor + eyeHeight;
    nextVerticalVelocity = 0;
  }

  return nextVerticalVelocity;
}