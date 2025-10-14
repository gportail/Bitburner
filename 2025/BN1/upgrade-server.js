/**
 * Upgrade un serveur
 */
import * as cl from "./libs/colors.js";

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.yellow}Upgrade des serveurs.`);
  ns.tprintf(`${cl.yellow}run %s <option> [serveurs]`, ns.self().filename);
  ns.tprintf('options :');
  ns.tprintf('  -h            : aide');
  ns.tprintf('  -r <ram>      : quantité de ram de chaque serveur en Go (def: 8)');
  ns.tprintf('  -a            : tous les serveurs');
}

/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['r', 8],  // qte de RAM en Go
    ['a', false], // all servers
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  let serveurs;
  if (!params['a']) {
    if (params['_'].length == 0) {
      help(ns);
      ns.exit();
    }
    serveurs = params['_'];
  } else {
    serveurs = ns.getPurchasedServers();
  }

  const ram = params['r'];
  var totPrice = 0;
  for (var i = 0; i < serveurs.length; i++) {
    if (ns.serverExists(serveurs[i])) {
      totPrice += ns.getPurchasedServerUpgradeCost(serveurs[i], ram)
    }
  }
  const msg = ns.vsprintf("Upgrade de %d serveur(s) avec %d Go de ram au prix total de $%s", [serveurs.length, ram, ns.formatNumber(totPrice, 2)]);
  const response = await ns.prompt(msg);
  if (!response) ns.exit();
  for (var i = 0; i < serveurs.length; i++) {
    if (ns.serverExists(serveurs[i])) {
      if (ns.upgradePurchasedServer(serveurs[i], ram))
        ns.tprintf(`${cl.yellow}Upgrade du serveur %s avec %d Go de ram`, serveurs[i], ram);
      else
        ns.tprintf(`${cl.yellow}Impossible d'upgrader le serveur %s avec %d Go de ram`, serveurs[i], ram);
    } else {
      ns.tprintf(`${cl.red}Le serveur %s n'existe pas`, serveurs[i]);
    }
  }
}
