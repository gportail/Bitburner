/**
 * Deploie les script sur 1 serveur
 */
import * as cl from "libs/colors.js";
import { deployFiles } from "./libs/rootServeur.js";
import { DeployScripts } from "./libs/constantes.js"
import { deepscan, sortServersByHackSkill } from "./libs/deepscan.js";

function help(ns) {
  ns.tprintf(`${cl.info}Deploie les scripts sur tous les serveurs possibles.\n`);
  ns.tprintf('usage : run deploy.js');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -q          : mode silencieux');
  ns.exit();
}

/** @param {NS} ns */
export async function main(ns) {

  var params = ns.flags([
    ['h', false], // aide
    ['q', false] //execution silencieuse = non
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
      deployFiles(ns, target, DeployScripts, quiet);
    }
  }
  ns.enableLog('ALL');
} 