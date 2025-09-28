import * as cl from "libs/colors.js";
import * as l from "libs/logs.js";
import { moneyFactor } from "libs/constantes.js";

// const moneyFactor = 0.80;

function help(ns) {
  ns.tprintf(`${cl.yellow}Augmente l'argent du serveur.\n`);
  ns.tprintf('usage : run g.js -c <target?> <option> ');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible à grow');
  ns.tprintf('  -i          : pas d\'arret, continue a grow même si les conditions pour arreter sont atteintes.');
  ns.tprintf('  -q          : mode silence');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  let host = ns.getHostname();

  let params = ns.flags([
    ['h', false], // aide
    ['c', ''],  // cible
    ['i', false], // pas d'arret
    ['q', false], // silencieu si true
  ]);

  if (params['h']) {
    help(ns);
  }

  l.disableNSlogs(ns);
  let quiet = params['q'];

  if (params['c'] != '') host = params['c'];
  if (!quiet) l.logf(ns, "%s : Execution du script %s avec %s comme cible.", [ns.getHostname(), ns.getScriptName(), host]);

  let minMoney = ns.getServerMaxMoney(host) * moneyFactor;

  if (ns.getServerMaxMoney(host) == 0) {  // pas d'argent sur ce serveur
    l.enableNSlogs(ns);
    ns.exit(); 
  }
  while (true) {
    // si $ present < 80% du max$ => on fait grandir
    if (ns.getServerMoneyAvailable(host) < minMoney) {
      await ns.grow(host, { threads: ns.self.threads });
    } else {
      if (params['i']) {
        await ns.sleep(1000);
        continue;
      }
      else {
        l.enableNSlogs(ns);
        ns.exit();
      }
    }
  }
}
