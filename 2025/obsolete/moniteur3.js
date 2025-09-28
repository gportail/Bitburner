import { secLvlFactor, moneyFactor } from "libs/constantes.js";
import * as cl from "libs/colors.js";
import { logf, log, logFile } from "libs/logs.js";
import { getServers, sortServersByHackSkill, sortServersByHackChance, sortServersByTotalTime, sortServersByMaxRam, deepscan } from "libs/deepscan3.js";
import { calcNbThread, progsAvailables, isPurchasedByPlayer, ExecAScript, RunAScript } from "libs/lib.js";

let serveurs = new Array();
let quiet = false;
let loopNb = 0;

const ScriptBuyProgram = 'buy-programs3.js';
const ScriptDeploy = 'deploy3.js';
const ScriptAutoHack = 'autohack3.js';
const ScriptG = 'loop_g3.js';
const ScriptW = 'loop_w3.js';
const ScriptHack = 'loop_h3.js';
const ScriptBasicHack = 'basic_hack3.js';

const ScriptSimpleG = 'simple_g3.js';
const ScriptSimpleW = 'simple_w3.js';
const ScriptSimpleH = 'simple_h3.js';

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

function countRootedServeurs(ns) {
  let count = 0;
  for (let s of serveurs) {
    if (ns.hasRootAccess(s)) count++;
  }
  return count;
}

function calcMaxThread(ns, script, host) {
  return Math.floor(ns.getServerMaxRam(host) / ns.getScriptRam(script, host));
}

function calcAvailableThread(ns, script, host) {
  return Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script, host));
}


/**
 * Fonction d'attente en fonction du nombre de serveurs rooté
 */
async function wait(ns) {
  let countRS = countRootedServeurs(ns);
  let waitTime = 0;
  if (countRS <= 25)
    waitTime = 30 * 1000;
  else if (countRS > 25 && countRS <= 50)
    waitTime = 45 * 1000;
  else
    waitTime = 60 * 1000;
  await ns.sleep(waitTime);
  return waitTime;
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
 * Lance g.js/w.js/basic_hack.js sur les serveurs root ayant de l'argent et de la ram
 */
function selfHack(ns) {
  for (let srv of serveurs) {
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (srv == "home") continue;
    if (ns.getServerMaxRam(srv) == 0) continue;  // pas de RAM on ignore
    if (ns.getServerMoneyAvailable(srv) == 0) continue; // pas de $ on ignore
    if (ns.hasRootAccess(srv)) {
      var minSec = ns.getServerMinSecurityLevel(srv) * secLvlFactor;
      var minMoney = ns.getServerMaxMoney(srv) * moneyFactor;

      // si le script 'basic_hack.js' est lancé c'est que g.js et w.js sont deja passe
      var th = calcNbThread(srv, ScriptHack, ns);
      if (ns.isRunning(ScriptHack, srv)) {
        logf(ns, "[selfHack] Le script %s en cour sur %s", [ScriptHack, srv], quiet);
        continue;
      }

      // si w.js ne tourne pas et que c'est les condition pour le faire tourner alors on le lance
      if (ns.getServerSecurityLevel(srv) > minSec) { // si on doit diminuer le niveau de securité
        if (ns.isRunning(ScriptW, srv) == false) {  // si le script w.js ne tourne pas
          logf(ns, "[selfHack] Lancement de %s sur le serveur %s", [ScriptW, srv], quiet);
          ns.killall(srv);
          ExecAScript(ns, quiet, ScriptW, srv, calcNbThread(srv, ScriptW, ns));
        }
        continue;
      }

      // si g.js ne tourne pas et que c'est les condition pour le faire tourner alors on le lance
      if (ns.getServerMoneyAvailable(srv) < minMoney) {  // si l'$ dispo n'est pas au minimum requis
        if (ns.isRunning(ScriptG, srv) == false) {  // si le script g.js ne tourne pas
          logf(ns, "[selfHack] Lancement de %s sur le serveur %s", [ScriptG, srv], quiet);
          ns.killall(srv);
          ExecAScript(ns, quiet, ScriptG, srv, calcNbThread(srv, ScriptG, ns));
        }
        continue;
      }
      // si on peut, on lance les hacks
      if (ns.getServerMoneyAvailable(srv) > minMoney && ns.getServerSecurityLevel(srv) < minSec) {
        if (ns.isRunning(ScriptG, srv) == false) {
          logf(ns, "[selfHack] Lancement de %s sur le serveur %s", [ScriptHack, srv], quiet);
          ns.killall(srv);
          ExecAScript(ns, quiet, ScriptHack, srv, calcNbThread(srv, ScriptHack, ns));
        }
      }
    }
  }
}

/**
 * Durée d'un cicle H+G+W en seconde
 */
function getFullDuration(ns, srv) {
  return Math.ceil((ns.getHackTime(srv) + ns.getGrowTime(srv) + ns.getWeakenTime(srv)) / 1000);
}

/**
 * Calcul du nombre de thread optimum pour WEAKEN
 * @param host: string le serveur qui va executer le script
 * @param target: string Le serveur cible du scipt de weaken
 * @return 0 si impossible d'executer le script
 */
function calcWeakenThread(ns, host, target) {
  // WEAKEN
  let th = 0;
  let minSec = ns.getServerMinSecurityLevel(target) * secLvlFactor;
  if ((ns.getServerSecurityLevel(target) > minSec) && (ns.hackAnalyzeChance(target) < 1)) { // prise en compte de la chance de hack
    th = calcMaxThread(ns, ScriptSimpleW, host);  // nombre max de thread (limité par la RAM de l'hote)
  }
  return th;
}
/**
 * Calcul du nombre de thread optimum pour GROW
 * @param host: string le serveur qui va executer le script
 * @param target: string Le serveur cible du scipt de weaken
 * @return 0 si impossible d'executer le script
 */
function calcGrowThread(ns, host, target) {
  let th = 0;
  if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
    let maxTh = calcMaxThread(ns, ScriptSimpleG, host);  // nombre max de thread (limité par la RAM de l'hote')
    // calcul du nb de thread pour atteindre la max de $
    let mult = ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target); // il faut multiplier $ dispo par ce nombre pour avoir max$
    if (ns.getServerMoneyAvailable(target) > 1000) {
      let multTh = Math.ceil(ns.growthAnalyze(target, mult));  // nombre de thread pour multiplier les $ par mult
      th = Math.min(multTh, maxTh);  // nombre de thread possible
    } else { th = maxTh };
  }
  return th;
}

