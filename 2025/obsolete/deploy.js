/**
 * Deploie les scripts sur les serveurs
 */
import { debugf, log, logf, disableNSlogs, enableNSlogs } from "libs/logs.js";
import { runAndWait } from "libs/lib.js";
import { getServers, sortServersByHackSkill, deepscan } from "libs/deepscan.js";

// const scripts = ['g.js', 'w.js', 'basic_hack.js', 'libs/colors.js', 'libs/constantes.js'];
function help(ns) {
  ns.tprintf(`${cl.yellow}Deploie les scripts vers tous les serveurs possibles.\n`);
  ns.tprintf('usage : run deploy.js');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible de deploy_single.js');
  ns.tprintf('  -q          : mode silencieux');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  var startServer = ns.getHostname();

  let quiet = (ns.args[0] == '-q')
  if (quiet == undefined) quiet = false;

  deepscan(startServer, ns);
  sortServersByHackSkill(ns);
  let servers = getServers();
  for (let srv of servers) {
    //let srv = servers[i];
    if (ns.getServerRequiredHackingLevel(srv) > ns.getPlayer().skills.hacking) break;
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (srv == "home") continue;
    log(ns, "                     .", quiet);
    // debugf(ns, "traitement du serveur %s  hasRootAccess=%s", [srv, ns.hasRootAccess(srv)]);
    if (ns.hasRootAccess(srv)) {  // deploie que sur les serveurs root
      //ns.tprint("Serveur " + srv + " hasRootAccess OK");
      // debugf(ns, "Serveur %s  hasRootAccess OK", [srv]);
      //ns.run('deploy_single.js', 1, '-c', srv, quiet);
      //await ns.sleep(200);
      if (quiet) await runAndWait(ns, 'deploy_single.js', '-c', srv, '-q');
      else await runAndWait(ns, 'deploy_single.js', '-c', srv);
    }
  }
}
