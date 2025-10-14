/**
 * Achete les programme si il y a assez de $
 */
import * as l from "./libs/logs.js";
import { runCommand } from "./libs/lib.js";
import * as cl from "./libs/colors.js";

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.info}Achète les programmes selon l'argent disponible.`);
  ns.tprintf('options :');
  ns.tprintf('  -h    : aide');
  ns.tprintf('  -q    : execution silencieuse');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['q', false], //execution silencieuse
  ]);

  if (params['h']) {
    help(ns);
  }

  let quiet = params['q'];

  ns.disableLog('ALL');

  let progs = [
    ['BruteSSH.exe', 500000],
    ['FTPCrack.exe', 1500000],
    ['relaySMTP.exe', 5000000],
    ['HTTPWorm.exe', 30000000],
    ['SQLInject.exe', 250000000],
    ['Formulas.exe', 5000000000],
    ['ServerProfiler.exe', 500000],
    ['DeepscanV1.exe', 500000],
    ['DeepscanV2.exe', 25000000],
    ['AutoLink.exe', 1000000],
  ];
  for (let prog of progs) {
    if (!ns.fileExists(prog[0], 'home')) {
      if (!ns.hasTorRouter()) {
        l.log(ns, `${cl.warn}Il faut acheter le routeur Tor`);
        if (ns.getServerMoneyAvailable('home') > 200000){ 
          ns.singularity.purchaseTor();
          l.log(ns, `${cl.warn}Routeur Tor acheté`);
        } 
        ns.exit();
      }
      if (ns.getServerMoneyAvailable('home') > prog[1]) {
        l.logf(ns, `${cl.info}Achat du programme %s`, [prog[0]], quiet);
        ns.singularity.purchaseProgram(prog[0]);
        // runCommand('buy ' + prog[0]);
      }
    }
  }
 ns.enableLog('ALL');
}
