import * as cl from "libs/colors.js";
import { logf } from "libs/logs.js";
import { secLvlFactor } from "libs/constantes.js";

//const secLvlFactor = 1.25;

function help(ns) {
  ns.tprintf(`${cl.info}Diminue la sécurité du serveur jusqu\'au niveau requis`);
  ns.tprintf('usage : run w.js -c <target?> <option>');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible à weaken');
  ns.tprintf('  -i          : pas d\'arret');
  ns.tprintf('  -q          : mode silence');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  var target = ns.getHostname();

  var params = ns.flags([
    ['h', false], // aide
    ['c', ''],  // cible
    ['i', false], // pas d'arret
    ['q', false], // silencieu si true
  ]);

  if (params['h']) {
    help(ns);
  }

  ns.disableLog('ALL');

  let quiet = params['q'];
  if (params['c'] != '') target = params['c'];

  logf(ns, `La cible est ${cl.info}%s`, [target], quiet);

  var minSec = ns.getServerMinSecurityLevel(target) * secLvlFactor;

  while (true) {
    // si le SecLvl > MinSecLvl * 1.25 => on l'affaibli
    if (ns.getServerSecurityLevel(target) > minSec) {
      await ns.weaken(target, { threads: ns.self.threads });
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
