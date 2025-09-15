import { secLvlFactor, moneyFactor } from "libs/constantes.js";
import * as cl from "libs/colors.js";
import { debugf, logf, disableNSlogs, enableNSlogs } from "libs/logs.js";

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
  if (params['c'] != '') target = params['c'];

  if (!quiet) ns.tprintf(`%s : Execution du script ${cl.green}%s${cl.reset} avec ${cl.green}%s${cl.reset} comme cible.`, ns.getHostname(), ns.getScriptName(), target);

  // calcul du nombre de thread
  let maxMoney = ns.getServerMaxMoney(target);
  debugf(ns, "Sur le serveur %s : maxMoney = %s", [target, ns.formatNumber(maxMoney, 2)], quiet);
  if (maxMoney > 0) {
    let minMoneyAvailable = maxMoney * moneyFactor;
    debugf(ns, "Sur le serveur %s : minMoneyAvailable = %s", [target, ns.formatNumber(minMoneyAvailable, 2)], quiet);

    let moneyPerThread = ns.hackAnalyze(target) * minMoneyAvailable;
    //let moneyPerThread = ns.hackAnalyze(target) * ns.getServerMoneyAvailable(target)
    debugf(ns, "Sur le serveur %s : hackAnalyze = %f    moneyPerThread = %s", [target, ns.hackAnalyze(target), ns.formatNumber(moneyPerThread, 2)], quiet);

    let threads = Math.floor((maxMoney - minMoneyAvailable) / (moneyPerThread / moneyFactor));
    let memBHScript = ns.getScriptRam('basic_hack.js');
    let availableRam = ns.getServerMaxRam(ns.getHostname()) - ns.getServerUsedRam(ns.getHostname());
    debugf(ns, "Sur le serveur %s : availableRam = %s", [target, ns.formatRam(availableRam)], quiet);
    let memThread = Math.floor(availableRam / memBHScript);
    debugf(ns, "Sur le serveur %s : memThread = %d    threads=%d", [target, memThread, threads], quiet);
    //ns.tprintf("MaxMoney=%s minMoneyAvailable=%s moneyPerThread=%s threads=%d, memThread=%d", ns.formatNumber(maxMoney), ns.formatNumber(minMoneyAvailable), ns.formatNumber(moneyPerThread), threads, memThread);
    let th = Math.min(threads, memThread);
    //ns.tprint(" Serveur = " + target + "       threads = " + th);
    logf(ns, "[%s sur %s] : Target = %s      threads = %d", [ns.getScriptName(), ns.getHostname(), target, th]);
    if (th > 0) {
      if (quiet) {
        ns.exec('basic_hack.js', ns.getHostname(), Math.min(threads, memThread), '-c', target, '-q');
      } else {
        ns.exec('basic_hack.js', ns.getHostname(), Math.min(threads, memThread), '-c', target);
      }
    }
    await ns.sleep(500);
  }
}
