import { setDefaultMaterial } from "../libs/util/util.js";

export function createCastleMaterials() {
  return {
    matPedra: setDefaultMaterial("rgb(180, 175, 160)"),
    matMadeira: setDefaultMaterial("rgb(70, 40, 20)"),
    matTelhado: setDefaultMaterial("rgb(110, 110, 105)"),
    matGrama: setDefaultMaterial("rgb(85, 140, 50)"),
    matTerra: setDefaultMaterial("rgb(150, 130, 100)"),
  };
}