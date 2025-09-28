import { sortServersByHackSkill, deepscan } from "./libs/deepscan.js";
import * as cl from "libs/colors.js";
import { rootServeur, deployFiles }  from "./libs/rootServeur.js";
import * as C from "./libs/constantes.js";

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.info}Passe en root les serveurs possibles`);
  ns.tprintf('options :');
  ns.tprintf('  -h    : aide');
  ns.tprintf('  -q    : execution silencieuse');
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

  let startServer = ns.getHostname();
  let serveurs = deepscan(ns, startServer);
  sortServersByHackSkill(ns, serveurs);
  for (let srv of serveurs) {
    if (rootServeur(ns, srv, quiet)){
      deployFiles(ns, target, C.DeployScripts, quiet);
    } 
  }
}
