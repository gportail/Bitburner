/**
 * Deploie les script sur 1 serveur
 */
import * as cl from "libs/colors.js";
import { log, logf } from "libs/logs.js";

function help(ns) {
  ns.tprintf(`${cl.info}Deploie les scripts sur la cible.\n`);
  ns.tprintf('usage : run deploy_single.js -c <target>');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible de sur laquelle on déploie les scripts');
  ns.tprintf('  -q          : mode silencieux');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  const scripts = ['simple_g3.js', 'simple_w3.js', 'simple_h3.js', 'loop_g4.js', 'loop_w4.js', 'loop_h4.js', 'basic_hack4.js', 'libs/colors.js', 'libs/constantes.js', 'libs/logs.js', 'single_w_and_g4.js'];

  var params = ns.flags([
    ['h', false], // aide
    ['c', ''], // pas de cible
    ['q', false] //execution silencieuse = non
  ]);

  if (params['h']) {
    help(ns);
  }

  if (params['c'] == "") {
    help(ns);
  }

  let quiet = params['q'];
  let target = params['c'];

  ns.disableLog('ALL');
  logf(ns, `Cible du script ${cl.info}%s .${cl.reset}`, [target], quiet);
  if (!ns.hasRootAccess(target)) { // serveur non rooté => on quite
    logf(ns, `${cl.error}Les serveur %s n\'est pas rooté, pas de deploiement des scripts.${cl.reset}`, [target], quiet);
    return;
  }
  if (ns.getServerRequiredHackingLevel(target) <= ns.getPlayer().skills.hacking) {
    if (ns.getServerMaxRam(target) > 0) {
      for (let scr of scripts) {
        logf(ns, `Copie de ${cl.info}%s${cl.reset} vers le serveur ${cl.info}%s${cl.reset}.`, [scr, target], quiet);
        ns.scp(scr, target);
      }
      log(ns, "", quiet);
    } else {
      logf(ns, `${cl.warn}Le serveur %s n\'a pas de RAM.${cl.reset}`, [target], quiet);
      log(ns, "", quiet);
    }
  }
  ns.enableLog('ALL');
}
