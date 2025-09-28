import { logf } from "./libs/logs.js";

let budget = 0;

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.yellow}Achete des hacknet-node.`);
  ns.tprintf('options :');
  ns.tprintf('  -h            : aide');
  ns.tprintf('  -q <quantite> : nombre de hacknet-node a acheter (def: 1)');
  ns.tprintf('  -l <level>    : level des hacknet-node (1-200, def: 1)');
  ns.tprintf('  -r <ram>      : quantité de ram de chaque hacknet-node (1-6, def: 1)');
  ns.tprintf('  -c <core>     : nombre de core de chaque hacknet-node (1-16, def: 1)');
  ns.exit();
}

function calcBudget(ns) {
  budget = Math.floor(ns.getServerMoneyAvailable("home") * 0.30);  // 30% de l'argent dispo
}

/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['q', 1], // quantite
    ['l', 1],  //level
    ['r', 1], //ram
    ['c', 1], //core
  ]);

  if (params['h']) {
    help(ns);
  }

  calcBudget(ns);
  logf(ns, "Budget = %s", [ns.formatNumber(budget, 2)]);
  let hn = ns.hacknet;
  let totalPrice = 0
  while (totalPrice < budget) {
    let nodePrice = hn.getPurchaseNodeCost();
    totalPrice += nodePrice;
    if (totalPrice >= budget) break;
    let newIndex = hn.purchaseNode();
    let upgradePrice = hn.getLevelUpgradeCost(newIndex, 199) + hn.getCoreUpgradeCost(newIndex, 15) + hn.getRamUpgradeCost(newIndex, 6);
    totalPrice += upgradePrice;
    if (totalPrice >= budget) break;
    hn.upgradeCore(newIndex, 15);
    hn.upgradeLevel(newIndex, 199);
    hn.upgradeRam(newIndex, 6);
    logf(ns, "Prix du node = %s", [ns.formatNumber(upgradePrice + nodePrice, 2)]);
    logf(ns, "Dépense total = %s", [ns.formatNumber(totalPrice, 2)]);
    if (totalPrice >= budget) break;
  }
}
