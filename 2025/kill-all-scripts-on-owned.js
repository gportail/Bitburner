/**
 * Parcour les serveur est kill les scripts
 */
import * as ds from "libs/deepscan.js";

/** @param {NS} ns */
export async function main(ns) {
  let servers = ns.getPurchasedServers();
  for (let host of servers) {
    if (host == "darkweb" && !ns.hasTorRouter()) continue;
    if (host == "home") continue;
    if (ns.getServerMaxRam(host) > 0) { // il y a de la ram donc peut executer des scripts
      ns.killall(host);
    }
  }
}
