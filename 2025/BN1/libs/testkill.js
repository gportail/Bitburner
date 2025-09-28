import { killFlagExists } from "./process";



/** @param {NS} ns */
export async function main(ns) {
  while (true) {
    if (killFlagExists(ns)){ 
      ns.tprint("Le fichier kill existe..... fin du script.");
      break;
    } 
    ns.tprint('testkill.js.........running (PID = ' + ns.pid + ')');
    await ns.sleep(1000);
  }
} 