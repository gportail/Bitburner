import * as cl from "libs/colors.js";
import { logf, log, logFile } from "libs/logs.js";
/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.info}Diminue le niveau de sécurité et augmente les $ disponible de la cible.`);
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : serveur cible');
  ns.tprintf('  -s <seclvl> : niveau de securité a atteindre');
  ns.tprintf('  -m <money>  : $ disponible a atteindre');
  ns.tprintf('  -q    : execution silencieuse');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  let params = ns.flags([
    ['h', false], // aide
    ['c', ''],    // la cible
    ['s', 1],     // niveau de securité a atteindre
    ['m', 1],     // $ disponible a atteindre
    ['q', false], //execution silencieuse
  ]);

  if (params['h']) help(ns);

  let quiet = params['q'];
  let target = params['c'];
  if (target == '') help(ns);
  let secLvl = params['s'];
  let money = params['m'];
  if (money == 1) help(ns);

  log(ns, `Parametres: target=${target}   SevLev=${secLvl}   Money=${money}`, quiet);
  while (true) {
    if ((ns.getServerSecurityLevel(target) <= secLvl) && (ns.getServerMoneyAvailable(target) >= money)) break;
    if (ns.getServerSecurityLevel(target) > secLvl) await ns.weaken(target, { threads: ns.self.threads });
    if (ns.getServerMoneyAvailable(target) < money) await ns.grow(target, { threads: ns.self.threads });
    await ns.sleep(500);
  }
}
