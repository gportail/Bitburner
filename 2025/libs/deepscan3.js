/** @param {NS} ns */

import { calculGainSeconds } from "libs/lib.js";

/** liste des serveurs découvert */
export let servers = new Array();

/**
 * Renvoie la liste des serveurs
 */
export function getServers() {
  return servers;
}

/**
 * Trie les serveurs par HackSkill croissant
 * @param sl string[] liste de serveur
 */
export function sortServersByHackSkill(ns, sl) {
  if (sl == undefined) sl = servers;
  sl.sort(function (a, b) {
    const a_info = ns.getServerRequiredHackingLevel(a);
    const b_info = ns.getServerRequiredHackingLevel(b);
    if (a_info > b_info) return 1;
    if (a_info < b_info) return -1;
    return 0;
  });
}

/**
 * Trie les serveurs par MaxMoney
 * @param sl string[] liste de serveur
 */
export function sortServersByMaxMoney(ns, sl) {
  if (sl == undefined) sl = servers;
  sl.sort(function (a, b) {
    const a_info = ns.getServerMaxMoney(a);
    const b_info = ns.getServerMaxMoney(b);
    if (a_info > b_info) return 1;
    if (a_info < b_info) return -1;
    return 0;
  });
}

/**
 * Trie les serveurs par MaxMoney
 * @param sl string[] liste de serveur
 */
export function sortServersByMaxRam(ns, sl) {
  if (sl == undefined) sl = servers;
  sl.sort(function (a, b) {
    const a_info = ns.getServerMaxRam(a);
    const b_info = ns.getServerMaxRam(b);
    if (a_info > b_info) return 1;
    if (a_info < b_info) return -1;
    return 0;
  });
}


/**
 * Trie les serveurs par chance de hack
 * @param sl string[] liste de serveur
 */
export function sortServersByHackChance(ns, sl) {
  if (sl == undefined) sl = servers;
  sl.sort(function (a, b) {
    const a_info = ns.hackAnalyzeChance(a);
    const b_info = ns.hackAnalyzeChance(b);
    if (a_info > b_info) return 1;
    if (a_info < b_info) return -1;
    return 0;
  });
}
/**
 * Trie les serveurs par $/s
 * @param sl string[] liste de serveur
 */
export function sortServersByMoneyPerSec(ns, sl) {
  if (sl == undefined) sl = servers;
  sl.sort(function (a, b) {
    const a_info = calculGainSeconds(a, ns);
    const b_info = calculGainSeconds(b, ns);
    if (a_info > b_info) return 1;
    if (a_info < b_info) return -1;
    return 0;
  });
}

/**
 * Trie les serveurs par temp total pour w+g+h
 * @param sl string[] liste de serveur
 */
export function sortServersByTotalTime(ns, sl) {
  if (sl == undefined) sl = servers;
  sl.sort(function (a, b) {
    const a_info = ns.getHackTime(a) + ns.getGrowTime(a) + ns.getWeakenTime(a);
    const b_info = ns.getHackTime(b) + ns.getGrowTime(b) + ns.getWeakenTime(b);
    if (a_info > b_info) return 1;
    if (a_info < b_info) return -1;
    return 0;
  });
}

/**
 * Trie les serveurs par nom, insensible à la casse
 * @param sl string[] liste de serveur
 */
export function sortServersByName(ns, sl) {
  if (sl == undefined) sl = servers;
  sl.sort(function (a, b) {
    const a_info = a.toLowerCase();
    const b_info = b.toLowerCase();
    if (a_info > b_info) return 1;
    if (a_info < b_info) return -1;
   return 0;
  });
}

/** 
 * liste les serveurs enfants de {fromServer}
 * @return string[] Liste des serveurs
 */
export function deepscan(ns, fromServer) {
  let neighbor = ns.scan(fromServer);
  for (let srv of neighbor) {
    if (srv == 'darkweb') continue;
    if (srv == 'home') continue;
    if (!servers.includes(srv)) {
      servers.push(srv);
      deepscan(ns,srv);
    }
  }
  return servers;
}
