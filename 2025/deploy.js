/**
 * Deploie les scripts sur les serveurs
 */

import { getServers, sortServersByHackSkill, deepscan } from "libs/deepscan.js";

// const scripts = ['g.js', 'w.js', 'basic_hack.js', 'libs/colors.js', 'libs/constantes.js'];

/** @param {NS} ns */
export async function main(ns) {
  var startServer = ns.getHostname();

  let quiet = (ns.args[0] == '-q')
  if (quiet == undefined) quiet = false;

  deepscan(startServer, ns);
  sortServersByHackSkill(ns);
  let servers = getServers();
  for (var i = 0; i < servers.length; i++) {
    let srv = servers[i];
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (srv == "home") continue;
    if (ns.hasRootAccess(srv)) {  // deploie que sur les serveurs root
      if (!quiet) {
        ns.run('deploy_single.js', 1, '-c', srv, '-v');
      } else {
        ns.run('deploy_single.js', 1, '-c', srv);
      }
    }
  }
}
