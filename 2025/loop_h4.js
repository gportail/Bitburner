import * as cl from "libs/colors.js";
import { logf } from "libs/logs.js";
import { secLvlFactor, moneyFactor } from "libs/constantes.js";

// const moneyFactor = 0.80;

function help(ns) {
  ns.tprintf(`${cl.info}Hack du serveur`);
  ns.tprintf('usage : run g.js -c <target?> <option> ');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible à hack');
  ns.tprintf('  -i          : pas d\'arret, continue a hack même si les conditions pour arreter sont atteintes.');
  ns.tprintf('  -q          : mode silence');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  let target = ns.getHostname();

  let params = ns.flags([
    ['h', false], // aide
    ['c', ''],  // cible
    ['i', false], // pas d'arret
    ['q', false], // silencieux si true
  ]);

  if (params['h']) {
    help(ns);
  }

  ns.disableLog('ALL');
  let quiet = params['q'];

  if (params['c'] != '') target = params['c'];

  logf(ns, `La cible est ${cl.info}%s`, [target], quiet);

  let minMoney = ns.getServerMaxMoney(target) * moneyFactor;
  let minSec = ns.getServerMinSecurityLevel(target) * secLvlFactor;

  if (ns.getServerMaxMoney(target) == 0) {  // pas d'argent sur ce serveur
    ns.enableLog('ALL');
    ns.exit();
  }
  while (true) {
    // si les condition sont OK
    if ((ns.getServerMoneyAvailable(target) > minMoney)
      && (ns.getServerSecurityLevel(target) < minSec)) {
      await ns.hack(target, { threads: ns.self.threads });
    } else {
      if (params['i']) {
        await ns.sleep(1000);
        continue;
      } else {
        logf(ns, `Fin du script avec comme cible ${cl.info}%s`, [target], quiet);
        ns.enableLog('ALL');
        ns.exit();
      }
    }
  }
}
