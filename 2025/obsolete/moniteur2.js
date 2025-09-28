import { secLvlFactor, moneyFactor } from "libs/constantes.js";
import { logf, disableNSlogs, enableNSlogs } from "libs/logs.js";
import { getServers, sortServersByHackSkill, sortServersByHackChance, deepscan } from "libs/deepscan.js";
import { calcNbThread, progsAvailables, isPurchasedByPlayer } from "libs/lib.js";

let serveurs = new Array();

let quiet = true;
/**
 * Lance g.js/w.js/basic_hack.js sur les serveurs root ayant de l'argent et de la ram
 */
function selfHack(ns) {
  for (let srv of serveurs) {
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (srv == "home") continue;
    if (ns.getServerRequiredHackingLevel(srv) <= ns.getPlayer().skills.hacking) {
      if (ns.getServerMoneyAvailable(srv) > 0 && ns.getServerMaxRam(srv) > 0) {

        var minSec = ns.getServerMinSecurityLevel(srv) * secLvlFactor;
        var minMoney = ns.getServerMaxMoney(srv) * moneyFactor;

        // si le script 'basic_hack.js' est lancé c'est que g.js et w.js sont deja passe
        var th = calcNbThread(srv, 'basic_hack.js', ns);
        if (ns.isRunning('basic_hack.js', srv)) {
          logf(ns, "    [selfHack] Le script basic_hack en cour sur %s", [srv], quiet);
          continue;
        }

        // si w.js ne tourne pas et que c'est les condition pour le faire tourner alors on le lance
        if (ns.getServerSecurityLevel(srv) > minSec) { // si on doit diminuer le niveau de securité
          if (ns.isRunning('w.js', srv) == false) {  // si le script w.js ne tourne pas
            logf(ns, "    [selfHack] Lancement de w.js sur le serveur %s", [srv], quiet);
            ns.killall(srv);
            ns.exec('w.js', srv, calcNbThread(srv, 'w.js', ns));
          }
          continue;
        }

        // si g.js ne tourne pas et que c'est les condition pour le faire tourner alors on le lance
        if (ns.getServerMoneyAvailable(srv) < minMoney) {  // si l'$ dispo n'est pas au minimum requis
          if (ns.isRunning('g.js', srv) == false) {  // si le script g.js ne tourne pas
            logf(ns, "    [selfHack] Lancement de g.js sur le serveur %s", [srv], quiet);
            ns.killall(srv);
            ns.exec('g.js', srv, calcNbThread(srv, 'g.js', ns));
          }
          continue;
        }
        // a la fin on lance basic_hack.js
        logf(ns, "    [selfHack] Lancement de basic_hack.js sur le serveur %s", [srv], quiet);
        ns.killall(srv);
        ns.exec('basic_hack.js', srv, calcNbThread(srv, 'basic_hack.js', ns));
      }
    }
  }
}

/**
 * Utiliser les serveurs sans $ pour hack les serveurs sans RAM (w_and_g.js).
 * Prend comme serveur cible celui qui a le moins de chance d'être hack
 */
let lastWeakAndGrow = '';

function doWeakAndGrow(ns) {
  if (lastWeakAndGrow != '' && ns.hackAnalyzeChance(lastWeakAndGrow) < 0.99) return;
  sortServersByHackChance(ns, serveurs);
  for (let srv of serveurs) {
    if (srv == lastWeakAndGrow) return;  // c'est le serveur en cour d'etre w_and_g
    if (isPurchasedByPlayer(srv, ns)) continue; // Serveur acheté, pas d'argent dessus
    if (srv == 'home') continue;
    if (srv == 'darkweb') continue;
    if (!ns.hasRootAccess(srv)) continue;
    if (ns.getServerMaxMoney(srv) == 0) continue;  // pas de $
    logf(ns, "[doWeakAndGrow] Lancement avec %s comme cible", [srv]);
    ns.run('w_and_g.js', 1, '-c', srv, '-q');
    lastWeakAndGrow = srv;
    return;
  }
}

