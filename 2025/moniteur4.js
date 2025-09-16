import { secLvlFactor, moneyFactor } from "libs/constantes.js";
import * as cl from "libs/colors.js";
import { logf, log, logFile } from "libs/logs.js";
import { getServers, sortServersByHackSkill, sortServersByHackChance, sortServersByTotalTime, sortServersByMaxRam, deepscan } from "libs/deepscan3.js";
import { calcNbThread, progsAvailables, isPurchasedByPlayer, ExecAScript, RunAScript } from "libs/lib.js";

let serveurs = new Array();
let quiet = false;
let loopNb = 0;

const DureeCycle = 15;  // durée d'un cycle en s
const ScriptBuyProgram = 'buy-programs4.js';
const ScriptAutoHack = 'autohack4.js';
const ScriptDeploy = 'deploy4.js';

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.info}Moniteur de tous les processus.`);
  ns.tprintf('options :');
  ns.tprintf('  -h    : aide');
  ns.tprintf('  -q    : execution silencieuse');
  ns.exit();
}

/**
 * Lance le script d'achat des programmes
 */
function buyPrograms(ns) {
  RunAScript(ns, quiet, ScriptBuyProgram), 1;
}

/**
 * Lance autohack/deploy si c'est possible
 */
function autoHack(ns) {
  sortServersByHackSkill(ns, serveurs);
  for (let srv of serveurs) {
    if (ns.getServerRequiredHackingLevel(srv) <= ns.getPlayer().skills.hacking) {
      if (!ns.hasRootAccess(srv)) {
        // il y a au moins 1 serveur non rooté
        logf(ns, "[tryAutoHack] Lancement de %s", [ScriptAutoHack], quiet);
        RunAScript(ns, quiet, ScriptAutoHack, 1);
        logf(ns, "[tryAutoHack] Lancement de %s", [ScriptDeploy], quiet);
        RunAScript(ns, quiet, ScriptDeploy, 1);
        break;
      }
    }
  }
}


/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['q', false], //execution silencieuse
    ['1', false], //un seul run (debug)
  ]);

  if (params['h']) {
    help(ns);
  }

  quiet = params['q'];
  let oneRun = params['1'];


  logf(ns, "Debut du script %s", [ns.getScriptName()], quiet);
  ns.disableLog('ALL');

  log(ns, "Scan des serveurs présents", quiet);
  serveurs = deepscan(ns, 'home');
  sortServersByHackSkill(ns, serveurs);

  let waitTimer = DureeCycle * 1000;  // temps entre chaque boucle

  while(true){
    if (loopNb % 4 == 0) buyPrograms(ns);  // achat des pogrammes tous les 4 cycles (60s)
    if (loopNb % 3 == 0) autoHack(ns);     // hack des serveurs et deploiement des scripts tous les 3 cycle (45s)

    if (oneRun) break; // pour debug
    await ns.sleep(waitTimer);
  } 

  ns.enableLog('ALL');
  logf(ns, "Fin du script %s", [ns.getScriptName()], quiet);
}
