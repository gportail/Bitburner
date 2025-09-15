/**
 * Deploie les script sur 1 serveur
 */
import * as cl from "libs/colors.js";
import { debugf, log, logf, disableNSlogs, enableNSlogs } from "libs/logs.js";

function help(ns) {
  ns.tprintf(`${cl.yellow}Deploie les scripts sur la cible.\n`);
  ns.tprintf('usage : run deploy_single.js -c <target>');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible de deploy_single.js');
  ns.tprintf('  -q          : mode silencieux');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  const scripts = ['g.js', 'w.js', 'basic_hack.js', 'libs/colors.js', 'libs/constantes.js', 'libs/logs.js'];

  var params = ns.flags([
    ['h', false], // aide
    ['c', ''], // pas de cible
    ['q', false] //bavard
  ]);

  if (params['h']) {
    help(ns);
  }

  if (params['c'] == "") {
    help(ns);
  }

  let quiet = params['q'];
  let target = params['c'];

  disableNSlogs(ns);
  //if (params['v']) ns.tprintf(`%s : Execution du script ${cl.green}%s${cl.reset} avec ${cl.green}%s${cl.reset} comme cible.`, ns.getHostname(), ns.getScriptName(), target);
  logf(ns, `%s : Execution du script ${cl.green}%s${cl.reset} avec ${cl.green}%s${cl.reset} comme cible.`, [ns.getScriptName(), ns.getScriptName(), target], quiet);
  //debugf(ns, '%s : getServerRequiredHackingLevel=%d   getPlayer().skills.hacking=%d', [target, ns.getServerRequiredHackingLevel(target), ns.getPlayer().skills.hacking], quiet);
  if (ns.getServerRequiredHackingLevel(target) <= ns.getPlayer().skills.hacking) {
    //debugf(ns, 'target=%s   1er critere OK', [target], quiet);
    //debugf(ns, '%s : getServerMaxRam=%d', [target, ns.getServerMaxRam(target)], quiet);
    if (ns.getServerMaxRam(target) > 0) {
      //debugf(ns, 'target=%s   2eme critere OK', [target], quiet);
      //for (var j = 0; j < scripts.length; j++) {
      for (let scr of scripts) {
        logf(ns, `${cl.green}[%s] Copie de ${cl.yellow}%s${cl.reset} vers le serveur ${cl.yellow}%s${cl.reset}.`, [ns.getScriptName(), scr, target], quiet);
        ns.scp(scr, target);
      }
    }
  }
  enableNSlogs(ns);
}
