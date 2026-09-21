import * as THREE from "three";
import KeyboardState from "../libs/util/KeyboardState.js";
import {
  createCollisionContext,
  resolveVerticalMovement,
  eyeHeight,
  maxStepHeight,
} from "./playerCollision.js";

// Entrada de Teclado e Mouse
const keyboard = new KeyboardState();
const speed = 12.0;
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

// Atualização de Movimento
export function updateMovement(controls, delta, collisionObjects = []) {
  keyboard.update();

  if (!controls.isLocked) return false;

  const isForward = keyboard.pressed("W") || keyboard.pressed("up");
  const isBackward = keyboard.pressed("S") || keyboard.pressed("down");
  const isLeft = keyboard.pressed("A") || keyboard.pressed("left");
  const isRight = keyboard.pressed("D") || keyboard.pressed("right");

  let collisionOccurred = false;

  // Colisão com piso, rampas, escadas, colisores
  const collisionContext = createCollisionContext(collisionObjects);
  const { floorAt, rampAt, isRampTraversal, collidesAt } = collisionContext;

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

  const supportFloor = floorAt(controls.object.position);
  const supportFeet = controls.object.position.y - eyeHeight;
  const isGrounded =
    supportFloor > -Infinity &&
    Math.abs(supportFeet - supportFloor) <= 0.15 &&
    verticalVelocity >= -0.5;

  if (localDirection.lengthSq() > 0 && isGrounded) {
    const desiredMovement = new THREE.Vector3()
      .addScaledVector(forward, localDirection.z)
      .addScaledVector(right, localDirection.x)
      .multiplyScalar(speed * delta);

    const substeps = Math.max(1, Math.ceil(desiredMovement.length() / 0.2));
    const substepMovement = desiredMovement.clone().divideScalar(substeps);
    for (let step = 0; step < substeps; step += 1) {
      const start = controls.object.position.clone();
      const fullPosition = start.clone().add(substepMovement);
      const currentFloor = floorAt(start);
      const candidateFloor = floorAt(fullPosition);

      const leavesHighSurface =
        currentFloor > -Infinity &&
        (candidateFloor === -Infinity ||
          currentFloor - candidateFloor > maxStepHeight) &&
        !rampAt(fullPosition);
      if (leavesHighSurface) {
        controls.object.position.copy(fullPosition);
        break;
      }

      const canClimb =
        candidateFloor > currentFloor &&
        candidateFloor - (start.y - eyeHeight) <= maxStepHeight;
      const canTraverse = canClimb || isRampTraversal(start, fullPosition);

      if (!collidesAt(fullPosition, canTraverse)) {
        controls.object.position.copy(fullPosition);
        if (canClimb || isRampTraversal(start, fullPosition)) {
          controls.object.position.y += Math.min(
            candidateFloor + 0.03 - (controls.object.position.y - eyeHeight),
            6 * delta,
          );
          verticalVelocity = 0;
        }
        continue;
      }

      collisionOccurred = true;
      const xPosition = start.clone();
      xPosition.x += substepMovement.x;
      const xFloor = floorAt(xPosition);
      const xCanClimb =
        xFloor > currentFloor &&
        xFloor - (start.y - eyeHeight) <= maxStepHeight;
      if (
        !collidesAt(xPosition, xCanClimb || isRampTraversal(start, xPosition))
      )
        controls.object.position.x = xPosition.x;

      const zPosition = controls.object.position.clone();
      zPosition.z += substepMovement.z;
      const zFloor = floorAt(zPosition);
      const zCanClimb =
        zFloor > currentFloor &&
        zFloor - (start.y - eyeHeight) <= maxStepHeight;
      if (
        !collidesAt(zPosition, zCanClimb || isRampTraversal(start, zPosition))
      )
        controls.object.position.z = zPosition.z;
    }
  }

  verticalVelocity = resolveVerticalMovement(
    controls.object,
    delta,
    verticalVelocity,
    collisionContext,
  );

  return collisionOccurred;
}
