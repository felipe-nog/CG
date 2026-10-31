import * as THREE from "three";

export function buildWallWalkways(grupoCastelo, matPedra) {
  const alturaTopo = 0.1;
  const yAndar = 20.05;

  // Helper para criar segmento de passarela transitável com base de pedra
  function createSegment(larguraX, profundidadeZ, posX, posZ) {
    const topo = new THREE.Mesh(
      new THREE.BoxGeometry(larguraX, alturaTopo, profundidadeZ),
      matPedra,
    );
    topo.position.set(posX, yAndar, posZ);
    topo.userData.collisionType = "walkable";
    grupoCastelo.add(topo);

    // Bloco estrutural de pedra de sustentação embaixo
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(larguraX, 1.0, profundidadeZ),
      matPedra,
    );
    base.position.set(posX, yAndar - 0.55, posZ);
    grupoCastelo.add(base);

    return topo;
  }


  // TORRE CENTRAL DO FUNDO
  // Contorna a torre central pela frente, ligando os dois lados do muro do fundo
  createSegment(14, 3.5, 0, -32.5);
  createSegment(3.5, 6, -6.5, -36.0);
  createSegment(3.5, 6, 6.5, -36.0);

  // CANTO TRASEIRO-DIREITO
  createSegment(7, 69, 32.5, 0);

  // CANTO FRONTAL-DIREITO
  // Conecta Muro Direito ao Muro da Frente Direito contornando a torre
  createSegment(6, 4, 31.0, 40.0);
  createSegment(20, 6, 25.5, 35.0);


  // PORTÃO PRINCIPAL E TORRES DO PORTÃO 
  // Passadiço de guarda suspenso sobre a entrada, ligando Muro Frente Esq ao Muro Frente Dir
  createSegment(36, 13.5, 0, 36.5);
  createSegment(3.5, 6, -17.0, 36.0);
  createSegment(3.5, 6, 17.0, 36.0);

  // Parapeito de proteção com ameias voltado para o pátio interno
  const geomParapeito = new THREE.BoxGeometry(36, 1.2, 0.4);
  const parapeitoPortao = new THREE.Mesh(geomParapeito, matPedra);
  parapeitoPortao.position.set(0, yAndar + 0.6, 29.8);
  grupoCastelo.add(parapeitoPortao);

  // CANTO FRONTAL-ESQUERDO
  // Conecta Muro da Frente Esquerdo ao Muro Esquerdo contornando a torre
  createSegment(20, 6, -28.0, 35.0);
  createSegment(8, 9, -41.0, 15);

  // CORREDOR DE INTEGRAÇÃO DO MURO EM L (Lateral Esquerda)
  // Garante continuidade de trânsito em x = -38 entre z = 0 e z = 20
  createSegment(4, 20, -38.0, 10.0);

  // PLATAFORMAS DE ACESSO ÀS 4 GUARITAS DE CANTO
  // Conectam as passarelas dos muros diretamente aos vãos das portas das torres
  createSegment(5.0, 5.0, -36.0, -36.0);
  createSegment(9.5, 5.0, 33.75, -36.0);
  createSegment(5.0, 5.0, 36.0, 36.0);
  createSegment(5.0, 5.0, -36.0, 36.0);
}
