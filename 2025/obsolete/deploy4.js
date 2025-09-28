/**
 * Deploie les scripts sur les serveurs
 */
import * as cl from "libs/colors.js";
import { runAndWait } from "libs/lib.js";
import { sortServersByHackSkill, deepscan } from "libs/deepscan3.js";


const depoySingleScript = 'deploy_single4.js';
/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.info}Copie certains scripts sur les serveur rooté.`);
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible de ' + depoySingleScript);
  ns.tprintf('  -q          : execution silencieuse');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['q', false], //execution silencieuse
  ]);

  if (params['h']) {
    help(ns);
  }

  let quiet = params['q'];

  ns.disableLog('ALL');

  let serveurs = deepscan(ns, 'home');
  sortServersByHackSkill(ns, serveurs);
  for (let target of serveurs) {
    // les serveurs sont trié par ordre de hackskill donc pas besoin de continuer la boucle si target est trop grand
    if (ns.getServerRequiredHackingLevel(target) > ns.getPlayer().skills.hacking) break;
    if (target == "darkweb" && !ns.hasTorRouter()) continue;
    if (target == "home") continue;
    if (ns.hasRootAccess(target)) {  // deploie que sur les serveurs rooté
      if (quiet) await runAndWait(ns, depoySingleScript, '-c', target, '-q');
      else await runAndWait(ns, depoySingleScript, '-c', target);
    }
  }
  ns.enableLog('ALL');
}
