import * as THREE from "three";

export function buildExternalAccess(grupoCastelo, materials) {
  const { matPedra, matGrama, matAreia } = materials;
  const grupoAcesso = new THREE.Group();

  const geomTransicao = new THREE.BoxGeometry(10.0, 0.3, 4.0);
  const rampaTransicao = new THREE.Mesh(geomTransicao, matPedra);
  rampaTransicao.position.set(0, 0.15, 42.0);
  rampaTransicao.userData.collisionType = "walkable";
  grupoAcesso.add(rampaTransicao);

  // Duas camadas com alturas diferentes para evitar Z-fighting:
  // - Areia (base mais larga, y = 0.25)
  // - Verde / Grama (trilha central mais alta, y = 0.38)
  const extComp = 52.0; // Comprimento do trecho reto
  const zCentro = 70.0; // Posição central em Z (de 44 a 96)
  const yAreia = 0.25;
  const yGrama = 0.38;

  // Camada Inferior: Margem de Areia
  const geomAreia = new THREE.BoxGeometry(14.0, 0.25, extComp);
  const pistaAreia = new THREE.Mesh(geomAreia, matAreia);
  pistaAreia.position.set(0, yAreia / 2, zCentro);
  pistaAreia.userData.collisionType = "walkable";
  grupoAcesso.add(pistaAreia);

  // Camada Superior: Trilha Central Verde (0.13 mais alta que a areia)
  const geomGrama = new THREE.BoxGeometry(8.0, 0.13, extComp);
  const pistaGrama = new THREE.Mesh(geomGrama, matGrama);
  pistaGrama.position.set(0, yAreia + 0.13 / 2, zCentro);
  pistaGrama.userData.collisionType = "walkable";
  grupoAcesso.add(pistaGrama);

  // Platô circular (mudar pra octógono) externo cercado por água, com base de areia e topo verde
  const zMirante = 106.0;
  const raioAreia = 11.0;
  const raioGrama = 7.5;

  // Base circular de areia da ilhota
  const baseIlhaAreia = new THREE.Mesh(
    new THREE.CylinderGeometry(raioAreia, raioAreia, 0.25, 32),
    matAreia,
  );
  baseIlhaAreia.position.set(0, yAreia / 2, zMirante);
  baseIlhaAreia.userData.collisionType = "walkable";
  grupoAcesso.add(baseIlhaAreia);

  // Topo circular verde da ilhota
  const topoIlhaGrama = new THREE.Mesh(
    new THREE.CylinderGeometry(raioGrama, raioGrama, 0.13, 32),
    matGrama,
  );
  topoIlhaGrama.position.set(0, yAreia + 0.13 / 2, zMirante);
  topoIlhaGrama.userData.collisionType = "walkable";
  grupoAcesso.add(topoIlhaGrama);

  grupoCastelo.add(grupoAcesso);
}
