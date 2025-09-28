import * as cl from "./libs/colors.js";
/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.info}Hack le serveur cible.`);
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : serveur cible');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  let params = ns.flags([
    ['h', false], // aide
    ['c', ''],    // la cible
    ['q', false],
  ]);

  if (params['h']) {
    help(ns);
  }
  let target = params['c'];
  if (target == '') help(ns);
 
  while (true) {
    await ns.hack(target, { threads: ns.self.threads });
    await ns.sleep(500);
  }
}
