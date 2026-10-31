import * as THREE from "three";
import {
  createKeyMaterial,
  createKeyMesh,
  KEY_COLOR,
  KEY_EMISSIVE_INTENSITY,
} from "../modeling/key.js";

const TOTAL_KEYS = 4;
const PICKUP_DISTANCE = 3.2;
const LIGHT_INTENSITY = 80;
const LIGHT_DISTANCE = 20;
const PARKED_Y = -50;

function createHud() {
  const hud = document.createElement("div");
  hud.style.cssText = `
    position: fixed; top: 16px; left: 16px; z-index: 10;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 10px 16px;
    background: rgba(10, 12, 20, 0.6); border: 1px solid rgba(255, 200, 80, 0.4);
    border-radius: 10px; font: 600 15px sans-serif; color: #ffe9b0;
    pointer-events: none; user-select: none;`;

  const title = document.createElement("span");
  hud.appendChild(title);

  const slotsRow = document.createElement("div");
  slotsRow.style.cssText = `display: flex; align-items: center; gap: 8px;`;
  hud.appendChild(slotsRow);

  const slots = [];
  for (let i = 0; i < TOTAL_KEYS; i++) {
    const slot = document.createElement("span");
    slot.style.cssText = `
      display: block; width: 18px; height: 18px; border-radius: 50%;
      border: 2px solid rgba(255, 200, 80, 0.5); transition: all 0.25s;`;
    slotsRow.appendChild(slot);
    slots.push(slot);
  }

  document.body.appendChild(hud);

  const update = (count) => {
    title.textContent = `Chaves coletadas: ${count}/${TOTAL_KEYS}`;
    slots.forEach((slot, i) => {
      const filled = i < count;
      slot.style.background = filled ? "#ffc83d" : "transparent";
      slot.style.boxShadow = filled
        ? "0 0 10px 3px rgba(255, 170, 30, 0.9)"
        : "none";
    });
  };

  update(0);
  return update;
}

/**
 * Chaves soltas pelos inimigos, coleta por proximidade, HUD e atalho 'K'
 * (dá todas as chaves; apertar de novo restaura as que o jogador tinha).
 */
export function setupKeySystem(scene, camera) {
  const drops = [];

  // Pool fixo de chaves + luzes (uma por chave). Criar/remover luzes ou
  // materiais em tempo de jogo obriga o three.js a recompilar shaders (travada);
  // aqui tudo existe desde o início, "estacionado" abaixo do chão, e os shaders
  // são compilados já nos primeiros quadros.
  const keyMaterial = createKeyMaterial();
  const pool = Array.from({ length: TOTAL_KEYS }, () => {
    const mesh = createKeyMesh(keyMaterial);
    mesh.frustumCulled = false;
    const light = new THREE.PointLight(KEY_COLOR, 0, LIGHT_DISTANCE, 2);
    scene.add(mesh, light);
    const slot = { mesh, light };
    park(slot);
    return slot;
  });

  function park({ mesh, light }) {
    mesh.position.set(0, PARKED_Y, 0);
    light.position.copy(mesh.position);
    light.intensity = 0;
  }

  const renderHud = createHud();

  let collected = 0;
  let cheatActive = false;
  let cheatCount = TOTAL_KEYS;

  const carried = () => (cheatActive ? cheatCount : collected);
  renderHud(0);

  window.addEventListener("keydown", (event) => {
    if (event.repeat || event.key.toLowerCase() !== "k") return;
    cheatActive = !cheatActive;
    cheatCount = TOTAL_KEYS;
    renderHud(carried());
  });

  function dropKey(position) {
    const slot = pool.pop();
    const { mesh, light } = slot;
    mesh.position.copy(position);
    light.intensity = LIGHT_INTENSITY;
    light.position.copy(position);

    drops.push({ slot, mesh, light, baseY: position.y, time: 0 });
  }

  const cameraPosition = new THREE.Vector3();

  function update(delta) {
    camera.getWorldPosition(cameraPosition);

    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      drop.time += delta;
      drop.mesh.position.y = drop.baseY + Math.sin(drop.time * 2.5) * 0.15;
      drop.mesh.rotation.y += delta * 2;
      drop.light.position.copy(drop.mesh.position);
      drop.mesh.material.emissiveIntensity =
        KEY_EMISSIVE_INTENSITY + Math.sin(drop.time * 4) * 0.4;

      if (drop.mesh.position.distanceTo(cameraPosition) <= PICKUP_DISTANCE) {
        park(drop.slot);
        pool.push(drop.slot);
        drops.splice(i, 1);
        collected = Math.min(collected + 1, TOTAL_KEYS);
        renderHud(carried());
      }
    }
  }

  function takeKey() {
    if (carried() <= 0) return false;
    if (cheatActive) cheatCount -= 1;
    else collected -= 1;
    renderHud(carried());
    return true;
  }

  return { dropKey, update, takeKey, carried };
}
