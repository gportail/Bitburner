import { getServers, sortServersByHackSkill, deepscan } from "libs/deepscan3.js";
import * as cl from "libs/colors.js";
import { log, logf } from "libs/logs.js";

const hack_script = "basic_hack.js";

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
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (srv == 'home') continue;
    if (ns.getServerRequiredHackingLevel(srv) <= ns.getPlayer().skills.hacking) {
      if (ns.hasRootAccess(srv) == false) {

        logf(ns, `${cl.warn}Hack de %s (skill=%d, port=%d)`, [srv, ns.getServerRequiredHackingLevel(srv), ns.getServerNumPortsRequired(srv)], quiet);
        let openPortCount = 0;
        if (ns.getServerNumPortsRequired(srv) >= 1) {
          if (ns.fileExists("brutessh.exe", "home")) {
            if (ns.brutessh(srv)) openPortCount++;
          }
        }
        if (ns.getServerNumPortsRequired(srv) >= 2) {
          if (ns.fileExists("ftpcrack.exe", "home")) {
            if (ns.ftpcrack(srv)) openPortCount++;
          }
        }
        if (ns.getServerNumPortsRequired(srv) >= 3) {
          if (ns.fileExists("relaySMTP.exe", "home")) {
            if (ns.relaysmtp(srv)) openPortCount++;
          }
        }
        if (ns.getServerNumPortsRequired(srv) >= 4) {
          if (ns.fileExists("HTTPWorm.exe", "home")) {
            if (ns.httpworm(srv)) openPortCount++;
          }
        }
        if (ns.getServerNumPortsRequired(srv) >= 5) {
          if (ns.fileExists("SQLInject.exe", "home")) {
            if (ns.sqlinject(srv)) openPortCount++;
          }
        }
        if (openPortCount == ns.getServerNumPortsRequired(srv)) {
          ns.nuke(srv);
        }
        if (ns.hasRootAccess(srv)) {
          logf(ns, `${cl.warn}%s est hacké`, [srv], quiet);
        }
      } else {
        logf(ns, `${cl.info}%s (%d) déjà hacké`, [srv, ns.getServerRequiredHackingLevel(srv)], quiet);
      }
    }
  }
}
