/**
 * Serveur de log
 */

import * as C from "./libs/constantes.js";


/**
 * Sauvegarde des données de statistique
 * @param {NS} ns 
 * @param {JSON} datas 
 */
function saveStats(ns, datas) {
  if (!ns.fileExists(C.logStatFile)) {
    ns.write(C.logStatFile, "script;from;target;hack;grow;weaken\n", 'a');
  }
  let ligne = ns.vsprintf("%s;%s;%s;%f;%f;%f", [datas.script, datas.from, datas.datas.target, datas.datas.hack, datas.datas.grow, datas.datas.weaken])
  ns.write(C.logStatFile, ligne + "\n", 'a');
}


/** @param {NS} ns */
export async function main(ns) {

  let datas;

  while (true) {
    for (let port of C.logListenPorts) {
      while (ns.peek(port) != "NULL PORT DATA") {
        datas = ns.readPort(port);
        datas = JSON.parse(datas);
        switch (port) {
          case C.logStatPort:
            saveStats(ns, datas);
            break;
        }
      }
      await ns.sleep(100);
    }
  }
} 