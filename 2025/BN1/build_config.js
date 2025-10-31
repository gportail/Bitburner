/*
Construction d'un fichier de configuration JSON en fonction de ce qui est disponible
*/
import * as C from "./libs/constantes.js";
import { config, saveConfig } from "./libs/config.js";

// let config = {};

function checkBitNode(ns, bn) {
  const info = ns.getResetInfo();
  let curNode = info.currentNode;
  let BN = info.ownedSF.get(bn);
  if ((curNode == bn) || (BN != undefined)) {
    return true;
  }
  return false;
}

function checkSingularityAPI(ns) {
  return checkBitNode(ns, 4);
}

/** @param {NS} ns */
export async function main(ns) {

  config.moneyFactor = C.moneyFactor;
  config.secLvlFactor = C.secLvlFactor;
  config.secLvlTolerance = C.secLvlTolerance;
  config.ScriptBuyProgram = C.ScriptBuyProgram;
  config.ScriptDeploySingle = C.ScriptDeploySingle;
  config.ScriptSingleW = C.ScriptSingleW;
  config.ScriptSingleG = C.ScriptSingleG;
  config.ScriptSingleH = C.ScriptSingleH;
  config.ScriptShare = C.ScriptShare;
  config.ScriptRunShare = C.ScriptRunShare;
  config.ScriptRunShareOnOwned = C.ScriptRunShareOnOwned;
  config.ScriptLoopSingleW = C.ScriptLoopSingleW;
  config.ScriptLoopSingleG = C.ScriptLoopSingleG;
  config.ScriptLoopSingleH = C.ScriptLoopSingleH;
  config.ScriptBasic = C.ScriptBasic;
  config.DeployScripts = C.DeployScripts;
  config.Moniteur32Go = C.Moniteur32Go;
  config.ScriptBackdoor = C.ScriptBackdoor;
  config.logStatPort = C.logStatPort;
  config.logStatFile = C.logStatFile;
  config.logListenPorts = C.logListenPorts;

  let singularity = checkSingularityAPI(ns);
  if (singularity) {
    config.ScriptBuyProgram = C.ScriptBuyProgramSing;
    config.ScriptBackdoor = C.ScriptBackdoorSing;
  }
  saveConfig(ns)
} 