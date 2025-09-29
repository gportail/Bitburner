/**
 * v5/moniteur_32Go.js
 * 
 * Moniteur d'execution a utiliser avec moins de 16 Go de RAM
 */


import * as cl from "./libs/colors.js";
import * as C from "./libs/constantes.js";
import { logf, log, logToFile } from "./libs/logs.js";
import * as DS from "./libs/deepscan.js";
import { calcNbThread, calcNbThreadPossible, getScriptsRunning } from "./libs/lib.js";
import { ExecAScript, RunAScript } from "./libs/lib.js";
import { rootServeur, deployFiles } from "./libs/rootServeur.js";

let serveurs = new Array();
export let quiet = false;
let loopNb = 0;

const DureeCycle = 15;  // durée d'un cycle en s
let emptyServers; // liste des serveurs sans $ et avec de la ram

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
 * Calcul le nombre de thread necessaire pour passe le SecLvl au minimum
 * @param {NS} ns 
 * @param {String} target 
 * @returns {integer} 
 */
function calculThreadWeaken(ns, target) {
  let WTarget = ns.getServerSecurityLevel(target) - ns.getServerMinSecurityLevel(target);  // gain de SecLvl a avoir
  let WThread = 1;
  while (ns.weakenAnalyze(WThread) < WTarget) WThread++;
  return Math.ceil(WThread++); // on ajoute un thread de plus
}

/**
 * Calcul le nombre de thread necessaire pour passe les $ dispo au maximum en limitant le SecLvl créé.
 * @param {NS} ns 
 * @param {String} target 
 * @returns {integer} 
 */
function calculThreadGrow(ns, target) {
  // calcul du nombre de thread necessaire pour monter à MaxMoney
  let GrowThread = 0;
  if (ns.getServerMoneyAvailable(target) == 0) return 0;
  let multi = Math.ceil(ns.getServerMaxMoney(target) / ns.getServerMoneyAvailable(target)); // calcul par combien il faut multiplier MoneyAvailable pour avoir MaxMoney
  GrowThread = ns.growthAnalyze(target, multi); // calcul le nombre de thread de Grow pour obtenir MaxMoney
  // on veut minimiser la progression du SecLvl => on diminue le nombre de thread pour être dans la limite voulue
  let minSevLvl = ns.getServerMinSecurityLevel(target);
  let maxSecLvl = minSevLvl * C.secLvlFactor;
  while (ns.growthAnalyzeSecurity(GrowThread, target) > maxSecLvl - minSevLvl) GrowThread--;
  return Math.ceil(GrowThread++);  // on ajout 1 thread pour etre juste au dessus de la limite SecLvl voulu et donc déclencher un Weaken dans le prochain cycle.
}

/**
 * Calcul le nombre de thread necessaire  pour que le hack depasse tout juste le SecLvl limite.
 * @param {NS} ns 
 * @param {String} target Cible du hack
 * @returns {integer} Nombre de thread
 */
function calculThreadHack(ns, target) {
  // calcul le nombre de thread pour prendre un % du MaxMoney (1 - C.moneyFactor)
  let Amount = ns.getServerMaxMoney(target) * (1 - C.moneyFactor);
  let HackThread = Math.ceil(ns.hackAnalyzeThreads(target, Amount));
  // augmentation du SecLvl pour HackThread
  // let secLvlHack = ns.hackAnalyzeSecurity(HackThread, target);
  // on veut minimiser la progression du SecLvl => on diminue le nombre de thread pour être dans la limite voulue
  let minSevLvl = ns.getServerMinSecurityLevel(target);
  let maxSecLvl = minSevLvl * C.secLvlFactor;
  while (ns.hackAnalyzeSecurity(HackThread, target) > maxSecLvl - minSevLvl) HackThread--;
  return Math.ceil(HackThread++);
}

/**
 * Recherche des serveurs sans $ et lance le script dessus
 * @param {NS} ns 
 * @param {String} target La cible du script
 * @param {String} script Le script a lancer
 * @param {integer} threads Le nombre de thread à consommer
 */
