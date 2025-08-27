/**
 * Parcour les serveurs sans argent et lance des scripts de grow ou weakean sur la cible.
 * Les scripts doivent avoir été deployés sur les serveurs.
 */
import { getServers, sortServersByMaxMoney, deepscan } from "libs/deepscan.js";
import * as cl from "libs/colors.js";

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.yellow}Lance les scripts g.js et w.js sur la cible.`);
  ns.tprintf(`${cl.yellow}Les scripts sont lancé sur les serveurs ayant 0\$`);
  ns.tprintf('options :');
  ns.tprintf('  -h         : aide');
  ns.tprintf('  -c <cible> : la cible des scripts');
  ns.tprintf('  -f         : force la relance des scripts');
  ns.tprintf('  -q         : silencieu');
}


/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['c', ''],  //la cible
    ['f', false], //force la relance des scripts
    ['q', false], // mode silencieu
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  if (params['c'] == '') {
    help(ns);
    ns.exit();
  }

  var target = params['c'];
  var force =  params['f'];
  let quiet = params['q'];

  let startServer = ns.getHostname();
  deepscan(startServer, ns);
  sortServersByMaxMoney(ns);

  var minRamNeed = ns.getScriptRam('g.js') + ns.getScriptRam('w.js');
  var gRam = ns.getScriptRam('g.js');
  var wRam = ns.getScriptRam('w.js');
  var minRamNeed = gRam + wRam;

  let servers = getServers();
  for (var i = 0; i < servers.length; i++) {
    let srv = servers[i];
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (srv == "home") continue;
    if (srv == "home2") continue;
    if (ns.getServerMaxMoney(srv) > 0) continue;
    if (ns.getServerMaxRam(srv) == 0) continue;
    if (ns.getServerMaxRam(srv) < minRamNeed) continue;  // on peut lance w.js ET g.js
    if (ns.isRunning('w.js', srv, target, '-i') && !force ) continue; // si les scripts tourne on ne les tue pas!!
    if (ns.hasRootAccess(srv)) {
      let ram = ns.getServerMaxRam(srv);
      let th = Math.trunc(ram / minRamNeed);
      if(!quiet) ns.tprintf(`${cl.green}Lancement des scripts g.js et w.js sur %s avec %d thread, la cible est %s`, srv, th, target);
      ns.killall(srv);
      if (ns.exec('w.js', srv, th, '-c', target, '-i', '-q') == 0) {
        ns.tprintf(`${cl.red}Lancement de w.js sur %s impossible`, srv);
      }
      if (ns.exec('g.js', srv, th, '-c', target, '-i', '-q') == 0) {
        ns.tprintf(`${cl.red}Lancement de g.js sur %s impossible`, srv);
      }
    }
  }
}
