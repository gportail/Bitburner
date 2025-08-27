import { secLvlFactor, moneyFactor } from "libs/constantes.js";
import * as cl from "libs/colors.js";

function help(ns) {
  ns.tprintf(`${cl.yellow}Lance le script basic_hack.js avec le nombre de thread optimum pour ne pas vider la cible sur la machine hote de ce script.\n`);
  ns.tprintf('usage : run run_basic_hack.js -c <target>');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  -c <target> : la cible de basic_hack.js');
  ns.tprintf('  -q        : mode silence');
}

/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['c', ''], // pas de cible
    ['q', false], // silencieu si true
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  let target = ns.getHostname();
  let quiet = params['q'];
  if (params['c'] != false) target = params['c'];
  if (!quiet) ns.tprintf(`%s : Execution du script ${cl.green}%s${cl.reset} avec ${cl.green}%s${cl.reset} comme cible.`, ns.getHostname(), ns.getScriptName(), target);

  // calcul du nombre de thread
  let maxMoney = ns.getServerMaxMoney(target);
  if (maxMoney > 0) {
    let minMoneyAvailable = maxMoney * moneyFactor;
    let moneyPerThread = ns.hackAnalyze(target) * minMoneyAvailable;
    let threads = Math.floor((maxMoney - minMoneyAvailable) / (moneyPerThread / moneyFactor));
    let memBHScript = ns.getScriptRam('basic_hack.js');
    let memThread = Math.floor(ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname()) / memBHScript);
    //ns.tprintf("MaxMoney=%s minMoneyAvailable=%s moneyPerThread=%s threads=%d, memThread=%d", ns.formatNumber(maxMoney), ns.formatNumber(minMoneyAvailable), ns.formatNumber(moneyPerThread), threads, memThread);
    ns.tprint("Serveur = " + target + "       threads = " + threads);
    if (quiet) {
      ns.exec('basic_hack.js', ns.getHostname(), Math.min(threads, memThread), '-c', target, '-q');
    } else {
      ns.exec('basic_hack.js', ns.getHostname(), Math.min(threads, memThread), '-c', target);
    }
  }
}