function startScriptOnEmptyServer(ns, target, script, threads) {
  if (threads == 0) return;
  // on cherche si le script a deja ete lancé avec target comme cible
  for (let srv of emptyServers) {
    if (target == "darkweb" && !ns.hasTorRouter()) continue;
    if (!ns.hasRootAccess(srv)) continue;
    if (ns.isRunning(script, srv, '-c', target, '-q')) return; // si le script existe alors on sort de la fonction
    if (ns.isRunning(script, srv, '-c', target)) return; // si le script existe alors on sort de la fonction
  }
  // on cherche des serveurs pouvant lancer le script
  let shareRunning = false;
  for (let srv of emptyServers) {
    if (target == "darkweb" && !ns.hasTorRouter()) continue;
    if (ns.getServerMaxRam(srv) == 0) continue;
    if (!ns.hasRootAccess(srv)) continue;
    shareRunning = ns.isRunning(C.ScriptShare, srv);
    if (shareRunning) {
      ns.kill(C.ScriptShare);
    }
    let th = Math.min(calcNbThreadPossible(srv, script, ns), threads);  // nombre de thread a lancer sur SRV
    if (th > 0) {
      logf(ns, `[startScriptOnEmptyServer] Demarrage de ${cl.info}%s${cl.reset} sur ${cl.info}%s${cl.reset} avec ${cl.info}%s${cl.reset} thread. La cible est ${cl.info}%s`, [script, srv, th, target], quiet);
      // logToFile(ns, vsprintf('[startScriptOnEmptyServer] Demarrage de %s sur %s avec %s thread. La cible est %s', [script, srv, th, target]), 'logs/' + target + '.txt');
      if (ExecAScript(ns, quiet, script, srv, th, '-c', target) == 0) {
        logf(ns, `${cl.error}[startScriptOnEmptyServer] Erreur de demarrage de %s sur %s avec %s thread. La cible est %s`, [script, target, th, target], quiet);
        // logToFile(ns, vsprintf('[startScriptOnEmptyServer][ERREUR] Erreur de demarrage de %s sur %s avec %s thread. La cible est %s', [script, target, th, target]), 'logs/' + target + '.txt');
      }
    }
    threads -= th;
    if (shareRunning) {
      ExecAScript(ns, quiet, C.ScriptRunShare, srv, 1);
      shareRunning = false;
    }
    if (threads <= 0) return 0;
  }
  return threads;
}

/**
 * Lance le script sur target avec target comme cible.
 * @param {NS} ns 
 * @param {String} target 
 * @param {String} script 
 * @param {integer} threads 
 * @returns {integer} Le nombre de thread restant
 */
function startScriptOnTarget(ns, target, script, threads) {
  if (ns.getServerMaxRam(target) == 0) return threads;  // pas de ram sur la cible on renvoie le nombre de thread
  let th = Math.min(calcNbThreadPossible(target, script, ns), threads);
  if (th > 0) {
    logf(ns, `[startScriptOnTarget] Demarrage de ${cl.info}%s${cl.reset} sur ${cl.info}%s${cl.reset} avec ${cl.info}%s${cl.reset} thread. La cible est ${cl.info}%s`, [script, target, th, target], quiet);
    // logToFile(ns, vsprintf('[startScriptOnTarget] Demarrage de %s sur %s avec %d thread. La cible est %s', [script, target, th, target]), 'logs/' + target + '.txt');
    if (ExecAScript(ns, quiet, script, target, th, '-c', target) == 0) {
      logf(ns, `${cl.error}[startScriptOnTarget] Erreur de demarage de %s sur %s avec %s thread. La cible est %s`, [script, target, th, target], quiet);
      // logToFile(ns, vsprintf('[startScriptOnTarget][ERREUR]  Erreur de demarage de %s sur %s avec %s thread. La cible est %s', [script, target, th, target]), 'logs/' + target + '.txt');
    }
  }
  return Math.max(threads - th, 0);
}

/**
 *  Génère la liste des serveurs sans $ mais avec de la ram
 * @param {NS} ns 
 * @param {Array} serveurs 
 * @returns {Array} tableau contenant les serveurs sans $ mais avec de la ram
 */