/**
 * Lance autohack/deploy si c'est possible
 */
function tryAutoHack(ns) {
  let prevSrv = "";
  sortServersByHackSkill(ns, serveurs);
  // recherche du dernier serveur hackable
  /*   for (let srv of serveurs) {
      if (ns.getServerRequiredHackingLevel(srv) > ns.getPlayer().skills.hacking) break;
      prevSrv = srv;
    } */
  /*   if ((ns.getServerRequiredHackingLevel(prevSrv) <= ns.getPlayer().skills.hacking)
      && (progsAvailables(ns) >= ns.getServerNumPortsRequired(prevSrv))) {
   */
  //logf(ns, "    [tryAutoHack] Lancement de autohack.js prevSrv = %s", [prevSrv], quiet);
  logf(ns, "    [tryAutoHack] Lancement de autohack.js", [], quiet);
  ns.run('autohack.js', 1, '-q');
  //logf(ns, "    [tryAutoHack] Lancement de deploy.js prevSrv = %s", [prevSrv], quiet);
  logf(ns, "    [tryAutoHack] Lancement de deploy.js", [], quiet);
  ns.run('deploy.js', 1, '-q');
  //  }
}

/**
 * Lance un basic_hack sur home avec comme cible les serveurs n'ayant pas de ram mais qui ont des $
 */
function hackFromHome(ns) {
  let ps = ns.ps('home');
  for (let srv of serveurs) {
    // ns.tprint("Traitement de "+ srv);
    let start = true;
    if (srv == 'home') continue;
    if (srv == 'darkweb') continue;
    if (!ns.hasRootAccess(srv)) continue;
    if (isPurchasedByPlayer(srv, ns)) continue;
    if (ns.getServerMaxRam(srv) > 0) continue;
    if (ns.getServerMaxMoney(srv) == 0) continue;
    // test si un process basic_hack existe deja avec la cible comme argument
    for (let p of ps) {
      if (p.filename == 'basic_hack.js') {
        if (p.args.includes(srv)) {
          // ns.tprint("deja lancé pour " + srv);
          start = false;
          continue;
        }
      }
    }
    if (start) {
      // ns.tprint("lancement de run_basic_hack.js pour " + srv);
      ns.run('run_basic_hack.js', 1, '-c', srv, '-q');
    }
  }
}

function countRootedServeurs(ns) {
  let count = 0;
  for (let s of serveurs) {
    if (ns.hasRootAccess(s)) count++;
  }
  return count;
}

/**
 * Lance le script d'achat des programmes
 */
function buyPrograms(ns) {
  ns.run('buy_programs.js', 1);
}

/** @param {NS} ns */
export async function main(ns) {
  disableNSlogs(ns);
  deepscan('home', ns);
  sortServersByHackSkill(ns);
  serveurs = getServers();
  while (true) {
    disableNSlogs(ns);
    buyPrograms(ns);  // achat des programmmes
    tryAutoHack(ns);  // root des serveurs
    selfHack(ns);     // g/w/hack des serveurs root si ils ont de la ram et des $
    hackFromHome(ns); // g/w/hack des serveur avec 0 ram et des $
    doWeakAndGrow(ns);// TODO : utiliser les serveurs sans $ pour hack les serveurs sans RAM (w_and_g.js)
    //TODO : acheter des serveurs
    //TODO : acheter des hacknet node
    //TODO : rejoindre les factions
    //TODO : augmentation STR/DEF/DEX/AGI/CHA
    //TODO : travail...Etc
    let countRS = countRootedServeurs(ns);
    if (countRS <= 25)
      await ns.sleep(30 * 1000);
    else if (countRS > 20 && countRS <= 50)
      await ns.sleep(45 * 1000);
    else
      await ns.sleep(60 * 1000);
    enableNSlogs(ns);
    // ns.exit(); // pour debug
  }
}
