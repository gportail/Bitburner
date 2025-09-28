import * as cl from "./libs/colors.js";
import * as C from "./libs/constantes.js";
import { logf, log, logFile } from "./libs/logs.js";
// import { clServer } from "./libs/classServer";
import * as DS from "./libs/deepscan.js";
import { calcNbThread, getScriptsRunning } from "./libs/lib.js";
// import { ExecAScript, RunAScript, getScriptsRunning } from "./libs/lib.js";
import { rootServeur, deployFiles } from "./libs/rootServeur.js";

let serveurs = new Array();
export let quiet = false;
let loopNb = 0;
let hackServerWithNoRamTargets = new Array();

const DureeCycle = 15;  // durée d'un cycle en s

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
// function buyPrograms(ns) {
//   RunAScript(ns, quiet, C.ScriptBuyProgram, 1); 
// }

/**
 * root les serveurs et deploie les fichiers.
 */
function doRootServer(ns) {
  DS.sortServersByHackSkill(ns, serveurs);
  for (let target of serveurs) {
    if (!ns.hasRootAccess(target)) {
      if (ns.getServerRequiredHackingLevel(target) <= ns.getPlayer().skills.hacking) {
        logf(ns, "[doRootServer] Lancement du root du serveur %s", [target], quiet);
        if (rootServeur(ns, target, quiet)) {
          logf(ns, "[doRootServer] Lancement du deploiement des fichier sur %s", [target], quiet);
          deployFiles(ns, target, C.DeployScripts, quiet);
        }
      }
    }
  }
}

/**
 * Lance le script de H/G/W sur le serveur cible
 * @param target la cible du hack 
 */
function localHack(ns, target) {
  if (target == "home") return;
  if (target == "darkweb" && !ns.hasTorRouter()) return;
  if (ns.getServerMaxRam(target) == 0) return;  // pas de RAM on ignore
  if (ns.getServerMoneyAvailable(target) == 0) return; // pas de $ on ignore
  if (ns.hasRootAccess(target)) {
    // ns.tprint('target=' + target + '    scripts=' + getScriptsRunning(target, ns));
    if (getScriptsRunning(ns, target).includes(C.ScriptLoopSingleH)) return;  // si le script "ScriptBasic" s'execute, on sort
    logf(ns, "[localHack] Lancement de %s sur le serveur %s", [C.ScriptLoopSingleH, target], quiet);
    ns.killall(target);
    // ExecAScript(ns, quiet, C.ScriptBasic, target, calcNbThread(target, C.ScriptBasic, ns));
    logf(ns, ` ${cl.red}Merci d'executer les commandes suivantes :`, [], false);
    logf(ns, ` ${cl.red}  Se connecter au serveur %s `, [target], false);
    logf(ns, ` ${cl.red}  Lancer la commande : run %s -c %s -t %d`, [C.ScriptLoopSingleH, target, calcNbThread(target, C.ScriptLoopSingleH, ns)], false);
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

  let waitTimer = DureeCycle * 1000;  // temps entre chaque boucle

  while (true) {
    if (loopNb % 2 == 0) {
      log(ns, "Scan des serveurs présents", quiet);
      serveurs = DS.deepscan(ns, 'home');
      DS.sortServersByHackSkill(ns, serveurs);
      // log(ns, serveurs, quiet);
    }
    // if (loopNb % 4 == 0) buyPrograms(ns);  // achat des programmes tous les 4 cycles (60s) // il faut 16Go
    if (loopNb % 3 == 0) doRootServer(ns);     // hack des serveurs et deploiement des scripts tous les 3 cycle (45s)

    for (let target of serveurs) {
      if (target == "darkweb" && !ns.hasTorRouter()) continue;
      if (target == "home") continue;
      if (!ns.hasRootAccess(target)) continue;
      if ((ns.getServerMaxRam(target) > 0) && (ns.getServerMoneyAvailable(target) > 0)) localHack(ns, target);  // le serveur se hack lui meme
    }

    // ns.tprint(' RAM@home = ' + ns.getServerMaxRam('home'));
    if ((ns.getServerMaxRam('home') < 16) && (ns.getServerMoneyAvailable('home') > 1.1e6)) {
      logf(ns, `${cl.red}****************************************`, [], false);
      logf(ns, `${cl.red}Il faut upgrader à 16Go de ram pour HOME`, [], false);
      logf(ns, `${cl.red}****************************************`, [], false);
    }
    if (ns.getServerMaxRam('home') >= 32) {
      logf(ns, `${cl.red}******************************************`, [], false);
      logf(ns, `${cl.red}Il faut lancer le script moniteur_16Go.js `, [], false);
      logf(ns, `${cl.red}******************************************`, [], false);
      break
    }
    if (oneRun) break; // pour debug
    await ns.sleep(waitTimer);
  }

  ns.enableLog('ALL');
  logf(ns, "Fin du script %s", [ns.getScriptName()], quiet);
}