function listEmptyServers(ns, serveurs) {
  let esrv = [];
  for (let srv of serveurs) {
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (srv == "home") continue;
    if ((ns.getServerMaxMoney(srv) == 0) && (ns.getServerMaxRam(srv) > 0)) esrv.push(srv);
  }
  esrv.push('home');
  return esrv;
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

  // serveurs = DS.deepscan(ns, 'home');
  // DS.sortServersByHackSkill(ns, serveurs);
  // emptyServers = listEmptyServers(ns, serveurs); // liste des serveurs sans $ et avec de la ram
  // ns.tprint(emptyServers);


  while (true) {
    if (loopNb % 4 == 0) {
      log(ns, "Scan des serveurs présents", quiet);
      serveurs = DS.deepscan(ns, 'home');
      DS.sortServersByHackSkill(ns, serveurs);
      emptyServers = listEmptyServers(ns, serveurs); // liste des serveurs sans $ et avec de la ram
    }
    if (loopNb % 4 == 0) buyPrograms(ns);  // achat des programmes tous les 4 cycles (60s) // il faut 16Go
    if (loopNb % 3 == 0) doRootServer(ns); // hack des serveurs et deploiement des scripts tous les 3 cycle (45s)

    for (let target of serveurs) {
      if (target == "darkweb" && !ns.hasTorRouter()) continue;
      if (target == "home") continue;
      if (!ns.hasRootAccess(target)) continue;
      if (ns.getServerMaxMoney(target) == 0) continue;  // pas de $ on passe au suivant

      // le serveur target a des $
      let resteTh = 0;
      // Le serveur target à un SecLvl trop haut 
      if (ns.getServerSecurityLevel(target) > (ns.getServerMinSecurityLevel(target) * C.secLvlFactor)) {
        // le script Weaken tourne déjà sur target => on passe
        if (getScriptsRunning(ns, target).includes(C.ScriptSingleW)) continue;
        // Calcul du nombre de thread pour le redescendre a MinSec
        let WThread = calculThreadWeaken(ns, target);
        // et lancement du script ScriptSingleW sur target et sur des serveurs sans $
        logf(ns, `[main] Nombre de thread pour demarrage de ${cl.info}weaken${cl.reset} le serveur ${cl.info}%s${cl.reset} : ${cl.info}%d${cl.reset} thread.`, [target, WThread], quiet);
        // logToFile(ns, vsprintf('[main] Nombre de thread pour demarrage de weaken le serveur %s : %d thread.', [target, WThread]), 'logs/' + target + '.txt');
        WThread = startScriptOnTarget(ns, target, C.ScriptSingleW, WThread);
        resteTh = startScriptOnEmptyServer(ns, target, C.ScriptSingleW, WThread);
        if (resteTh > 0) {
          log(ns, `${cl.red}[main][weaken]Pas assez de place pour executer tous les thread (${target}) `, false);
        }
        continue;
      }

      // Le serveur target à un $ trop bas
      if (ns.getServerMoneyAvailable(target) < (ns.getServerMaxMoney(target) * C.moneyFactor)) {
        // le script grow tourne déjà sur target => on passe
        if (getScriptsRunning(ns, target).includes(C.ScriptSingleG)) continue;
        // Calcul du nombre de thread pour le monter a MaxMoney sans trop dépasser la limte de SecLvl
        let GThread = calculThreadGrow(ns, target);
        // et lancement du script ScriptSingleG sur target et des serveurs sans $
        logf(ns, `[main] Nombre de thread pour Demarrage de ${cl.info}grow${cl.reset} le serveur ${cl.info}%s${cl.reset} : ${cl.info}%d${cl.reset} thread.`, [target, GThread], quiet);
        // logToFile(ns, vsprintf('[main] Nombre de thread pour Demarrage de grow le serveur %s : %d thread.', [target, GThread]), 'logs/' + target + '.txt');
        GThread = startScriptOnTarget(ns, target, C.ScriptSingleG, GThread);
        resteTh = startScriptOnEmptyServer(ns, target, C.ScriptSingleG, GThread);
        if (resteTh > 0) {
          log(ns, `${cl.red}[main][grow]Pas assez de place pour executer tous les thread (${target}) `, false);
        }
        continue;
      }

      // le script hack tourne déjà sur target => on passe
      if (getScriptsRunning(ns, target).includes(C.ScriptSingleH)) continue;
      // calcul du nombre de thread pour le hack sans trop dépasser la limte de SecLvl
      let HThread = calculThreadHack(ns, target);
      // et lancement du script ScriptSingleH sur target et des serveurs sans $
      logf(ns, `[main] Nombre de thread pour Demarrage de ${cl.info}hack${cl.reset} le serveur ${cl.info}%s${cl.reset} : ${cl.info}%d${cl.reset} thread.`, [target, HThread], quiet);
      // logToFile(ns, vsprintf('[main] Nombre de thread pour Demarrage de hack le serveur %s : %d thread.', [target, HThread]), 'logs/' + target + '.txt');
      HThread = startScriptOnTarget(ns, target, C.ScriptSingleH, HThread);
      resteTh = startScriptOnEmptyServer(ns, target, C.ScriptSingleH, HThread);
      if (resteTh > 0) {
        log(ns, `${cl.red}[main][hack]Pas assez de place pour executer tous les thread (${target}) `, false);
      }


      // nombre de thread necessaire
      // let thread = calcOptimalThread(ns, target);
      // lancement sur la target avec consommation du nombre de thread
      // if (ns.getServerMaxRam(target) > 0) thread = localHack(ns, target, thread);  // le serveur a de la RAM, il se hack lui meme
      // lancement sur des serveurs sans $ avec consommation des thread


      // TODO : faire l'inverse : quand un serveur est en dehors des criteres pour être hack alors chercher un serveur sans $ pour le W&G 
      // if ((ns.getServerMaxRam(target) > 0) && (ns.getServerMoneyAvailable(target) == 0)) remoteWG(ns, target); // le serveur a de la ram mais pas de $ => on hack un autre serveur
      //if ((ns.getServerMaxRam(target) == 0) && (ns.getServerMoneyAvailable(target) > 0)) hackServerWithNoRam(ns, target);

    }

    if ((ns.getServerMaxRam('home') < 64) && (ns.getServerMoneyAvailable('home') > 10.1e6)) {
      logf(ns, `${cl.red}****************************************`, [], false);
      logf(ns, `${cl.red}Il faut upgrader à 64Go de ram pour HOME`, [], false);
      logf(ns, `${cl.red}****************************************`, [], false);
    }

    // if (ns.getServerMaxRam('home') >= 64) {
    //   logf(ns, `${cl.red}******************************************`, [], false);
    //   logf(ns, `${cl.red}Il faut lancer le script moniteur_32Go.js `, [], false);
    //   logf(ns, `${cl.red}******************************************`, [], false);
    //   break;
    // }
    if (oneRun) break; // pour debug
    await ns.sleep(waitTimer);
  }

  ns.enableLog('ALL');
  logf(ns, "Fin du script %s", [ns.getScriptName()], quiet);
}
