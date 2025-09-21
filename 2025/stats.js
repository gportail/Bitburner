import * as ds from "libs/deepscan.js";
import * as cl from "libs/colors.js";
import { getScriptsRunning, timeformat, calculGainSeconds, isPurchasedByPlayer } from "libs/lib.js";
import { clServer } from "libs/classServer";


let info;

function buildInfos() {
  info = new Array();
  info.push({ title: 'Host                ', dataFormat: '%-20s', fct: function (ns, srv) { return srv.name } });
  info.push({ title: 'Root ', dataFormat: '%5t', fct: function (ns, srv) { return srv.RootAcces } });
  info.push({ title: 'SecL ', dataFormat: '%5s', fct: function (ns, srv) { return ns.formatNumber(srv.SecurityLevel, 2) } });
  info.push({ title: 'minSL', dataFormat: '%5s', fct: function (ns, srv) { return ns.formatNumber(srv.MinSecurityLevel, 0) } });
  info.push({ title: 'Skill', dataFormat: '%5d', fct: function (ns, srv) { return srv.RequiredHackingLevel } });
  info.push({ title: 'Port', dataFormat: '%4d', fct: function (ns, srv) { return ns.formatNumber(srv.NumPortsRequired, 0) } });
  info.push({ title: ' Max$  ', dataFormat: '%7s', fct: function (ns, srv) { return ns.formatNumber(srv.MaxMoney, 2) } });
  info.push({ title: ' Cur$  ', dataFormat: '%7s', fct: function (ns, srv) { return ns.formatNumber(srv.MoneyAvailable, 2) } });
  info.push({ title: '  Cur$% ', dataFormat: '%8s', fct: function (ns, srv) { return ns.formatPercent(srv.PercentMoneyAvailable, 2) } });
  info.push({ title: ' RAM ', dataFormat: '%5s', fct: function (ns, srv) { return ns.formatRam(srv.MaxRam, 0) } });
  info.push({ title: ' FRam ', dataFormat: '%6s', fct: function (ns, srv) { return ns.formatRam(srv.FreeRam, 1) } });
  info.push({ title: 'Hack % ', dataFormat: '%7s', fct: function (ns, srv) { return ns.formatPercent(srv.HackChance, 1) } });  // chance de hack
  info.push({ title: 'Hack $', dataFormat: '%6s', fct: function (ns, srv) { return ns.formatNumber(srv.GainPerThread, 1) } });  // gain par thread
  info.push({ title: ' Hack$/s ', dataFormat: '%7s/s', fct: function (ns, srv) { return ns.formatNumber(srv.GainPerSecond, 2) } }); // gain $/s
  info.push({ title: ' WTime', dataFormat: '%6s', fct: function (ns, srv) { return timeformat(srv.WeakenTime) } });  // durée weaken 
  info.push({ title: ' GTime', dataFormat: '%6s', fct: function (ns, srv) { return timeformat(srv.GrowTime) } });    // durée grow 
  info.push({ title: ' HTime', dataFormat: '%6s', fct: function (ns, srv) { return timeformat(srv.HackTime) } });    // durée hack
  info.push({ title: ' FTime', dataFormat: '%6s', fct: function (ns, srv) { return timeformat(srv.CycleTime) } });// durée d'un cycle WGH
  info.push({ title: 'Scripts', dataFormat: '%s', fct: function (ns, srv) { let res = srv.RunningScripts.join(); return res == "" ? "" : res; } });
}

function printServersStats2(ns, onlyRoot, withOwned) {
  let servers = ds.getServers();
  buildInfos();
  let header = "    ";
  for (let inf of info) {
    header += "|" + inf.title;
  }
  ns.tprintf(`${cl.info}%s`, [header]);
  ns.tprintf(`${cl.info}%s`, ["".padStart(header.length, "=")]);
  let count = 1;
  for (let srv of servers) {
    if (srv == "home") continue;
    if (isPurchasedByPlayer(srv, ns) && !withOwned) continue;
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (onlyRoot && !ns.hasRootAccess(srv)) continue;
    let color = cl.whiteOnGreen;
    if (count % 2 != 0) color = cl.blackOnLightGrey;
    if (!ns.hasRootAccess(srv)) color = cl.red;
    let row = "";
    let oSrv = new clServer(ns, srv);
    for (let inf of info) {
      let data = inf.fct(ns, oSrv);
      if (data == '') data = " ";
      row += vsprintf('|' + inf.dataFormat, data);
    }
    ns.tprintf(`${color}%3d %s`, count, row);
    count++;
  }
}


/**
 * Affiche liste des serveurs trié par HackSkill croissant
 */
