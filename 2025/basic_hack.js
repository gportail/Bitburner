import { secLvlFactor, moneyFactor } from "libs/constantes.js";
import * as cl from "libs/colors.js";

function help(ns) {
  ns.tprintf(`${cl.yellow}Hack/weaken/grow d'un serveur.\n`);
  ns.tprintf('usage : run basic_hack.js -c <target?>');
  ns.tprintf('options :');
  ns.tprintf('  -h        : aide');
  ns.tprintf('  -q        : mode silence');
}

/** @param {NS} ns */
export async function main(ns) {

  var params = ns.flags([
    ['h', false], // aide
    ['c', ''], // pas de cible
    ['q', false], // silencieu si true
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  let quiet = params['q'];
  let host = ns.getHostname();

  if (params['c'] != false) host = params['c'];
  if (!quiet) ns.tprintf(`%s : Execution du script ${cl.green}%s${cl.reset} avec ${cl.green}%s${cl.reset} comme cible.`, ns.getHostname(), ns.getScriptName(), host);

  var minSec = ns.getServerMinSecurityLevel(host) * secLvlFactor;
  var minMoney = ns.getServerMaxMoney(host) * moneyFactor;

  while (true) {
    if (!ns.hasRootAccess(host)){
      await ns.sleep(60*1000);
      continue;
    }
    // si le SecLvl > MinSecLvl * 1.25 => on l'affaibli
    if (ns.getServerSecurityLevel(host) > minSec) {
      await ns.weaken(host, { threads: ns.self.threads });
      continue;
    }
    // si $ present < 75% (voir moneyFactor dans libs/constantes.js) du max$ => on fait grandir
    if (ns.getServerMoneyAvailable(host) < minMoney) {
      await ns.grow(host, { threads: ns.self.threads });
      continue
    }
    await ns.hack(host, { threads: ns.self.threads });
  }
}
