/**
 * lance juste un hack sur la cible
 */
import * as cl from "libs/colors.js";
/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.yellow}Lance en boucle un hack puis grow puis weaken sur la cible.`);
  ns.tprintf('options :');
  ns.tprintf('  -h         : aide');
  ns.tprintf('  -c <cible> : la cible a hacker');
}

/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['c', ''],  //la cible
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  if (params['c'] == '') {
    help(ns);
    ns.exit();
  }

  var target = params['c'];
  while (true) {
    await ns.hack(target, { threads: ns.self.threads });
    await ns.grow(target, { threads: ns.self.threads });
    await ns.weaken(target, { threads: ns.self.threads });
  }
}
