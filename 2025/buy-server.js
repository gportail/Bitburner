/**
 * Achete des serveurs
 */
import * as cl from "libs/colors.js";
import { runAndWait } from "libs/lib.js";
import { logf } from "libs/logs.js";

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
  ns.exit();
}

function rename(ns, oldname, prefix) {
  let owned = ns.getPurchasedServers();
  let idx = 1;
  for (let s of owned) {
    let newname = prefix + '-' + idx;
    if (ns.serverExists(newname)) {
      idx++;
    } else {
      ns.renamePurchasedServer(oldname, newname);
      return newname;
    }
  }
}
/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['n', "SRV"],  //prefix du serveur
    ['q', 1], // 1 serveurs
    ['r', 8]
  ]);

  if (params['h']) {
    help(ns);
  }

  const qte = params['q'];
  const prefix = params['n'];
  const ram = params['r'];

  let maxS = ns.getPurchasedServerLimit();
  if ((ns.getPurchasedServers().length + qte) > maxS) {
    logf(ns, `${cl.error}Achat de %d serveur(s) avec %d Go de ram impossible: dépassement de la limite`, [qte, ram], false);
    ns.exit();
  }

  const price = ns.getPurchasedServerCost(ram) * qte;
  if (price > ns.getServerMoneyAvailable('home')){
    logf(ns, `${cl.error}Achat de %d serveur(s) avec %d Go de ram impossible: pas assez d'argent`, [qte, ram], false);
    ns.exit();
  }

  const msg = ns.vsprintf("Achat de %d serveur(s) avec %d Go de ram au prix total de $%s", [qte, ram, ns.formatNumber(price, 2)]);
  const response = await ns.prompt(msg);
  if (response) {
    for (let i = 0; i < qte; ++i) {
      let name = ns.purchaseServer(prefix, ram);
      if (name == '') {
        logf(ns, `${cl.error}Achat du serveur avec %d Go de ram impossible`, [ram], false);
        ns.exit();
      }
      name = rename(ns, name, prefix);
      logf(ns, `${cl.info}Achat du serveur %s avec %d Go de ram`, [name, ram], false);
      await runAndWait(ns, 'deploy_single3.js', '-c', name);
    }
  }
}
