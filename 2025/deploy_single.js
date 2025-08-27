/**
 * Deploie les script sur 1 serveur
 */
import * as cl from "libs/colors.js";

function help(ns) {
  ns.tprintf(`${cl.yellow}Deploie les scripts sur la cible.\n`);
  ns.tprintf('usage : run deploy_single.js -c <target>');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible de deploy_single.js');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  const scripts = ['g.js', 'w.js', 'basic_hack.js', 'libs/colors.js', 'libs/constantes.js'];

  var params = ns.flags([
    ['h', false], // aide
    ['c', ''], // pas de cible
    ['v', false] //bavard
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  if (params['c'] == "") {
    help(ns);
  }
  let target = params['c'];
  if (params['v']) ns.tprintf(`%s : Execution du script ${cl.green}%s${cl.reset} avec ${cl.green}%s${cl.reset} comme cible.`, ns.getHostname(), ns.getScriptName(), target);
  if (ns.getServerRequiredHackingLevel(target) <= ns.getPlayer().skills.hacking) {
    if (ns.getServerMaxRam(target) > 0) {
      for (var j = 0; j < scripts.length; j++) {
        if (params['v']) ns.tprint("Copie de ", scripts[j], " vers le serveur ", target);
        ns.scp(scripts[j], target);
      }
    }
  }
}