/**
 * Calcul du nombre de thread optimum pour HACK
 * @param host: string le serveur qui va executer le script
 * @param target: string Le serveur cible du scipt de weaken
 * @return 0 si impossible d'executer le script
 */
function calcHackThread(ns, host, target) {
  let th = 0;
  let minSec = ns.getServerMinSecurityLevel(target) * secLvlFactor;
  let minMoney = ns.getServerMaxMoney(target) * moneyFactor;

  if ((ns.getServerMoneyAvailable(target) > minMoney) && ((ns.getServerSecurityLevel(target) < minSec) || (ns.hackAnalyzeChance(target) == 1))) {
    // if ((ns.getServerMoneyAvailable(target) > minMoney) && (ns.hackAnalyzeChance(target) >= 0.95)) {
    let maxTh = calcMaxThread(ns, ScriptSimpleH, host);  // nombre max de thread (limité par la RAM de la cible)
    // calcul du nombre de thread pour prendre maximum 25% du max$ et rester au dessus du minSec
    let moneyStolen = ns.getServerMaxMoney(target) * (1 - moneyFactor); // $ a voler
    let hackThread = Math.ceil(ns.hackAnalyzeThreads(target, moneyStolen));    // nombre de thread pour hack moneyStolen
    let hackSecLvl = ns.hackAnalyzeSecurity(hackThread, target);    // augmentation du SecLvl pour hackThread
    while (ns.getServerSecurityLevel(target) + hackSecLvl > minSec) {
      hackThread--;
      hackSecLvl = ns.hackAnalyzeSecurity(hackThread, target);
      if (hackThread == 1) break;
    }
    th = Math.max(hackThread, maxTh);  // nombre de thread possible
  }
  return th;
}

/**
 * Lance les scripts simple_X3 en essayant une optimisation des thread
 */
function simpleHack(ns, host, target) {
  // selection du script
  let scriptToRun = '';
  let th = calcWeakenThread(ns, host, target);
  if (th > 0) scriptToRun = ScriptSimpleW;
  else {
    th = calcHackThread(ns, host, target);
    if (th > 0) scriptToRun = ScriptSimpleH;
    else {
      th = calcGrowThread(ns, host, target);
      if (th > 0) scriptToRun = ScriptSimpleG;
    }
  }

  if (th > 0 && scriptToRun != '') {
    if (!ns.isRunning(scriptToRun, host, '-c', target)) {
      logf(ns, "[simpleHack] Lancement de %s sur le serveur %s avec %s comme cible et %d threads", [scriptToRun, host, target, th], quiet);
      ExecAScript(ns, false, scriptToRun, host, th, '-c', target);
    }
  }
  return;
}

