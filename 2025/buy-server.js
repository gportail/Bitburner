/**
 * Achete des serveurs
 */
import * as cl from "libs/colors.js";

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.yellow}Achete des serveurs.`);
  ns.tprintf('options :');
  ns.tprintf('  -h            : aide');
  ns.tprintf('  -n <name>     : nom des serveur (def: SRV)');
  ns.tprintf('  -q <quantite> : nombre de serveur a acheter (def: 1)');
  ns.tprintf('  -r <ram>      : quantité de ram de chaque serveur en Go (def: 8)');
}

/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['n', "SRV"],  //prefix du serveur
    ['q', 1], // tous les serveurs
    ['r', 8]
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  const qte = params['q'];
  const prefix = params['n'];
  const ram = params['r'];

  const price = ns.getPurchasedServerCost(ram) * qte;
  const msg = ns.vsprintf("Achat de %d serveur(s) avec %d Go de ram au prix total de $%s", [qte, ram, ns.formatNumber(price, 2)]);
  const response = await ns.prompt(msg);
  if (response) {
    var name = "";
    for (let i = 0; i < qte; ++i) {
      name = ns.purchaseServer(prefix, ram);
      ns.tprintf("Achat du serveur %s avec %d Go de ram", name, ram);
      ns.run('deploy_single.js', 1, '-c', name);
    }
  }
}
