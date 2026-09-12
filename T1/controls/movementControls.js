import * as THREE from 'three';
import KeyboardState from '../libs/util/KeyboardState.js';

const keyboard = new KeyboardState();
const speed = 6.0; 
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

  if (!controls.isLocked) return;

  const direction = new THREE.Vector3();

  const isForward = keyboard.pressed("W") || keyboard.pressed("up");
  const isBackward = keyboard.pressed("S") || keyboard.pressed("down");
  const isLeft = keyboard.pressed("A") || keyboard.pressed("left");
  const isRight = keyboard.pressed("D") || keyboard.pressed("right");

  const movementAmount = 10;

  if(isForward) {
    direction.z = movementAmount;
  } else if(isBackward) {
    direction.z = -movementAmount;
  } else {
    direction.z = 0;
  }
  
  if(isLeft) {
    direction.x = -movementAmount;
  } else if(isRight) {
    direction.x = movementAmount;
  } else {
    direction.x = 0;
  }

  direction.normalize(); 

  const playerBounds = new THREE.Box3();
  const playerSize = new THREE.Vector3(1, 2, 1);
  const previousPosition = new THREE.Vector3();
  let collisionOccurred = false;

  const collidesWithObject = () => {
    playerBounds.setFromCenterAndSize(controls.object.position, playerSize);
    return collisionObjects.some((object) => {
      if (!object.isMesh || !object.visible) return false;

      const objectBounds = new THREE.Box3().setFromObject(object);
      return playerBounds.intersectsBox(objectBounds);
    });
  };

  const moveWithCollision = (move) => {
    previousPosition.copy(controls.object.position);
    move();

    if (collidesWithObject()) {
      collisionOccurred = true;
      controls.object.position.copy(previousPosition);
    }
  };

  if (isForward || isBackward) {
    moveWithCollision(() => {
      controls.moveForward(direction.z * speed * delta);
    });
  }

  if (isLeft || isRight) {
    moveWithCollision(() => {
      controls.moveRight(direction.x * speed * delta);
    });
  }

  return collisionOccurred;
}