import * as cl from "libs/colors.js";
import { secLvlFactor } from "libs/constantes.js";

//const secLvlFactor = 1.25;

function help(ns) {
  ns.tprintf(`${cl.yellow}Diminue la sécurité du serveur.\n`);
  ns.tprintf('usage : run w.js <target?> <option>');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible à weaken');
  ns.tprintf('  -i          : pas d\'arret');
  ns.tprintf('  -q          : mode silence');
}

/** @param {NS} ns */
export async function main(ns) {
  var host = ns.getHostname();

  var params = ns.flags([
    ['h', false], // aide
    ['c', ''],  // cible
    ['i', false], // pas d'arret
    ['q', false], // silencieu si true
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  let quiet = params['q'];
  if (params['c'] != '') host = params['c'];
  if (!quiet) ns.tprintf("%s : Execution du script %s avec %s comme cible.", ns.getHostname(), ns.getScriptName(), host);

  var minSec = ns.getServerMinSecurityLevel(host) * secLvlFactor;

  while (true) {
    // si le SecLvl > MinSecLvl * 1.25 => on l'affaibli
    if (ns.getServerSecurityLevel(host) > minSec) {
      await ns.weaken(host, { threads: ns.self.threads });
    } else {
      if (params['i']) {
        await ns.sleep(1000);
        continue;
      }
      else ns.exit();
    }
  }
}
