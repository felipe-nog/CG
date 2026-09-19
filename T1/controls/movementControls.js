import * as THREE from "three";
import KeyboardState from "../libs/util/KeyboardState.js";
import { collectCollisionData } from "../collisionUtils.js";

const keyboard = new KeyboardState();
const speed = 18.0;
const playerRadius = 0.5;
const playerHeight = 2.0;
const eyeHeight = 2.0;
const maxStepHeight = 0.75;
const gravity = 28.0;
const maxFallSpeed = 35.0;
let verticalVelocity = 0;
let onShoot = null;

const onMouseDown = (event) => {
  // event.button === 0 (esquerdo), event.button === 2 (direito)
  if (event.button === 0 || event.button === 2) {
    if (onShoot) onShoot();
  }
};

const onContextMenu = (event) => {
  event.preventDefault();
};

export function setupMovementControls(shootCallback) {
  onShoot = shootCallback;

  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("contextmenu", onContextMenu);
}

export function updateMovement(controls, delta, collisionObjects = []) {
  keyboard.update();

  if (!controls.isLocked) return false;

  const isForward = keyboard.pressed("W") || keyboard.pressed("up");
  const isBackward = keyboard.pressed("S") || keyboard.pressed("down");
  const isLeft = keyboard.pressed("A") || keyboard.pressed("left");
  const isRight = keyboard.pressed("D") || keyboard.pressed("right");

  const playerBounds = new THREE.Box3();
  const playerSize = new THREE.Vector3(
    playerRadius * 2,
    playerHeight,
    playerRadius * 2,
  );
  let collisionOccurred = false;

  const { colliders, walkableBounds, roofBounds, stairBounds, ramps } =
    collectCollisionData(collisionObjects);

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

  // ATUALIZE A FUNÇÃO collidesAt (adicionamos isTraversable e isClimbing)
  const collidesAt = (position, isTraversable, isClimbing) => {
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
    // Ignora colisão com teto apenas se estiver ativamente subindo um degrau
    if (intersectsRoofFromBelow && !isClimbing) return true;

    // A escada só vira parede se o caminho NÃO for atravessável (ex: degrau alto demais)
    return (
      !isTraversable &&
      stairBounds.some((bounds) => playerBounds.intersectsBox(bounds))
    );
  };

  const localDirection = new THREE.Vector3(
    isRight ? 1 : isLeft ? -1 : 0,
    0,
    isForward ? 1 : isBackward ? -1 : 0,
  );
  if (localDirection.lengthSq() > 0) localDirection.normalize();

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
    controls.object.quaternion,
  );
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
    controls.object.quaternion,
  );
  forward.y = 0;
  right.y = 0;
  forward.normalize();
  right.normalize();

  if (localDirection.lengthSq() > 0) {
    const desiredMovement = new THREE.Vector3()
      .addScaledVector(forward, localDirection.z)
      .addScaledVector(right, localDirection.x)
      .multiplyScalar(speed * delta);

    const substeps = Math.max(1, Math.ceil(desiredMovement.length() / 0.2));
    const substepMovement = desiredMovement.clone().divideScalar(substeps);

    // ATUALIZE O LOOP DE SUBSTEPS
    for (let step = 0; step < substeps; step += 1) {
      const start = controls.object.position.clone();
      const fullPosition = start.clone().add(substepMovement);
      const currentFloor = floorAt(start);
      const candidateFloor = floorAt(fullPosition);

      // Separamos os conceitos:
      // isTraversable: A diferença de altura permite passagem (seja subindo ou descendo)?
      const isTraversable =
        candidateFloor - (start.y - eyeHeight) <= maxStepHeight;
      // needsClimb: O terreno da frente é mais alto E permite passagem?
      const needsClimb = candidateFloor > currentFloor && isTraversable;

      if (!collidesAt(fullPosition, isTraversable, needsClimb)) {
        controls.object.position.copy(fullPosition);
        if (needsClimb) {
          controls.object.position.y += Math.min(
            candidateFloor + 0.03 - (controls.object.position.y - eyeHeight),
            6 * delta,
          );
          verticalVelocity = 0;
        }
        continue;
      }

      collisionOccurred = true;

      // Checagem isolada para X
      const xPosition = start.clone();
      xPosition.x += substepMovement.x;
      const xFloor = floorAt(xPosition);
      const xIsTraversable = xFloor - (start.y - eyeHeight) <= maxStepHeight;
      const xNeedsClimb = xFloor > currentFloor && xIsTraversable;

      if (!collidesAt(xPosition, xIsTraversable, xNeedsClimb))
        controls.object.position.x = xPosition.x;

      // Checagem isolada para Z
      const zPosition = controls.object.position.clone();
      zPosition.z += substepMovement.z;
      const zFloor = floorAt(zPosition);
      const zIsTraversable = zFloor - (start.y - eyeHeight) <= maxStepHeight;
      const zNeedsClimb = zFloor > currentFloor && zIsTraversable;

      if (!collidesAt(zPosition, zIsTraversable, zNeedsClimb))
        controls.object.position.z = zPosition.z;
    }
  }

  const floor = floorAt(controls.object.position);
  const feet = controls.object.position.y - eyeHeight;
  const targetFeet = floor + 0.03;
  if (
    floor > -Infinity &&
    targetFeet > feet &&
    targetFeet - feet <= maxStepHeight
  ) {
    controls.object.position.y += Math.min(targetFeet - feet, 6 * delta);
    verticalVelocity = 0;
  } else {
    verticalVelocity = Math.max(
      verticalVelocity - gravity * delta,
      -maxFallSpeed,
    );
    controls.object.position.y += verticalVelocity * delta;
    if (floor > -Infinity && controls.object.position.y - eyeHeight <= floor) {
      controls.object.position.y = floor + eyeHeight;
      verticalVelocity = 0;
    }
  }

  return collisionOccurred;
}
