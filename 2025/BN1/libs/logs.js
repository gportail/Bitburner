/**
 * Gestion des logs
 */
import * as cl from "./colors.js";

/**
 * Liste des fonctions dont on desactive le log
 */
let logDisabledFonction = ['getServerMaxMoney', 'getServerMaxRam', 'getServerSecurityLevel',
  'getServerMoneyAvailable', 'getScriptRam', 'getWeakenTime', 'getGrowTime', 'getHackTime',
  'hackAnalyzeChance', 'hackAnalyze', 'getServerMoneyAvailable', 'getPurchasedServers',
  'getServerRequiredHackingLevel', 'getServerMinSecurityLevel', 'getServerNumPortsRequired',
  'killall', 'exec', 'run', 'scan'];

export function disableNSlogs(ns) {
  ns.disableLog('disableLog');
  ns.disableLog('enableLog');
  for (let f of logDisabledFonction) ns.disableLog(f);
}

export function enableNSlogs(ns) {
  for (let f of logDisabledFonction) ns.enableLog(f);
  ns.enableLog('disableLog');
  ns.enableLog('enableLog');
}

/**
 * Log un message
 * @param msg string le message
 * @param quiet bool si true, uniquement dans les logs
 */
export function log(ns, msg, quiet = false) {
  let color = cl.loghead;
  if (msg == "")
    ns.print("\n")
  else
    ns.printf(`${color}[%s@%s]${cl.reset} %s`, ns.getScriptName(), ns.getHostname(), msg);
  if (!quiet) {
    if (msg == "")
      ns.tprintf("\n")
    else
      ns.tprintf(`${color}[%s@%s]${cl.reset} %s`, ns.getScriptName(), ns.getHostname(), msg);
  }
}

export function logFile(ns, msg) {
  let filename = ns.getHostname()+ "_" + ns.getScriptName().replace('.js','.txt');
  logToFile(ns, msg, filename);
}

export function logToFile(ns,msg,filename){
  ns.write(filename, msg + "\n", "a");
} 
/**
 * Log un message formaté
 * @param msg string le message
 * @param args array les parametres passés au formatage
 * @param quiet bool si true, uniquement dans les logs
 */
export function logf(ns, format, args = [], quiet = false) {
  let s = ns.vsprintf(format, args);
  log(ns, s, quiet);
}

export function debugf(ns, format, args = [], quiet = false) {
  let s = ns.vsprintf(`${cl.cyan}%s:%s:DEBUG:%s`, [ns.getScriptName(), (new Date()).toLocaleTimeString('fr-FR'), format]);
  logf(ns, s, args, quiet);
}
