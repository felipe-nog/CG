import * as THREE from "three";

export function buildWallStairs(grupo, matPedra) {
  const grupoEscada = new THREE.Group();

  const profundidade = 0.8;
  for (let i = 0; i < 40; i++) {
    const alturaDegrau = (i + 1) * 0.5;
    const degrau = new THREE.Mesh(new THREE.BoxGeometry(6, alturaDegrau, profundidade), matPedra);
    degrau.position.set(-33, alturaDegrau / 2, 20 - (i * profundidade));
    degrau.userData.collisionType = "walkable";
    degrau.userData.isStairStep = true;

    grupoEscada.add(degrau);
  }

  const rampaMuro = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.1, 32),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  rampaMuro.position.set(-33, 0.25, 4.4);
  rampaMuro.userData.collisionType = "ramp";
  rampaMuro.userData.ramp = {
    bottom: new THREE.Vector3(-33, 0.5, 20),
    top: new THREE.Vector3(-33, 20, -11.2),
  };
  grupoEscada.add(rampaMuro);

  const profPonte = 26.4;
  const posZ_Ponte = -11.6 - (profPonte / 2);
  const ponteAcesso = new THREE.BoxGeometry(6, 1, profPonte);
  const ponte = new THREE.Mesh(ponteAcesso, matPedra);

  ponte.position.set(-33, 19.5, posZ_Ponte);
  ponte.userData.collisionType = "walkable";
  grupoEscada.add(ponte);

  grupo.add(grupoEscada);
}