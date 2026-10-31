import * as THREE from "three";
import { clone as cloneSkinned } from "../build/jsm/utils/SkeletonUtils.js";
import { ENEMY_TYPES, loadEnemyModels } from "../modeling/enemyModels.js";

const FADE_DURATION = 1.0;
const HIT_FLASH_DURATION = 0.15;
const LIGHT_INTENSITY = 150;
const LIGHT_DISTANCE = 20;
const BAR_WIDTH = 1.8;
const BAR_HEIGHT = 0.2;

const ENEMY_SPAWNS = [
  { type: "ghost", position: [-20, 20.1, -40], axis: "x", range: 11 },
  { type: "beholder", position: [-15, 1.0, -1], axis: "z", range: 3 },
  { type: "beholder", position: [-5, 1.0, -27], axis: "x", range: 8 },
  { type: "ghost", position: [16, 0.16, 22], axis: "z", range: 6 },
];

function createHealthBar() {
  const bar = new THREE.Group();

  const makeMaterial = (color) =>
    new THREE.MeshLambertMaterial({
      color: 0x000000,
      emissive: color,
      transparent: true,
      depthWrite: false,
    });

  const background = new THREE.Mesh(
    new THREE.PlaneGeometry(BAR_WIDTH + 0.12, BAR_HEIGHT + 0.12),
    makeMaterial(0x140808),
  );
  background.renderOrder = 10;

  // A geometria é deslocada para que a escala em X encolha para a esquerda.
  const fillGeometry = new THREE.PlaneGeometry(BAR_WIDTH, BAR_HEIGHT);
  fillGeometry.translate(BAR_WIDTH / 2, 0, 0);
  const fill = new THREE.Mesh(fillGeometry, makeMaterial(0x39e05a));
  fill.position.set(-BAR_WIDTH / 2, 0, 0.01);
  fill.renderOrder = 11;

  bar.add(background, fill);
  bar.userData = { fill };
  return bar;
}

function createEnemy(type, template, spawnWorld, patrol, castleScale) {
  const config = ENEMY_TYPES[type];
  const size = template.userData.size;

  const holder = new THREE.Group();
  holder.position.copy(spawnWorld);

  // SkeletonUtils.clone refaz o vínculo entre malha e esqueleto (modelos animados)
  const model = cloneSkinned(template);
  // Clona materiais para que cada inimigo possa piscar/esmaecer sozinho
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.material = object.material.clone();
    object.castShadow = true;
    object.receiveShadow = true;
  });
  holder.add(model);

  let mixer = null;
  if (template.animations.length > 0) {
    mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(template.animations[0]);
    action.time = Math.random() * action.getClip().duration;
    action.play();
  }

  // Luz pontual + orbe luminoso acima da cabeça: o inimigo é fácil de achar
  const orbMaterial = new THREE.MeshLambertMaterial({
    color: 0x000000,
    emissive: config.lightColor,
    transparent: true,
  });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), orbMaterial);
  orb.position.y = config.height + 0.5;
  holder.add(orb);

  const light = new THREE.PointLight(
    config.lightColor,
    LIGHT_INTENSITY,
    LIGHT_DISTANCE,
    2,
  );
  light.position.y = config.height * 0.6;
  holder.add(light);

  const healthBar = createHealthBar();
  healthBar.position.y = config.height + 1.1;
  holder.add(healthBar);

  const hitRadius = Math.max(size.x, size.z) * 0.45;

  return {
    type,
    config,
    holder,
    model,
    mixer,
    orb,
    light,
    healthBar,
    hitRadius,
    hp: config.hp,
    state: "alive", // alive | dying | dead
    deathTimer: 0,
    flashTimer: 0,
    visibleAtNight: true,
    patrol: {
      axis: patrol.axis,
      min: spawnWorld[patrol.axis] - patrol.range * castleScale,
      max: spawnWorld[patrol.axis] + patrol.range * castleScale,
      direction: 1,
    },
    baseY: spawnWorld.y,
    time: Math.random() * 10,
  };
}

function forEachMaterial(enemy, callback) {
  enemy.holder.traverse((object) => {
    if (object.isMesh) callback(object.material);
  });
}

/**
 * Sistema de inimigos: carrega os modelos, posiciona os 4 inimigos no castelo,
 * move-os (patrulha), recebe dano e dispara `onEnemyDefeated(position)`.
 */
