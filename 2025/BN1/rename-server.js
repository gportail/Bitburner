import * as cl from "./libs/colors.js";
import { renameServer } from "./buy-server.js";
/**
 * Affiche l'aide
 */
function help(ns) {
  ns.tprintf(`${cl.yellow}Renomme des serveurs.`);
  ns.tprintf(`${cl.yellow} ${ns.getScriptName()} <oldName> <newname>`);
  ns.tprintf('options :');
  ns.tprintf('  -h    : aide');
  ns.exit();
}

/** 
 * @param {NS} ns 
 */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
  ]);

  if (params['h']) {
    help(ns);
  }

  const oldName = ns.args[0];
  const newName = ns.args[1];
  if (!ns.renamePurchasedServer(oldName, newName)) help(ns);
} 