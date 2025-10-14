import { logToServer, logStatsToServer } from "./libs/logs.js";
import * as C from "./libs/constantes.js";

/** @param {NS} ns */
export async function main(ns) {

  // ns.writePort(1,'ligne 1');
  // await ns.sleep(1000);
  // ns.writePort(1, 'ligne 2');
  // ns.writePort(1, 'ligne 3');
  // await ns.sleep(100);
  // ns.writePort(1, 'ligne 4');
  // await ns.sleep(2000);
  // ns.writePort(1, 'ligne 5');
  // await ns.sleep(500);
  // ns.writePort(1, 'ligne 6');
  // await ns.sleep(500);
  // let data = '{ "log": "machin", "info": "ligne 7" }';
  // ns.writePort(1, data);
  // logToServer(ns, C.logStatPort, ns.getScriptName(), 'toto;titit;tutut')
  logStatsToServer(ns, 'n00dles', 12547, 52, 35);
} 