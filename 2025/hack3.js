import { secLvlFactor, moneyFactor } from "libs/constantes.js";
import * as cl from "libs/colors.js";
import { logf } from "libs/logs.js";

function help(ns) {
  ns.tprintf(`${cl.info}Hack/weaken/grow d'un serveur.\n`);
  ns.tprintf('usage : run basic_hack.js -c <target?> <option>');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible');
  ns.tprintf('  -q          : mode silence');
  ns.exit();
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
  }

  ns.disableLog('ALL');
  let quiet = params['q'];
  let target = ns.getHostname();
  if (params['c'] != false) target = params['c'];
  logf(ns, "La cible est %s.", [target], quiet);

  let minSec = ns.getServerMinSecurityLevel(target) * secLvlFactor;
  let minMoney = ns.getServerMaxMoney(target) * moneyFactor;

  while (true) {
    if (!ns.hasRootAccess(target)) {
      await ns.sleep(60 * 1000);
      continue;
    }
    // si le SecLvl > MinSecLvl * 1.25 => on l'affaibli
    if (ns.getServerSecurityLevel(target) > minSec) {
      await ns.weaken(target, { threads: ns.self.threads });
      continue;
    }
    // si $ present < 75% (voir moneyFactor dans libs/constantes.js) du max$ => on fait grandir
    if (ns.getServerMoneyAvailable(target) < minMoney) {
      await ns.grow(target, { threads: ns.self.threads });
      continue
    }
    await ns.hack(target, { threads: ns.self.threads });
  }
}
