/**
 * v5/moniteur_16Go.js
 * 
 * Moniteur d'execution a utiliser avec moins de 16 Go de RAM
 */

import * as cl from "./libs/colors.js";
import * as C from "./libs/constantes.js";
import { logf, log, logFile } from "./libs/logs.js";
import * as DS from "./libs/deepscan.js";
import { calcNbThread, getScriptsRunning } from "./libs/lib.js";
import { ExecAScript, RunAScript } from "./libs/lib.js";
import { rootServeur, deployFiles } from "./libs/rootServeur.js";

let serveurs = new Array();
export let quiet = false;
let loopNb = 0;

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
function buyPrograms(ns) {
  RunAScript(ns, quiet, C.ScriptBuyProgram, 1);
}

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
    let Script = '';
    if (ns.getServerSecurityLevel(target) > (ns.getServerMinSecurityLevel(target) * C.secLvlFactor)) 
      Script = C.ScriptSingleW
    else if (ns.getServerMoneyAvailable(target) < (ns.getServerMaxMoney(target) * C.moneyFactor))
      Script = C.ScriptSingleG
    else Script = C.ScriptSingleH;
    if (getScriptsRunning(ns, target).includes(Script)) return; 
    logf(ns, "[localHack] Lancement de %s sur le serveur %s", [Script, target], quiet);
    ns.killall(target);
    ExecAScript(ns, quiet, Script, target, calcNbThread(target, Script, ns), '-c', target);
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
    }
    if (loopNb % 4 == 0) buyPrograms(ns);  // achat des programmes tous les 4 cycles (60s) // il faut 16Go
    if (loopNb % 3 == 0) doRootServer(ns);     // hack des serveurs et deploiement des scripts tous les 3 cycle (45s)

    for (let target of serveurs) {
      if (target == "darkweb" && !ns.hasTorRouter()) continue;
      if (target == "home") continue;
      if (!ns.hasRootAccess(target)) continue;
      if ((ns.getServerMaxRam(target) > 0) && (ns.getServerMoneyAvailable(target) > 0)) localHack(ns, target);  // le serveur se hack lui meme
   }

    if ((ns.getServerMaxRam('home') < 32) && (ns.getServerMoneyAvailable('home') > 3.2e6)) {
      logf(ns, `${cl.red}****************************************`, [], false);
      logf(ns, `${cl.red}Il faut upgrader à 32Go de ram pour HOME`, [], false);
      logf(ns, `${cl.red}****************************************`, [], false);
    }

    if (ns.getServerMaxRam('home') >= 32) {
      logf(ns, `${cl.red}******************************************`, [], false);
      logf(ns, `${cl.red}Il faut lancer le script moniteur_32Go.js `, [], false);
      logf(ns, `${cl.red}******************************************`, [], false);
      ns.spawn(C.Moniteur32Go, { threads: 1, spawnDelay: 500 });

    }
    if (oneRun) break; // pour debug
    await ns.sleep(waitTimer);
  }

  ns.enableLog('ALL');
  logf(ns, "Fin du script %s", [ns.getScriptName()], quiet);
}
