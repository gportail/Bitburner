import { secLvlFactor, moneyFactor } from "libs/constantes.js";
import * as cl from "libs/colors.js";
import { logf, log, logFile } from "libs/logs.js";
import { getServers, sortServersByHackSkill, sortServersByHackChance, sortServersByTotalTime, sortServersByMaxRam, deepscan } from "libs/deepscan3.js";
import { calcNbThread, getScriptsRunning, progsAvailables, isPurchasedByPlayer, ExecAScript, RunAScript } from "libs/lib.js";
import { clServer } from "./libs/classServer";
import { runAndWait } from "./libs/lib";

let serveurs = new Array();
let quiet = false;
let loopNb = 0;
let hackServerWithNoRamTargets = new Array();

const DureeCycle = 15;  // durée d'un cycle en s
const ScriptBuyProgram = 'buy-programs4.js';
const ScriptAutoHack = 'autohack4.js';
const ScriptDeploy = 'deploy4.js';
const ScriptSingleWG = 'single_w_and_g4.js';
const ScriptG = 'loop_g3.js';
const ScriptW = 'loop_w3.js';
const ScriptH = 'loop_h3.js';
const ScriptBasic = 'basic_hack4.js';
const ScriptKillOwned = 'kill-all-scripts-on-owned.js';

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


/**
 * Lance le script de H/G/W sur le serveur cible
 * @param target la cible du hack 
 */
function localHack(ns, target) {
  if (target == "home") return;
  if (ns.getServerMaxRam(target) == 0) return;  // pas de RAM on ignore
  if (ns.getServerMoneyAvailable(target) == 0) return; // pas de $ on ignore
  if (ns.hasRootAccess(target)) {
    if (getScriptsRunning(ns,target).includes(ScriptBasic)) return;
    logf(ns, "[localHack] Lancement de %s sur le serveur %s", [ScriptBasic, target], quiet);
    ns.killall(target);
    ExecAScript(ns, quiet, ScriptBasic, target, calcNbThread(target, ScriptBasic, ns));
  }
}

/**
 * Choisie une cible et lance un script de hack sur {agent} avec la cible
 * @param ns 
 * @param agent Le serveur sur lequel va s'executer le script (0$ et de la ram)
 */
function remoteWG(ns, agent) {
  if (getScriptsRunning(agent, ns).includes(ScriptSingleWG)) return;
  let remoteTargets = serveurs.slice();
  sortServersByHackSkill(ns, remoteTargets);
  // recherche de la meilleur cible : 
  for (let target of remoteTargets) {
    if (target == agent) continue;
    if (!ns.hasRootAccess(target)) continue;
    // choix de la cible: celui qui a MoneyAvailable < minMoney ET SecLevel > minSec
    let minSec = ns.getServerMinSecurityLevel(target) * secLvlFactor;
    let minMoney = ns.getServerMaxMoney(target) * moneyFactor;
    if ((ns.getServerSecurityLevel(target) > minSec) && (ns.getServerMoneyAvailable(target) < minMoney)) {
      log(ns, `Lancement du script ${cl.info}${ScriptSingleWG}${cl.reset} sur le serveur ${cl.info}${agent}${cl.reset} avec ${cl.info}${target}${cl.reset} comme cible`, quiet);
      ExecAScript(ns, quiet, ScriptSingleWG, agent, calcNbThread(agent, ScriptSingleWG, ns), '-c', target, '-m', minMoney, '-s', minSec);
    }
  }
}

/**
 * Recherche les serveurs avec de la RAM mais pas de $
 * @param {NS} ns 
 * @returns {Array} Liste des serveur avec de la RAM et pas de $
 */
function searchServerWithRamNoMoney(ns) {
  let res = [];
  for (let srv of serveurs) {
    if (srv == 'home') continue;
    if (srv == 'darkweb') continue;
    if (ns.getServerMaxMoney(srv) > 0) continue;
    if (ns.getServerMaxRam(srv) == 0) continue;
    res.push(srv);
  }
  return res;
}

