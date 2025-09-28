/**
 * Parcour les serveurs sans argent et lance des scripts de grow ou weakean sur la cible.
 * Les scripts doivent avoir été deployés sur les serveurs.
 */
import { sortServersByMaxMoney, deepscan } from "libs/deepscan3.js";
import * as cl from "libs/colors.js";
import { logf } from "libs/logs.js";

const ScriptG = 'loop_g3.js';
const ScriptW = 'loop_w3.js';
const ScriptHack = 'loop_h3.js';
/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.info}Lance les scripts g.js et w.js sur la cible.`);
  ns.tprintf(`${cl.info}Les scripts sont lancé sur les serveurs ayant 0\$`);
  ns.tprintf('options :');
  ns.tprintf('  -h         : aide');
  ns.tprintf('  -c <cible> : la cible des scripts');
  ns.tprintf('  -f         : force la relance des scripts');
  ns.tprintf('  -q         : execution silencieuse');
  ns.exit();
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
  }

  if (params['c'] == '') {
    help(ns);
  }

  let target = params['c'];
  let force = params['f'];
  let quiet = params['q'];

  let startServer = ns.getHostname();
  let servers = deepscan(ns, startServer);
  sortServersByMaxMoney(ns, servers);

  let gRam = ns.getScriptRam(ScriptG);
  let wRam = ns.getScriptRam(ScriptW);
  let minRamNeed = gRam + wRam;

  for (let srv of servers) {
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (srv == "home") continue;
    if (srv == "home2") continue;
    if (ns.getServerMaxMoney(srv) > 0) continue;
    if (ns.getServerMaxRam(srv) == 0) continue;
    if (ns.getServerMaxRam(srv) < minRamNeed) continue;  // on peut lance w.js ET g.js
    if (ns.isRunning(ScriptW, srv, target, '-i') && !force) continue; // si les scripts tourne on ne les tue pas!!
    if (ns.hasRootAccess(srv)) {
      let ram = ns.getServerMaxRam(srv);
      let th = Math.trunc(ram / minRamNeed);
      // if (!quiet) ns.tprintf(`${cl.green}Lancement des scripts g.js et w.js sur %s avec %d thread, la cible est %s`, srv, th, target);
      logf(ns, `${cl.info}Lancement des scripts %s et %s sur %s avec %d thread, la cible est %s`, [ScriptG, ScriptW, srv, th, target], quiet);
      ns.killall(srv);
      if (ns.exec(ScriptW, srv, th, '-c', target, '-i', '-q') == 0) {
        logf(ns, `${cl.error}Lancement de %s sur %s impossible`, [ScriptW, srv], false);
      }
      if (ns.exec(ScriptG, srv, th, '-c', target, '-i', '-q') == 0) {
        logf(ns, `${cl.error}Lancement de %s sur %s impossible`, [ScriptG, srv], false);
      }
    }
  }
}
