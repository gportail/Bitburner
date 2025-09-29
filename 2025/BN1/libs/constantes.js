/**
 * Les constantes
 */

export const moneyFactor = 0.8;  // seuil de 80% du max money pour commencer a hack le serveur
export const secLvlFactor = 1.15; // seuil du niveau de securite de +25% à partir duquel on considere le hack possible
export const secLvlTolerance = 0.05;  // tolerance sur le 
export const ScriptBuyProgram = 'BN1/buy-programs.js';
// export const ScriptAutoHack = 'autohack.js';
export const ScriptDeploySingle = 'BN1/deploy_single.js';
// export const ScriptSingleWG = 'single_w_and_g4.js';
// export const ScriptG = 'loop_g3.js';
// export const ScriptW = 'loop_w3.js';
// export const ScriptH = 'loop_h3.js';
export const ScriptSingleW = 'BN1/singleW.js';
export const ScriptSingleG = 'BN1/singleG.js';
export const ScriptSingleH = 'BN1/singleH.js';

export const ScriptShare = 'BN1/shareRam.js';
export const ScriptRunShare = 'BN1/run_share.js';


export const ScriptLoopSingleW = 'BN1/loop_singleW.js';
export const ScriptLoopSingleG = 'BN1/loop_singleG.js';
export const ScriptLoopSingleH = 'BN1/loop_singleH.js';

export const ScriptBasic = 'BN1/basic_hack.js';
// export const ScriptKillOwned = 'kill-all-scripts-on-owned.js';
export const DeployScripts = ['./basic_hack.js', './libs/constantes.js', "./libs/colors.js", "./libs/logs.js", "./singleW.js", 
  "./singleG.js", "./singleH.js", "./loop_singleW.js", "./loop_singleG.js", "./loop_singleH.js"];
export const Moniteur32Go = 'BN1/moniteur_32Go.js';
