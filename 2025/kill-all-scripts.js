/**
 * Parcour les serveur est kill les scripts
 */
import * as ds from "libs/deepscan.js";

/** @param {NS} ns */
export async function main(ns) {
  let startServer = ns.getHostname();
  ds.deepscan(startServer, ns);
  ds.sortServersByHackSkill(ns);
  let servers = ds.getServers();
  for (var i = 0; i < servers.length; i++) {
    var host = servers[i];;
    if (host == "darkweb" && !ns.hasTorRouter()) continue;
    if (host == "home") continue;
    if (ns.getServerMaxRam(host) > 0) { // il y a de la ram donc peut executer des scripts
      ns.killall(host);
    }
  }
}