export function setupEnemySystem(scene, castle, camera, onEnemyDefeated) {
  const enemies = [];
  let night = false;

  const targets = []; // interface usada pelo sistema de projéteis

  function refreshVisibility(enemy) {
    const visible = enemy.state !== "dead" && night;
    enemy.holder.visible = visible;
    // A luz nunca é removida da cena (evita recompilar shaders); só zerada.
    enemy.light.intensity = visible ? LIGHT_INTENSITY * fadeFactor(enemy) : 0;
  }

  function fadeFactor(enemy) {
    return enemy.state === "dying"
      ? Math.max(0, 1 - enemy.deathTimer / FADE_DURATION)
      : 1;
  }

  function updateHealthBar(enemy) {
    const ratio = enemy.hp / enemy.config.hp;
    const { fill } = enemy.healthBar.userData;
    fill.scale.x = Math.max(ratio, 0.001);
    fill.material.emissive.setHSL(0.33 * ratio, 0.75, 0.5);
  }

  function damage(enemy) {
    if (enemy.state !== "alive") return;
    enemy.hp -= 1;
    enemy.flashTimer = HIT_FLASH_DURATION;
    updateHealthBar(enemy);

    if (enemy.hp <= 0) {
      enemy.state = "dying";
      enemy.deathTimer = 0;
      forEachMaterial(enemy, (material) => {
        material.transparent = true;
        material.needsUpdate = true;
      });
      const dropPosition = enemy.holder.position.clone();
      dropPosition.y = enemy.baseY + 1.4;
      onEnemyDefeated(dropPosition);
    }
  }

  function createTarget(enemy) {
    return {
      isHittable: () => enemy.state === "alive" && enemy.holder.visible,
      getHitSphere: (sphere) => {
        sphere.center.copy(enemy.holder.position);
        sphere.center.y += enemy.config.height * 0.5;
        sphere.radius = enemy.hitRadius;
      },
      onHit: () => damage(enemy),
    };
  }

  loadEnemyModels().then((templates) => {
    castle.updateMatrixWorld(true);
    const castleScale = castle.scale.x;

    ENEMY_SPAWNS.forEach((spawn) => {
      const world = castle.localToWorld(new THREE.Vector3(...spawn.position));
      const enemy = createEnemy(
        spawn.type,
        templates[spawn.type],
        world,
        spawn,
        castleScale,
      );
      scene.add(enemy.holder);
      enemies.push(enemy);
      targets.push(createTarget(enemy));
      refreshVisibility(enemy);
    });
  });

  function move(enemy, delta) {
    const { patrol, config } = enemy;
    const position = enemy.holder.position;
    const axis = patrol.axis;

    position[axis] += patrol.direction * config.speed * delta;
    if (position[axis] > patrol.max) {
      position[axis] = patrol.max;
      patrol.direction = -1;
    } else if (position[axis] < patrol.min) {
      position[axis] = patrol.min;
      patrol.direction = 1;
    }

    // Vira suavemente para o sentido do movimento
    const heading = axis === "x" ? patrol.direction : 0;
    const headingZ = axis === "z" ? patrol.direction : 0;
    const targetYaw = Math.atan2(heading, headingZ) + config.yawOffset;
    let diff = targetYaw - enemy.model.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    enemy.model.rotation.y += diff * Math.min(1, delta * 5);

    enemy.time += delta;
    if (config.flying) {
      // Flutua: sobe e desce suavemente, inclinando levemente no deslocamento
      position.y = enemy.baseY + 1.6 + Math.sin(enemy.time * 2) * 0.35;
      enemy.model.rotation.z = Math.sin(enemy.time * 2) * 0.06;
    } else {
      // Arrasta pelo chão: balanço lento lateral e leve oscilação do corpo
      position.y = enemy.baseY;
      enemy.model.rotation.z = Math.sin(enemy.time * 3) * 0.05;
    }
  }

  function update(delta, isNight) {
    night = isNight;

    enemies.forEach((enemy) => {
      if (enemy.state === "dead") return;

      if (enemy.state === "dying") {
        enemy.deathTimer += delta;
        const opacity = fadeFactor(enemy);
        forEachMaterial(enemy, (material) => {
          material.opacity = opacity;
        });
        if (enemy.deathTimer >= FADE_DURATION) {
          enemy.state = "dead";
          scene.remove(enemy.holder);
        }
      } else {
        move(enemy, delta);
      }
      enemy.mixer?.update(delta);

      // Piscada de dano
      enemy.flashTimer = Math.max(0, enemy.flashTimer - delta);
      const flash = enemy.flashTimer > 0 ? 1 : 0;
      enemy.model.traverse((object) => {
        if (object.isMesh) object.material.emissive.setRGB(flash * 0.9, flash * 0.1, 0);
      });

      // Orbe pulsante e barra de vida sempre voltada para a câmera
      enemy.orb.scale.setScalar(1 + Math.sin(enemy.time * 6) * 0.15);
      enemy.orb.material.opacity = fadeFactor(enemy);
      enemy.healthBar.quaternion.copy(camera.quaternion);
      enemy.healthBar.children.forEach((part) => {
        part.material.opacity = fadeFactor(enemy);
      });

      refreshVisibility(enemy);
    });
  }

  return { update, targets, enemies };
}