function printServersStats(ns, onlyRoot, withOwned) {
  let servers = ds.getServers();
  ns.tprintf(`${cl.info}    | %-20s | %6s | %5s | %5s | %5s | %4s | %8s | %8s | %5s | %8s | %8s | %8s | %6s | %6s | %6s | %6s |`,
    "Host", "root?", "secL", "minSL", "skill", "port", "Max$", "Curr$", "RAM", "Hack %", "Hack $", "Hack$/s", "WTime", "GTime", "HTime", "FTime");
  ns.tprintf(`${cl.info}========================================================================================================================================================================`)
  var count = 1;
  for (var i = 0; i < servers.length; i++) {
    let srv = servers[i];
    if (srv == "home") continue;
    if (isPurchasedByPlayer(srv, ns) && !withOwned) continue;
    if (srv == "darkweb" && !ns.hasTorRouter()) continue;
    if (onlyRoot && !ns.hasRootAccess(srv)) continue;
    let color = cl.whiteOnGreen;
    if (count % 2 != 0) color = cl.blackOnLightGrey;

    if (!ns.hasRootAccess(srv)) color = cl.red;
    ns.tprintf(`${color}%3d | %-20s | %-6t | %5s | %5s | %5d | %4d | %8s | %8s | %5s | %8s | %8s | %8s | %6s | %6s | %6s | %6s | %s `,
      count,
      srv,
      ns.hasRootAccess(srv),  // root access?
      ns.formatNumber(ns.getServerSecurityLevel(srv), 2),
      ns.formatNumber(ns.getServerMinSecurityLevel(srv), 0),
      ns.getServerRequiredHackingLevel(srv),
      ns.getServerNumPortsRequired(srv),
      ns.formatNumber(ns.getServerMaxMoney(srv), 2),
      ns.formatNumber(ns.getServerMoneyAvailable(srv), 2),
      // ns.getServerMaxMoney(srv)>0 ? ns.formatPercent(ns.getServerMoneyAvailable(srv)/ns.getServerMaxMoney(srv),2) : 0,
      ns.formatRam(ns.getServerMaxRam(srv), 0),
      ns.formatPercent(ns.hackAnalyzeChance(srv), 2), // chance de hack
      ns.formatNumber(ns.hackAnalyze(srv) * ns.getServerMoneyAvailable(srv), 2),  // gain par thread
      ns.formatNumber(calculGainSeconds(srv, ns), 2), // gain $/s
      timeformat(ns.getWeakenTime(srv)), // durée weaken 
      timeformat(ns.getGrowTime(srv)), // durée grow 
      timeformat(ns.getHackTime(srv)), // durée hack
      timeformat(ns.getHackTime(srv) + ns.getGrowTime(srv) + (ns.getWeakenTime(srv))),
      getScriptsRunning(srv, ns)
    );
    count++;
  }
}


function printHackNodeStats(ns) {
  ns.tprintf(`${cl.info}Hacknode stats`);
  ns.tprintf(`${cl.info}==============`);
  ns.tprintf(`${cl.info}Nombre de nodes: %d/%d`, ns.hacknet.numNodes(), ns.hacknet.maxNumNodes());

  let MoneyProd = 0;
  for (let i = 0; i < ns.hacknet.numNodes(); i++) {
    let HNstat = ns.hacknet.getNodeStats(i);
    MoneyProd += HNstat.totalProduction;
  }
  ns.tprintf(`${cl.info}Argent produit: %s`, ns.formatNumber(MoneyProd, 2));
}

/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.yellow}Affiche les statistiques des serveurs.\n`);
  ns.tprintf('options :');
  ns.tprintf('  -h        : aide');
  ns.tprintf('  -s <sort> : trie selon le skill|money|ram|hack|$/s|ttime, defaut=skill');
  ns.tprintf('  -a        : tous les serveurs, defaut: serveurs rooted');
  ns.tprintf('  -o        : affiche les serveurs acheter(def:false)')
}


/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['s', 'skill'],  //option de trie : skill|money|ram
    ['a', false], // tous les serveurs
    ['o', false], //avec les serveur achete
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  let startServer = ns.getHostname();
  ds.deepscan(startServer, ns);

  switch (params['s']) {
    case 'skill':
      ds.sortServersByHackSkill(ns);
      break;
    case 'money':
      ds.sortServersByMaxMoney(ns);
      break;
    case 'ram':
      ds.sortServersByMaxRam(ns);
      break;
    case 'hack':
      ds.sortServersByHackChance(ns);
      break;
    case '$/s':
      ds.sortServersByMoneyPerSec(ns);
      break;
    case 'ttime':
      ds.sortServersByTotalTime(ns);
      break;
  }
  //ns.ui.clearTerminal();
  printServersStats2(ns, !params['a'], params['o']);
  ns.tprintf("\n");
  printHackNodeStats(ns);
  ns.tprintf("\n");
  // printServersStats2(ns, !params['a'], params['o']);
}
