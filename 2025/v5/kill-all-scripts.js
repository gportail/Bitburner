/**
 * Parcour les serveur est kill les scripts
 */
import * as ds from "./libs/deepscan.js";

/** @param {NS} ns */
export async function main(ns) {
  let startServer = ns.getHostname();
  let servers = ds.deepscan(ns, startServer);
  ds.sortServersByHackSkill(ns, servers);
  for (let host of servers) {
    if (host == "darkweb" && !ns.hasTorRouter()) continue;
    if (host == "home") continue;
    if (ns.getServerMaxRam(host) > 0) { // il y a de la ram donc peut executer des scripts donc il faut kill les scripts
      ns.killall(host);
    }
  }
}
