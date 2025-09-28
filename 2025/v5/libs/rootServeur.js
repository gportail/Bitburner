import { logf } from "./logs.js";
import * as cl from "./colors.js";

/**
 * Essaye de rooter un serveur
 * @param {NS} ns 
 * @param {String} target le serveur a rooter
 * @param {Boolean} quiet Indique si la fonction est silencieuse
 * @returns {Boolean} True si le serveur est rooté
 */
export function rootServeur(ns, target, quiet = false) {
  let rooted = false;
  if (target == "darkweb" && !ns.hasTorRouter()) return rooted;
  if (target == 'home') return rooted;
  if (ns.getServerRequiredHackingLevel(target) <= ns.getPlayer().skills.hacking) {
    if (ns.hasRootAccess(target) == false) {

      logf(ns, `${cl.warn}Hack de %s (skill=%d, port=%d)`, [target, ns.getServerRequiredHackingLevel(target), ns.getServerNumPortsRequired(target)], quiet);
      let openPortCount = 0;
      if (ns.getServerNumPortsRequired(target) >= 1) {
        if (ns.fileExists("brutessh.exe", "home")) {
          if (ns.brutessh(target)) openPortCount++;
        }
      }
      if (ns.getServerNumPortsRequired(target) >= 2) {
        if (ns.fileExists("ftpcrack.exe", "home")) {
          if (ns.ftpcrack(target)) openPortCount++;
        }
      }
      if (ns.getServerNumPortsRequired(target) >= 3) {
        if (ns.fileExists("relaySMTP.exe", "home")) {
          if (ns.relaysmtp(target)) openPortCount++;
        }
      }
      if (ns.getServerNumPortsRequired(target) >= 4) {
        if (ns.fileExists("HTTPWorm.exe", "home")) {
          if (ns.httpworm(target)) openPortCount++;
        }
      }
      if (ns.getServerNumPortsRequired(target) >= 5) {
        if (ns.fileExists("SQLInject.exe", "home")) {
          if (ns.sqlinject(target)) openPortCount++;
        }
      }
      if (openPortCount == ns.getServerNumPortsRequired(target)) {
        ns.nuke(target);
      }
      if (ns.hasRootAccess(target)) {
        rooted = true;
        logf(ns, `${cl.warn}%s est hacké`, [target], quiet);
      }
    } else {
      logf(ns, `${cl.info}%s (%d) déjà hacké`, [target, ns.getServerRequiredHackingLevel(target)], quiet);
    }
  }
  return rooted;
}

/**
 * Copie les fichiers vers un serveur
 * @param {NS} ns 
 * @param {String} target Le serveur sur lequel on copie les fichiers
 * @param {Array} files Liste des fichiers à copier
 * @param {Boolean} quiet Indique si la fonction est silencieuse
 */
export function deployFiles(ns, target, files, quiet = false) {
  if (target == "darkweb" && !ns.hasTorRouter()) return;
  if (target == 'home') return;
  if (!ns.hasRootAccess(target)) { // serveur non rooté => on quite
    logf(ns, `${cl.error}Le serveur %s n\'est pas rooté, pas de deploiement des scripts.${cl.reset}`, [target], quiet);
    return;
  }
  if (ns.getServerRequiredHackingLevel(target) <= ns.getPlayer().skills.hacking) {
    if (ns.getServerMaxRam(target) > 0) {
      for (let scr of files) {
        logf(ns, `Copie de ${cl.info}%s${cl.reset} vers le serveur ${cl.info}%s${cl.reset}.`, [scr, target], quiet);
        ns.scp(scr, target);
      }
      logf(ns, "%s", [''], quiet);
    } else {
      logf(ns, `${cl.warn}Le serveur %s n\'a pas de RAM.${cl.reset}`, [target], quiet);
      logf(ns, "%s", [''], quiet);
    }
  }
} 