/**
 * Traite un serveur sans RAM mais avec des $. 
 * Calcul le nombre de thread necessaire pour compenser les pertes de sécurité et pour hack 20% (1 - moneyFactor) du MaxMoney
 * @param {NS} ns 
 * @param {String} target Le serveur cible
 */
function hackServerWithNoRam(ns, target) {
  target = new clServer(ns, target);
  if (!target.RootAcces) return;
  if (target.MaxMoney == 0) return;
  if (target.MaxRam > 0) return;

  if (hackServerWithNoRamTargets.includes(target.name)) return;
  hackServerWithNoRamTargets.push(target.name);
  logf(ns, "[hackServerWithNoRam] Target = %s", [target.name], quiet);

  let growThread = target.calcNbGrowThread(target.MaxMoney);
  let hackThread = target.calcNbHackThreadPercent(1 - moneyFactor);
  let secLvlGrow = target.calcSecLvlOnGrow(growThread);
  let secLvlHack = target.calcSecLvlOnHack(hackThread);
  let weakenThread = target.calcThreadToWeaken(secLvlHack + secLvlGrow);
  let ScriptThread = Math.max(growThread, hackThread, weakenThread);  // nombre de thread de script
  let memScript = ns.getScriptRam(ScriptBasic);
  // recherche d'un ou plusieurs serveur pour executer le script : serveur avec de la RAM mais pas de $
  let agents = searchServerWithRamNoMoney(ns);
  // lancement du script sur le serveur cible
  for (let agt of agents) {
    if (ScriptThread <= 0) break;
    agt = new clServer(ns, agt);
    if (agt.FreeRam > memScript) {
      let th = Math.min(agt.nbThread(ScriptBasic), ScriptThread);
      if (th > 0) {
        logf(ns, "[hackServerWithNoRam] Target = %s   Agent = %s    Threads = %d", [target.name, agt.name, th], quiet);
        ExecAScript(ns, quiet, ScriptBasic, agt.name, th, '-c', target.name);
        ScriptThread -= th;
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

  // log(ns, "Scan des serveurs présents", quiet);
  // serveurs = deepscan(ns, 'home');
  // sortServersByHackSkill(ns, serveurs);

  let waitTimer = DureeCycle * 1000;  // temps entre chaque boucle

  await runAndWait(ns, ScriptKillOwned);

  while (true) {
    if (loopNb % 2 == 0) {
      // log(ns, "Scan des serveurs présents", quiet);
      serveurs = deepscan(ns, 'home');
      sortServersByHackSkill(ns, serveurs);
    }
    if (loopNb % 4 == 0) buyPrograms(ns);  // achat des pogrammes tous les 4 cycles (60s)
    if (loopNb % 3 == 0) autoHack(ns);     // hack des serveurs et deploiement des scripts tous les 3 cycle (45s)

    for (let target of serveurs) {
      if (target == "darkweb" && !ns.hasTorRouter()) continue;
      if (target == "home") continue;
      if (!ns.hasRootAccess(target)) continue;
      if ((ns.getServerMaxRam(target) > 0) && (ns.getServerMoneyAvailable(target) > 0)) localHack(ns, target);  // le serveur se hack lui meme

      // TODO : faire l'inverse : quand un serveur est en dehors des criteres pour être hack alors chercher un serveur sans $ pour le W&G 
      // if ((ns.getServerMaxRam(target) > 0) && (ns.getServerMoneyAvailable(target) == 0)) remoteWG(ns, target); // le serveur a de la ram mais pas de $ => on hack un autre serveur
      if ((ns.getServerMaxRam(target) == 0) && (ns.getServerMoneyAvailable(target) > 0)) hackServerWithNoRam(ns, target);
    }

    // remoteWG(ns, 'home');

    if (oneRun) break; // pour debug
    await ns.sleep(waitTimer);
  }

  ns.enableLog('ALL');
  logf(ns, "Fin du script %s", [ns.getScriptName()], quiet);
}
