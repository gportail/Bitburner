/**
 * Gestion des logs
 */

let disabledfct = ['getServerMaxMoney', 'getServerMaxRam', 'getServerSecurityLevel', 'getServerMoneyAvailable', 'weaken', 'hack', 'grow'];


export function disableNSlogs(ns) {
  for (let f of disabledfct) ns.disableLog(f);
}

export function enableNSlogs(ns) {
  for (let f of disabledfct) ns.enableLog(f);
}

/** @param {NS} ns */
export async function main(ns) {

}
