/**
 * Verifie les scripts lancé sur les serveurs
 */
import { secLvlFactor, moneyFactor } from "libs/constantes.js";
import { getServers, sortServersByHackSkill, deepscan } from "libs/deepscan.js";
import { calcNbThread } from "libs/lib.js";

function moniteur(ns) {
  var startServer = ns.getHostname();
  deepscan(startServer, ns);
  sortServersByHackSkill(ns);
  let servers = getServers();
  for (var i = 0; i < servers.length; i++) {
    let srv = servers[i];
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (srv == "home") continue;
    if (ns.getServerRequiredHackingLevel(srv) <= ns.getPlayer().skills.hacking) {
      if (ns.getServerMoneyAvailable(srv) > 0 && ns.getServerMaxRam(srv) > 0) {

        var minSec = ns.getServerMinSecurityLevel(srv) * secLvlFactor;
        var minMoney = ns.getServerMaxMoney(srv) * moneyFactor;

        // si le script 'basic_hack.js' est lancé c'est que g.js et w.js sont deja passe
        var th = calcNbThread(srv, 'basic_hack.js', ns);
        if (ns.isRunning('basic_hack.js', srv)) {
          ns.printf("    Le script basic_hack en cour. %s", "");
          continue;
        }

        // si w.js ne tourne pas et que c'est les condition pour le faire tourner alors on le lance
        if (ns.getServerSecurityLevel(srv) > minSec) { // si on doit diminuer le niveau de securité
          if (ns.isRunning('w.js', srv) == false) {  // si le script w.js ne tourne pas
            ns.printf("    Lancement de w.js sur le serveur %s", srv);
            ns.killall(srv);
            ns.exec('w.js', srv, calcNbThread(srv, 'w.js', ns));
          }
          continue;
        }

        // si g.js ne tourne pas et que c'est les condition pour le faire tourner alors on le lance
        if (ns.getServerMoneyAvailable(srv) < minMoney) {  // si l'$ dispo n'est pas au minimum requis
          if (ns.isRunning('g.js', srv) == false) {  // si le script g.js ne tourne pas
            ns.printf("    Lancement de g.js sur le serveur %s", srv)
            ns.killall(srv);
            ns.exec('g.js', srv, calcNbThread(srv, 'g.js', ns));
          }
          continue;
        }
        // a la fin on lance basic_hack.js
        ns.printf("    Lancement de basic_hack.js sur le serveur %s", srv)
        ns.killall(srv);
        ns.exec('basic_hack.js', srv, calcNbThread(srv, 'basic_hack.js', ns));
      }
    }
  }
}

export async function main(ns) {
  while (true) {
    moniteur(ns);
    await ns.sleep(1000 * 30);
  }
}
