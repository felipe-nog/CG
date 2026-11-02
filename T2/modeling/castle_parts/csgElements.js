import * as THREE from "three";
import { CSG } from "../../libs/other/CSGMesh.js";

/**
 * Cria elementos arquitetônicos avançados utilizando CSG (Constructive Solid Geometry):
 * 1. Pórtico monumental arqueado do portão principal com arco pleno vazado via CSG.
 * 2. Seteiras (Arrow Slits) nos muros perimetrais, com base inferior plana e superior arredondada.
 */
export function buildCSGElements(grupoCastelo, materials) {
  const { matPedra, matPedraEscura } = materials;
  const auxMat = new THREE.Matrix4();

  // =============================================================
  // HELPER: Cortador de Seteira (base plana + topo semicilíndrico)
  // Conforme requisito: base inferior plana e superior arredondada
  // =============================================================
  function createSlitCutter(largura = 1.0, alturaRet = 2.8, profundidade = 6.0) {
    const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(largura, alturaRet, profundidade));
    boxMesh.position.set(0, alturaRet / 2, 0);
    boxMesh.updateMatrix();

    const raioArco = largura / 2;
    const arcoMesh = new THREE.Mesh(new THREE.CylinderGeometry(raioArco, raioArco, profundidade, 16));
    arcoMesh.rotation.x = Math.PI / 2;
    arcoMesh.position.set(0, alturaRet, 0);
    arcoMesh.updateMatrix();

    const boxCSG = CSG.fromMesh(boxMesh);
    const arcoCSG = CSG.fromMesh(arcoMesh);
    return boxCSG.union(arcoCSG);
  }

  // =============================================================
  // 1. PÓRTICO MONUMENTAL DO PORTÃO PRINCIPAL (z = 40)
  // Arco pleno vazado recortado via CSG emoldurando o portão de madeira
  // =============================================================
  const blocoPortico = new THREE.Mesh(new THREE.BoxGeometry(16.5, 18.0, 3.5), matPedra);
  blocoPortico.position.set(0, 9.0, 40.5);
  blocoPortico.updateMatrix();

  // Vão do arco: base reta (largura 8.4, altura 10.5) + topo arredondado (raio 4.2)
  const archBox = new THREE.Mesh(new THREE.BoxGeometry(8.4, 10.5, 5.0));
  archBox.position.set(0, 5.25, 40.5);
  archBox.updateMatrix();

  const archCyl = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 5.0, 24));
  archCyl.rotation.x = Math.PI / 2;
  archCyl.position.set(0, 10.5, 40.5);
  archCyl.updateMatrix();

  let porticoCSG = CSG.fromMesh(blocoPortico)
    .subtract(CSG.fromMesh(archBox))
    .subtract(CSG.fromMesh(archCyl));

  const meshPortico = CSG.toMesh(porticoCSG, auxMat, matPedra);
  meshPortico.castShadow = true;
  meshPortico.receiveShadow = true;
  meshPortico.userData.collisionType = "none";
  grupoCastelo.add(meshPortico);

  // Moldura decorativa no topo do pórtico
  const molduraPortico = new THREE.Mesh(
    new THREE.BoxGeometry(17.2, 0.8, 4.0),
    matPedraEscura || matPedra,
  );
  molduraPortico.position.set(0, 18.2, 40.5);
  molduraPortico.userData.collisionType = "none";
  grupoCastelo.add(molduraPortico);

  // =============================================================
  // 2. SETEIRAS NOS MUROS EXTERNOS VIA CSG
  // Painéis de muralha com seteiras autênticas recortadas via CSG
  // =============================================================

  // 2.1 Seteiras nos Muros Frontais (ladeando o portão, voltadas para o acesso)
  const configsSeteirasFrente = [
    { xCentro: -24, posicoes: [-28, -20] }, // Muro Frente Esquerdo
    { xCentro: 24, posicoes: [20, 28] },   // Muro Frente Direito
  ];

  configsSeteirasFrente.forEach((cfg) => {
    const blocoMuro = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 4.2), matPedra);
    blocoMuro.position.set(cfg.xCentro, 12, 40);
    blocoMuro.updateMatrix();
    let csMuro = CSG.fromMesh(blocoMuro);

    cfg.posicoes.forEach((posX) => {
      const cutter = createSlitCutter(1.1, 3.2, 6.0);
      const cutterMesh = CSG.toMesh(cutter, auxMat);
      cutterMesh.position.set(posX, 11, 40);
      cutterMesh.updateMatrix();
      csMuro = csMuro.subtract(CSG.fromMesh(cutterMesh));
    });

    const meshMuroSeteira = CSG.toMesh(csMuro, auxMat, matPedra);
    meshMuroSeteira.castShadow = true;
    meshMuroSeteira.receiveShadow = true;
    meshMuroSeteira.userData.collisionType = "none";
    grupoCastelo.add(meshMuroSeteira);
  });

  // 2.2 Seteiras no Muro do Fundo (z = -40)
  const blocoFundo = new THREE.Mesh(new THREE.BoxGeometry(40, 12, 4.2), matPedra);
  blocoFundo.position.set(0, 12, -40);
  blocoFundo.updateMatrix();
  let csFundo = CSG.fromMesh(blocoFundo);

  [-18, -10, 10, 18].forEach((posX) => {
    const cutter = createSlitCutter(1.0, 3.0, 6.0);
    const cutterMesh = CSG.toMesh(cutter, auxMat);
    cutterMesh.position.set(posX, 11, -40);
    cutterMesh.updateMatrix();
    csFundo = csFundo.subtract(CSG.fromMesh(cutterMesh));
  });

  const meshFundoSeteira = CSG.toMesh(csFundo, auxMat, matPedra);
  meshFundoSeteira.castShadow = true;
  meshFundoSeteira.receiveShadow = true;
  meshFundoSeteira.userData.collisionType = "none";
  grupoCastelo.add(meshFundoSeteira);
}
