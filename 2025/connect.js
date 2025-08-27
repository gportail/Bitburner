import * as cl from "libs/colors.js";
import { runCommand } from "libs/lib.js";

function help(ns) {
  ns.tprintf(`${cl.yellow}Connection à un serveur.\n`);
  ns.tprintf('usage : run connect.js <target>');
  ns.tprintf('options :');
  ns.tprintf('  -h          : aide');
  ns.tprintf('  <target>    : le serveur auquel on veut se connecter');
}

/**
 * Calcul le chemin vers un serveur
 */
function getPathTo(fromServer, toServer, ns) {
  let [results, isFound] = findPath(ns, toServer, fromServer, [], [], false);
  if (isFound) return results;
  return [];
}

function findPath(ns, target, serverName, serverList, ignore, isFound) {
  // https://www.reddit.com/r/Bitburner/comments/rm097d/find_server_path_script/
  ignore.push(serverName);
  let scanResults = ns.scan(serverName);
  for (let server of scanResults) {
    if (ignore.includes(server)) {
      continue;
    }
    if (server === target) {
      serverList.push(server);
      return [serverList, true];
    }
    serverList.push(server);
    [serverList, isFound] = findPath(ns, target, server, serverList, ignore, isFound);
    if (isFound) {
      return [serverList, isFound];
    }
    serverList.pop();
  }
  return [serverList, false];
}

/** @param {NS} ns */
export async function main(ns) {
  var params = ns.flags([
    ['h', false], // aide
    ['c', ''], // pas de cible
  ]);

  if (params['h']) {
    help(ns);
    ns.exit();
  }

  if (ns.args.length == 0) {
    help(ns);
    ns.exit();
  }
  let target;
  if (ns.args.length > 0) target = ns.args[0];

  ns.tprintf(`Connexion au serveur ${cl.green}%s${cl.reset}`, target);
  let P = getPathTo(ns.getHostname(), target, ns);
  let cmd = "";
  for(let server of P){
    cmd += "connect " + server + ";";
  }
  runCommand(cmd);
}
