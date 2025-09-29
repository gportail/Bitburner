/**
 * Kill un processus
 */

import { createKillFlag } from "./libs/process.js";

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.info}Tue un processus a la fin de son cycle si le processus le gère.`);
  ns.tprintf('options :');
  ns.tprintf('  -h    : aide');
  ns.tprintf('  --pid : Id du processus a tuer');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  let params = ns.flags([
    ['h', false], // aide
    ['pid', 0], //id du processus a tuer
    ['w', true],  // attend la fin de la boucle pour mettre fin au processus
  ]);

  if (params['h']) {
    help(ns);
  }

  let pid = params['pid'];
  if (pid == 0) help(ns);
  createKillFlag(ns, pid)
} 