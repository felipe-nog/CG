import * as THREE from "three";

/** Adiciona a escotilha circular e os quatro pedestais ao pátio interno. */
export function buildInteriorPortal(grupoCastelo, materials) {
  const { matPedra, matTelhado } = materials;
  const grupoPortal = new THREE.Group();
  const centro = new THREE.Vector3(0, 0, 10);

  // A escotilha fica nivelada com o piso do castelo (y = 0.1).
  // RingGeometry é criada no plano XY; a rotação a deixa horizontal no XZ.
  const aro = new THREE.Mesh(
    new THREE.RingGeometry(3.7, 4.5, 48),
    matPedra,
  );
  aro.rotation.x = -Math.PI / 2;
  aro.position.set(centro.x, 0.16, centro.z);
  aro.userData.collisionType = "walkable";
  grupoPortal.add(aro);

  const escotilha = new THREE.Mesh(
    new THREE.CylinderGeometry(3.68, 3.68, 0.18, 48),
    matTelhado,
  );
  escotilha.position.set(centro.x, 0.12, centro.z);
  escotilha.userData.collisionType = "walkable";
  grupoPortal.add(escotilha);

  // Frisos radiais discretos dividem visualmente a tampa em placas.
  const friso = new THREE.BoxGeometry(0.08, 0.025, 7.1);
  for (const angulo of [0, Math.PI / 2]) {
    const placa = new THREE.Mesh(friso, matPedra);
    placa.position.set(centro.x, 0.222, centro.z);
    placa.rotation.y = angulo;
    placa.userData.collisionType = "walkable";
    grupoPortal.add(placa);
  }

  // Quatro pedestais igualmente espaçados em volta da escotilha.
  const posicoes = [
    [-8, 0],
    [8, 0],
    [0, -8],
    [0, 8],
  ];

  for (const [x, z] of posicoes) {
    const pedestal = new THREE.Group();
    pedestal.position.set(centro.x + x, 0.1, centro.z + z);

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.28, 2.4), matPedra);
    base.position.y = 0.14;
    pedestal.add(base);

    const fuste = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.55, 1.35), matPedra);
    fuste.position.y = 0.555;
    pedestal.add(fuste);

    const capitel = new THREE.Mesh(new THREE.BoxGeometry(2, 0.25, 2), matPedra);
    capitel.position.y = 0.955;
    pedestal.add(capitel);

    const apoio = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 1.5), matPedra);
    apoio.position.y = 1.14;
    pedestal.add(apoio);

    grupoPortal.add(pedestal);
  }

  grupoCastelo.add(grupoPortal);
  return grupoPortal;
}
