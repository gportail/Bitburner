import * as ds from "libs/deepscan.js";
import * as cl from "libs/colors.js";
import { getScriptsRunning, timeformat, calculGainSeconds, isPurchasedByPlayer } from "libs/lib.js";

/**
 * Affiche liste des serveurs trié par HackSkill croissant
 */
function printServersStats(ns, onlyRoot, withOwned) {
  let servers = ds.getServers();
  ns.tprintf(`${cl.yellow}    | %-20s | %6s | %5s | %5s | %5s | %4s | %8s | %8s | %5s | %8s | %8s | %8s | %6s | %6s | %6s | %6s |`,
    "Host", "root?", "secL", "minSL", "skill", "port", "Max$", "Curr$", "RAM", "Hack %", "Hack $", "Hack$/s", "WTime", "GTime", "HTime", "FTime");
  ns.tprintf(`${cl.yellow}==================================================================================================================================`)
  var count = 1;
  for (var i = 0; i < servers.length; i++) {
    let srv = servers[i];
    if (srv == "home") continue;
    if (isPurchasedByPlayer(srv, ns) && !withOwned) continue;
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (onlyRoot && !ns.hasRootAccess(srv)) continue;
    var color = cl.bkgreen;
    if (!ns.hasRootAccess(srv)) color = cl.red;
    ns.tprintf(`${color}%3d | %-20s | %-6t | %5s | %5s | %5d | %4d | %8s | %8s | %5s | %8s | %8s | %8s | %6s | %6s | %6s | %6s | %s `,
      count,
      srv,
      ns.hasRootAccess(srv),  // root access?
      ns.formatNumber(ns.getServerSecurityLevel(srv), 2),
      ns.formatNumber(ns.getServerMinSecurityLevel(srv), 0),
      ns.getServerRequiredHackingLevel(srv),
      ns.getServerNumPortsRequired(srv),
      ns.formatNumber(ns.getServerMaxMoney(srv), 2),
      ns.formatNumber(ns.getServerMoneyAvailable(srv), 2),
      ns.formatRam(ns.getServerMaxRam(srv), 0),
      ns.formatPercent(ns.hackAnalyzeChance(srv), 2), // chance de hack
      ns.formatNumber(ns.hackAnalyze(srv) * ns.getServerMoneyAvailable(srv), 2),  // gain par thread
      ns.formatNumber(calculGainSeconds(srv, ns), 2), // gain $/s
      timeformat(ns.getWeakenTime(srv)), // durée weaken 
      timeformat(ns.getGrowTime(srv)), // durée grow 
      timeformat(ns.getHackTime(srv)), // durée hack
      timeformat(ns.getHackTime(srv) + ns.getGrowTime(srv) + (ns.getWeakenTime(srv))),
      getScriptsRunning(srv, ns)
    );
    count++;
  }
}

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.yellow}Affiche les statistiques des serveurs.\n`);
  ns.tprintf('options :');
  ns.tprintf('  -h        : aide');
  ns.tprintf('  -s <sort> : trie selon le skill|money|ram|hack|$/s|ttime, defaut=skill');
  ns.tprintf('  -a        : tous les serveurs, defaut: serveurs rooted');
  ns.tprintf('  -o        : affiche les serveurs acheter(def:false)')
}


/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['s', 'skill'],  //option de trie : skill|money|ram
    ['a', false], // tous les serveurs
    ['o', false], //avec les serveur achete
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  let startServer = ns.getHostname();
  ds.deepscan(startServer, ns);

  switch (params['s']) {
    case 'skill':
      ds.sortServersByHackSkill(ns);
      break;
    case 'money':
      ds.sortServersByMaxMoney(ns);
      break;
    case 'ram':
      ds.sortServersByMaxRam(ns);
      break;
    case 'hack':
      ds.sortServersByHackChance(ns);
      break;
    case '$/s':
      ds.sortServersByMoneyPerSec(ns);
      break;
    case 'ttime':
      ds.sortServersByTotalTime(ns);
      break;
  }
  ns.ui.clearTerminal();
  printServersStats(ns, !params['a'], params['o']);
}
