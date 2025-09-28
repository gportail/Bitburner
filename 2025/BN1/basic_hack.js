import { secLvlFactor, moneyFactor } from "./libs/constantes.js";
import * as cl from "./libs/colors.js";
import { logf } from "./libs/logs.js";

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
    ['q', false], // execution silencieuse si true
  ]);

  if (params['h']) {
    help(ns);
  }

  ns.disableLog('ALL');
  let quiet = params['q'];
  let target = params['c'] != '' ? params['c'] : ns.getHostname();

  logf(ns, "La cible est %s.", [target], quiet);

  var minSec = ns.getServerMinSecurityLevel(target) * secLvlFactor;
  var minMoney = ns.getServerMaxMoney(target) * moneyFactor;

  while (true) {
    if (!ns.hasRootAccess(target)) {
      ns.exit();
    }
    // si le SecLvl > MinSecLvl * 1.25 => on l'affaibli
    if (ns.getServerSecurityLevel(target) > minSec) {
      logf(ns, "Lancement de weaken sur le serveur %s", [target], quiet);
      await ns.weaken(target, { threads: ns.self.threads });
      continue;
    }
    // si $ present < 75% (voir moneyFactor dans libs/constantes.js) du max$ => on fait grandir
    if (ns.getServerMoneyAvailable(target) < minMoney) {
      logf(ns, "Lancement de grow sur le serveur %s", [target], quiet);
      await ns.grow(target, { threads: ns.self.threads });
      continue
    }
    logf(ns, "Lancement de hack sur le serveur %s", [target], quiet);
    await ns.hack(target, { threads: ns.self.threads });
  }
}