/**
 * Hack d'un serveur depuis lui même, version améliorée.
 */
function hackLocalServer(ns) {
  for (let target of serveurs) {
    if (target == "darkweb" && !ns.hasTorRouter()) continue;
    if (target == "home") continue;
    if (ns.getServerMaxRam(target) == 0) continue;  // pas de RAM on ignore
    if (ns.getServerMoneyAvailable(target) == 0) continue; // pas de $ on ignore
    if (!ns.hasRootAccess(target)) continue;

    simpleHack(ns, target, target);
  }
}

/**
 * Traitement à partir des serveurs qui ont 0$ mais de la ram
 */
function hackRemoteServer(ns) {
  let serversRam = [];  //serveurs avec de la ram mais 0$
  let serversMoney = [];   // serveurs avec 0ram mais des $
  for (let s of serveurs) {
    if (s == "darkweb" && !ns.hasTorRouter()) continue;
    if (s == "home") continue;
    if (ns.getServerMaxMoney(s) > 0 && ns.getServerMaxRam == 0) serversMoney.push(s);
    if (ns.getServerMaxMoney(s) == 0 && ns.getServerMaxRam > 0) serversRam.push(s);
  }
  // 1 - hack des serveurs qui ont des $ mais pas de RAM
  sortServersByTotalTime(ns, serversMoney);  // trie les serveurs $ par temps total d'un cycle temps croissant
  sortServersByMaxRam(ns, serversRam);  // trie les serveurs ram par MaxRam croissant
  serversRam.reverse(); // trie les serveurs ram par MaxRam decroissant
  for (let s of serversMoney) {

  }
  // 2 - amélioration des serveurs les plus interressant
}

/**
 * H/W/G depuis le serveur home
 */
function hackFromHome(ns) {
  sortServersByHackChance(ns, serveurs);
  serveurs.reverse;
  for (let target of serveurs) {
    if (target == "darkweb" && !ns.hasTorRouter()) continue;
    if (target == "home") continue;
    if (!ns.hasRootAccess(target)) continue;
    if (ns.getServerMaxMoney(target) > 0) {
      logf(ns, "[hackFromHome loop n°%d] Lancement de %s sur le serveur %s avec %s comme cible", [loopNb, 'simpleHack', 'home', target], quiet);
      simpleHack(ns, 'home', target);
    }
  }
}
/**
 * Hack les serveurs avec 0Go de RAM
 */
function hackServer0ram(ns) {
  sortServersByHackChance(ns, serveurs);
  serveurs.reverse(); // tri par hachChange décroissant
  // cherche un serveur a 0Go => la cible
  for (let target of serveurs) {
    if (target == "darkweb" && !ns.hasTorRouter()) continue;
    if (target == "home") continue;
    if (!ns.hasRootAccess(target)) continue;
    if (ns.getServerMaxRam(target) > 0) continue;  // de la RAM on ignore
    if (ns.getServerMoneyAvailable(target) == 0) continue; // pas de $ on ignore
    // le serveur a des $ mais pas de RAM
    let ramNeed = ns.getScriptRam(ScriptBasicHack);
    logf(ns, "[hackServer0ram] Serveur cible %s", [target], quiet);
    return;
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

  let waitTimer = 15 * 1000;
  while (true) {
    log(ns, `>>>>>> Boucle n°${loopNb}`, quiet);
    if (loopNb % 4 == 0) buyPrograms(ns);  // achat des pogrammes tous les 4 cycles (60s)
    if (loopNb % 3 == 0) autoHack(ns);     // hack des serveurs et deploiement des scripts tous les 3 cycle (45s)
    // selfHack(ns);     // lance le hack/grow/weaken des serveurs sur eux même a chaque cycle (15s)
    hackLocalServer(ns);
    hackFromHome(ns);
    // hackServer0ram(ns); // lance des processus pour hacker des serveurs avec 0Go de ram
    hackRemoteServer(ns);

    if (oneRun) break; // pour debug
    await ns.sleep(waitTimer);
    loopNb++;
  }
  ns.enableLog('ALL');
  logf(ns, "Fin du script %s", [ns.getScriptName()], quiet);
}
