import * as THREE from "three";

export function buildExternalAccess(grupoCastelo, materials) {
  const { matPedra, matPedraEscura, matGrama, matAreia } = materials;
  const grupoAcesso = new THREE.Group();

  const yBaseSubmersa = -0.24;
  const hBaseSubmersa = 0.92;
  const yTrilha = 0.24;
  const hTrilha = 0.12;
  const yGrama = 0.23;
  const hGrama = 0.10;
  const larguraTrilha = 4.6;

  // Conecta o piso interno ao início da passarela
  const soleira = new THREE.Mesh(
    new THREE.BoxGeometry(8.4, 0.25, 2.5),
    matPedra,
  );
  soleira.position.set(0, 0.16, 40.75);
  soleira.castShadow = true;
  soleira.receiveShadow = true;
  soleira.userData.collisionType = "walkable";
  grupoAcesso.add(soleira);

  // RETÂNGULO PONTE QUE LEVA À PORTA DO CASTELO
  const zPonte1 = 50.0;
  const compPonte1 = 16.0;
  const largPonte = 6.0;

  // Fundação submersa de alvenaria
  const basePonte1 = new THREE.Mesh(
    new THREE.BoxGeometry(largPonte, hBaseSubmersa, compPonte1),
    matPedraEscura,
  );
  basePonte1.position.set(0, yBaseSubmersa, zPonte1);
  basePonte1.castShadow = true;
  basePonte1.receiveShadow = true;
  basePonte1.userData.collisionType = "walkable";
  grupoAcesso.add(basePonte1);

  // Trilha central de areia
  const trilhaPonte1 = new THREE.Mesh(
    new THREE.BoxGeometry(larguraTrilha, hTrilha, compPonte1),
    matAreia,
  );
  trilhaPonte1.position.set(0, yTrilha, zPonte1);
  trilhaPonte1.castShadow = true;
  trilhaPonte1.receiveShadow = true;
  trilhaPonte1.userData.collisionType = "walkable";
  grupoAcesso.add(trilhaPonte1);

  // RETÂNGULO NO MEIO: PLATAFORMA CENTRAL
  // Possui grama nas duas margens, trilha no meio e a ruína histórica na direita.
  const zMeio = 70.0;
  const compMeio = 34.0;
  const largMeio = 15.5;

  // Fundação submersa de alvenaria
  const baseMeio = new THREE.Mesh(
    new THREE.BoxGeometry(largMeio, hBaseSubmersa, compMeio),
    matPedraEscura,
  );
  baseMeio.position.set(0, yBaseSubmersa, zMeio);
  baseMeio.castShadow = true;
  baseMeio.receiveShadow = true;
  baseMeio.userData.collisionType = "walkable";
  grupoAcesso.add(baseMeio);

  // Degrau na linha d'água
  const saiaMeio = new THREE.Mesh(
    new THREE.BoxGeometry(largMeio + 0.8, 0.35, compMeio + 0.8),
    matPedraEscura,
  );
  saiaMeio.position.set(0, -0.5, zMeio);
  saiaMeio.receiveShadow = true;
  grupoAcesso.add(saiaMeio);

  // Trilha central de areia (continuação em linha reta)
  const trilhaMeio = new THREE.Mesh(
    new THREE.BoxGeometry(larguraTrilha, hTrilha, compMeio),
    matAreia,
  );
  trilhaMeio.position.set(0, yTrilha, zMeio);
  trilhaMeio.castShadow = true;
  trilhaMeio.receiveShadow = true;
  trilhaMeio.userData.collisionType = "walkable";
  grupoAcesso.add(trilhaMeio);

  // Faixa de grama do lado esquerdo da trilha
  const gramaMeioEsq = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, hGrama, compMeio - 0.6),
    matGrama,
  );
  gramaMeioEsq.position.set(-4.95, yGrama, zMeio);
  gramaMeioEsq.castShadow = true;
  gramaMeioEsq.receiveShadow = true;
  gramaMeioEsq.userData.collisionType = "walkable";
  grupoAcesso.add(gramaMeioEsq);

  // Faixa de grama do lado direito da trilha
  const gramaMeioDir = new THREE.Mesh(
    new THREE.BoxGeometry(5.0, hGrama, compMeio - 0.6),
    matGrama,
  );
  gramaMeioDir.position.set(4.95, yGrama, zMeio);
  gramaMeioDir.castShadow = true;
  gramaMeioDir.receiveShadow = true;
  gramaMeioDir.userData.collisionType = "walkable";
  grupoAcesso.add(gramaMeioDir);

  // Bordas externas de pedra em volta da ilha central
  const bordaMeioEsq = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.14, compMeio),
    matPedra,
  );
  bordaMeioEsq.position.set(-7.5, 0.24, zMeio);
  grupoAcesso.add(bordaMeioEsq);

  const bordaMeioDir = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.14, compMeio),
    matPedra,
  );
  bordaMeioDir.position.set(7.5, 0.24, zMeio);
  grupoAcesso.add(bordaMeioDir);

  // Ruína histórica do barbacã sobre a grama direita (retângulo + meia esfera)
  buildBarbicanRuin(grupoAcesso, matPedra, matPedraEscura, 5.0, zMeio);

  // RETÂNGULO PONTE QUE LEVA AO OCTÓGONO
  const zPonte2 = 88.5;
  const compPonte2 = 13.0;

  // Fundação submersa de alvenaria
  const basePonte2 = new THREE.Mesh(
    new THREE.BoxGeometry(largPonte, hBaseSubmersa, compPonte2),
    matPedraEscura,
  );
  basePonte2.position.set(0, yBaseSubmersa, zPonte2);
  basePonte2.castShadow = true;
  basePonte2.receiveShadow = true;
  basePonte2.userData.collisionType = "walkable";
  grupoAcesso.add(basePonte2);

  // Trilha central de areia
  const trilhaPonte2 = new THREE.Mesh(
    new THREE.BoxGeometry(larguraTrilha, hTrilha, compPonte2),
    matAreia,
  );
  trilhaPonte2.position.set(0, yTrilha, zPonte2);
  trilhaPonte2.castShadow = true;
  trilhaPonte2.receiveShadow = true;
  trilhaPonte2.userData.collisionType = "walkable";
  grupoAcesso.add(trilhaPonte2);

  // PLATÔ OCTOGONAL EXTERNO
  const zOctogono = 106.0;
  const raioOctogono = 11.907;
  const compTrilhaOctogono = 22.0;

  // Fundação submersa octogonal de pedra
  const geomBaseOctogono = new THREE.CylinderGeometry(
    raioOctogono,
    raioOctogono,
    hBaseSubmersa,
    8,
  );
  geomBaseOctogono.rotateY(Math.PI / 8);
  const baseOctogono = new THREE.Mesh(geomBaseOctogono, matPedraEscura);
  baseOctogono.position.set(0, yBaseSubmersa, zOctogono);
  baseOctogono.castShadow = true;
  baseOctogono.receiveShadow = true;
  baseOctogono.userData.collisionType = "walkable";
  grupoAcesso.add(baseOctogono);

  // Saia inferior alargada na água (detalhe arquitetônico do mirante)
  const geomSaiaOctogono = new THREE.CylinderGeometry(
    raioOctogono + 0.6,
    raioOctogono + 0.6,
    0.35,
    8,
  );
  geomSaiaOctogono.rotateY(Math.PI / 8);
  const saiaOctogono = new THREE.Mesh(geomSaiaOctogono, matPedraEscura);
  saiaOctogono.position.set(0, -0.5, zOctogono);
  saiaOctogono.receiveShadow = true;
  grupoAcesso.add(saiaOctogono);

  // Superfície de grama octogonal
  const geomTopoGrama = new THREE.CylinderGeometry(
    raioOctogono - 0.5,
    raioOctogono - 0.5,
    hGrama,
    8,
  );
  geomTopoGrama.rotateY(Math.PI / 8);
  const topoOctogonoGrama = new THREE.Mesh(geomTopoGrama, matGrama);
  topoOctogonoGrama.position.set(0, yGrama, zOctogono);
  topoOctogonoGrama.castShadow = true;
  topoOctogonoGrama.receiveShadow = true;
  topoOctogonoGrama.userData.collisionType = "walkable";
  grupoAcesso.add(topoOctogonoGrama);

  // Trilha central de areia atravessando todo o octógono
  const trilhaOctogono = new THREE.Mesh(
    new THREE.BoxGeometry(larguraTrilha, hTrilha, compTrilhaOctogono),
    matAreia,
  );
  trilhaOctogono.position.set(0, yTrilha, zOctogono);
  trilhaOctogono.castShadow = true;
  trilhaOctogono.receiveShadow = true;
  trilhaOctogono.userData.collisionType = "walkable";
  grupoAcesso.add(trilhaOctogono);

  // Vestígio de alvenaria na extremidade final da trilha do octógono
  const restoPontaOctogono = new THREE.Mesh(
    new THREE.BoxGeometry(larguraTrilha + 0.4, 0.16, 0.8),
    matPedra,
  );
  restoPontaOctogono.position.set(0, 0.26, zOctogono + 10.6);
  restoPontaOctogono.castShadow = true;
  restoPontaOctogono.receiveShadow = true;
  grupoAcesso.add(restoPontaOctogono);

  grupoCastelo.add(grupoAcesso);
}

function buildBarbicanRuin(grupo, matPedra, matPedraEscura, posX, posZ) {
  const largX = 1.6;
  const altRet = 4.5;
  const compZ = 5.0;
  const raioEsfera = compZ / 2;

  const grupoRuina = new THREE.Group();
  grupoRuina.position.set(posX, 0.25, posZ);

  // Retângulo da base
  const retangulo = new THREE.Mesh(
    new THREE.BoxGeometry(largX, altRet, compZ),
    matPedra,
  );
  retangulo.position.set(0, altRet / 2, 0);
  retangulo.castShadow = true;
  retangulo.receiveShadow = true;
  grupoRuina.add(retangulo);

  // Metade de uma esfera em cima do retângulo
  const geomEsfera = new THREE.SphereGeometry(raioEsfera, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const esfera = new THREE.Mesh(geomEsfera, matPedra);
  esfera.position.set(0, altRet, 0);
  esfera.scale.set(largX / compZ, 1, 1);
  esfera.castShadow = true;
  esfera.receiveShadow = true;
  grupoRuina.add(esfera);

  grupo.add(grupoRuina);
}
