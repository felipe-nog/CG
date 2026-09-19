import * as THREE from 'three';
import KeyboardState from '../libs/util/KeyboardState.js';

const keyboard = new KeyboardState();
const speed = 12.0; 
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

  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('contextmenu', onContextMenu);
}

export function updateMovement(controls, delta, collisionObjects = []) {
  keyboard.update();

  if (!controls.isLocked) return false;

  const isForward = keyboard.pressed("W") || keyboard.pressed("up");
  const isBackward = keyboard.pressed("S") || keyboard.pressed("down");
  const isLeft = keyboard.pressed("A") || keyboard.pressed("left");
  const isRight = keyboard.pressed("D") || keyboard.pressed("right");

  const playerBounds = new THREE.Box3();
  const playerSize = new THREE.Vector3(1, 2, 1);
  let collisionOccurred = false;

  const colliders = [];
  const collectColliders = (object) => {
    if (!object.visible) return;
    if (object.isMesh) colliders.push(object);
    object.children.forEach(collectColliders);
  };
  collisionObjects.forEach(collectColliders);

  const collidesAt = (position) => {
    playerBounds.setFromCenterAndSize(position, playerSize);
    return colliders.some((object) => {
      const objectBounds = new THREE.Box3().setFromObject(object);
      return playerBounds.intersectsBox(objectBounds);
    });
  };

  const localDirection = new THREE.Vector3(
    isRight ? 1 : isLeft ? -1 : 0,
    0,
    isForward ? 1 : isBackward ? -1 : 0,
  );
  if (localDirection.lengthSq() === 0) return false;
  localDirection.normalize();

  const forward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(controls.object.quaternion);
  const right = new THREE.Vector3(1, 0, 0)
    .applyQuaternion(controls.object.quaternion);
  forward.y = 0;
  right.y = 0;
  forward.normalize();
  right.normalize();

  const desiredMovement = new THREE.Vector3()
    .addScaledVector(forward, localDirection.z)
    .addScaledVector(right, localDirection.x)
    .multiplyScalar(speed * delta);

  const substeps = Math.max(1, Math.ceil(desiredMovement.length() / 0.2));
  const substepMovement = desiredMovement.clone().divideScalar(substeps);
  for (let step = 0; step < substeps; step += 1) {
    const start = controls.object.position.clone();
    const fullPosition = start.clone().add(substepMovement);

    if (!collidesAt(fullPosition)) {
      controls.object.position.copy(fullPosition);
      continue;
    }

    collisionOccurred = true;
    const xPosition = start.clone();
    xPosition.x += substepMovement.x;
    if (!collidesAt(xPosition)) controls.object.position.x = xPosition.x;

    const zPosition = controls.object.position.clone();
    zPosition.z += substepMovement.z;
    if (!collidesAt(zPosition)) controls.object.position.z = zPosition.z;
  };

  return collisionOccurred;
}