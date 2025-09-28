/**
 * Equivalent à la commande witch d'Unix
 */
/** @param {NS} ns */
export async function main(ns) {
  var script = ns.args[0];
  while (true) {
    ns.ui.clearTerminal();
    ns.run(script);
    await ns.sleep(2000);
  }
}
