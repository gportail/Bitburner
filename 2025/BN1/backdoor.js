import * as cl from "./libs/colors.js";
import { runCommand } from "./libs/lib.js";
/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.info}Installe une backdoor sur la cible.`);
  ns.tprintf('options :');
  ns.tprintf('  -h    : aide');
  ns.tprintf('  -c    : cible sur laquelle installer la backdoor');
  ns.exit();
}


/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['c', ''], //cible 
  ]);

  if (params['h']) {
    help(ns);
  }

  let target = params['c'];
  if (target == '') help(ns);

  let co = 'run connect.js ' + target;
  runCommand(co);
  await ns.sleep(1000);
  runCommand('backdoor');
  await ns.sleep(1000);
  runCommand('home');
}
