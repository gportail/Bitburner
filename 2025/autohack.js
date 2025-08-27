import { getServers, sortServersByHackSkill, deepscan } from "libs/deepscan.js";
import { green, red, yellow } from "libs/colors.js";

const hack_script = "basic_hack.js";

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${yellow}Passe en root les serveurs possibles`);
  ns.tprintf('options :');
  ns.tprintf('  -h    : aide');
  ns.tprintf('  -q    : execution silencieuse');
}

/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['q', false], //execution silencieuse
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  let quiet = params['q'];

  let startServer = ns.getHostname();
  deepscan(startServer, ns);
  sortServersByHackSkill(ns);
  let servers = getServers();
  for (var i = 0; i < servers.length; i++) {
    let srv = servers[i];
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (ns.getServerRequiredHackingLevel(srv) <= ns.getPlayer().skills.hacking) {
      if (ns.hasRootAccess(srv) == false) {
        if (!quiet) ns.tprintf(`${red}Hack de %s (skill=%d, port=%d)`, srv, ns.getServerRequiredHackingLevel(srv), ns.getServerNumPortsRequired(srv));
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
          if (!quiet) ns.tprintf(`${red}%s est hacké`, srv);
          if (ns.getServerMaxMoney(srv) > 0) {
            ns.scp(hack_script, srv);
          }
        }
      } else {
        if (!quiet) ns.tprintf(`${green}%s (%d) déjà hacké`, srv, ns.getServerRequiredHackingLevel(srv));
      }
    }
  }
}
