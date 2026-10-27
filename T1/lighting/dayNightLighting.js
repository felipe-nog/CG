import * as THREE from "three";

const day = {
  background: 0x9bb9d0,
  skyColor: 0xffffff,
  groundColor: 0x4b5546,
  ambientIntensity: 1.15,
  directionalColor: 0xfff1d2,
  directionalIntensity: 2.1,
  position: new THREE.Vector3(55, 110, 45),
};

const night = {
  background: 0x101a32,
  skyColor: 0x7385b4,
  groundColor: 0x182033,
  ambientIntensity: 0.28,
  directionalColor: 0xa9c4ff,
  directionalIntensity: 0.65,
  position: new THREE.Vector3(-55, 95, -45),
};

export function setupDayNightLighting(scene, renderer, shadowCasters = []) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const ambientLight = new THREE.HemisphereLight(
    day.skyColor,
    day.groundColor,
    day.ambientIntensity,
  );
  scene.add(ambientLight);

  // A mesma luz direcional representa o sol de dia e a lua à noite.
  const directionalLight = new THREE.DirectionalLight(
    day.directionalColor,
    day.directionalIntensity,
  );
  directionalLight.position.copy(day.position);
  directionalLight.target.position.set(0, 0, 0);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(2048, 2048);
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 240;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  directionalLight.shadow.camera.updateProjectionMatrix();
  directionalLight.shadow.bias = -0.0002;
  directionalLight.shadow.normalBias = 0.025;
  directionalLight.shadow.radius = 2;
  scene.add(directionalLight, directionalLight.target);

  shadowCasters.forEach((root) => {
    root.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      const isInvisibleHelper = materials.some(
        (material) => material?.transparent && material.opacity === 0,
      );
      if (isInvisibleHelper) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
  });

  let isNight = false;
  const applyLighting = () => {
    const preset = isNight ? night : day;
    scene.background = new THREE.Color(preset.background);
    ambientLight.color.setHex(preset.skyColor);
    ambientLight.groundColor.setHex(preset.groundColor);
    ambientLight.intensity = preset.ambientIntensity;
    directionalLight.color.setHex(preset.directionalColor);
    directionalLight.intensity = preset.directionalIntensity;
    directionalLight.position.copy(preset.position);
    directionalLight.shadow.needsUpdate = true;
  };

  const onKeyDown = (event) => {
    if (event.repeat || event.key.toLowerCase() !== "h") return;
    isNight = !isNight;
    applyLighting();
  };
  window.addEventListener("keydown", onKeyDown);
  applyLighting();

  return {
    toggle: () => {
      isNight = !isNight;
      applyLighting();
    },
    isNight: () => isNight,
    directionalLight,
    ambientLight,
  };
}
