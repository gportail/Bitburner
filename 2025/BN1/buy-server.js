/**
 * Achete des serveurs
 */
import * as cl from "./libs/colors.js";
import { runAndWait } from "./libs/lib.js";
import { logf } from "./libs/logs.js";
import * as C from "./libs/constantes.js";

const ScriptDeploy = 'deploy_single4.js';

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

export function renameServer(ns, oldname, prefix) {
  let owned = ns.getPurchasedServers();
  let idx = 1;
  for (let s of owned) {
    let newname = prefix + '-' + ns.vsprintf("%03d", [idx]);
    if (ns.serverExists(newname)) {
      idx++;
    } else {
      ns.renamePurchasedServer(oldname, newname);
      return newname;
    }
  }
}

/**
 * Renvoie le nombre max de serveur achetable
 * @param {NS} ns 
 * @returns {integer}  
 */
export function getMaxBuyableServer(ns) {
  return ns.getPurchasedServerLimit() - ns.getPurchasedServers().length;
}


/**
 * Renvoie le prix d'achat d'une quantité de serveur. Tient compte du nombre possible de serveur achetable.
 * @param {NS} ns 
 * @param {Integer} qte La quantité voulu
 * @param {Integer} ram La ram voulu
 * @returns {number}  Prix pour acheter au plus {qte} serveurs.
 */
export function getPriceServers(ns, qte, ram) {
  let q = Math.min(getMaxBuyableServer(ns), qte);
  return ns.getPurchasedServerCost(ram) * q;
}

/**
 * Achète des serveurs
 * @param {NS} ns 
 * @param {integer} qte Nombre de serveur
 * @param {integer} ram Quantité de ram
 * @param {string} prefix Prefix du nom des serveurs (SRV)
 * @returns {integer} Nombre de serveurs acheté
 */
export function buyServeurs(ns, qte, ram, prefix = 'SRV') {
  let q = Math.min(getMaxBuyableServer(ns), qte);
  let price = getPriceServers(ns, q, ram);
  if (price < ns.getServerMoneyAvailable('home')) {
    for (let i = 0; i < q; i++) {
      let name = ns.purchaseServer(prefix, ram);
      name = renameServer(ns, name, prefix);
    }
    return q;
  }
  return 0;
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

  let q = Math.min(getMaxBuyableServer(ns), qte);
  const price = getPriceServers(ns, qte, ram);
  if (price > ns.getServerMoneyAvailable('home')) {
    logf(ns, `${cl.error}Achat de %d serveur(s) avec %d Go de ram impossible: pas assez d'argent ($%s)`, [qte, ram, ns.formatNumber(price, 2)], false);
    ns.exit();
  }

  const msg = ns.vsprintf("Achat de %d serveur(s) avec %d Go de ram au prix total de $%s", [q, ram, ns.formatNumber(price, 2)]);
  const response = await ns.prompt(msg);
  if (response) {
    if (buyServeurs(ns, q, ram, prefix) == 0) {
      logf(ns, `${cl.error}Achat du serveur avec %d Go de ram impossible`, [ram], false);
    }
    for (let s of ns.getPurchasedServers()) {
      await runAndWait(ns, C.ScriptDeploySingle, '-c', s);
    }
  }
}
